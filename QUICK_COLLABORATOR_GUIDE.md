# 🚀 Quick Collaborator Guide (2 Minutes)

## Step 1: Clone & Setup (1 minute)
```bash
git clone https://github.com/250w-del/realestate.git
cd realestate
setup_collaborator.bat    # Windows
# or
./setup_collaborator.sh   # Mac/Linux
```

## Step 2: Start Development (30 seconds)
```bash
start_dev.bat    # Windows - starts both servers
# or manually:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

## Step 3: Open App (10 seconds)
Open browser: **http://localhost:3000**

---

## 📋 Shared Credentials (Already Configured!)

The setup script automatically configures:
- ✅ Supabase database connection
- ✅ API endpoints
- ✅ JWT secret for auth
- ✅ All environment variables

**You don't need to configure anything!** Just run the setup script.

---

## 🗄️ Database Access

**Supabase Dashboard**: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi

**Credentials** (if needed):
- Host: `db.rmqmvkaerxxjqxxybkqi.supabase.co`
- Database: `postgres`
- User: `postgres`
- Password: `lRBmNMEXMfkHk6fq`

---

## 🔄 Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes & test

# 4. Commit & push
git add .
git commit -m "Your changes"
git push origin feature/your-feature

# 5. Create Pull Request on GitHub
```

---

## ⚠️ Important Rules

1. **Don't delete database tables** - we share the same DB
2. **Use unique test data** - prefix with your name (e.g., "John - Test Property")
3. **Work on feature branches** - never commit directly to main
4. **Pull before starting work** - stay up to date

---

## 🆘 Common Issues

**Can't connect to database?**
- Check internet connection
- Verify `.env` files were created

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Module not found?**
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 📚 Full Documentation

For detailed information, see:
- **COLLABORATOR_SETUP.md** - Complete setup guide
- **README.md** - Project documentation
- **START_HERE.md** - Supabase quick start

---

## ✅ Quick Test

After setup, test everything works:

```bash
# Test backend
curl http://localhost:5000/api/health

# Should return: {"status":"OK",...}
```

Open http://localhost:3000 - you should see the homepage!

---

**Need help?** Check COLLABORATOR_SETUP.md or ask the team!
