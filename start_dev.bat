@echo off
echo =========================================
echo Starting Real Estate Platform
echo =========================================
echo.

REM Start backend in a new window
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================
echo Both servers are starting!
echo =========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
echo (The servers will keep running in their own windows)
pause >nul
