#!/bin/bash

# Quick Start Script for Supabase Setup

echo "========================================="
echo "Supabase Real Estate Platform Setup"
echo "========================================="
echo ""

echo "Your Supabase Project: rmqmvkaerxxjqxxybkqi"
echo "Project URL: https://rmqmvkaerxxjqxxybkqi.supabase.co"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Installing PostgreSQL driver..."
cd backend
npm install pg
if [ $? -ne 0 ]; then
    echo "❌ Error installing pg package"
    exit 1
fi
echo "✅ PostgreSQL driver installed successfully!"
echo ""

echo "Step 2: Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please update backend/.env with your Supabase password!"
    echo ""
    echo "1. Go to: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi"
    echo "2. Settings → Database"
    echo "3. Copy your database password"
    echo "4. Edit backend/.env and replace YOUR_PASSWORD_HERE"
    echo ""
    read -p "Press Enter when you've updated the password..."
else
    echo "✅ .env file exists"
fi
echo ""

echo "Step 3: Database Schema Setup"
echo ""
echo "Please complete these steps in Supabase:"
echo ""
echo "1. Go to: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/sql"
echo "2. Click 'New Query'"
echo "3. Open file: database/schema_postgresql.sql"
echo "4. Copy ALL contents and paste into SQL Editor"
echo "5. Click 'Run' or press Ctrl+Enter"
echo "6. Wait for completion"
echo ""
read -p "Have you completed the schema setup? (y/n): " ready
if [ "$ready" != "y" ] && [ "$ready" != "Y" ]; then
    echo ""
    echo "Please complete the schema setup first, then run this script again."
    exit 0
fi

echo ""
echo "Step 4: Starting the server..."
echo ""
npm run dev
