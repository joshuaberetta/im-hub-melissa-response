# Database Documentation

## Overview

The IM Hub now uses SQLite for persistent data storage. This enables user-submitted content such as WhatsApp groups, resources, and contact information.

## Database Location

- **File**: `backend/imhub.db`
- **Type**: SQLite 3
- **ORM**: SQLAlchemy 2.0+

## Database Models

### WhatsAppGroup

Stores WhatsApp coordination groups for humanitarian sectors.

**Fields:**
- `id` (Integer, Primary Key): Auto-incrementing ID
- `name` (String, 200): Group name
- `sector` (String, 100): Sector (e.g., Health, WASH, Shelter)
- `description` (Text): Group purpose and description
- `link` (String, 500): WhatsApp group invite link
- `contact_name` (String, 200, Optional): Name of group administrator
- `contact_email` (String, 200, Optional): Email of group administrator
- `approved` (Boolean, default=False): Moderation flag
- `created_at` (DateTime): Timestamp when created
- `updated_at` (DateTime): Timestamp when last updated

### Resource

User-submitted resources and links (tools, guidelines, templates, etc.).

**Fields:**
- `id` (Integer, Primary Key): Auto-incrementing ID
- `title` (String, 200): Resource title
- `description` (Text, Optional): Resource description
- `url` (String, 500): Link to resource
- `category` (String, 100, Optional): Type (guideline, tool, template, reference)
- `sector` (String, 100, Optional): Associated sector
- `submitted_by` (String, 200, Optional): Name of submitter
- `email` (String, 200, Optional): Email of submitter
- `approved` (Boolean, default=False): Moderation flag
- `created_at` (DateTime): Timestamp when created
- `updated_at` (DateTime): Timestamp when last updated

### ContactSubmission

Contact information submissions for the directory.

**Fields:**
- `id` (Integer, Primary Key): Auto-incrementing ID
- `organization` (String, 200): Organization name
- `focal_point_name` (String, 200): Contact person name
- `email` (String, 200): Contact email
- `phone` (String, 50, Optional): Phone number
- `sector` (String, 100, Optional): Sector
- `role` (String, 200, Optional): Role/position
- `location` (String, 200, Optional): Location
- `additional_info` (Text, Optional): Additional information
- `approved` (Boolean, default=False): Moderation flag
- `created_at` (DateTime): Timestamp when created
- `updated_at` (DateTime): Timestamp when last updated

## API Endpoints

### WhatsApp Groups

- `GET /api/whatsapp-groups` - List all approved groups
  - Query params: `approved_only` (bool), `sector` (string)
- `POST /api/whatsapp-groups` - Submit a new group (requires auth)
- `PATCH /api/whatsapp-groups/{id}/approve` - Approve a group (admin only)
- `DELETE /api/whatsapp-groups/{id}` - Delete a group (admin only)

### Resources

- `GET /api/resources-db` - List all approved resources
  - Query params: `approved_only` (bool), `category` (string), `sector` (string)
- `POST /api/resources-db` - Submit a new resource (requires auth)
- `PATCH /api/resources-db/{id}/approve` - Approve a resource (admin only)
- `DELETE /api/resources-db/{id}` - Delete a resource (admin only)

### Contact Submissions

- `GET /api/contact-submissions` - List all approved submissions
  - Query params: `approved_only` (bool)
- `POST /api/contact-submissions` - Submit contact info (requires auth)
- `PATCH /api/contact-submissions/{id}/approve` - Approve a submission (admin only)
- `DELETE /api/contact-submissions/{id}` - Delete a submission (admin only)

## Database Initialization

The database is automatically initialized when the FastAPI application starts (via `@app.on_event("startup")`).

To manually initialize or reset the database:

```bash
cd backend
python3 database.py
```

This will:
1. Create the `imhub.db` file if it doesn't exist
2. Create all tables
3. Seed initial WhatsApp groups (if database is empty)

## Moderation Workflow

All user-submitted content is created with `approved=False` by default. This enables a moderation workflow:

1. User submits content via the frontend
2. Content is saved to database with `approved=False`
3. Admin reviews and approves content using approve endpoints
4. Only approved content is shown to regular users (when `approved_only=True`)

## Database Backups

Since this is SQLite, backing up is simple:

```bash
# Backup
cp backend/imhub.db backend/imhub.db.backup

# Restore
cp backend/imhub.db.backup backend/imhub.db
```

For production deployments on Render, consider:
- Regular automated backups to cloud storage
- Using Render's persistent disk feature
- Migrating to PostgreSQL for better concurrency if needed

## Querying the Database

You can query the database directly using the SQLite CLI:

```bash
sqlite3 backend/imhub.db

# Example queries
SELECT * FROM whatsapp_groups;
SELECT * FROM resources WHERE approved = 1;
SELECT COUNT(*) FROM contact_submissions;
```

## Migration to PostgreSQL

If you need to migrate to PostgreSQL later:

1. Update `DATABASE_URL` in `database.py`
2. Install `psycopg2` or `asyncpg`
3. Update `render.yaml` or add PostgreSQL service in Render
4. The SQLAlchemy models will work without changes

## Schema Diagram

```
whatsapp_groups          resources                contact_submissions
+------------------+     +------------------+     +---------------------+
| id (PK)         |     | id (PK)         |     | id (PK)            |
| name            |     | title           |     | organization       |
| sector          |     | description     |     | focal_point_name   |
| description     |     | url             |     | email              |
| link            |     | category        |     | phone              |
| contact_name    |     | sector          |     | sector             |
| contact_email   |     | submitted_by    |     | role               |
| approved        |     | email           |     | location           |
| created_at      |     | approved        |     | additional_info    |
| updated_at      |     | created_at      |     | approved           |
+------------------+     | updated_at      |     | created_at         |
                        +------------------+     | updated_at         |
                                                +---------------------+
```

## Development Tips

- Database file is in `.gitignore` - don't commit it
- Use `seed_initial_data()` function to populate test data
- Each model has a `to_dict()` method for easy API serialization
- All timestamps are in UTC
- The `get_db()` dependency ensures proper session cleanup
