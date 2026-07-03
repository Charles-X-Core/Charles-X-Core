# Wakapi Startup Script
# Run this to start your local coding stats server

$WAKAPI_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$WAKAPI_EXE = Join-Path $WAKAPI_DIR "wakapi.exe"
$CONFIG_FILE = Join-Path $WAKAPI_DIR "config-local.yml"
$DATA_DIR = Join-Path $WAKAPI_DIR "data"

# Create data directory if it doesn't exist
if (-not (Test-Path $DATA_DIR)) {
    New-Item -ItemType Directory -Path $DATA_DIR -Force | Out-Null
}

Write-Host "Starting Wakapi server..." -ForegroundColor Cyan
Write-Host "Dashboard: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

& $WAKAPI_EXE -config $CONFIG_FILE