# Announcement Management Quick Start

This guide will help you set up and start using the new database-based announcement management system.

## Setup (One-time)

### 1. Initialize Database with Announcement Table

The database will automatically create the announcements table when you start the backend:

```bash
cd backend
python main.py
```

### 2. Migrate Existing Announcements (Optional)

If you have existing announcements in markdown files, run the migration script:

```bash
cd backend
python migrations/migrate_announcements.py
```

This will:
- Import all `.md` files from `backend/announcements/`
- Convert them to database entries
- Preserve all metadata (title, date, priority, author, tags)

## Using the Announcement Manager

### Access the Admin Panel

1. Log in to IM Hub
2. Click "Admin Panel" in the navigation
3. Click the "Announcements" tab

### Create a New Announcement

1. Click **"+ Create New Announcement"** button
2. Fill in the form:

   **Title** (required)
   - Clear, concise title
   - Example: "New 5W Form Available"

   **Date** (required)
   - Use the date picker
   - Defaults to today

   **Priority** (required)
   - **High** 🔴 - Urgent/Critical announcements
   - **Medium** 🟠 - Important updates
   - **Normal** 🔵 - Standard announcements (default)
   - **Low** ⚪ - General information

   **Author** (optional)
   - Your name or "IM Team"
   - Defaults to your username if left empty

   **Tags** (optional)
   - Comma-separated keywords
   - Example: "forms, 5w, data-collection"
   - Used for RSS feed categorization

   **Content** (required)
   - Write using HTML tags
   - See HTML examples below

3. Click **"Create Announcement"**

### Edit an Announcement

1. Find the announcement in the list
2. Click **"✏️ Edit"** button
3. Modify any fields
4. Click **"Update Announcement"**

### Delete an Announcement

1. Find the announcement
2. Click **"✗ Delete"** button
3. Confirm deletion
4. Announcement is permanently removed

## HTML Content Examples

### Basic Formatting

```html
<p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>

<p>You can also use <u>underline</u> and <mark>highlight</mark>.</p>
```

### Lists

```html
<p><strong>New features:</strong></p>
<ul>
  <li>Enhanced location selection</li>
  <li>Beneficiary demographic breakdowns</li>
  <li>Distribution tracking</li>
</ul>

<p><strong>Steps to follow:</strong></p>
<ol>
  <li>Complete the form</li>
  <li>Submit for review</li>
  <li>Wait for approval</li>
</ol>
```

### Links

```html
<p>Please access the form through the <a href="https://example.com">Forms menu</a>.</p>

<p>For more information, see the 
<a href="https://example.com/guide" target="_blank">complete guide</a>.</p>
```

### Headings

```html
<h3>Important Update</h3>
<p>Details about the update...</p>

<h4>What's Changed</h4>
<ul>
  <li>Feature 1</li>
  <li>Feature 2</li>
</ul>
```

### Combined Example

```html
<h3>Damage Assessment Exercise w/ ODPEM!</h3>

<p>ODPEM is requesting volunteers to help them with Damage Assessments in 
<strong>St. Elizabeth</strong> and <strong>Westmoreland</strong> this Tuesday, 
Thursday and/or Saturday.</p>

<p><strong>What you'll do:</strong></p>
<ul>
  <li>Use KoboCollect for assessments</li>
  <li>Visit affected communities</li>
  <li>Document damage levels</li>
</ul>

<p>Sign up here: 
<a href="https://signup.com/example" target="_blank">Volunteer Registration</a></p>
```

## Tips for Good Announcements

### Title
- Keep it short and clear (under 60 characters)
- Use action words when appropriate
- Examples:
  - ✅ "New 5W Form Available"
  - ✅ "Volunteers Needed for Assessment"
  - ❌ "Update"
  - ❌ "Please Read This Important Information About Forms"

### Priority
- **High**: Security alerts, urgent deadlines, critical updates
- **Medium**: Important new features, upcoming events, policy changes
- **Normal**: Regular updates, form releases, general news
- **Low**: Tips, reminders, informational content

### Content
- Start with the most important information
- Use bullet points for multiple items
- Keep paragraphs short (2-3 sentences)
- Include links to relevant resources
- Use formatting to highlight key points

### Tags
- Use consistent tag names
- Common tags: forms, assessment, training, deadline, volunteers
- Helps users find related announcements
- Used in RSS feed filtering

## Viewing Announcements

### On the Home Page
- Latest announcements appear at the top
- Priority indicated by colored indicators
- Click "Read More" to expand full content

### Via RSS Feed
- Public feed URL: `https://your-domain.com/feeds/announcements.xml`
- No authentication required
- Shows 20 most recent announcements
- Includes priority badges and tags
- Updates automatically when new announcements are created

## Troubleshooting

### Can't see "Create" button
- Verify you're logged in as an admin user
- Check that you're on the "Announcements" tab

### Announcement doesn't appear
- Check that you clicked "Create Announcement" (not Cancel)
- Refresh the page
- Check browser console for errors

### HTML not rendering correctly
- Verify all tags are properly closed: `<p>text</p>`
- Check for quotes around attribute values: `href="url"`
- Test HTML in a simple editor first

### Migration didn't work
- Ensure markdown files have valid frontmatter
- Check file dates are in correct format (YYYY-MM-DD)
- Run migration script with Python 3.7+

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify backend is running (`python main.py`)
3. Check database exists (`backend/imhub.db`)
4. Review full documentation in `ANNOUNCEMENT_DATABASE_MIGRATION.md`
