# 🚀 Quick Start with Supabase

Your project is pre-configured for Supabase! Follow these 3 simple steps.

## ⚡ 3-Step Setup

### 1️⃣ Install Dependencies (1 minute)

```bash
cd backend
npm install pg
```

### 2️⃣ Add Your Password (30 seconds)

Edit `backend/.env` and add your Supabase password:

```env
DB_PASSWORD=your_actual_password_here
```

**Where to find it:**
1. Go to [Your Supabase Project](https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi)
2. Click **Settings** → **Database**
3. Copy your database password

### 3️⃣ Run Database Schema (2 minutes)

1. Go to [SQL Editor](https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/sql)
2. Click **New Query**
3. Copy ALL contents from `database/schema_postgresql.sql`
4. Paste and click **Run**

## ✅ Start Your Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ PostgreSQL Database connected successfully
✅ Server running on port 5000
```

## 🎯 Test It

```bash
curl http://localhost:5000/api/health
```

## 📚 Your Supabase Details

- **Project**: `rmqmvkaerxxjqxxybkqi`
- **URL**: `https://rmqmvkaerxxjqxxybkqi.supabase.co`
- **Dashboard**: [Open Dashboard](https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi)
- **SQL Editor**: [Open SQL Editor](https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/sql)

## 🔧 Already Configured

✅ Database host: `db.rmqmvkaerxxjqxxybkqi.supabase.co`
✅ Database port: `5432`
✅ Database name: `postgres`
✅ SSL enabled: `true`
✅ Publishable key: `sb_publishable_l_ouHzdWhaBCT3dFpn1UVA_YWZht70-`

## 🆘 Need Help?

- **Detailed Guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Migration Info**: See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Quick Start**: See [QUICK_START_POSTGRESQL.md](./QUICK_START_POSTGRESQL.md)

## 🎉 That's It!

Your real estate platform is ready to run with Supabase!
