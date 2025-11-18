# Database Persistence Issue on Render

## Problem

**Users, announcements, and other database records are lost after every rebuild on Render.**

### Root Cause

The IM Hub uses SQLite with the database file stored at `backend/imhub.db`. However:

1. **Render's free tier has no persistent disk storage**
2. The filesystem is **ephemeral** - it resets on every:
   - Rebuild (triggered by code push)
   - Service restart
   - Automatic spin-down/spin-up (after 15 min inactivity)
   - Plan changes or service updates

3. Every time the service restarts, a fresh database is created with only the seed data

## Impact

**Data Loss Scenarios:**
- ✗ User accounts created through admin panel → Lost on rebuild
- ✗ Announcements created through UI → Lost on rebuild  
- ✗ Contacts added via API or UI → Lost on rebuild
- ✗ WhatsApp groups registered → Lost on rebuild
- ✗ Any user-submitted content → Lost on rebuild

**What's Preserved:**
- ✓ Seed data (default admin user, sample WhatsApp groups)
- ✓ Configuration files (content.yaml, sector markdown files)
- ✓ Code changes

## Solutions

### Option 1: Upgrade to Render Paid Plan (Recommended for Production)

**Render Starter Plan ($7/month)**
- Includes persistent disk storage
- Database persists across rebuilds
- Better for production use

**Steps:**
1. Go to Render Dashboard → Your Service → Settings
2. Upgrade to Starter plan or higher
3. Add a persistent disk:
   - Go to "Disks" tab
   - Click "Add Disk"
   - Mount Path: `/opt/render/project/src/backend/data`
   - Size: 1GB (more than enough for SQLite)
4. Update database path in `backend/database.py`:
   ```python
   # Use persistent disk path on Render
   import os
   if os.getenv('RENDER'):
       DB_PATH = Path('/opt/render/project/src/backend/data/imhub.db')
   else:
       DB_PATH = Path(__file__).parent / "imhub.db"
   ```

**Pros:**
- ✓ Simple, works with current SQLite setup
- ✓ No code changes needed (just disk mount)
- ✓ Fast and reliable

**Cons:**
- ✗ Costs $7/month
- ✗ Still single-file database (backup recommended)

### Option 2: Switch to PostgreSQL (Best for Production)

Use Render's free PostgreSQL database (or paid for better limits).

**Render PostgreSQL Free Tier:**
- 90-day data retention
- 1GB storage
- Automatically backed up
- Persistent storage

**Steps:**
1. In Render Dashboard → "New +" → "PostgreSQL"
2. Create database (free tier available)
3. Update backend to use PostgreSQL instead of SQLite
4. Install `psycopg2-binary` in requirements.txt
5. Update `DATABASE_URL` in `database.py`:
   ```python
   import os
   DATABASE_URL = os.getenv(
       'DATABASE_URL',
       f"sqlite:///{DB_PATH}"  # Fallback for development
   )
   ```
6. Render provides `DATABASE_URL` automatically

**Pros:**
- ✓ Free tier available
- ✓ Production-grade database
- ✓ Automatic backups
- ✓ Better for concurrent users
- ✓ Data persists permanently

**Cons:**
- ✗ Requires code changes
- ✗ Free tier only keeps data 90 days
- ✗ Migration needed for existing data

### Option 3: External Database (Railway, Supabase, etc.)

Use a third-party PostgreSQL provider.

**Options:**
- Railway (PostgreSQL, free tier available)
- Supabase (PostgreSQL, generous free tier)
- ElephantSQL (PostgreSQL, free tier)
- PlanetScale (MySQL, free tier)

**Steps:**
1. Create database on external provider
2. Get connection string (DATABASE_URL)
3. Add as environment variable in Render
4. Update backend to use PostgreSQL
5. Run migrations

**Pros:**
- ✓ Often more generous free tiers
- ✓ Dedicated database service
- ✓ Better monitoring and tools

**Cons:**
- ✗ Another service to manage
- ✗ Requires code changes
- ✗ Network latency (different providers)

### Option 4: Periodic Database Backups (Temporary Workaround)

Create automated backups and restore on rebuild.

**Not recommended** - complex and error-prone, but possible:

1. Add backup script to dump database to external storage (S3, GitHub, etc.)
2. Run backup on schedule
3. Restore from backup on startup if database is empty
4. Update environment variables to trigger backup/restore

**Pros:**
- ✓ Can work with free tier

**Cons:**
- ✗ Complex to implement
- ✗ Risk of data loss between backups
- ✗ Manual intervention needed
- ✗ Not recommended for production

## Immediate Workaround (Development/Demo)

For now, to minimize data loss:

1. **Avoid unnecessary rebuilds** - Don't push code changes unless needed
2. **Document important data** - Keep records of critical users/content
3. **Use seed data** - Add important records to `seed_initial_data()` in `database.py`
4. **Export before rebuild** - Download data via API before pushing changes

## Recommended Solution Path

### For Development/Testing:
- Continue with SQLite on ephemeral storage
- Accept that data resets on rebuild
- Use seed data for testing

### For Production:
**Best: PostgreSQL (Option 2)**
1. Create Render PostgreSQL database
2. Update code to support PostgreSQL
3. Migrate to PostgreSQL
4. Much better for production

**Alternative: Paid Render + Persistent Disk (Option 1)**
1. Upgrade to Render Starter plan ($7/month)
2. Add persistent disk
3. Update database path
4. Simpler but still SQLite limitations

## Migration to PostgreSQL (Detailed)

If choosing Option 2, here's how to migrate:

### 1. Update requirements.txt
```txt
# Add PostgreSQL support
psycopg2-binary==2.9.9
```

### 2. Update database.py
```python
import os
from pathlib import Path

# Database configuration
if os.getenv('DATABASE_URL'):
    # Production: Use PostgreSQL from environment
    DATABASE_URL = os.getenv('DATABASE_URL')
    # Render provides postgres://, SQLAlchemy needs postgresql://
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
else:
    # Development: Use SQLite
    DB_PATH = Path(__file__).parent / "imhub.db"
    DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create engine (adjust for PostgreSQL vs SQLite)
if DATABASE_URL.startswith('postgresql://'):
    engine = create_engine(DATABASE_URL)
else:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
```

### 3. Create PostgreSQL database on Render
1. Render Dashboard → "New +" → "PostgreSQL"
2. Name: `im-hub-db`
3. Plan: Free (or paid for production)
4. Create

### 4. Connect to your web service
Render automatically provides `DATABASE_URL` environment variable to linked services.

Or manually add in your web service:
- Key: `DATABASE_URL`
- Value: Internal connection string from PostgreSQL service

### 5. Deploy
Push changes and rebuild. Database will now persist!

## Current Status

**Environment:** Render Free Tier  
**Database:** SQLite (ephemeral)  
**Persistence:** ❌ None - data lost on rebuild  
**Impact:** High - all user-created data is lost  

## Recommended Action

**For Production Deployment:**
1. Set up Render PostgreSQL database (free tier to start)
2. Update code to support PostgreSQL (see migration steps above)
3. Test locally with PostgreSQL
4. Deploy to production
5. Data will now persist across rebuilds

**For Development/Demo:**
- Accept current limitations
- Use seed data for consistent test data
- Document that data resets on rebuild

## Questions?

- Which solution fits your needs best?
- Is this for production or development/demo?
- Budget available for hosting?
- How critical is data persistence?

Let me know which approach you'd like to take, and I can help implement it!
