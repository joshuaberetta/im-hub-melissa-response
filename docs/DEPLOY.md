# Render Deployment Guide

## Quick Deploy to Render

### Prerequisites
- GitHub account
- Render account (free tier available at https://render.com)
- Your code pushed to a GitHub repository

### Step 1: Push to GitHub

```bash
cd /Users/josh/Desktop/melissa\ response/im-hub
git init
git add .
git commit -m "Initial commit - IM Hub application"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Build Settings:**
- **Name**: `im-hub` (or your preferred name)
- **Environment**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `python backend/main.py`

**Environment Variables:**
Click "Add Environment Variable" and add:

```
SECRET_KEY=<generate-a-random-secret-key>
ADMIN_USERNAME=melissa
ADMIN_PASSWORD=<your-secure-password>
SITE_URL=https://your-app-name.onrender.com
```

To generate a secure SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Important:** After deployment, update `SITE_URL` with your actual Render URL (e.g., `https://im-hub.onrender.com`)

5. Click "Create Web Service"

### Step 3: Wait for Deployment

Render will:
1. Clone your repository
2. Run `build.sh` to:
   - Install Python backend dependencies
   - Install Node.js frontend dependencies
   - Build the React frontend (creates `frontend/dist/`)
3. Start your application with `python backend/main.py`
   - The backend serves the built frontend files at the root
   - API endpoints are available at `/api/*`
4. Provide you with a URL like: `https://im-hub.onrender.com`

**Note:** The full application (frontend + backend) runs from a single service. The backend serves both the API and the static frontend files.

### Step 4: Access Your Application

Once deployed, visit your Render URL. You'll be redirected to the login page.

**Default credentials (change these!):**
- Username: `melissa` (or what you set in ADMIN_USERNAME)
- Password: Whatever you set in ADMIN_PASSWORD

### Step 5: Update SITE_URL Environment Variable

After your app is deployed and you have your Render URL:

1. Go to your service in Render dashboard
2. Click "Environment" tab
3. Find the `SITE_URL` variable
4. Update it to your actual URL (e.g., `https://im-hub.onrender.com`)
5. Click "Save Changes"

This ensures RSS feeds and external links work correctly.

## Alternative: Using Blueprint (render.yaml)

If you have a `render.yaml` file in your repo:

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will detect `render.yaml` and auto-configure
5. Set the environment variables in the Render dashboard

## Troubleshooting

### Build fails
- Check that `build.sh` has execute permissions: `chmod +x build.sh`
- Verify all dependencies are listed in `requirements.txt` and `package.json`

### Application won't start
- Check logs in Render dashboard
- Verify PORT environment variable is being read correctly
- Ensure all required environment variables are set

### Frontend shows blank page
- Check browser console for errors
- Verify API calls are going to correct URL (should be same origin in production)
- Check that frontend build completed successfully in build logs

### Login doesn't work
- Verify ADMIN_USERNAME and ADMIN_PASSWORD are set correctly
- Check SECRET_KEY is set
- Look at server logs for authentication errors

## Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push
```

Render will automatically detect the push and redeploy.

## Manual Redeploy

In Render dashboard:
1. Go to your service
2. Click "Manual Deploy"
3. Select branch to deploy

## Free Tier Limitations

Render's free tier:
- Apps spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month of runtime
- Good for demos and development

**⚠️ CRITICAL: No Persistent Storage on Free Tier**

The free tier does **not** include persistent disk storage. This means:

- **SQLite database is ephemeral** - stored on temporary filesystem
- **Data is lost on every rebuild or restart**, including:
  - User accounts created through admin panel
  - Announcements created through UI
  - Contacts and other user-submitted data
  - Any changes made after deployment

**What's preserved:**
- Code and configuration files
- Seed data (recreated on each restart)

**Solutions:**
1. **For production**: Upgrade to Render Starter plan ($7/month) with persistent disk
2. **Better**: Switch to PostgreSQL (free tier available, data persists)
3. **For demo/testing**: Accept data resets, use seed data

See `DATABASE_PERSISTENCE_ISSUE.md` for detailed solutions.

For production, consider upgrading to a paid plan or using PostgreSQL.

## Custom Domain

To use your own domain:

1. In Render dashboard, go to your service
2. Go to "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records as instructed by Render

## Environment Variables Best Practices

- Never commit `.env` files
- Use strong passwords
- Rotate SECRET_KEY periodically
- Use HTTPS URLs for POWERBI_URL and KOBO_URL
- Keep ADMIN_PASSWORD secure

## Monitoring

Check your application health:
- Visit: `https://your-app.onrender.com/api/health`
- Should return: `{"status": "healthy", "timestamp": "..."}`

### Verify Full Stack Deployment

1. **Frontend loads**: Visit your Render URL, should see the login page
2. **API works**: Visit `/api/health`, should return JSON
3. **Authentication works**: Login with your credentials
4. **Static files serve**: Check browser console for 404 errors (shouldn't be any)
5. **All routes work**: Navigate to different pages (Home, Dashboards, etc.)

If frontend doesn't load:
- Check build logs for errors during `npm run build`
- Verify `frontend/dist/` was created during build
- Check that backend is serving static files (look for "Serving frontend" in logs)

## Logs

Access logs in Render dashboard:
1. Go to your service
2. Click "Logs" tab
3. View real-time logs of your application

## Support

For issues:
- Check Render's documentation: https://render.com/docs
- Review application logs in Render dashboard
- Check GitHub repository issues
