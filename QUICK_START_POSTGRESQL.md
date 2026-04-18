# Quick Start: PostgreSQL Migration

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
cd backend
npm install pg
```

### Step 2: Choose Your Database (1 min)

#### Option A: Supabase (Easiest - Recommended)
1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click "New Project"
3. Choose a name, password, and region
4. Wait 2 minutes for setup

#### Option B: Local PostgreSQL
```bash
# Install PostgreSQL first, then:
psql -U postgres -c "CREATE DATABASE real_estate;"
```

### Step 3: Run Database Schema (1 min)

#### For Supabase:
1. In Supabase dashboard → SQL Editor
2. Copy all content from `database/schema_postgresql.sql`
3. Paste and click "Run"

#### For Local:
```bash
psql -U postgres -d real_estate -f database/schema_postgresql.sql
```

### Step 4: Update Environment (1 min)

Edit `backend/.env`:

**For Supabase:**
```env
DB_HOST=db.xxxxx.supabase.co
DB_USER=postgres
DB_PASSWORD=your_supabase_password
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
```

**For Local:**
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=real_estate
DB_PORT=5432
DB_SSL=false
```

### Step 5: Start Server (1 min)
```bash
cd backend
npm run dev
```

Look for:
```
✅ PostgreSQL Database connected successfully
✅ Server running in development mode on port 5000
```

## ✅ Done!

Your app is now running with PostgreSQL!

## 🔍 Quick Test

Test the API:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-..."
}
```

## 🆘 Troubleshooting

### "Connection refused"
- Check DB_HOST and DB_PORT in .env
- For Supabase: Make sure you copied the correct host from Settings → Database

### "Password authentication failed"
- Check DB_PASSWORD in .env
- For Supabase: Use the password you set when creating the project

### "Database does not exist"
- For local: Run `psql -U postgres -c "CREATE DATABASE real_estate;"`
- For Supabase: Use `DB_NAME=postgres` (not real_estate)

### "SSL required"
- For Supabase: Set `DB_SSL=true` in .env
- For local: Set `DB_SSL=false` in .env

## 📚 Next Steps

1. ✅ Database is running
2. Test user registration: `POST /api/auth/register`
3. Test property creation: `POST /api/properties`
4. Read full guide: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## 🎯 What Changed?

- ✅ MySQL → PostgreSQL
- ✅ `mysql2` → `pg` package
- ✅ Query syntax updated
- ✅ Schema converted
- ✅ Ready for Supabase hosting

## 💡 Pro Tips

### Use Supabase Features

**1. Built-in Auth (Optional)**
```javascript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
```

**2. Real-time Updates**
```javascript
supabase
  .channel('properties')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, 
    payload => console.log(payload))
  .subscribe()
```

**3. Storage for Images**
```javascript
const { data } = await supabase.storage
  .from('property-images')
  .upload('image.jpg', file)
```

**4. Row Level Security**
```sql
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active properties"
ON properties FOR SELECT
USING (is_active = true);
```

## 📊 Comparison

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| Speed | Fast | Faster for complex queries |
| Full-text search | Basic | Advanced |
| JSON support | JSON | JSONB (faster) |
| Standards | Some | More compliant |
| Hosting | Many options | Supabase (free tier) |

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Full Migration Guide](./MIGRATION_GUIDE.md)
- [Migration Summary](./POSTGRESQL_MIGRATION_SUMMARY.md)

---

**Need help?** Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.
