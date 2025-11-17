# IM Hub - FastAPI + React Application

Full-stack application with FastAPI backend and React TypeScript frontend, featuring OCHA/ReliefWeb styling, authentication, and YAML-based content management.

## Features

- **FastAPI Backend**: Python REST API with JWT authentication
- **React TypeScript Frontend**: Modern SPA with React Router
- **SQLite Database**: Persistent storage for user-submitted content
- **User Submissions**: Register WhatsApp groups, resources, and contacts
- **Content Moderation**: Admin panel for reviewing and approving submissions
- **YAML Content Management**: Easy-to-update content configuration
- **OCHA Styling**: Professional ReliefWeb-inspired design
- **Embedded Dashboards**: Power BI and Kobo form integration
- **Secure Authentication**: Single-user login with environment variables
- **Render Deployment**: Ready to deploy on Render.com

## Project Structure

```
im-hub/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # SQLAlchemy models and database setup
│   ├── imhub.db             # SQLite database (auto-generated)
│   ├── content.yaml         # Content configuration
│   ├── DATABASE.md          # Database documentation
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ContactsPage.tsx  # WhatsApp groups with submission form
│   │   │   ├── AdminPage.tsx     # Admin moderation panel
│   │   │   └── ...
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── vite.config.ts
├── .env                     # Environment variables
├── build.sh                 # Render build script
└── render.yaml              # Render deployment config
```

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (copy from root .env file or create):
```bash
# In the root directory
cp .env.example .env
# Edit .env with your credentials
```

4. Run the backend server:
```bash
python main.py
```

The API will be available at http://localhost:8000

The database will be automatically initialized on first run.

### Database Management

The SQLite database (`backend/imhub.db`) is automatically created when you start the backend.

To manually initialize or reset the database:
```bash
cd backend
python database.py
```

This will:
- Create the database if it doesn't exist
- Create all tables
- Seed initial WhatsApp groups (if empty)

For more information, see `backend/DATABASE.md`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## Environment Variables

### Root `.env` file:

```env
# Authentication
SECRET_KEY=your-secret-key-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Embedded Content URLs
POWERBI_URL=https://your-powerbi-embed-url
KOBO_URL=https://your-kobo-form-url

# Server Configuration
PORT=8000
```

### Frontend `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

## Content Configuration

Edit `backend/content.yaml` to update the home page content:

```yaml
title: Welcome to the IM Hub
intro: Access key information management resources and tools.

sections:
  - title: Quick Links
    links:
      - text: View Power BI Dashboard
        url: /powerbi
        internal: true
      - text: ReliefWeb
        url: https://reliefweb.int
        internal: false

about:
  title: About This Hub
  content: Description of your IM Hub
```

## Deployment to Render

### Option 1: Using Blueprint (render.yaml)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. In Render Dashboard:
   - Click "New" → "Blueprint"
   - Connect your repository
   - Render will detect `render.yaml` and configure automatically

3. Set required environment variables in Render dashboard:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `POWERBI_URL` (optional)
   - `KOBO_URL` (optional)
   - `SECRET_KEY` will be auto-generated

### Option 2: Manual Setup

1. Create a new Web Service in Render

2. Configure:
   - **Build Command**: `./build.sh`
   - **Start Command**: `python backend/main.py`
   - **Environment**: Python 3

3. Add environment variables in the Render dashboard

4. Deploy

### Update Frontend API URL for Production

After deploying, update the frontend `.env` file:

```env
VITE_API_URL=https://your-render-app.onrender.com
```

Rebuild the frontend and redeploy.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `GET /api/auth/verify` - Verify JWT token

### Content
- `GET /api/content` - Get YAML content (requires auth)
- `GET /api/login-content` - Get login page content (public)
- `GET /api/navigation` - Get navigation items (requires auth)
- `GET /api/announcements` - Get announcements (requires auth)
- `GET /feeds/announcements.xml` - RSS feed for announcements (public)

### WhatsApp Groups (Database)
- `GET /api/whatsapp-groups` - List approved groups (requires auth)
- `POST /api/whatsapp-groups` - Submit new group (requires auth)
- `PATCH /api/whatsapp-groups/{id}/approve` - Approve group (admin)
- `DELETE /api/whatsapp-groups/{id}` - Delete group (admin)

### Resources (Database)
- `GET /api/resources-db` - List approved resources (requires auth)
- `POST /api/resources-db` - Submit new resource (requires auth)
- `PATCH /api/resources-db/{id}/approve` - Approve resource (admin)
- `DELETE /api/resources-db/{id}` - Delete resource (admin)

### Contact Submissions (Database)
- `GET /api/contact-submissions` - List approved contacts (requires auth)
- `POST /api/contact-submissions` - Submit contact info (requires auth)
- `PATCH /api/contact-submissions/{id}/approve` - Approve contact (admin)
- `DELETE /api/contact-submissions/{id}` - Delete contact (admin)

### Other
- `GET /api/health` - Health check
- `GET /api/mapaction-feed` - Fetch MapAction RSS feed (requires auth)

## Technology Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - SQL toolkit and ORM
- SQLite - Embedded database
- Pydantic - Data validation
- PyJWT - JWT token handling
- PyYAML - YAML configuration
- Uvicorn - ASGI server
- python-frontmatter - Markdown parsing
- feedparser - RSS feed parsing

### Frontend
- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool
- React Router - Client-side routing

## Security Notes

- Never commit `.env` files to version control
- Change default credentials before deployment
- Use strong SECRET_KEY in production
- Configure CORS properly for production
- Use HTTPS in production (Render provides this automatically)

## User Features

### For All Users (Authenticated)

1. **Submit WhatsApp Groups**
   - Navigate to Contacts page
   - Click "Add Group" button
   - Fill in group details (name, sector, description, link)
   - Submit for admin approval

2. **Browse Approved Content**
   - View approved WhatsApp groups
   - Search and filter by sector
   - Switch between card and table views

### For Administrators

1. **Access Admin Panel**
   - Navigate to Admin page in navigation
   - View pending and approved submissions

2. **Moderate Submissions**
   - Review pending WhatsApp groups, resources, and contacts
   - Approve legitimate submissions
   - Delete spam or inappropriate content

3. **Manage Content**
   - Edit `backend/content.yaml` for static content
   - Add/edit announcements in `backend/announcements/`
   - Upload files to `backend/files/`

## Database Features

The application uses SQLite for persistent storage of user-submitted content:

- **WhatsApp Groups**: Coordination groups for humanitarian sectors
- **Resources**: User-submitted links, tools, and documents
- **Contact Submissions**: Contact information for the directory

All submissions require admin approval before appearing publicly. See `backend/DATABASE.md` for detailed documentation.

## Content Moderation Workflow

1. User submits content (WhatsApp group, resource, or contact)
2. Content saved to database with `approved=False`
3. Admin reviews in Admin Panel
4. Admin approves or deletes submission
5. Approved content appears to all users

## Customization

### Styling
- Colors defined in CSS variables in `frontend/src/index.css`
- Component-specific styles in respective `.css` files
- Based on OCHA blue (#026CB6) color scheme

### Content
- Edit `backend/content.yaml` for home page content
- Restart backend to apply changes
- No rebuild required

### Authentication
- Single-user login configured via environment variables
- Extend `backend/main.py` for multiple users if needed

## Troubleshooting

### Backend won't start
- Check Python version (3.11+)
- Verify all dependencies installed
- Check environment variables are set

### Frontend can't connect to backend
- Verify `VITE_API_URL` in frontend/.env
- Check CORS settings in backend
- Ensure backend is running

### Content not updating
- Check YAML syntax in content.yaml
- Restart backend server
- Verify authentication token is valid

## License

MIT License - Feel free to use and modify

## Support

For issues or questions, please open an issue in the repository.
