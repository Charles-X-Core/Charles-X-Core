@echo off
echo === Wakapi File Watcher ===
echo.
echo This will monitor your project directories and
echo automatically send coding activity to Wakapi.
echo.
echo Press Ctrl+C to stop.
echo.
pause
powershell -ExecutionPolicy Bypass -File "%~dp0file-watcher.ps1"