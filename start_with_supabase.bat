@echo off
REM Quick Start Script for Supabase Setup

echo =========================================
echo Supabase Real Estate Platform Setup
echo =========================================
echo.

echo Your Supabase Project: rmqmvkaerxxjqxxybkqi
echo Project URL: https://rmqmvkaerxxjqxxybkqi.supabase.co
echo.

REM Check if we're in the right directory
if not exist "backend\package.json" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: Installing PostgreSQL driver...
cd backend
call npm install pg
if errorlevel 1 (
    echo Error installing pg package
    pause
    exit /b 1
)
echo PostgreSQL driver installed successfully!
echo.

echo Step 2: Checking environment configuration...
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please update backend\.env with your Supabase password!
    echo.
    echo 1. Go to: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi
    echo 2. Settings - Database
    echo 3. Copy your database password
    echo 4. Edit backend\.env and replace YOUR_PASSWORD_HERE
    echo.
    pause
) else (
    echo .env file exists
)
echo.

echo Step 3: Database Schema Setup
echo.
echo Please complete these steps in Supabase:
echo.
echo 1. Go to: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/sql
echo 2. Click "New Query"
echo 3. Open file: database\schema_postgresql.sql
echo 4. Copy ALL contents and paste into SQL Editor
echo 5. Click "Run" or press Ctrl+Enter
echo 6. Wait for completion
echo.
set /p ready="Have you completed the schema setup? (y/n): "
if /i not "%ready%"=="y" (
    echo.
    echo Please complete the schema setup first, then run this script again.
    pause
    exit /b 0
)

echo.
echo Step 4: Starting the server...
echo.
call npm run dev

pause
