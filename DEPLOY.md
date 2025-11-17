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
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<your-secure-password>
POWERBI_URL=<your-powerbi-embed-url>
KOBO_URL=<your-kobo-form-url>
```

To generate a secure SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

5. Click "Create Web Service"

### Step 3: Wait for Deployment

Render will:
1. Clone your repository
2. Run `build.sh` to install dependencies and build frontend
3. Start your application with `python backend/main.py`
4. Provide you with a URL like: `https://im-hub.onrender.com`

### Step 4: Access Your Application

Once deployed, visit your Render URL. You'll be redirected to the login page.

**Default credentials (change these!):**
- Username: `admin` (or what you set in ADMIN_USERNAME)
- Password: Whatever you set in ADMIN_PASSWORD

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

For production, consider upgrading to a paid plan.

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
