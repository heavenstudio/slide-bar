# Deployment Guide - Render.com

This guide walks through deploying Slide Bar to Render.com with automatic PR previews.

## Prerequisites

- GitHub repository connected to Render
- Render.com account (free tier is sufficient)

## Quick Setup

### 1. Create Render Account & Connect GitHub

1. Sign up at [render.com](https://render.com)
2. Connect your GitHub account
3. Grant access to the `slide-bar` repository

### 2. Deploy Using Blueprint

1. Go to Render Dashboard
2. Click **"New" → "Blueprint"**
3. Select your `slide-bar` repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"**

This will create:
- ✅ PostgreSQL database (`slidebar-db`)
- ✅ Backend API service (`slidebar-api`)
- ✅ Frontend web service (`slidebar-web`)

### 3. Configure Environment Variables

After deployment, add the frontend environment group:

1. Go to **Dashboard → Environment Groups**
2. Create new group: `slidebar-web`
3. Add variable:
   - `VITE_API_URL` = `https://slidebar-api.onrender.com`
4. Save and redeploy frontend service

### 4. Enable PR Previews

1. Go to each service settings
2. Navigate to **"Pull Request Previews"**
3. Enable **"Create previews for pull requests"**
4. Select **"Create new preview instances"**
5. Save

Now every PR will automatically get a preview deployment! 🎉

## Deployment Structure

```
Production (main branch):
├── slidebar-api.onrender.com     (Backend API)
├── slidebar-web.onrender.com     (Frontend)
└── slidebar-db                   (PostgreSQL)

PR Preview (pr-123 branch):
├── slidebar-api-pr-123.onrender.com
├── slidebar-web-pr-123.onrender.com
└── Uses shared production database
```

## Important Notes

### Free Tier Limitations

- **Services spin down after 15 min of inactivity**
  - First request after sleep takes ~30-60 seconds
  - Not suitable for production with real users
  - Perfect for demos and staging

- **Database**
  - 90 days of inactivity before suspension
  - 1GB storage limit
  - Shared compute resources

- **Monthly limits**
  - 750 hours/month per service (enough for 24/7)
  - 100GB bandwidth

### File Uploads

- Uses persistent disk mounted at `/var/data/uploads`
- 1GB disk size (configurable in render.yaml)
- Files persist across deployments

### Migrations

- Prisma migrations run automatically on each deploy
- Defined in `startCommand` of backend service

## Manual Deployment

To manually trigger a deployment:

```bash
# From Render dashboard
1. Go to service
2. Click "Manual Deploy"
3. Select "Deploy latest commit" or specific branch
```

Or via API:
```bash
curl -X POST https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

## Monitoring

### Check Deployment Status

```bash
# View logs in Render dashboard
1. Go to service
2. Click "Logs" tab
3. Filter by timeframe
```

### Health Checks

- Backend: `https://slidebar-api.onrender.com/api/auth/demo-login`
- Frontend: `https://slidebar-web.onrender.com`

## Troubleshooting

### Backend fails to start

Check if Prisma migrations succeeded:
```bash
# In Render logs, look for:
"✅ Database cleaned for test run"
"Server running on port 10000"
```

### Frontend can't connect to backend

Verify environment variable:
```bash
# In frontend service logs:
echo $VITE_API_URL
# Should output: https://slidebar-api.onrender.com
```

### Database connection issues

Check DATABASE_URL format:
```
postgresql://user:password@host:5432/database?sslmode=require
```

## Upgrading to Paid Tier

To keep services always on and improve performance:

1. **Starter Plan** ($7/month per service)
   - No cold starts
   - 512MB RAM → 2GB RAM
   - Better for production

2. **Standard Plan** ($25/month per service)
   - Horizontal scaling
   - 4GB RAM
   - Higher compute

## Cost Estimate

**Free Tier (Current Setup):**
- Backend: $0
- Frontend: $0
- Database: $0
- **Total: $0/month**

**Paid (Always-On):**
- Backend Starter: $7
- Frontend Starter: $7
- Database Starter: $7
- **Total: $21/month**

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Render)
3. Add monitoring/alerting
4. Set up database backups
