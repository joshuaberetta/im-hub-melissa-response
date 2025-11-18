# Backend Scripts & Utilities

This directory contains utility scripts for data management and administrative tasks.

## Available Scripts

### `import_contacts.py`
Imports contacts into the IM Hub database via the API.

**Purpose:** Bulk import contacts from CSV, Excel, or other data sources.

**Usage:**
1. Get your authentication token (log in to the web interface, check localStorage)
2. Update `AUTH_TOKEN` in the script
3. Modify the data source (CSV, Excel, database export, etc.)
4. Run:
   ```bash
   cd backend
   python scripts/import_contacts.py
   ```

**What it does:**
- Reads contact data from specified source
- Posts contacts to `/api/contacts` endpoint
- Validates data before import
- Reports success/failure for each contact

**When to use:**
- Migrating contacts from PowerBI or other systems
- Bulk importing from spreadsheets
- Initial database population

## Script Guidelines

### Creating New Scripts
1. Add clear docstrings explaining purpose
2. Include usage examples in comments
3. Validate input data before processing
4. Provide helpful error messages
5. Log operations for debugging

### Running Scripts
- Always test with sample data first
- Backup database before bulk operations
- Use authentication tokens securely (don't commit them)
- Verify results after running

### Security Notes
- Never commit authentication tokens to Git
- Use environment variables for sensitive data
- Store backup copies before bulk operations

## Common Tasks

### Import Data
```bash
# Contacts
python scripts/import_contacts.py

# See migrations/ for database schema migrations
```

### Export Data
Contact data can be exported via the API:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/contacts > contacts.json
```

## See Also
- `migrations/` - Database schema migrations
- `DATABASE.md` - Database documentation
- API documentation in main `README.md`
