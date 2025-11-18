# Render Persistent Disk Setup Checklist

Follow these steps to add persistent storage to your Render deployment.

## ✅ Checklist

### Step 1: Add Persistent Disk in Render Dashboard

1. Go to your Render service dashboard
2. Click on the **"Disks"** tab
3. Click **"Add Disk"**
4. Configure:
   - **Mount Path:** `/var/data`
   - **Size:** `1 GB` (can increase later if needed)
5. Click **"Add Disk"**

### Step 2: Add Environment Variable

1. Still in Render dashboard, go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add:
   - **Key:** `RENDER`
   - **Value:** `true`
4. Click **"Save Changes"**

### Step 3: Deploy Updated Code

The code has already been updated to use the persistent disk.

Commit and push the changes:

```bash
cd "/Users/josh/Desktop/melissa response/im-hub"
git add backend/database.py
git commit -m "Use persistent disk for database on Render"
git push
```

Render will automatically rebuild.

### Step 4: Verify After Deployment

1. Wait for Render to finish deploying
2. Log into your app
3. Create a test user or announcement
4. Trigger a manual rebuild in Render (or make a small code change and push)
5. **Verify:** The test user/announcement should still be there!

## What Changed

### Code Update

Updated `backend/database.py` to detect Render environment:

```python
# Use persistent disk on Render, local file in development
if os.getenv('RENDER'):
    # Production on Render: use persistent disk
    DB_PATH = Path('/var/data/imhub.db')
else:
    # Development: use local file
    DB_PATH = Path(__file__).parent / "imhub.db"
```

### How It Works

- **On Render:** Database stored at `/var/data/imhub.db` (persistent disk)
- **Locally:** Database stored at `backend/imhub.db` (same as before)
- Render's persistent disk survives rebuilds, restarts, and redeployments

## Cost

**Render Starter Plan Required:** $7/month

This includes:
- Persistent disk storage
- Better performance
- No cold starts (instant response)
- More CPU/memory

## Expected Behavior

### Before (Free Tier)
- ❌ Data lost on every rebuild
- ❌ Users disappear after code push
- ❌ Announcements reset

### After (With Persistent Disk)
- ✅ Data persists across rebuilds
- ✅ Users remain after code push
- ✅ All data preserved permanently
- ✅ Production-ready

## Troubleshooting

### Data still being lost?

**Check:**
1. Disk is actually mounted at `/var/data`
2. Environment variable `RENDER=true` is set
3. Service has been redeployed after code changes
4. Check logs for database path: should show `/var/data/imhub.db`

### Can't access database?

**Possible issues:**
1. Disk permissions - Render should handle this automatically
2. Path typo - verify mount path is exactly `/var/data`
3. App needs restart - try manual deploy

### Want to backup database?

Even with persistent disk, regular backups are recommended:

**Option 1: Manual backup via SSH** (if enabled on Render)
```bash
render ssh
cp /var/data/imhub.db /var/data/imhub.db.backup
```

**Option 2: Export via API**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.onrender.com/api/contacts > contacts.json
```

## Migration from Free Tier

If you already have the app running on free tier:

1. Add disk and environment variable (Steps 1-2 above)
2. Deploy updated code (Step 3)
3. Database will start fresh on persistent disk
4. Recreate your users/data (or add to seed data)

**Note:** Existing data on free tier can't be migrated (it's already gone on next rebuild). This setup prevents future data loss.

## Alternative: PostgreSQL

If you prefer, you could also:
- Use Render's PostgreSQL database (free tier available)
- Better for production at scale
- See `DATABASE_PERSISTENCE_ISSUE.md` for details

But for SQLite with small-medium data, persistent disk works great!

## Next Steps After Setup

1. ✅ Verify data persists through rebuild
2. Set up regular backups (recommended)
3. Test all functionality
4. Document any specific data that needs recreation
5. Consider migrating to PostgreSQL if you scale up

---

**Questions?** Check `DATABASE_PERSISTENCE_ISSUE.md` for more details.
