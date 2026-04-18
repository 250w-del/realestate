# ❌ DNS Resolution Failed - Troubleshooting Guide

## Problem
Your computer cannot find the Supabase server at `db.rmqmvkaerxxjqxxybkqi.supabase.co`

**Error**: `getaddrinfo ENOTFOUND db.rmqmvkaerxxjqxxybkqi.supabase.co`

## 🔍 Step 1: Verify Your Supabase Project

### Check if Project Exists

1. Go to https://app.supabase.com
2. Log in to your account
3. Check if you see project `rmqmvkaerxxjqxxybkqi` in your dashboard

**If you DON'T see the project:**
- The project may have been deleted
- You may be logged into the wrong account
- The project ID might be incorrect

### Get Correct Connection Details

1. Click on your project in Supabase dashboard
2. Go to **Settings** → **Database**
3. Scroll to **Connection Info**
4. Look for **Host** - it should look like:
   ```
   db.xxxxxxxxxxxxx.supabase.co
   ```

5. **Copy the EXACT hostname** from there

## 🔧 Step 2: Update Your .env File

Edit `backend/.env` and update with the CORRECT hostname:

```env
DB_HOST=db.YOUR_ACTUAL_PROJECT_ID.supabase.co
DB_USER=postgres
DB_PASSWORD=9LYc2AnMII7zEDar
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
```

## 🌐 Step 3: Check Network Issues

### Test Internet Connection
```bash
ping google.com
```

If this fails, check your internet connection.

### Test DNS Resolution
```bash
nslookup db.rmqmvkaerxxjqxxybkqi.supabase.co
```

If this fails, try:

#### Option A: Change DNS Server (Windows)

1. Open **Control Panel** → **Network and Internet** → **Network Connections**
2. Right-click your network adapter → **Properties**
3. Select **Internet Protocol Version 4 (TCP/IPv4)** → **Properties**
4. Select **Use the following DNS server addresses**:
   - Preferred DNS: `8.8.8.8` (Google DNS)
   - Alternate DNS: `8.8.4.4`
5. Click **OK** and restart your computer

#### Option B: Flush DNS Cache
```bash
ipconfig /flushdns
```

### Check VPN/Firewall
- Disable VPN temporarily
- Check if firewall is blocking connections
- Try from a different network (mobile hotspot)

## 🎯 Step 4: Alternative Connection Methods

### Option A: Use Connection Pooler

Supabase provides an alternative connection pooler. Try this in `backend/.env`:

```env
# Instead of db.xxx.supabase.co, try:
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
```

Get the exact pooler URL from:
1. Supabase Dashboard → Settings → Database
2. Look for **Connection Pooling** section

### Option B: Use Connection String

Instead of individual parameters, try using a connection string.

1. Get connection string from Supabase:
   - Settings → Database → Connection String → URI

2. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

3. Update `backend/config/database.js` to use connection string:
   ```javascript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   ```

4. Add to `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:9LYc2AnMII7zEDar@db.xxx.supabase.co:5432/postgres
   ```

## 🔍 Step 5: Verify Project Status

### Check if Project is Paused

1. Go to https://app.supabase.com/project/rmqmvkaerxxjqxxybkqi
2. Check if there's a message saying "Project is paused"
3. If paused, click **Resume Project**

### Check Project Region

1. Settings → General
2. Note the region (e.g., US East, EU West)
3. Ensure you're not in a country that blocks that region

## 🆘 Quick Fixes to Try

### Fix 1: Restart Everything
```bash
# Close all terminals
# Restart your computer
# Try again
```

### Fix 2: Use Local PostgreSQL Instead

If Supabase continues to fail, use local PostgreSQL temporarily:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_local_password
DB_NAME=real_estate
DB_PORT=5432
DB_SSL=false
```

Then install PostgreSQL locally and create the database.

### Fix 3: Check Supabase Status

Visit: https://status.supabase.com

Check if there are any ongoing incidents.

## 📞 Get Help from Supabase

If none of the above works:

1. Go to https://supabase.com/dashboard/support
2. Create a support ticket
3. Mention:
   - Project ID: `rmqmvkaerxxjqxxybkqi`
   - Error: DNS resolution failed
   - Your location/country

## ✅ Test Your Connection

After making changes, test with:

```bash
cd backend
node test_connection.js
```

You should see:
```
✅ DNS Resolution successful
✅ Database Connection successful!
✅ Query successful!
```

## 🎯 Most Likely Causes

1. **Wrong Project ID** (90% of cases)
   - Double-check the hostname in Supabase dashboard
   
2. **Project Doesn't Exist** (5% of cases)
   - Create a new project
   - Update .env with new credentials

3. **Network/DNS Issue** (5% of cases)
   - Change DNS to 8.8.8.8
   - Disable VPN
   - Try different network

---

**Need more help?** Share the output of:
```bash
cd backend
node test_connection.js
```
