# 🎯 START HERE - Supabase Setup

## Your Supabase Project is Ready!

**Project**: `rmqmvkaerxxjqxxybkqi`
**URL**: https://rmqmvkaerxxjqxxybkqi.supabase.co

---

## ⚡ 3 Simple Steps to Get Running

### 📝 Step 1: Add Your Password

Open `backend/.env` and update line 3:

```env
DB_PASSWORD=your_actual_password_here
```

**Where to find it:**
👉 https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi
→ Settings → Database → Copy password

---

### 🗄️ Step 2: Create Database Tables

1. Open: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/sql
2. Click "New Query"
3. Open file: `database/schema_postgresql.sql`
4. Copy everything (Ctrl+A, Ctrl+C)
5. Paste in SQL Editor
6. Click "Run" (Ctrl+Enter)

**Wait for**: ✅ Success message

---

### 🚀 Step 3: Start Your Server

```bash
cd backend
npm install pg
npm run dev
```

**Look for:**
```
✅ PostgreSQL Database connected successfully
✅ Server running on port 5000
```

---

## ✅ Test It Works

```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"OK",...}`

---

## 📚 Need More Help?

| Document | When to Use |
|----------|-------------|
| **README_SUPABASE.md** | Quick 3-step guide |
| **SUPABASE_SETUP.md** | Detailed setup with screenshots |
| **MIGRATION_GUIDE.md** | Full technical guide |
| **SETUP_COMPLETE.md** | What's been configured |

---

## 🎯 Quick Links

- 🏠 [Dashboard](https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi)
- 📝 [SQL Editor](https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/sql)
- 📊 [Tables](https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/editor)
- 🔑 [API Keys](https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/settings/api)

---

## 🆘 Common Issues

**"Connection refused"**
→ Check password in `backend/.env`

**"SSL required"**
→ Ensure `DB_SSL=true` in `backend/.env`

**"Database does not exist"**
→ Use `DB_NAME=postgres` (not real_estate)

---

## 🎉 That's It!

Follow the 3 steps above and you're ready to build!

**Questions?** Check the documentation files listed above.
