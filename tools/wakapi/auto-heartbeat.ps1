# Wakapi Auto-Heartbeat
# Sends periodic heartbeats to track coding activity

param(
    [int]$IntervalSeconds = 120,
    [string]$Project = "charles-profile",
    [string]$Language = "Markdown"
)

$WAKAPI_URL = "http://localhost:3000"
$API_KEY_FILE = "C:\Users\Administrator\Desktop\github\charles-profile\tools\wakapi\.api_key"

# Get API key from file or prompt
if (Test-Path $API_KEY_FILE) {
    $API_KEY = Get-Content $API_KEY_FILE
} else {
    $API_KEY = Read-Host -Prompt "Enter your Wakapi API key (from http://localhost:3000/settings)"
    $API_KEY | Out-File -FilePath $API_KEY_FILE -NoNewline
}

$headers = @{
    "Authorization" = "Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${API_KEY}:")))"
}

Write-Host "Starting auto-heartbeat (Ctrl+C to stop)..." -ForegroundColor Cyan
Write-Host "Project: $Project | Language: $Language | Interval: ${IntervalSeconds}s" -ForegroundColor Gray

while ($true) {
    $timestamp = [int][double]::Parse((Get-Date -UFormat %s))
    
    $payload = @{
        time = $timestamp
        project = $Project
        language = $Language
        entity = "auto-heartbeat"
        type = "app"
        category = "coding"
        user_agent = "wakatime-cli/1.0"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$WAKAPI_URL/api/heartbeat" `
            -Method Post `
            -Headers $headers `
            -Body $payload `
            -ContentType "application/json"
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Heartbeat sent" -ForegroundColor Green
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Error: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds $IntervalSeconds
}