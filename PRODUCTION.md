# Production Deployment Guide (Render)

## Prerequisites
- GitHub account
- Render account (free tier)
- Cloudinary account

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for production"
git push origin main
```

## Step 2: Create Render Account
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account

## Step 3: Create PostgreSQL Database
1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - Name: `remote-job-db`
   - Database: `remote_job`
   - User: `remote_job_user`
   - Plan: Free
3. Click "Create Database"
4. Wait for the database to provision (green status)
5. Copy the "Internal Database URL" for later

## Step 4: Create Web Service
1. In Render Dashboard, click "New +" → "Web Service"
2. Select your GitHub repository
3. Configure:
   - Name: `remote-job-manager`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

## Step 5: Set Environment Variables
In the Web Service settings, add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DB_HOST` | (from PostgreSQL connection info) |
| `DB_PORT` | (from PostgreSQL connection info) |
| `DB_USER` | (from PostgreSQL connection info) |
| `DB_PASS` | (from PostgreSQL connection info) |
| `DB_NAME` | `remote_job` |
| `JWT_SECRET` | (generate a strong random string) |
| `JWT_REFRESH_SECRET` | (generate a strong random string) |
| `CLOUDINARY_CLOUD_NAME` | (from Cloudinary dashboard) |
| `CLOUDINARY_API_KEY` | (from Cloudinary dashboard) |
| `CLOUDINARY_API_SECRET` | (from Cloudinary dashboard) |
| `OPENROUTER_API_KEY` | (your API key) |
| `TAILED_CV_LAMBDA_URL` | (your Lambda URL) |
| `FRONTEND_URL` | (your frontend URL) |

## Step 6: Run Migrations
After the service is deployed, connect to it via SSH and run migrations:
1. In Render Dashboard, go to your web service
2. Click "Shell" to open a shell
3. Run: `node migrate-cvs.js`

Or run migrations locally and push the changes to GitHub.

## Step 7: Update CORS
Update `FRONTEND_URL` in Render environment variables to match your frontend URL.

## Step 8: Verify Deployment
1. Visit your service URL: `https://remote-job-manager.onrender.com`
2. Test the health endpoint: `https://remote-job-manager.onrender.com/health`

## Important Notes
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep may take 30+ seconds
- For production, consider upgrading to a paid plan
