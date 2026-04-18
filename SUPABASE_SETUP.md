# Supabase Setup Guide

Your Supabase project is already configured! Follow these steps to complete the setup.

## 📋 Your Supabase Details

- **Project URL**: `https://rmqmvkaerxxjqxxybkqi.supabase.co`
- **Project ID**: `rmqmvkaerxxjqxxybkqi`
- **Database Host**: `db.rmqmvkaerxxjqxxybkqi.supabase.co`
- **Publishable Key**: `sb_publishable_l_ouHzdWhaBCT3dFpn1UVA_YWZht70-`

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your Database Password

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `rmqmvkaerxxjqxxybkqi`
3. Go to **Settings** → **Database**
4. Find your database password (you set this when creating the project)
5. Copy the password

### Step 2: Update Backend .env

Your `backend/.env` file has been pre-configured. Just add your password:

```env
# Database Configuration (PostgreSQL/Supabase)
DB_HOST=db.rmqmvkaerxxjqxxybkqi.supabase.co
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE  # ← Add your Supabase password here
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true

# Supabase Configuration
SUPABASE_URL=https://rmqmvkaerxxjqxxybkqi.supabase.co
SUPABASE_ANON_KEY=sb_publishable_l_ouHzdWhaBCT3dFpn1UVA_YWZht70-
SUPABASE_SERVICE_KEY=your_service_role_key_here  # ← Optional: Get from Settings → API
```

### Step 3: Run Database Schema

1. Go to [Supabase SQL Editor](https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/sql)
2. Click **New Query**
3. Open the file `database/schema_postgresql.sql` in your project
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for completion (should take ~10 seconds)

### Step 4: Verify Tables Created

1. In Supabase Dashboard, go to **Table Editor**
2. You should see these tables:
   - ✅ users
   - ✅ properties
   - ✅ property_images
   - ✅ favorites
   - ✅ messages
   - ✅ property_viewings
   - ✅ reviews
   - ✅ search_history
   - ✅ notifications
   - ✅ settings

### Step 5: Install Dependencies & Start Server

```bash
# Install PostgreSQL driver
cd backend
npm install pg

# Start the server
npm run dev
```

You should see:
```
✅ PostgreSQL Database connected successfully
✅ Database time: 2024-...
✅ Server running in development mode on port 5000
```

## 🎯 Test Your Connection

### Quick Test
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-...",
  "uptime": 1.234
}
```

### Register a Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔑 Get Service Role Key (Optional)

For admin operations, you may need the service role key:

1. Go to **Settings** → **API**
2. Find **service_role** key (keep this secret!)
3. Copy and add to `backend/.env`:
   ```env
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 📊 Supabase Dashboard Features

### View Your Data
- **Table Editor**: Browse and edit data directly
- **SQL Editor**: Run custom queries
- **Database**: View schema and relationships

### Monitor Performance
- **Logs**: View real-time logs
- **Reports**: Database performance metrics
- **API**: Monitor API usage

### Security
- **Authentication**: Built-in auth (optional to use)
- **Policies**: Row Level Security rules
- **API Keys**: Manage access keys

## 🔒 Enable Row Level Security (Optional)

For additional security, enable RLS:

```sql
-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Allow public to view active properties
CREATE POLICY "Public can view active properties"
ON properties FOR SELECT
USING (is_active = true);

-- Allow agents to manage their own properties
CREATE POLICY "Agents can manage own properties"
ON properties FOR ALL
USING (agent_id = auth.uid());
```

Run this in the SQL Editor to enable.

## 🌐 Connection Strings

### Direct Connection (for psql or other tools)

**Connection String:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.rmqmvkaerxxjqxxybkqi.supabase.co:5432/postgres
```

**Using psql:**
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.rmqmvkaerxxjqxxybkqi.supabase.co:5432/postgres"
```

### Connection Pooler (for production)

For better performance in production:

```env
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
# Other settings remain the same
```

Find this in **Settings** → **Database** → **Connection Pooling**

## 🚀 Frontend Setup

Your frontend is already configured in `frontend/.env`:

```env
VITE_SUPABASE_URL=https://rmqmvkaerxxjqxxybkqi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_l_ouHzdWhaBCT3dFpn1UVA_YWZht70-
```

### Optional: Use Supabase Client in Frontend

Install Supabase client:
```bash
cd frontend
npm install @supabase/supabase-js
```

Create `frontend/src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## 📈 Next Steps

1. ✅ Database configured
2. ✅ Schema created
3. ✅ Environment variables set
4. ⏳ Test all API endpoints
5. ⏳ Deploy backend to production
6. ⏳ Deploy frontend to production
7. ⏳ Set up backups (automatic in Supabase)
8. ⏳ Monitor performance

## 🆘 Troubleshooting

### "Connection refused"
- Check your password in `backend/.env`
- Ensure `DB_SSL=true` is set

### "Password authentication failed"
- Go to Supabase Dashboard → Settings → Database
- Reset your database password if needed
- Update `backend/.env` with new password

### "SSL required"
- Make sure `DB_SSL=true` in `backend/.env`

### "Database does not exist"
- Use `DB_NAME=postgres` (not `real_estate`)
- Supabase uses `postgres` as the default database name

### Tables not showing
- Re-run the schema in SQL Editor
- Check for errors in the SQL execution
- Verify you're connected to the right project

## 🔗 Useful Links

- **Your Project Dashboard**: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi
- **SQL Editor**: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/sql
- **Table Editor**: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/editor
- **API Docs**: https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi/api
- **Supabase Docs**: https://supabase.com/docs

## 💡 Pro Tips

1. **Backups**: Supabase automatically backs up your database daily
2. **Monitoring**: Check the Reports tab for performance insights
3. **Logs**: Use the Logs Explorer to debug issues
4. **API**: Supabase auto-generates REST and GraphQL APIs
5. **Storage**: Use Supabase Storage for property images (alternative to Cloudinary)

## 🎉 You're All Set!

Your Supabase database is ready to use. Start your backend server and begin testing!

```bash
cd backend
npm run dev
```

---

**Need help?** Check the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) or [Supabase Documentation](https://supabase.com/docs)
