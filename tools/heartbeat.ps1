# TakaTime Heartbeat Sender
# This script sends a heartbeat to MongoDB via TakaTime CLI

param(
    [string]$Project = "unknown",
    [string]$Language = "unknown",
    [string]$File = "unknown",
    [int]$Duration = 120
)

$MONGO_URI = [System.Environment]::GetEnvironmentVariable("TAKATIME_MONGO_URI", "User")

if (-not $MONGO_URI) {
    Write-Host "Error: TAKATIME_MONGO_URI not set. Run setup-takatime.ps1 first." -ForegroundColor Red
    exit 1
}

$TOOLS_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$UPLOAD_BIN = Join-Path $TOOLS_DIR "taka-upload-windows-amd64.exe"

& $UPLOAD_BIN `
    --uri $MONGO_URI `
    --project $Project `
    --language $Language `
    --file $File `
    --duration $Duration `
    --editor "opencode"

Write-Host "Heartbeat sent: $Project ($Language) for $Duration seconds" -ForegroundColor Green