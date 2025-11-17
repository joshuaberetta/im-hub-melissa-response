# Quick Start Guide

## ✅ Your IM Hub is Ready!

The application has been fully set up with:
- ✅ FastAPI backend with JWT authentication
- ✅ React TypeScript frontend with OCHA styling
- ✅ YAML-based content management
- ✅ Login page with hardcoded credentials
- ✅ Three-tab interface (Home, Power BI, Kobo)
- ✅ Ready for Render deployment

## 🚀 Running Locally

### Backend Server
The backend is currently running on http://localhost:8000

To start it manually:
```bash
cd backend
python main.py
```

### Frontend Dev Server
To start the frontend:
```bash
cd frontend
npm run dev
```

The app will be at http://localhost:5173

### Or Run Both Together
```bash
./start-dev.sh
```

## 🔑 Login Credentials

Check your `.env` file for credentials:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
```

**⚠️ Change these before deploying to production!**

## 📝 Updating Content

Edit `backend/content.yaml` to update the home page:

```yaml
title: Welcome to the IM Hub
intro: Your intro text here

sections:
  - title: Quick Links
    links:
      - text: Link Name
        url: /path or https://example.com
        internal: true/false
```

Restart the backend after changes.

## 🎨 Customizing

### Colors
Edit CSS variables in `frontend/src/index.css`:
```css
:root {
  --ocha-blue: #026CB6;
  --ocha-blue-dark: #025195;
  /* ... more colors */
}
```

### Embedded URLs
Set in `.env`:
```
POWERBI_URL=https://your-powerbi-url
KOBO_URL=https://your-kobo-url
```

## 📦 Deploying to Render

See [DEPLOY.md](./DEPLOY.md) for full instructions.

Quick steps:
1. Push code to GitHub
2. Create Web Service on Render
3. Set environment variables
4. Deploy!

## 📁 Project Structure

```
im-hub/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── content.yaml         # Home page content
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.tsx
│   │   └── config.ts        # API configuration
│   └── package.json
├── .env                     # Environment variables
├── build.sh                 # Render build script
└── render.yaml              # Render config
```

## 🔧 Common Tasks

### Add a new section to home page
Edit `backend/content.yaml`, add to `sections` array

### Change login credentials
Edit `.env` file, restart backend

### Update styling
Edit component CSS files in `frontend/src/components/`

### Add new route/tab
1. Create component in `frontend/src/components/`
2. Add route in `Dashboard.tsx`
3. Add nav item in `Navigation.tsx`

## 📚 API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token
- `GET /api/content` - Get YAML content
- `GET /api/powerbi-url` - Get Power BI URL
- `GET /api/kobo-url` - Get Kobo URL
- `GET /api/health` - Health check

## 🐛 Troubleshooting

### Backend won't start
- Check Python version (3.11+)
- Install dependencies: `pip install -r backend/requirements.txt`
- Check `.env` file exists

### Frontend can't connect
- Verify backend is running on port 8000
- Check `VITE_API_URL` in `frontend/.env`
- Clear browser cache

### Content not updating
- Restart backend after editing `content.yaml`
- Check YAML syntax is valid
- Clear browser cache

## 📞 Next Steps

1. ✅ Test login at http://localhost:5173
2. ✅ Update `backend/content.yaml` with your links
3. ✅ Set your Power BI and Kobo URLs in `.env`
4. ✅ Change default credentials in `.env`
5. ✅ Customize colors if desired
6. ✅ Deploy to Render (see DEPLOY.md)

## 🎉 You're All Set!

Your IM Hub is ready to use. The backend is running and waiting for you to start the frontend!
