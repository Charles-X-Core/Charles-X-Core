# Wakapi Background Service
# Runs Wakapi as a background process

$WAKAPI_DIR = "C:\Users\Administrator\Desktop\github\charles-profile\tools\wakapi"
$WAKAPI_EXE = Join-Path $WAKAPI_DIR "wakapi.exe"
$CONFIG_FILE = Join-Path $WAKAPI_DIR "config-local.yml"
$LOG_FILE = Join-Path $WAKAPI_DIR "wakapi.log"
$PID_FILE = Join-Path $WAKAPI_DIR "wakapi.pid"

function Start-Wakapi {
    # Check if already running
    if (Test-Path $PID_FILE) {
        $existingPid = Get-Content $PID_FILE
        $process = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Wakapi already running (PID: $existingPid)" -ForegroundColor Yellow
            return
        }
    }
    
    Write-Host "Starting Wakapi in background..." -ForegroundColor Cyan
    
    # Start process in background
    $process = Start-Process -FilePath $WAKAPI_EXE `
        -ArgumentList "-config $CONFIG_FILE" `
        -WindowStyle Hidden `
        -RedirectStandardOutput $LOG_FILE `
        -RedirectStandardError "$LOG_FILE.error" `
        -PassThru
    
    # Save PID
    $process.Id | Out-File -FilePath $PID_FILE -NoNewline
    
    Write-Host "Wakapi started (PID: $($process.Id))" -ForegroundColor Green
    Write-Host "Dashboard: http://localhost:3000" -ForegroundColor Green
    Write-Host "Log: $LOG_FILE" -ForegroundColor Gray
}

function Stop-Wakapi {
    if (Test-Path $PID_FILE) {
        $pid = Get-Content $PID_FILE
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Remove-Item $PID_FILE -Force
        Write-Host "Wakapi stopped" -ForegroundColor Red
    } else {
        Write-Host "Wakapi not running" -ForegroundColor Yellow
    }
}

function Get-WakapiStatus {
    if (Test-Path $PID_FILE) {
        $pid = Get-Content $PID_FILE
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Wakapi is running (PID: $pid)" -ForegroundColor Green
            Write-Host "CPU: $($process.CPU)s | Memory: $([math]::Round($process.WorkingSet64/1MB, 2))MB" -ForegroundColor Gray
        } else {
            Write-Host "Wakapi not running (stale PID)" -ForegroundColor Yellow
            Remove-Item $PID_FILE -Force
        }
    } else {
        Write-Host "Wakapi not running" -ForegroundColor Yellow
    }
}

# Export functions
Export-ModuleMember -Function Start-Wakapi, Stop-Wakapi, Get-WakapiStatus