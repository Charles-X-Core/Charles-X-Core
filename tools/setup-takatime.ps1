# TakaTime Configuration
# Run this script to set up your MongoDB connection

$MONGO_URI = Read-Host -Prompt "Enter your MongoDB Atlas URI (mongodb+srv://...)"

# Save to environment variable (user level)
[System.Environment]::SetEnvironmentVariable("TAKATIME_MONGO_URI", $MONGO_URI, "User")

Write-Host "MongoDB URI saved to environment variable TAKATIME_MONGO_URI" -ForegroundColor Green
Write-Host "Restart your terminal for changes to take effect." -ForegroundColor Yellow