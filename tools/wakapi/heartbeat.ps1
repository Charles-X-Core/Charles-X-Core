# Wakapi Quick Heartbeat
# Sends a single heartbeat for current directory

param(
    [string]$Project = "",
    [string]$Language = "",
    [string]$File = ""
)

$WAKAPI_URL = "http://localhost:3000/api/compat/wakatime/v1/users/current/heartbeats.bulk"
$API_KEY = "81efea9c-a16b-4b97-aef4-e9877277af1a"

# Auto-detect project from current directory
if (-not $Project) {
    $Project = Split-Path (Get-Location) -Leaf
}

# Auto-detect language from file extension
if (-not $Language -and $File) {
    $ext = [System.IO.Path]::GetExtension($File).ToLower()
    $langMap = @{
        ".py" = "Python"
        ".js" = "JavaScript"
        ".ts" = "TypeScript"
        ".php" = "PHP"
        ".java" = "Java"
        ".kt" = "Kotlin"
        ".cs" = "C#"
        ".go" = "Go"
        ".rs" = "Rust"
        ".rb" = "Ruby"
        ".html" = "HTML"
        ".css" = "CSS"
        ".vue" = "Vue"
        ".md" = "Markdown"
    }
    if ($langMap.ContainsKey($ext)) {
        $Language = $langMap[$ext]
    } else {
        $Language = "Unknown"
    }
}

if (-not $File) {
    $File = "manual-heartbeat"
}

$timestamp = [int][double]::Parse((Get-Date -UFormat %s))

$payload = @{
    time = $timestamp
    project = $Project
    language = $Language
    entity = $File
    type = "file"
    category = "coding"
    user_agent = "wakatime-cli/1.0"
} | ConvertTo-Json

$bytes = [System.Text.Encoding]::UTF8.GetBytes("${API_KEY}:")
$base64 = [System.Convert]::ToBase64String($bytes)
$headers = @{
    "Authorization" = "Basic $base64"
    "Content-Type" = "application/json"
}

try {
    Invoke-RestMethod -Uri $WAKAPI_URL -Method Post -Headers $headers -Body $payload -TimeoutSec 5
    Write-Host "✓ Heartbeat sent: $Project ($Language)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
    Write-Host "  Make sure Wakapi is running" -ForegroundColor Yellow
}