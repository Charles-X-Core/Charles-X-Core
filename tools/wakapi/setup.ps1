# Wakapi Quick Setup
# Helps configure API key and test connection

$WAKAPI_URL = "http://localhost:3000"
$API_KEY_FILE = "C:\Users\Administrator\Desktop\github\charles-profile\tools\wakapi\.api_key"

Write-Host "=== Wakapi Quick Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Wakapi is running
try {
    $null = Invoke-RestMethod -Uri $WAKAPI_URL -TimeoutSec 2
    Write-Host "✓ Wakapi is running at $WAKAPI_URL" -ForegroundColor Green
} catch {
    Write-Host "✗ Wakapi is not running" -ForegroundColor Red
    Write-Host "  Start it with: .\start-wakapi.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Login with your account" -ForegroundColor White
Write-Host "3. Go to Settings page" -ForegroundColor White
Write-Host "4. Copy your API Key" -ForegroundColor White
Write-Host ""

$apiKey = Read-Host -Prompt "Paste your API key here"

if ($apiKey) {
    $apiKey | Out-File -FilePath $API_KEY_FILE -NoNewline
    Write-Host ""
    Write-Host "✓ API key saved!" -ForegroundColor Green
    
    # Test connection
    $headers = @{
        "Authorization" = "Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${apiKey}:")))"
    }
    
    try {
        $summary = Invoke-RestMethod -Uri "$WAKAPI_URL/api/summary?interval=today" -Headers $headers
        Write-Host "✓ Connection successful!" -ForegroundColor Green
        Write-Host "  Total time today: $([math]::Round($summary.total_time / 3600, 2)) hours" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Connection failed: $_" -ForegroundColor Red
    }
} else {
    Write-Host "No API key provided" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Send heartbeat: .\send-heartbeat.ps1 -Project 'my-project' -Language 'TypeScript'" -ForegroundColor White
Write-Host "  2. Auto-track: .\auto-heartbeat.ps1" -ForegroundColor White
Write-Host "  3. Generate stats: .\generate-stats.ps1" -ForegroundColor White