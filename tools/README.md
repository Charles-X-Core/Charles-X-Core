# TakaTime CLI Tools

This directory contains TakaTime CLI tools for tracking coding activity.

## Setup

1. **Get MongoDB Atlas URI** (free):
   - Go to https://mongodb.com/atlas
   - Create free account and cluster
   - Get connection string (mongodb+srv://...)

2. **Configure**:
   ```powershell
   .\setup-takatime.ps1
   ```

3. **Send Heartbeat**:
   ```powershell
   .\heartbeat.ps1 -Project "mi-proyecto" -Language "TypeScript" -File "index.ts" -Duration 120
   ```

## Files

- `taka-upload-windows-amd64.exe` - Sends heartbeats to MongoDB
- `taka-report-windows-amd64.exe` - Generates stats cards
- `taka-dashboard-windows-amd64.exe` - Local dashboard
- `setup-takatime.ps1` - Configuration script
- `heartbeat.ps1` - Heartbeat sender
- `generate-stats.ps1` - Stats card generator

## GitHub Actions

Add `MONGO_URI` secret to your repo:
1. Go to repo Settings > Secrets and variables > Actions
2. Add new secret: `MONGO_URI` with your MongoDB connection string

The workflow runs hourly and updates `metrics/takatime.svg`.