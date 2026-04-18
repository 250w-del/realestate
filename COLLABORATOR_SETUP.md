# 👥 Collaborator Setup Guide

Welcome! This guide will help you set up the Real Estate Platform for development using our shared Supabase database.

## 🎯 Quick Start (5 minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/250w-del/realestate.git
cd realestate
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file:

```env
# Database Configuration (Shared Supabase)
DB_HOST=db.rmqmvkaerxxjqxxybkqi.supabase.co
DB_USER=postgres
DB_PASSWORD=lRBmNMEXMfkHk6fq
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true

# Supabase Configuration
SUPABASE_URL=https://rmqmvkaerxxjqxxybkqi.supabase.co
SUPABASE_ANON_KEY=sb_publishable_l_ouHzdWhaBCT3dFpn1UVA_YWZht70-

# JWT Configuration
JWT_SECRET=shared_dev_secret_key_2024
JWT_EXPIRE=7d

# App Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Optional: Add your own Cloudinary/Email if needed
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
```

#### Frontend Configuration

Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://rmqmvkaerxxjqxxybkqi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_l_ouHzdWhaBCT3dFpn1UVA_YWZht70-

# App Configuration
VITE_APP_NAME=MichelRealEstate Platform
VITE_APP_VERSION=1.0.0
```

### Step 4: Start Development Servers

**Option A: Using the start script (Windows)**
```bash
# From project root
start_dev.bat
```

**Option B: Manual start**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

---

## 🗄️ Database Information

### Shared Supabase Database

We're all using the same Supabase database for development:

- **Project ID**: `rmqmvkaerxxjqxxybkqi`
- **Host**: `db.rmqmvkaerxxjqxxybkqi.supabase.co`
- **Database**: `postgres`
- **Dashboard**: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi

### Database Schema

The database is already set up with all tables. You can view the schema in:
- `database/schema_postgresql.sql`

### Tables Available:
- `users` - User accounts (admin, agent, user)
- `properties` - Property listings
- `favorites` - User favorite properties
- `messages` - User-agent messaging
- `viewings` - Property viewing appointments
- `reviews` - Property reviews
- `notifications` - User notifications

---

## 🔐 Test Accounts

You can create your own test accounts or use these:

### Create Admin Account
```bash
cd backend
node scripts/create_admin.js
```

### Register New Users
Use the registration page at http://localhost:3000/register

---

## 🚀 Development Workflow

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
- Edit code
- Test locally
- Commit frequently

### 4. Push Your Branch
```bash
git add .
git commit -m "Description of changes"
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Go to GitHub repository
- Create Pull Request from your branch to `main`
- Request review

---

## ⚠️ Important Development Rules

### Database Safety

Since we share the same database:

1. **Don't delete tables or drop schema**
2. **Don't delete other developers' test data**
3. **Use unique test data** (e.g., prefix with your name)
4. **Test destructive operations carefully**

### Example: Creating Test Properties
```javascript
// Good - Use your name prefix
title: "John - Test Property 1"

// Bad - Generic names that might conflict
title: "Test Property"
```

### Git Workflow

1. **Always pull before starting work**
   ```bash
   git pull origin main
   ```

2. **Work on feature branches, not main**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Commit often with clear messages**
   ```bash
   git commit -m "Add property search filter"
   ```

4. **Push your branch and create PR**
   ```bash
   git push origin feature/my-feature
   ```

---

## 🧪 Testing Your Setup

### Test Backend Connection
```bash
cd backend
node test_connection.js
```

Expected output:
```
✅ PostgreSQL Database connected successfully
✅ Server running on port 5000
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Get properties
curl http://localhost:5000/api/properties
```

### Test Frontend
1. Open http://localhost:3000
2. You should see the homepage
3. Try registering a new account
4. Browse properties

---

## 🛠️ Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution:**
1. Check your internet connection
2. Verify `DB_PASSWORD` in `backend/.env`
3. Ensure `DB_SSL=true` is set

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Issue: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "CORS error"

**Solution:**
Check `FRONTEND_URL` in `backend/.env` matches your frontend URL:
```env
FRONTEND_URL=http://localhost:3000
```

---

## 📚 Project Structure

```
realestate/
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Route controllers
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, validation, etc.
│   ├── config/            # Database config
│   └── server.js          # Entry point
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux store
│   │   └── App.jsx       # Main app
│   └── index.html
├── database/              # SQL schemas
└── scripts/               # Utility scripts
```

---

## 🎯 Development Tasks

### Backend Development
- API endpoints in `backend/routes/`
- Business logic in `backend/controllers/`
- Database queries use PostgreSQL syntax

### Frontend Development
- Pages in `frontend/src/pages/`
- Components in `frontend/src/components/`
- State management with Redux in `frontend/src/store/`
- API calls in `frontend/src/services/`

---

## 📞 Need Help?

1. **Check Documentation**:
   - `README.md` - Main documentation
   - `START_HERE.md` - Quick start guide
   - `TROUBLESHOOTING_DNS.md` - Connection issues

2. **Ask Team Members**:
   - Create an issue on GitHub
   - Message in team chat

3. **Supabase Dashboard**:
   - View database: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/editor
   - SQL Editor: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/sql

---

## ✅ Checklist

Before starting development, ensure:

- [ ] Repository cloned
- [ ] Dependencies installed (backend & frontend)
- [ ] Environment files created (`.env` in both folders)
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Can access http://localhost:3000
- [ ] API health check works
- [ ] Created a feature branch

---

## 🎉 You're Ready!

You're all set to start developing! Remember:
- Pull latest changes before starting work
- Work on feature branches
- Test your changes locally
- Create PRs for review
- Be careful with shared database

Happy coding! 🚀
