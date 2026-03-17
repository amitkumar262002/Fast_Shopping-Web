@echo off
:: ============================================================
::  FAST SHOPPING — One-Click Startup (Double-click this file)
:: ============================================================
title Fast Shopping Launcher

echo.
echo  =============================================
echo   FAST SHOPPING - Starting Platform...
echo  =============================================
echo.

:: Kill port 8000 if busy
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    echo  Clearing port 8000 (PID %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

:: Kill port 5173 if busy
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    echo  Clearing port 5173 (PID %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 1 /nobreak >nul

:: Start Backend
echo  Starting Backend (FastAPI on port 8000)...
start "Fast Shopping - Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && python -m app.main"

timeout /t 3 /nobreak >nul

:: Start Frontend
echo  Starting Frontend (Vite on port 5173)...
start "Fast Shopping - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host"

timeout /t 4 /nobreak >nul

echo.
echo  =============================================
echo   FAST SHOPPING IS RUNNING!
echo  =============================================
echo.
echo   Website:   http://localhost:5173
echo   API Docs:  http://localhost:8000/api/docs
echo.
echo  Opening website in browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo  Both windows are open. Close this window anytime.
pause
