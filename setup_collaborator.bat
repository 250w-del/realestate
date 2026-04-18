@echo off
echo ========================================
echo   Real Estate Platform - Collaborator Setup
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)
echo.

echo [2/4] Setting up Backend Environment...
if not exist .env (
    copy .env.example .env
    echo ✓ Created backend/.env from .env.example
    echo.
    echo IMPORTANT: The .env file has been created with shared Supabase credentials.
    echo You can start developing immediately!
) else (
    echo ✓ backend/.env already exists
)
echo.

echo [3/4] Installing Frontend Dependencies...
cd ..\frontend
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)
echo.

echo [4/4] Setting up Frontend Environment...
if not exist .env (
    copy .env.example .env
    echo ✓ Created frontend/.env from .env.example
) else (
    echo ✓ frontend/.env already exists
)
echo.

cd ..

echo ========================================
echo   Setup Complete! ✓
echo ========================================
echo.
echo Next Steps:
echo   1. Start backend:  cd backend ^&^& npm run dev
echo   2. Start frontend: cd frontend ^&^& npm run dev
echo   3. Open browser:   http://localhost:3000
echo.
echo Or use the quick start script:
echo   start_dev.bat
echo.
echo For more information, see COLLABORATOR_SETUP.md
echo.
pause
