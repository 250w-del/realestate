# 🔍 How to Get Your Correct Supabase Connection Details

## The Problem

The hostname `db.rmqmvkaerxxjqxxybkqi.supabase.co` cannot be found. This usually means:
- The project ID is incorrect
- The project doesn't exist
- The project was deleted

## ✅ Solution: Get the Correct Details

### Step 1: Log into Supabase

Go to: https://app.supabase.com

### Step 2: Find Your Project

Look at your projects list. Do you see a project there?

**If YES** → Continue to Step 3
**If NO** → You need to create a new project (see "Create New Project" below)

### Step 3: Click on Your Project

Click on the project you want to use.

### Step 4: Get Connection Details

1. Click **Settings** (gear icon in sidebar)
2. Click **Database**
3. Scroll down to **Connection Info** section

You'll see something like this:

```
Host: db.abcdefghijklmnop.supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: [your password]
```

### Step 5: Copy to Your .env

Open `backend/.env` and update:

```env
DB_HOST=db.abcdefghijklmnop.supabase.co  ← Copy from "Host"
DB_USER=postgres
DB_PASSWORD=9LYc2AnMII7zEDar  ← Your password
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
```

### Step 6: Test Connection

```bash
cd backend
node test_connection.js
```

---

## 🆕 Create New Project (If Needed)

If you don't have a project or want to create a new one:

### 1. Go to Supabase Dashboard
https://app.supabase.com

### 2. Click "New Project"

### 3. Fill in Details:
- **Name**: MichelRealEstate (or any name)
- **Database Password**: Create a strong password (save it!)
- **Region**: Choose closest to you
- **Pricing Plan**: Free

### 4. Click "Create new project"

Wait 2-3 minutes for setup to complete.

### 5. Get Connection Details

Once ready:
1. Go to **Settings** → **Database**
2. Copy the connection details
3. Update your `backend/.env` file

### 6. Run Database Schema

1. Go to **SQL Editor** (in sidebar)
2. Click **New Query**
3. Open `database/schema_postgresql.sql` from your project
4. Copy ALL contents
5. Paste into SQL Editor
6. Click **Run** (or Ctrl+Enter)

### 7. Test Connection

```bash
cd backend
node test_connection.js
```

---

## 📋 Quick Checklist

- [ ] Logged into Supabase dashboard
- [ ] Found or created a project
- [ ] Copied the EXACT hostname from Settings → Database
- [ ] Updated `backend/.env` with correct details
- [ ] Ran database schema in SQL Editor (if new project)
- [ ] Tested connection with `node test_connection.js`
- [ ] Saw "✅ ALL TESTS PASSED!"

---

## 🎯 What to Do Right Now

1. **Open**: https://app.supabase.com
2. **Check**: Do you see any projects?
3. **If YES**: Get connection details from Settings → Database
4. **If NO**: Create a new project
5. **Update**: `backend/.env` with correct hostname
6. **Test**: Run `node test_connection.js`

---

## 💡 Pro Tip

The project ID in the hostname should match what you see in the URL when you're in your project:

```
https://app.supabase.com/project/YOUR_PROJECT_ID
                                      ↑
                                This should match
                                      ↓
db.YOUR_PROJECT_ID.supabase.co
```

---

**Still stuck?** See [TROUBLESHOOTING_DNS.md](./TROUBLESHOOTING_DNS.md) for more solutions.
