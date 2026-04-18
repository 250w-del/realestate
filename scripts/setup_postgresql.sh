#!/bin/bash

# PostgreSQL Migration Setup Script
# This script helps set up PostgreSQL for the real estate platform

echo "========================================="
echo "PostgreSQL Migration Setup"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Installing PostgreSQL driver..."
cd backend
npm uninstall mysql2 2>/dev/null
npm install pg
echo "✅ PostgreSQL driver installed"
echo ""

echo "Step 2: Checking environment file..."
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please update the database credentials in backend/.env"
else
    echo "✅ .env file exists"
    echo "⚠️  Please update DB_HOST, DB_USER, DB_PASSWORD, DB_PORT to PostgreSQL settings"
fi
echo ""

echo "Step 3: Database setup options..."
echo ""
echo "Choose your database setup:"
echo "1) Local PostgreSQL"
echo "2) Supabase (Cloud)"
echo "3) Skip (I'll do it manually)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Local PostgreSQL Setup"
        echo "----------------------"
        read -p "Enter PostgreSQL username (default: postgres): " db_user
        db_user=${db_user:-postgres}
        
        read -p "Enter database name (default: real_estate): " db_name
        db_name=${db_name:-real_estate}
        
        echo ""
        echo "Creating database..."
        psql -U $db_user -c "CREATE DATABASE $db_name;" 2>/dev/null
        
        echo "Running schema..."
        psql -U $db_user -d $db_name -f ../database/schema_postgresql.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Database created and schema applied successfully"
        else
            echo "❌ Error creating database. Please check PostgreSQL installation and credentials"
        fi
        ;;
    2)
        echo ""
        echo "Supabase Setup"
        echo "--------------"
        echo "1. Go to https://supabase.com and create a new project"
        echo "2. Go to Settings → Database"
        echo "3. Copy your connection details"
        echo "4. Go to SQL Editor in Supabase dashboard"
        echo "5. Copy and paste the contents of database/schema_postgresql.sql"
        echo "6. Run the SQL"
        echo "7. Update your backend/.env file with Supabase credentials"
        echo ""
        echo "Example .env for Supabase:"
        echo "DB_HOST=db.your-project.supabase.co"
        echo "DB_USER=postgres"
        echo "DB_PASSWORD=your_password"
        echo "DB_NAME=postgres"
        echo "DB_PORT=5432"
        echo "DB_SSL=true"
        echo ""
        read -p "Press Enter when done..."
        ;;
    3)
        echo "Skipping database setup"
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run: cd backend && npm run dev"
echo "3. Check console for 'PostgreSQL Database connected successfully'"
echo ""
echo "For detailed instructions, see MIGRATION_GUIDE.md"
echo ""
