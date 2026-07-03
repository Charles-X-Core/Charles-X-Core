# Wakapi - Local Coding Stats

100% local, zero cloud, SQLite-based coding activity tracker.

## Setup (2 minutes)

### 1. Start Wakapi Server
```powershell
cd C:\Users\Administrator\Desktop\github\charles-profile\tools\wakapi
.\start-wakapi.ps1
```

### 2. Create Account
1. Open http://localhost:3000
2. Click "Sign Up"
3. Username: `charles-x`
4. Password: (your choice)

### 3. Send Heartbeats
```powershell
# Manual heartbeat
.\send-heartbeat.ps1 -Project "farmacia-inventario" -Language "PHP" -File "app/Models/Producto.php"
```

### 4. Generate Stats for GitHub
```powershell
.\generate-stats.ps1
```

## Files

- `wakapi.exe` - Server binary
- `config-local.yml` - Configuration
- `start-wakapi.ps1` - Start server
- `send-heartbeat.ps1` - Send coding activity
- `generate-stats.ps1` - Generate stats SVG
- `data/wakapi.db` - SQLite database (auto-created)

## API

- Dashboard: http://localhost:3000
- Heartbeat API: http://localhost:3000/api/heartbeat
- Summary API: http://localhost:3000/api/summary

## Auto-Tracking

To track automatically, you can:
1. Use a shell hook (if using bash/zsh)
2. Run `send-heartbeat.ps1` periodically
3. Integrate with your editor via API