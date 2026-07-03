# Wakapi Stats Generator for GitHub Profile
# Generates a cyberpunk-themed stats SVG

param(
    [int]$Days = 7
)

$WAKAPI_URL = "http://localhost:3000"
$API_KEY = "charles-x-local-key"
$OUTPUT_DIR = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$OUTPUT_FILE = Join-Path $OUTPUT_DIR "metrics\takatime.svg"

$headers = @{
    "Authorization" = "Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${API_KEY}:")))"
}

try {
    # Get user stats
    $summary = Invoke-RestMethod -Uri "$WAKAPI_URL/api/summary?range=$Days" -Headers $headers
    
    $totalHours = [math]::Round($summary.total_time / 3600, 1)
    $languages = $summary.languages | Select-Object -First 5
    
    # Generate SVG
    $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="200">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FF4444;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="480" height="200" fill="#0a0a0f"/>
  <text x="240" y="40" font-family="monospace" font-size="24" fill="url(#grad)" text-anchor="middle">⏱️ CODING ACTIVITY</text>
  <text x="240" y="80" font-family="monospace" font-size="36" fill="#FF4444" text-anchor="middle">${totalHours}h</text>
  <text x="240" y="110" font-family="monospace" font-size="14" fill="#FF6B35" text-anchor="middle">last ${Days} days</text>
  
  $(($languages | ForEach-Object { 
    $y = 130 + ($languages.IndexOf($_) * 15)
    "  <text x='40' y='$y' font-family='monospace' font-size='12' fill='#FFA500'>$($_.name): $([math]::Round($_.total/3600, 1))h</text>"
  }) -join "`n")
  
  <text x="240" y="190" font-family="monospace" font-size="10" fill="#666" text-anchor="middle">Powered by Wakapi (Local)</text>
</svg>
"@

    $svg | Out-File -FilePath $OUTPUT_FILE -Encoding UTF8
    Write-Host "Stats card generated: $OUTPUT_FILE" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Make sure Wakapi is running: .\start-wakapi.ps1" -ForegroundColor Yellow
}