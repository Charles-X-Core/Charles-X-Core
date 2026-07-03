# Wakapi File Watcher
# Automatically sends heartbeats when files are modified

param(
    [string[]]$WatchDirs = @(
        "C:\Users\Administrator\Desktop\github",
        "C:\Users\Administrator\Desktop\proyectos"
    ),
    [string]$ApiKey = "81efea9c-a16b-4b97-aef4-e9877277af1a",
    [int]$DebounceSeconds = 30
)

$WAKAPI_URL = "http://localhost:3000/api/compat/wakatime/v1/users/current/heartbeats.bulk"

# Language mapping by extension
$LanguageMap = @{
    ".py" = "Python"
    ".js" = "JavaScript"
    ".ts" = "TypeScript"
    ".tsx" = "TypeScript"
    ".jsx" = "JavaScript"
    ".php" = "PHP"
    ".java" = "Java"
    ".kt" = "Kotlin"
    ".cs" = "C#"
    ".go" = "Go"
    ".rs" = "Rust"
    ".rb" = "Ruby"
    ".swift" = "Swift"
    ".html" = "HTML"
    ".css" = "CSS"
    ".scss" = "SCSS"
    ".vue" = "Vue"
    ".svelte" = "Svelte"
    ".sql" = "SQL"
    ".sh" = "Bash"
    ".ps1" = "PowerShell"
    ".yml" = "YAML"
    ".yaml" = "YAML"
    ".json" = "JSON"
    ".md" = "Markdown"
    ".txt" = "Text"
    ".xml" = "XML"
    ".yaml" = "YAML"
    ".toml" = "TOML"
    ".env" = "Properties"
    ".dockerfile" = "Docker"
    ".blade.php" = "PHP"
}

# Exclude patterns
$ExcludePatterns = @(
    "node_modules",
    ".git",
    "vendor",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "build",
    ".next",
    ".nuxt"
)

# Track last heartbeat per project
$LastHeartbeat = @{}

function Get-Language {
    param([string]$FilePath)
    $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    if ($LanguageMap.ContainsKey($ext)) {
        return $LanguageMap[$ext]
    }
    return "Unknown"
}

function Get-ProjectName {
    param([string]$FilePath)
    # Try to find git repo root
    $dir = Split-Path $FilePath -Parent
    while ($dir) {
        if (Test-Path (Join-Path $dir ".git")) {
            return Split-Path $dir -Leaf
        }
        $dir = Split-Path $dir -Parent
    }
    # Fallback to parent directory name
    return Split-Path (Split-Path $FilePath -Parent) -Leaf
}

function Send-Heartbeat {
    param(
        [string]$FilePath,
        [string]$Language,
        [string]$Project
    )
    
    $timestamp = [int][double]::Parse((Get-Date -UFormat %s))
    
    $payload = @{
        time = $timestamp
        project = $Project
        language = $Language
        entity = $FilePath
        type = "file"
        category = "coding"
        user_agent = "wakatime-cli/1.0"
    } | ConvertTo-Json
    
    $bytes = [System.Text.Encoding]::UTF8.GetBytes("${ApiKey}:")
    $base64 = [System.Convert]::ToBase64String($bytes)
    $headers = @{
        "Authorization" = "Basic $base64"
        "Content-Type" = "application/json"
    }
    
    try {
        Invoke-RestMethod -Uri $WAKAPI_URL -Method Post -Headers $headers -Body $payload -TimeoutSec 5
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ $Project ($Language)" -ForegroundColor Green
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✗ Error: $_" -ForegroundColor Red
    }
}

function Should-Exclude {
    param([string]$Path)
    foreach ($pattern in $ExcludePatterns) {
        if ($Path -match [regex]::Escape($pattern)) {
            return $true
        }
    }
    return $false
}

Write-Host "=== Wakapi File Watcher ===" -ForegroundColor Cyan
Write-Host "Watching directories:" -ForegroundColor White
$WatchDirs | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""
Write-Host "Debounce: ${DebounceSeconds}s | Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Create file system watchers
$watchers = @()
foreach ($dir in $WatchDirs) {
    if (Test-Path $dir) {
        $watcher = New-Object System.IO.FileSystemWatcher
        $watcher.Path = $dir
        $watcher.IncludeSubdirectories = $true
        $watcher.Filter = "*.*"
        $watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName
        $watcher.EnableRaisingEvents = $true
        
        $action = {
            $path = $Event.SourceEventArgs.FullPath
            $name = $Event.SourceEventArgs.Name
            
            # Skip excluded patterns
            if ($path -match "node_modules|\.git|vendor|__pycache__|\.venv|venv|dist|build|\.next|\.nuxt") {
                return
            }
            
            # Skip non-code files
            $ext = [System.IO.Path]::GetExtension($path).ToLower()
            $codeExts = @(".py", ".js", ".ts", ".tsx", ".jsx", ".php", ".java", ".kt", ".cs", ".go", ".rs", ".rb", ".swift", ".html", ".css", ".scss", ".vue", ".svelte", ".sql", ".sh", ".ps1", ".yml", ".yaml", ".json", ".md", ".txt", ".xml", ".toml", ".env")
            if ($ext -notin $codeExts) {
                return
            }
            
            # Debounce check
            $project = Split-Path (Split-Path $path -Parent) -Leaf
            $now = Get-Date
            if ($script:LastHeartbeat.ContainsKey($project)) {
                $last = $script:LastHeartbeat[$project]
                if (($now - $last).TotalSeconds -lt $script:DebounceSeconds) {
                    return
                }
            }
            $script:LastHeartbeat[$project] = $now
            
            # Send heartbeat
            $language = & $GetLanguage -FilePath $path
            $projectName = & $GetProjectName -FilePath $path
            
            & $Send-Heartbeat -FilePath $path -Language $language -Project $projectName
        }
        
        Register-ObjectEvent $watcher "Changed" -Action $action
        Register-ObjectEvent $watcher "Created" -Action $action
        $watchers += $watcher
        
        Write-Host "✓ Watching: $dir" -ForegroundColor Green
    } else {
        Write-Host "✗ Not found: $dir" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Waiting for file changes..." -ForegroundColor Cyan
Write-Host ""

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup
    $watchers | ForEach-Object {
        $_.EnableRaisingEvents = $false
        $_.Dispose()
    }
    Write-Host "Watcher stopped" -ForegroundColor Yellow
}