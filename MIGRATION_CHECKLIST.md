# PostgreSQL Migration Checklist

Use this checklist to track your migration progress.

## ✅ Pre-Migration (Completed)

- [x] Backup existing MySQL database
- [x] Review current database schema
- [x] Identify all SQL queries in codebase
- [x] Plan migration strategy
- [x] Create PostgreSQL schema
- [x] Update database configuration
- [x] Update query syntax in controllers

## 📦 Installation

- [ ] Install PostgreSQL driver
  ```bash
  cd backend
  npm install pg
  ```

- [ ] Verify package.json updated
  - [ ] `pg` added to dependencies
  - [ ] `mysql2` removed from dependencies

## 🗄️ Database Setup

Choose one option:

### Option A: Supabase (Recommended)
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project
- [ ] Note project credentials:
  - [ ] Project URL: `_______________________`
  - [ ] Database password: `_______________________`
  - [ ] Host: `db._______.supabase.co`
- [ ] Open SQL Editor in Supabase
- [ ] Copy contents of `database/schema_postgresql.sql`
- [ ] Paste and run SQL in Supabase
- [ ] Verify tables created (check Tables tab)

### Option B: Local PostgreSQL
- [ ] Install PostgreSQL on your machine
- [ ] Create database:
  ```bash
  psql -U postgres -c "CREATE DATABASE real_estate;"
  ```
- [ ] Run schema:
  ```bash
  psql -U postgres -d real_estate -f database/schema_postgresql.sql
  ```
- [ ] Verify tables created:
  ```bash
  psql -U postgres -d real_estate -c "\dt"
  ```

## ⚙️ Configuration

- [ ] Update `backend/.env` file:
  ```env
  DB_HOST=_______________________
  DB_USER=postgres
  DB_PASSWORD=_______________________
  DB_NAME=_______________________
  DB_PORT=5432
  DB_SSL=_______ (true for Supabase, false for local)
  ```

- [ ] Verify all required environment variables:
  - [ ] DB_HOST
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_NAME
  - [ ] DB_PORT
  - [ ] DB_SSL
  - [ ] JWT_SECRET
  - [ ] CLOUDINARY credentials
  - [ ] EMAIL credentials

## 🧪 Testing

### Basic Connection Test
- [ ] Start backend server:
  ```bash
  cd backend
  npm run dev
  ```

- [ ] Check console output:
  - [ ] "PostgreSQL Database connected successfully" ✅
  - [ ] "Database time: [timestamp]" ✅
  - [ ] "Server running in development mode on port 5000" ✅
  - [ ] No connection errors ✅

### API Endpoint Tests

#### Authentication
- [ ] POST `/api/auth/register` - Create test user
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
  ```
- [ ] POST `/api/auth/login` - Login with test user
- [ ] GET `/api/auth/me` - Get current user (with token)

#### Properties
- [ ] GET `/api/properties` - List properties
- [ ] POST `/api/properties` - Create property (as agent)
- [ ] GET `/api/properties/:id` - Get property details
- [ ] PUT `/api/properties/:id` - Update property
- [ ] DELETE `/api/properties/:id` - Delete property

#### Search & Filter
- [ ] GET `/api/properties?search=test` - Search properties
- [ ] GET `/api/properties?property_type=house` - Filter by type
- [ ] GET `/api/properties?min_price=100000&max_price=500000` - Price range
- [ ] GET `/api/properties?location=Kigali` - Location search

#### Favorites
- [ ] POST `/api/favorites` - Add to favorites
- [ ] GET `/api/favorites` - Get user favorites
- [ ] DELETE `/api/favorites/:id` - Remove from favorites

#### Messages
- [ ] POST `/api/messages` - Send message
- [ ] GET `/api/messages` - Get messages
- [ ] PUT `/api/messages/:id/read` - Mark as read

#### Viewings
- [ ] POST `/api/viewings` - Schedule viewing
- [ ] GET `/api/viewings` - Get viewings
- [ ] PUT `/api/viewings/:id` - Update viewing status

#### Reviews
- [ ] POST `/api/reviews` - Create review
- [ ] GET `/api/reviews` - Get reviews

#### Upload
- [ ] POST `/api/upload/property-images/:id` - Upload images
- [ ] POST `/api/upload/avatar` - Upload avatar

### Frontend Tests
- [ ] Start frontend:
  ```bash
  cd frontend
  npm run dev
  ```

- [ ] Test user flows:
  - [ ] User registration
  - [ ] User login
  - [ ] Browse properties
  - [ ] Search properties
  - [ ] View property details
  - [ ] Add to favorites
  - [ ] Send message to agent
  - [ ] Schedule viewing
  - [ ] Submit review

- [ ] Test agent flows:
  - [ ] Agent login
  - [ ] Create property
  - [ ] Upload property images
  - [ ] Edit property
  - [ ] View inquiries
  - [ ] Manage viewings

- [ ] Test admin flows:
  - [ ] Admin login
  - [ ] View all users
  - [ ] Manage properties
  - [ ] Approve reviews
  - [ ] View analytics

## 📊 Data Migration (If Applicable)

If you have existing data in MySQL:

- [ ] Export data from MySQL:
  ```bash
  mysqldump -u root -p real_estate > mysql_backup.sql
  ```

- [ ] Choose migration method:
  - [ ] Option A: Use pgloader (automated)
  - [ ] Option B: Manual export/import with conversion

- [ ] Verify data migrated:
  - [ ] Users count matches
  - [ ] Properties count matches
  - [ ] Images count matches
  - [ ] Relationships intact

## 🔍 Code Review

- [ ] Review all controllers for raw SQL queries
- [ ] Check for `?` placeholders (should be `$1, $2, $3`)
- [ ] Verify `LIKE` changed to `ILIKE` for case-insensitive search
- [ ] Check transaction callbacks use PostgreSQL client
- [ ] Verify ENUM values match PostgreSQL types

### Files to Review:
- [x] `backend/config/database.js` ✅
- [x] `backend/controllers/propertyController.js` ✅
- [ ] `backend/controllers/authController.js`
- [ ] `backend/controllers/userController.js`
- [ ] `backend/controllers/favoriteController.js`
- [ ] `backend/controllers/messageController.js`
- [ ] `backend/controllers/viewingController.js`
- [ ] `backend/controllers/reviewController.js`
- [ ] `backend/controllers/uploadController.js`
- [ ] `backend/controllers/settingsController.js`

## 🚀 Deployment

### Supabase
- [ ] Database already deployed ✅
- [ ] Configure connection pooling if needed
- [ ] Set up Row Level Security (optional)
- [ ] Configure backups

### Backend (Render/Railway/Heroku)
- [ ] Push code to GitHub
- [ ] Connect repository to hosting platform
- [ ] Set environment variables
- [ ] Deploy backend
- [ ] Verify deployment successful
- [ ] Test production API endpoints

### Frontend (Vercel/Netlify)
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Push code to GitHub
- [ ] Connect repository to hosting platform
- [ ] Deploy frontend
- [ ] Verify deployment successful
- [ ] Test production application

## 📝 Documentation

- [ ] Update README.md with PostgreSQL info ✅
- [ ] Document environment variables
- [ ] Update deployment guide
- [ ] Create troubleshooting guide
- [ ] Document Supabase setup

## 🎯 Post-Migration

- [ ] Monitor application logs for errors
- [ ] Check database performance
- [ ] Verify all features working
- [ ] Test with real users
- [ ] Monitor query performance
- [ ] Set up database backups
- [ ] Configure monitoring/alerts

## 🔄 Rollback Plan (Just in Case)

If something goes wrong:

- [ ] Keep MySQL database backup
- [ ] Keep old `database/schema.sql` file
- [ ] Document rollback steps:
  1. Reinstall mysql2: `npm install mysql2`
  2. Restore old database.js from git
  3. Update .env back to MySQL settings
  4. Restart server

## ✨ Optional Enhancements

After successful migration, consider:

- [ ] Implement Supabase Auth (replace JWT)
- [ ] Use Supabase Storage (replace Cloudinary)
- [ ] Add real-time subscriptions
- [ ] Implement Row Level Security
- [ ] Use Supabase Edge Functions
- [ ] Set up database triggers
- [ ] Add full-text search ranking
- [ ] Optimize indexes
- [ ] Set up connection pooling
- [ ] Configure read replicas

## 📞 Support

If you encounter issues:

- [ ] Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- [ ] Review [QUICK_START_POSTGRESQL.md](./QUICK_START_POSTGRESQL.md)
- [ ] Check [POSTGRESQL_MIGRATION_SUMMARY.md](./POSTGRESQL_MIGRATION_SUMMARY.md)
- [ ] Search PostgreSQL documentation
- [ ] Check Supabase documentation
- [ ] Review error logs

## 🎉 Completion

- [ ] All tests passing ✅
- [ ] Application deployed ✅
- [ ] Users can access application ✅
- [ ] No critical errors ✅
- [ ] Performance acceptable ✅
- [ ] Documentation updated ✅

---

**Migration Date**: _______________
**Completed By**: _______________
**Notes**: 
_______________________________________________
_______________________________________________
_______________________________________________
