# Install Wakapi as Windows Service
# Runs Wakapi automatically on startup

$WAKAPI_DIR = "C:\Users\Administrator\Desktop\github\charles-profile\tools\wakapi"
$WAKAPI_EXE = Join-Path $WAKAPI_DIR "wakapi.exe"
$CONFIG_FILE = Join-Path $WAKAPI_DIR "config-local.yml"
$TASK_NAME = "WakapiCodingStats"

Write-Host "Installing Wakapi as Windows service..." -ForegroundColor Cyan

# Create scheduled task to run at startup
$action = New-ScheduledTaskAction `
    -Execute $WAKAPI_EXE `
    -Argument "-config $CONFIG_FILE" `
    -WorkingDirectory $WAKAPI_DIR

$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest

# Register the task
Register-ScheduledTask `
    -TaskName $TASK_NAME `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Wakapi coding stats server - runs automatically on startup" `
    -Force

Write-Host "✓ Wakapi service installed!" -ForegroundColor Green
Write-Host ""
Write-Host "To manage:" -ForegroundColor Cyan
Write-Host "  Start:   Start-ScheduledTask -TaskName '$TASK_NAME'" -ForegroundColor White
Write-Host "  Stop:    Stop-ScheduledTask -TaskName '$TASK_NAME'" -ForegroundColor White
Write-Host "  Remove:  Unregister-ScheduledTask -TaskName '$TASK_NAME'" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard: http://localhost:3000" -ForegroundColor Green