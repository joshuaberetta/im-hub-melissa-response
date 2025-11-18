# Backend Directory Structure

This document explains the organization of the IM Hub backend.

## Directory Overview

```
backend/
├── main.py              # FastAPI application (API routes & server)
├── database.py          # SQLAlchemy models & database configuration
├── content.yaml         # Content configuration (navigation, dashboards, forms)
├── requirements.txt     # Python dependencies
├── imhub.db            # SQLite database file (created on first run)
├── DATABASE.md         # Database documentation
│
├── announcements/      # Announcement markdown files (legacy - migrated to DB)
│   ├── README.md
│   └── *.md
│
├── sectors/           # Sector information markdown files
│   ├── README.md
│   ├── education.md
│   ├── food-security.md
│   ├── health.md
│   ├── protection.md
│   ├── shelter.md
│   └── wash.md
│
├── geojson/          # GeoJSON administrative boundary files
│   ├── README.md
│   ├── jamaica-parishes.geojson
│   └── jamaica-communities.geojson
│
├── files/            # Downloadable files (templates, guides)
│   └── README.md
│
├── migrations/       # Database migration scripts
│   ├── README.md
│   └── migrate_announcements.py
│
└── scripts/          # Utility scripts for data management
    ├── README.md
    └── import_contacts.py
```

## Core Files

### `main.py`
FastAPI application with all API endpoints and server configuration.

**Key components:**
- Authentication & JWT handling
- API routes for all resources (contacts, groups, announcements, etc.)
- RSS feed generation
- Static file serving (frontend)

**Running:**
```bash
python main.py
# or
uvicorn main:app --reload
```

### `database.py`
SQLAlchemy ORM models and database initialization.

**Models:**
- `WhatsAppGroup` - Coordination groups
- `Resource` - User-submitted resources
- `ContactSubmission` - Contact form submissions
- `Contact` - Contact directory
- `User` - Authentication
- `Announcement` - Announcements

**Initialization:**
Database is auto-created on first run via `init_db()`.

### `content.yaml`
Configuration for dynamic content (navigation menus, dashboards, forms, etc.).

**Contains:**
- Login page content
- Navigation structure
- Dashboard configurations
- Form definitions
- Resource categories

## Content Directories

### `announcements/`
**Legacy system** - Now migrated to database.

Original markdown announcement files. Use the admin panel to manage announcements instead.

**Migration:** Run `python migrations/migrate_announcements.py` to import to database.

### `sectors/`
Sector-specific information pages (markdown files).

**Format:** Frontmatter + markdown content
- `title`: Sector name
- `description`: Brief description
- `content`: Detailed information with links

**API:** Accessed via `/api/sector/{sector_id}`

### `geojson/`
Administrative boundary GeoJSON files for mapping.

**Files:**
- `jamaica-parishes.geojson` - Parish boundaries
- `jamaica-communities.geojson` - Community boundaries

**API:** Accessed via `/api/geojson/{filename}`

### `files/`
Downloadable resources (Excel templates, guides, etc.).

**API:** Accessed via `/api/files/{filename}`

## Utility Directories

### `migrations/`
Database schema migration scripts.

**Purpose:** One-time data migrations and schema changes.

**Usage:**
```bash
python migrations/migrate_announcements.py
```

**Documentation:** See `migrations/README.md`

### `scripts/`
Data management and administrative utility scripts.

**Purpose:** Bulk data imports, exports, and other utilities.

**Usage:**
```bash
python scripts/import_contacts.py
```

**Documentation:** See `scripts/README.md`

## Database File

### `imhub.db`
SQLite database file (auto-created on startup).

**Location:** `backend/imhub.db`

**Backup:**
```bash
cp imhub.db imhub.db.backup
```

**Reset:**
```bash
rm imhub.db
python main.py  # Will recreate with seed data
```

**Documentation:** See `DATABASE.md`

## Environment Variables

Create `.env` file in project root:

```bash
# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# JWT Secret
SECRET_KEY=your-secret-key-change-in-production

# Server
PORT=8000

# Site URL (for RSS feed)
SITE_URL=https://your-domain.com
```

## Dependencies

### Install Requirements
```bash
pip install -r requirements.txt
```

### Key Dependencies
- `fastapi` - Web framework
- `sqlalchemy` - ORM
- `uvicorn` - ASGI server
- `python-multipart` - File uploads
- `python-jose` - JWT tokens
- `bcrypt` - Password hashing
- `pyyaml` - YAML parsing
- `python-frontmatter` - Markdown frontmatter
- `markdown` - Markdown to HTML

## Development

### Start Server
```bash
cd backend
python main.py
```

### API Documentation
Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Database Reset
```bash
rm imhub.db
python main.py  # Recreates with seed data
```

### Add New API Endpoint
1. Define Pydantic models in `main.py`
2. Add SQLAlchemy model in `database.py` (if needed)
3. Create route with `@app.get()` or `@app.post()`
4. Add authentication with `Depends(verify_token)`

## Production Deployment

### Checklist
- [ ] Change `ADMIN_PASSWORD` in `.env`
- [ ] Change `SECRET_KEY` to random string
- [ ] Set `SITE_URL` to production domain
- [ ] Use production-grade database (PostgreSQL) if needed
- [ ] Configure CORS for frontend domain
- [ ] Set up HTTPS/SSL
- [ ] Regular database backups

### Production Server
Use gunicorn or similar ASGI server:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Troubleshooting

### Database locked
- Close all database connections
- Ensure only one server instance running

### Import errors
- Verify all requirements installed: `pip install -r requirements.txt`
- Check Python version (3.7+)

### Port already in use
- Change `PORT` in `.env`
- Kill existing process on port 8000

## See Also

- Main README: `../README.md`
- Database docs: `DATABASE.md`
- Migration docs: `migrations/README.md`
- Scripts docs: `scripts/README.md`
- API endpoints: http://localhost:8000/docs
