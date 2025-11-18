# Database Migrations

This directory contains database migration scripts for the IM Hub.

## Available Migrations

### `migrate_announcements.py`
Migrates announcements from markdown files to the database.

**Purpose:** One-time migration to convert file-based announcements to database storage.

**Usage:**
```bash
cd backend
python migrations/migrate_announcements.py
```

**What it does:**
- Reads all `.md` files from `backend/announcements/` directory
- Converts markdown content to HTML
- Imports announcements into the database with all metadata (title, date, priority, author, tags)
- Prevents duplicate imports

**When to run:**
- After upgrading to database-based announcements
- To re-import if database is reset
- Never run in production if announcements already exist (check first)

## Migration Guidelines

### Running Migrations
1. Always backup the database before running migrations
2. Test migrations in development first
3. Check if migration has already been applied
4. Read the migration script comments for specific instructions

### Creating New Migrations
When creating new migration scripts:
1. Use descriptive names: `migrate_<feature>_<date>.py`
2. Include a docstring explaining the migration purpose
3. Add rollback instructions if applicable
4. Check for existing data before modifying
5. Provide clear output/logging
6. Handle errors gracefully

### Database Backups
Before running any migration:
```bash
cp backend/imhub.db backend/imhub.db.backup
```

To restore:
```bash
cp backend/imhub.db.backup backend/imhub.db
```

## Migration History

| Date | Script | Description | Status |
|------|--------|-------------|--------|
| 2025-11-17 | `migrate_announcements.py` | Initial migration of announcements from markdown to database | Available |

## Notes

- Migrations should be idempotent (safe to run multiple times)
- Always document what data is affected
- Include validation steps to verify migration success
- Test with sample data first
