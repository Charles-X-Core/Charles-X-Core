# Wakapi Heartbeat Sender
# Sends coding activity to local Wakapi server

param(
    [string]$Project = "unknown",
    [string]$Language = "unknown",
    [string]$File = "unknown"
)

$WAKAPI_URL = "http://localhost:3000/api/heartbeat"
$API_KEY = "charles-x-local-key"

$payload = @{
    time = [int][double]::Parse((Get-Date -UFormat %s))
    project = $Project
    language = $Language
    entity = $File
    type = "file"
    category = "coding"
    user_agent = "wakatime/14.0.1"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${API_KEY}:")))"
    "Content-Type" = "application/json"
}

try {
    Invoke-RestMethod -Uri $WAKAPI_URL -Method Post -Headers $headers -Body $payload
    Write-Host "Heartbeat sent: $Project ($Language)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Make sure Wakapi is running: .\start-wakapi.ps1" -ForegroundColor Yellow
}