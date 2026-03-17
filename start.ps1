# ============================================================
#  FAST SHOPPING — One-Click Startup Script
#  Run: .\start.ps1
#  Starts Backend (FastAPI :8000) + Frontend (Vite :5173)
# ============================================================

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  🛍️  FAST SHOPPING — Starting Platform" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# ── Kill any process already on port 8000 ─────────────────
$port8000 = netstat -ano | Select-String ":8000 " | Select-String "LISTENING"
if ($port8000) {
    $pid8000 = ($port8000 -split "\s+")[-1]
    Write-Host "⚠️  Port 8000 busy (PID $pid8000). Killing it..." -ForegroundColor Yellow
    taskkill /PID $pid8000 /F 2>$null | Out-Null
    Start-Sleep -Seconds 1
    Write-Host "✅ Port 8000 cleared!" -ForegroundColor Green
} else {
    Write-Host "✅ Port 8000 is free." -ForegroundColor Green
}

# ── Kill any process already on port 5173 ─────────────────
$port5173 = netstat -ano | Select-String ":5173 " | Select-String "LISTENING"
if ($port5173) {
    $pid5173 = ($port5173 -split "\s+")[-1]
    Write-Host "⚠️  Port 5173 busy (PID $pid5173). Killing it..." -ForegroundColor Yellow
    taskkill /PID $pid5173 /F 2>$null | Out-Null
    Start-Sleep -Seconds 1
    Write-Host "✅ Port 5173 cleared!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🐍 Starting Backend (FastAPI)..." -ForegroundColor Magenta

# ── Start Backend in new window ────────────────────────────
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PSScriptRoot\backend'; .\venv\Scripts\activate; Write-Host '🐍 Backend starting on http://localhost:8000' -ForegroundColor Green; python -m app.main"
) -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "⚛️  Starting Frontend (Vite)..." -ForegroundColor Blue

# ── Start Frontend in new window ───────────────────────────
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PSScriptRoot\frontend'; Write-Host '⚛️  Frontend starting on http://localhost:5173' -ForegroundColor Blue; npm run dev -- --host"
) -WindowStyle Normal

Start-Sleep -Seconds 4

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  ✅ Fast Shopping is RUNNING!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Website:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "  🔧 API Docs:  http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host "  📱 Network:   http://$(((Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1).IPAddress)):5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press ENTER to open the website in browser..." -ForegroundColor Gray
Read-Host | Out-Null

Start-Process "http://localhost:5173"
