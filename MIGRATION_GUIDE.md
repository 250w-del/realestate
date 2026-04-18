# PostgreSQL Migration Guide

This guide will help you migrate from MySQL to PostgreSQL with Supabase hosting.

## What Changed

### 1. Database Driver
- **Removed**: `mysql2` package
- **Added**: `pg` (PostgreSQL driver)

### 2. Database Configuration
- New file: `backend/config/database.js` (rewritten for PostgreSQL)
- Connection pool now uses `pg.Pool` instead of `mysql2.createPool`
- Query parameters changed from `?` to `$1, $2, $3...`

### 3. Schema Changes
- New file: `database/schema_postgresql.sql`
- `AUTO_INCREMENT` → `SERIAL` or `BIGSERIAL`
- `ENUM` types now created separately
- `FULLTEXT` search → PostgreSQL full-text search with `to_tsvector`
- `JSON` → `JSONB` (better performance)
- Triggers rewritten in PL/pgSQL

## Installation Steps

### Step 1: Install PostgreSQL Driver

```bash
cd backend
npm uninstall mysql2
npm install pg
```

### Step 2: Set Up PostgreSQL Database

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create database:
```bash
psql -U postgres
CREATE DATABASE real_estate;
\q
```

#### Option B: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection details from Settings → Database
4. Note: Supabase provides a connection string like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
   ```

### Step 3: Update Environment Variables

Update your `backend/.env` file:

```env
# PostgreSQL Configuration
DB_HOST=db.your-project.supabase.co  # or localhost for local
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres  # or real_estate for local
DB_PORT=5432
DB_SSL=true  # Set to true for Supabase

# Optional: Supabase Direct Client
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

### Step 4: Run Database Schema

```bash
# For local PostgreSQL
psql -U postgres -d real_estate -f database/schema_postgresql.sql

# For Supabase
# Copy the contents of database/schema_postgresql.sql
# Paste into Supabase SQL Editor and run
```

### Step 5: Migrate Data (if you have existing data)

#### Option A: Using pgloader (Recommended)
```bash
# Install pgloader
# Ubuntu/Debian: sudo apt-get install pgloader
# Mac: brew install pgloader

# Create migration file: migration.load
pgloader mysql://user:password@localhost/real_estate postgresql://postgres:password@localhost/real_estate
```

#### Option B: Manual Export/Import
```bash
# Export from MySQL
mysqldump -u root -p real_estate > mysql_dump.sql

# Convert and import (requires manual SQL conversion)
# Use online tools or manually adjust syntax
```

### Step 6: Update Controllers (Already Done)

The following files have been updated:
- ✅ `backend/config/database.js` - PostgreSQL connection
- ✅ `backend/controllers/propertyController.js` - Query parameters updated
- ⚠️ Other controllers need similar updates

### Step 7: Test the Application

```bash
cd backend
npm run dev
```

Check the console for:
```
PostgreSQL Database connected successfully
Database time: [current timestamp]
Server running in development mode on port 5000
```

## Remaining Tasks

### Controllers to Update

You need to update query parameters in these files:

1. **backend/controllers/authController.js** ✅ (uses helper functions, should work)
2. **backend/controllers/propertyController.js** ✅ (updated)
3. Check other controllers in `backend/controllers/` for raw SQL queries

### Files to Check

Search for any raw SQL queries with `?` placeholders:
```bash
cd backend
grep -r "query(" --include="*.js" | grep "?"
```

Replace `?` with `$1, $2, $3...` in order.

## PostgreSQL vs MySQL Differences

### Query Syntax Changes

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| Parameters | `?` | `$1, $2, $3` |
| Case-insensitive LIKE | `LIKE` | `ILIKE` |
| Auto-increment | `AUTO_INCREMENT` | `SERIAL` |
| JSON | `JSON` | `JSONB` (recommended) |
| Full-text search | `MATCH() AGAINST()` | `to_tsvector() @@ plainto_tsquery()` |
| String concat | `CONCAT()` | `\|\|` or `CONCAT()` |
| Limit offset | `LIMIT ? OFFSET ?` | `LIMIT $1 OFFSET $2` |

### Data Type Mapping

| MySQL | PostgreSQL |
|-------|------------|
| `INT` | `INTEGER` |
| `TINYINT(1)` | `BOOLEAN` |
| `DATETIME` | `TIMESTAMP` |
| `TEXT` | `TEXT` |
| `DECIMAL(12,2)` | `DECIMAL(12,2)` |
| `ENUM('a','b')` | Custom ENUM type |

## Supabase Benefits

Once migrated to Supabase, you can leverage:

### 1. Built-in Authentication
Replace JWT auth with Supabase Auth:
```javascript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

### 2. Real-time Subscriptions
```javascript
supabase
  .channel('properties')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'properties' }, 
    payload => console.log('New property:', payload))
  .subscribe()
```

### 3. Storage for Images
Replace Cloudinary with Supabase Storage:
```javascript
const { data, error } = await supabase.storage
  .from('property-images')
  .upload('public/image.jpg', file)
```

### 4. Row Level Security (RLS)
Secure your data at the database level:
```sql
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active properties"
ON properties FOR SELECT
USING (is_active = true);

CREATE POLICY "Agents can update own properties"
ON properties FOR UPDATE
USING (auth.uid() = agent_id);
```

### 5. Auto-generated REST API
Access your data via REST without writing backend code:
```javascript
// GET /rest/v1/properties?select=*&is_active=eq.true
```

## Troubleshooting

### Connection Issues
```
Error: connect ECONNREFUSED
```
**Solution**: Check DB_HOST, DB_PORT, and DB_PASSWORD in .env

### SSL Certificate Error
```
Error: self signed certificate
```
**Solution**: Add `DB_SSL=true` and update database.js:
```javascript
ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
```

### Query Parameter Error
```
Error: bind message supplies 0 parameters, but prepared statement requires 1
```
**Solution**: Check that all `?` are replaced with `$1, $2, $3...` in correct order

### ENUM Type Error
```
Error: invalid input value for enum
```
**Solution**: Ensure ENUM types are created before tables:
```sql
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'user');
```

## Rollback Plan

If you need to rollback to MySQL:

1. Keep the old `database/schema.sql` file
2. Reinstall mysql2: `npm install mysql2`
3. Restore old `backend/config/database.js` from git history
4. Update .env back to MySQL settings

## Next Steps

1. ✅ Install `pg` package
2. ✅ Update database configuration
3. ✅ Create PostgreSQL schema
4. ⏳ Set up Supabase project
5. ⏳ Run schema on Supabase
6. ⏳ Update remaining controllers
7. ⏳ Test all API endpoints
8. ⏳ Migrate existing data (if any)
9. ⏳ Update frontend if using Supabase client
10. ⏳ Deploy to production

## Support

For issues:
- PostgreSQL docs: https://www.postgresql.org/docs/
- Supabase docs: https://supabase.com/docs
- pg driver docs: https://node-postgres.com/

Good luck with your migration! 🚀
