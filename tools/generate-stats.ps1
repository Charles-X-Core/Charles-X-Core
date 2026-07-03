# TakaTime Stats Generator
# Generates a cyberpunk-themed stats card for GitHub profile

$MONGO_URI = [System.Environment]::GetEnvironmentVariable("TAKATIME_MONGO_URI", "User")

if (-not $MONGO_URI) {
    Write-Host "Error: TAKATIME_MONGO_URI not set. Run setup-takatime.ps1 first." -ForegroundColor Red
    exit 1
}

$TOOLS_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$REPORT_BIN = Join-Path $TOOLS_DIR "taka-report-windows-amd64.exe"
$OUTPUT_DIR = Split-Path -Parent $TOOLS_DIR
$OUTPUT_FILE = Join-Path $OUTPUT_DIR "metrics\takatime.svg"

# Generate cyberpunk themed stats
& $REPORT_BIN `
    --uri $MONGO_URI `
    --theme cyberpunk `
    --days 7 `
    --output $OUTPUT_FILE

Write-Host "Stats card generated: $OUTPUT_FILE" -ForegroundColor Green