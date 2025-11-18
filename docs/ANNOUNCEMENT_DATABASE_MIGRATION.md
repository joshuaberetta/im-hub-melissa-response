# Announcement Database Migration

This document describes the migration of announcements from markdown files to database storage, enabling admin management through the UI.

## Changes Made

### 1. Database Model
Added `Announcement` model to `backend/database.py`:
- `id`: Auto-incrementing primary key
- `title`: Announcement title
- `content`: HTML content (converted from markdown)
- `date`: Publication date
- `priority`: Priority level (high, medium, normal, low)
- `author`: Author name
- `tags`: Comma-separated tags
- `approved`: Approval status (auto-approved for admins)
- `deleted`: Soft delete flag
- `created_at`, `updated_at`: Timestamps

### 2. Backend API Endpoints
Updated `backend/main.py` with new endpoints:

#### GET `/api/announcements`
- Fetches announcements from database
- Supports `include_deleted` and `limit` parameters
- Only shows approved, non-deleted announcements by default
- Returns announcements with summary field extracted from content

#### POST `/api/announcements`
- Creates new announcement (admin only)
- Accepts: title, content, date, priority, author, tags
- Auto-approved for admins
- Converts tags array to comma-separated string

#### PUT `/api/announcements/{id}`
- Updates existing announcement (admin only)
- Partial updates supported
- Updates timestamp automatically

#### DELETE `/api/announcements/{id}`
- Soft delete by default
- Permanent delete with `?permanent=true` query parameter
- Admin only

#### PATCH `/api/announcements/{id}/restore`
- Restores soft-deleted announcement
- Admin only

#### GET `/feeds/announcements.xml`
- Updated RSS feed to use database
- No authentication required (public endpoint)
- Includes priority badges and tags
- Limited to 20 most recent announcements

### 3. Frontend Admin Interface
Updated `frontend/src/components/AdminPage.tsx`:

- Added "Announcements" tab to admin panel
- Create new announcements form with:
  - Title (required)
  - Date picker (required)
  - Priority selector (low, normal, medium, high)
  - Author field (optional)
  - Tags (comma-separated)
  - Content textarea (HTML supported)
- Edit existing announcements
- Delete announcements (with confirmation)
- View active and deleted announcements
- Priority badge visual indicators

### 4. Frontend Display Component
Updated `frontend/src/components/Announcements.tsx`:
- Changed `id` type from `string` to `number`
- Compatible with database-generated IDs

### 5. Migration Script
Created `backend/migrations/migrate_announcements.py`:
- Imports existing markdown announcements into database
- Converts markdown to HTML
- Preserves metadata (title, date, priority, author, tags)
- Checks for existing announcements to prevent duplicates
- Shows migration progress and summary

## Migration Steps

### 1. Run the migration script:
```bash
cd backend
python migrations/migrate_announcements.py
```

This will:
- Read all `.md` files from `backend/announcements/`
- Convert markdown to HTML
- Import into the database
- Show summary of migrated announcements

### 2. Restart the backend:
```bash
cd backend
python main.py
```

### 3. Verify in Admin Panel:
1. Log in to the IM Hub
2. Navigate to Admin Panel
3. Click "Announcements" tab
4. Verify migrated announcements appear
5. Test creating a new announcement

## Usage for Admins

### Creating Announcements
1. Go to Admin Panel → Announcements
2. Click "+ Create New Announcement"
3. Fill in the form:
   - **Title**: Clear, concise title
   - **Date**: Publication date
   - **Priority**: 
     - High (🔴) - Urgent announcements
     - Medium (🟠) - Important announcements
     - Normal (🔵) - Standard announcements
     - Low (⚪) - Informational announcements
   - **Author**: Your name or "IM Team" (optional)
   - **Tags**: Comma-separated (e.g., "forms, 5w, assessment")
   - **Content**: Use HTML tags:
     ```html
     <p>Paragraph text</p>
     <strong>Bold text</strong>
     <ul><li>List item</li></ul>
     <a href="url">Link text</a>
     ```
4. Click "Create Announcement"

### Editing Announcements
1. Find announcement in the list
2. Click "✏️ Edit"
3. Modify fields as needed
4. Click "Update Announcement"

### Deleting Announcements
1. Find announcement in the list
2. Click "✗ Delete"
3. Confirm deletion
4. Announcement is permanently removed

## HTML Content Tips

The content field supports HTML. Common tags:

```html
<!-- Paragraphs -->
<p>Regular paragraph text</p>

<!-- Bold and emphasis -->
<strong>Bold text</strong>
<em>Italic text</em>

<!-- Lists -->
<ul>
  <li>Unordered list item</li>
</ul>

<ol>
  <li>Ordered list item</li>
</ol>

<!-- Links -->
<a href="https://example.com">Link text</a>

<!-- Headings (use h3-h6, h1-h2 reserved) -->
<h3>Subheading</h3>

<!-- Line breaks -->
<br>
```

## Benefits of Database Storage

1. **Admin Control**: Create, edit, delete through UI (no file editing needed)
2. **Immediate Updates**: Changes reflect instantly (no file commits)
3. **Better Management**: Filter, search, soft-delete capabilities
4. **Audit Trail**: Created/updated timestamps tracked
5. **Consistency**: Structured data format enforced
6. **Scalability**: Better performance with many announcements

## Backward Compatibility

- Markdown files in `backend/announcements/` are no longer used
- RSS feed continues to work (now pulls from database)
- Frontend announcement display unchanged for users
- Migration script preserves all existing announcement data

## Troubleshooting

### Migration fails
- Check that `backend/announcements/` directory exists
- Verify markdown files have valid frontmatter
- Check database permissions

### Announcements don't appear
- Verify database migration ran successfully
- Check that announcements are approved (should be auto-approved)
- Check that announcements are not deleted
- Verify API endpoint returns data: `GET /api/announcements`

### Can't create announcements
- Verify you're logged in as admin
- Check browser console for errors
- Verify backend API is running
- Check content field has HTML (required)

## Future Enhancements

Potential improvements:
- Rich text editor (WYSIWYG) for content
- Announcement scheduling (publish in future)
- Email notifications for new announcements
- Announcement categories/filters
- Attachment support
- Draft/published workflow
- Multi-language support
