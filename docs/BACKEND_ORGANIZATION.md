# Backend Organization Update

The backend directory has been reorganized for better maintainability and clarity.

## New Structure

```
backend/
├── Core Application Files
│   ├── main.py              # FastAPI application & API routes
│   ├── database.py          # SQLAlchemy models & DB config
│   ├── content.yaml         # Content configuration
│   ├── requirements.txt     # Python dependencies
│   └── imhub.db            # SQLite database (auto-created)
│
├── Documentation
│   ├── README.md           # Backend overview & guide (NEW)
│   └── DATABASE.md         # Database documentation
│
├── Content Directories
│   ├── announcements/      # Legacy markdown (use DB now)
│   ├── sectors/           # Sector info pages
│   ├── geojson/          # Map boundary files
│   └── files/            # Downloadable resources
│
├── Utilities
│   ├── migrations/       # Database migrations (NEW)
│   │   ├── README.md
│   │   └── migrate_announcements.py
│   │
│   └── scripts/         # Data management scripts (NEW)
│       ├── README.md
│       └── import_contacts.py
│
└── __pycache__/        # Python cache (ignored)
```

## Changes Made

### ✅ Created `migrations/` directory
**Purpose:** Database schema migrations and data migrations

**Contents:**
- `README.md` - Migration guidelines and documentation
- `migrate_announcements.py` - Announcement migration script

**When to use:**
- One-time database schema changes
- Data format migrations
- Major structural updates

### ✅ Created `scripts/` directory
**Purpose:** Utility scripts for data management and administrative tasks

**Contents:**
- `README.md` - Script usage guidelines
- `import_contacts.py` - Bulk contact import utility

**When to use:**
- Bulk data imports/exports
- Administrative tasks
- Data transformation utilities

### ✅ Created `backend/README.md`
**Purpose:** Comprehensive backend documentation

**Includes:**
- Directory structure explanation
- File descriptions
- Development guide
- Production checklist
- Troubleshooting tips

## Benefits

### 🎯 **Better Organization**
- Clear separation between core code, utilities, and migrations
- Easier to find specific tools and scripts
- More maintainable codebase

### 📚 **Improved Documentation**
- Each directory has its own README
- Clear guidelines for running scripts and migrations
- Better onboarding for new developers

### 🔧 **Easier Maintenance**
- Scripts and migrations are grouped by purpose
- Less clutter in root backend directory
- Clear patterns for adding new utilities

### 🚀 **Scalability**
- Easy to add new migrations as schema evolves
- Simple to create new utility scripts
- Organized structure supports growth

## Updated References

All documentation has been updated to reflect the new paths:

- `ANNOUNCEMENT_DATABASE_MIGRATION.md` → References `migrations/migrate_announcements.py`
- `ANNOUNCEMENT_QUICKSTART.md` → Updated migration command
- Migration scripts → Properly documented in `migrations/README.md`
- Import scripts → Documented in `scripts/README.md`

## Usage Examples

### Running Migrations
```bash
cd backend
python migrations/migrate_announcements.py
```

### Running Scripts
```bash
cd backend
python scripts/import_contacts.py
```

### Finding Documentation
- Backend overview: `backend/README.md`
- Database info: `backend/DATABASE.md`
- Migration guide: `backend/migrations/README.md`
- Script guide: `backend/scripts/README.md`

## Migration Path

If you previously ran scripts from the backend root:

**Before:**
```bash
cd backend
python migrate_announcements.py    # Old location
python import_contacts.py          # Old location
```

**After:**
```bash
cd backend
python migrations/migrate_announcements.py  # New location
python scripts/import_contacts.py          # New location
```

## Next Steps

### For Developers
1. Read `backend/README.md` for comprehensive overview
2. Check `migrations/README.md` before running migrations
3. Review `scripts/README.md` before bulk operations

### For New Scripts
- **Database migrations** → Add to `migrations/`
- **Data utilities** → Add to `scripts/`
- **Include README updates** for new scripts

### For Production
- Review `backend/README.md` production checklist
- Backup database before running migrations
- Test scripts in development first

---

**Summary:** The backend is now better organized with clear separation between core application code, migrations, and utility scripts. All documentation has been updated accordingly.
