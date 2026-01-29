# Deployment Guide - Analytics Dashboard Backend

This guide covers deploying your backend for **demo/resume projects** with free or low-cost options.

---

## Table of Contents
1. [Quick Start Deployment (5 minutes)](#quick-start-deployment)
2. [Recommended Platform: Render](#option-1-render-recommended)
3. [Alternative: Railway](#option-2-railway)
4. [Alternative: Fly.io](#option-3-flyio)
5. [Database Hosting](#database-hosting)
6. [Environment Variables](#environment-variables)
7. [Pre-Deployment Checklist](#pre-deployment-checklist)
8. [Testing Your Deployment](#testing-your-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start Deployment

**Fastest Path: Render + Supabase (Free Tier)**

**Time:** 5-10 minutes
**Cost:** $0/month (with limitations)

### Steps:
1. ✅ Create [Supabase](https://supabase.com) account → Get PostgreSQL URL
2. ✅ Create [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account → Get MongoDB URI
3. ✅ Push code to GitHub (if not already)
4. ✅ Deploy to [Render](https://render.com) → Connect GitHub repo
5. ✅ Set environment variables in Render dashboard
6. ✅ Wait for build and deploy (3-5 minutes)

---

## Option 1: Render (Recommended)

**Why Render?**
- Free tier with 750 hours/month
- Automatic deploys from GitHub
- Built-in PostgreSQL database option
- Simple dashboard
- Good for demos

### Step-by-Step Guide

#### 1. Prepare Your Repository

Ensure you have these files (already present):
- ✅ `Dockerfile`
- ✅ `package.json` with `start` script
- ✅ `.gitignore` (excludes node_modules, .env)

#### 2. Push to GitHub

```bash
# If not already a git repo
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/analytics-dashboard-be.git
git branch -M main
git push -u origin main
```

#### 3. Set Up Database on Supabase

**3.1 Create Supabase Project:**
1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name:** analytics-dashboard
   - **Database Password:** (generate strong password, save it!)
   - **Region:** Choose closest to you
4. Wait 2-3 minutes for provisioning

**3.2 Get Database Connection String:**
1. Go to **Project Settings** → **Database**
2. Copy **Connection String** (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Example: `postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres`

**3.3 Run Migrations:**

```bash
# In your local project
export DATABASE_URL="your-supabase-connection-string"
npm run migration:run
```

**3.4 Seed Data (Optional):**

```bash
export MONGO_URI="your-mongodb-atlas-uri"
npm run seed
```

#### 4. Set Up MongoDB Atlas

**4.1 Create MongoDB Atlas Cluster:**
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Click "Build a Database"
4. Choose **FREE M0** tier
5. Select AWS and region (same as Supabase if possible)
6. Click "Create"

**4.2 Configure Network Access:**
1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Confirm

**4.3 Create Database User:**
1. Go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Username: `dashboarduser` (or your choice)
4. Password: Generate and save!
5. Role: **Atlas Admin** (for simplicity)
6. Add User

**4.4 Get Connection String:**
1. Go to **Database** → **Connect** → **Connect your application**
2. Driver: **Node.js**
3. Copy connection string
4. Replace `<password>` with your user password
5. Replace `<dbname>` with `analytics-dashboard`
6. Example: `mongodb+srv://dashboarduser:password@cluster0.xxxxx.mongodb.net/analytics-dashboard?retryWrites=true&w=majority`

#### 5. Deploy to Render

**5.1 Create Render Account:**
1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub

**5.2 Create New Web Service:**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

| Field | Value |
|-------|-------|
| **Name** | analytics-dashboard-be |
| **Region** | Oregon (US West) or closest |
| **Branch** | main |
| **Root Directory** | (leave blank) |
| **Runtime** | Docker |
| **Instance Type** | Free |

**5.3 Add Environment Variables:**

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `PORT` | 4000 |
| `NODE_ENV` | production |
| `DATABASE_URL` | `your-supabase-connection-string` |
| `MONGO_URI` | `your-mongodb-atlas-connection-string` |
| `CORS_ORIGIN` | `*` (or your frontend URL) |

**5.4 Deploy:**
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build
3. Your API will be live at: `https://analytics-dashboard-be.onrender.com`

#### 6. Verify Deployment

```bash
# Test health endpoint
curl https://analytics-dashboard-be.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-29T..."}
```

### Render Free Tier Limitations

⚠️ **Important:**
- **Sleeps after 15 minutes of inactivity**
- First request after sleep takes 30-60 seconds (cold start)
- 750 hours/month free (enough for demo)
- Limited to 512 MB RAM

**Solution for Demos:**
Use [UptimeRobot](https://uptimerobot.com) to ping `/health` every 5 minutes (keeps it awake)

---

## Option 2: Railway

**Why Railway?**
- $5 free credit/month (500 hours)
- Very fast deployments
- Built-in PostgreSQL and MongoDB
- No sleep on free tier

### Step-by-Step Guide

#### 1. Create Railway Account

1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub

#### 2. Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository

#### 3. Add Databases

**3.1 Add PostgreSQL:**
1. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automatically provisions database
3. Copy `DATABASE_URL` from Variables tab

**3.2 Add MongoDB:**
1. Click **"+ New"** → **"Database"** → **"Add MongoDB"**
2. Railway provisions MongoDB
3. Copy `MONGO_URI` from Variables tab

#### 4. Configure Service

1. Click on your service (GitHub repo)
2. Go to **"Variables"** tab
3. Add environment variables:

```bash
PORT=4000
NODE_ENV=production
CORS_ORIGIN=*
# DATABASE_URL and MONGO_URI are auto-added by Railway
```

#### 5. Run Migrations

**Option A: Local Migration (Recommended)**
```bash
# Copy DATABASE_URL from Railway
export DATABASE_URL="railway-postgres-url"
npm run migration:run
npm run seed
```

**Option B: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration
railway run npm run migration:run
railway run npm run seed
```

#### 6. Deploy

1. Go to **"Settings"** tab
2. Under **"Deploy"**, click **"Generate Domain"**
3. Your API: `https://your-project.up.railway.app`

**Railway automatically redeploys on git push!**

---

## Option 3: Fly.io

**Why Fly.io?**
- Generous free tier (3 VMs)
- Global edge deployment
- PostgreSQL included
- Great performance

### Step-by-Step Guide

#### 1. Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

#### 2. Sign Up and Login

```bash
flyctl auth signup
# or
flyctl auth login
```

#### 3. Initialize Fly App

```bash
cd /path/to/analytics-dashboard-be
flyctl launch

# Answer prompts:
# App name: analytics-dashboard-be
# Region: Choose closest to you
# PostgreSQL: Yes
# Redis: No
```

This creates `fly.toml` configuration file.

#### 4. Set Up MongoDB

Use MongoDB Atlas (see Render guide above) or Railway

#### 5. Set Secrets (Environment Variables)

```bash
flyctl secrets set NODE_ENV=production
flyctl secrets set DATABASE_URL="your-postgres-url"
flyctl secrets set MONGO_URI="your-mongodb-uri"
flyctl secrets set CORS_ORIGIN="*"
```

#### 6. Run Migrations

```bash
# Connect to Fly Postgres
flyctl postgres connect -a your-postgres-app-name

# In psql shell:
\c analytics_dashboard

# Exit psql
\q

# Run migrations locally pointing to Fly DB
export DATABASE_URL="your-fly-postgres-url"
npm run migration:run
npm run seed
```

#### 7. Deploy

```bash
flyctl deploy
```

Your API: `https://analytics-dashboard-be.fly.dev`

---

## Database Hosting Options

### PostgreSQL

| Provider | Free Tier | Limitations | Best For |
|----------|-----------|-------------|----------|
| **Supabase** | ✅ 500 MB, 2 CPU hours | No connection pooling on free tier | Quick setup, generous limits |
| **Railway** | ✅ $5 credit | Credit-based, ~500 hours | All-in-one solution |
| **Neon** | ✅ 10 GB, branching | 1 project | Modern features |
| **ElephantSQL** | ✅ 20 MB | Very limited storage | Tiny demos only |
| **Render** | ✅ 90 days | Expires after 90 days | Short-term demos |

**Recommendation:** Supabase (best free tier)

### MongoDB

| Provider | Free Tier | Limitations | Best For |
|----------|-----------|-------------|----------|
| **MongoDB Atlas** | ✅ 512 MB, M0 cluster | Shared cluster | Industry standard |
| **Railway** | ✅ $5 credit | Credit-based | Integrated with Railway |

**Recommendation:** MongoDB Atlas M0 (unlimited time, 512 MB)

---

## Environment Variables

### Required Variables

```bash
# Server
PORT=4000
NODE_ENV=production

# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database

# MongoDB
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Security
CORS_ORIGIN=*  # Change to your frontend URL in production
```

### Optional Variables

```bash
# Logging
LOG_LEVEL=info

# Rate Limiting (already configured in code)
# No env vars needed
```

### How to Set on Each Platform

**Render:**
Dashboard → Environment → Add Environment Variable

**Railway:**
Project → Service → Variables → New Variable

**Fly.io:**
```bash
flyctl secrets set KEY=value
```

---

## Pre-Deployment Checklist

### Before First Deploy

- [ ] Code pushed to GitHub/GitLab
- [ ] `.env` file NOT committed (check `.gitignore`)
- [ ] PostgreSQL database created and connection string obtained
- [ ] MongoDB database created and connection string obtained
- [ ] Database migrations run successfully
- [ ] Seed data loaded (optional but recommended for demo)
- [ ] Health endpoint tested locally: `curl http://localhost:4000/health`
- [ ] All dependencies in `package.json`
- [ ] `Dockerfile` working: `docker build -t test .`

### After Deployment

- [ ] Health endpoint accessible: `curl https://your-app.com/health`
- [ ] Test API with Postman/Thunder Client
- [ ] Verify database connectivity (create a company, fetch it back)
- [ ] Set up monitoring (optional): UptimeRobot for Render
- [ ] Update frontend with production API URL
- [ ] Add deployment URL to your resume/portfolio

---

## Testing Your Deployment

### 1. Health Check

```bash
curl https://your-api-url.com/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2024-01-29T..."}
```

### 2. Create Test Company

```bash
curl -X POST https://your-api-url.com/api/v1/companies \
  -H "Content-Type: application/json" \
  -H "x-workspace-id: YOUR_WORKSPACE_ID" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "name": "Test Company",
    "industry": "Technology"
  }'
```

**Get workspace and user IDs from seed data or database:**

```bash
# If you ran the seed script, use these IDs:
# Workspace ID: Check your database or seed output
# User ID: Check your database or seed output
```

### 3. List Companies

```bash
curl https://your-api-url.com/api/v1/companies \
  -H "x-workspace-id: YOUR_WORKSPACE_ID" \
  -H "x-user-id: YOUR_USER_ID"
```

### 4. Test with Postman

1. Import [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) or create collection
2. Set base URL: `https://your-api-url.com`
3. Add headers:
   - `x-workspace-id`: your-workspace-id
   - `x-user-id`: your-user-id
4. Test all endpoints

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Causes:**
- Wrong DATABASE_URL or MONGO_URI
- Database IP whitelist doesn't include 0.0.0.0/0
- Database sleeping (some free tiers)

**Solutions:**
1. Verify connection strings in platform dashboard
2. Check MongoDB Atlas Network Access → Allow 0.0.0.0/0
3. Check database status in hosting provider dashboard
4. Test connection locally with same credentials

### Issue: "Migration failed"

**Causes:**
- Database not initialized
- Previous migration partially applied
- Connection timeout

**Solutions:**
```bash
# Check migration status
npm run typeorm migration:show

# Revert last migration
npm run migration:revert

# Re-run migrations
npm run migration:run
```

### Issue: "500 Internal Server Error"

**Causes:**
- Missing environment variables
- Database connection failed
- Code error

**Solutions:**
1. Check logs in platform dashboard
2. Verify all env vars are set
3. Look for specific error message in logs

**View Logs:**

**Render:**
Dashboard → Logs (real-time)

**Railway:**
Project → Service → Deployments → View Logs

**Fly.io:**
```bash
flyctl logs
```

### Issue: Render app sleeping

**Symptom:** First request takes 30-60 seconds

**Solutions:**
1. **UptimeRobot:** Ping `/health` every 5 minutes (free)
2. **Upgrade to Paid:** $7/month for always-on
3. **Accept cold starts:** Mention in demo "first load may be slow"

### Issue: CORS errors

**Error:** `Access-Control-Allow-Origin header is missing`

**Solution:**
```bash
# Set CORS_ORIGIN to your frontend URL
CORS_ORIGIN=https://your-frontend.vercel.app

# Or allow all (not recommended for production)
CORS_ORIGIN=*
```

### Issue: Rate limit exceeded

**Error:** `429 Too Many Requests`

**Cause:** More than 100 requests in 15 minutes from same IP

**Solution:**
- Wait 15 minutes
- Or modify rate limit in [src/app.ts:17](src/app.ts#L17)

---

## Keeping Your Free Tier Active

### Render
**Problem:** Sleeps after 15 minutes of inactivity

**Solution:**
1. Create free UptimeRobot account: [https://uptimerobot.com](https://uptimerobot.com)
2. Add new monitor:
   - Type: HTTP(s)
   - URL: `https://your-app.onrender.com/health`
   - Interval: 5 minutes
3. App stays awake 24/7

### Railway
**Problem:** $5 credit runs out (~500 hours)

**Solution:**
- Monitor usage in dashboard
- Pause services when not actively demoing
- Upgrade if needed ($5/month for additional credit)

### MongoDB Atlas
**Problem:** M0 cluster paused after inactivity

**Solution:**
- Automatically resumes on connection
- No action needed

---

## Deployment Costs Comparison

| Platform | Cost/Month | Database | Best For |
|----------|------------|----------|----------|
| **Render Free** | $0 | Bring your own | Quick demos |
| **Render Paid** | $7 | Bring your own | Production demos |
| **Railway Free** | $0* | Included | All-in-one |
| **Railway Paid** | $5+ | Included | Growing projects |
| **Fly.io Free** | $0 | PostgreSQL included | Edge performance |
| **Fly.io Paid** | $5+ | Included | Global deployment |

*$5 credit/month, usually lasts full month for small apps

**Recommended for Resume Projects:**
1. **Render (Free) + Supabase + MongoDB Atlas** = $0/month
2. **Railway (Free)** = $0-5/month (if credit lasts)

---

## Production Deployment (Future)

When you're ready to move beyond demo:

### Improvements Needed
1. ✅ Add proper authentication (JWT, OAuth2)
2. ✅ Implement request logging (Pino)
3. ✅ Add monitoring (Sentry for errors, New Relic for APM)
4. ✅ Set up CI/CD (GitHub Actions)
5. ✅ Implement automated tests (Jest)
6. ✅ Add database backups
7. ✅ Use managed secrets (AWS Secrets Manager, etc.)
8. ✅ Configure proper CORS (specific origins)
9. ✅ Add rate limiting per user/workspace
10. ✅ Set up CDN for static assets

### Recommended Production Stack
- **Compute:** AWS ECS, Google Cloud Run, or DigitalOcean App Platform
- **Database:** AWS RDS (PostgreSQL), MongoDB Atlas (M10+)
- **Monitoring:** Datadog, New Relic, or Sentry
- **CI/CD:** GitHub Actions
- **Secrets:** AWS Secrets Manager or HashiCorp Vault

---

## Resume/Portfolio Tips

### What to Include

**Backend Repository:**
```markdown
## Analytics Dashboard Backend

Multi-tenant CRM backend with RESTful API built with Node.js, Express, TypeScript, PostgreSQL, and MongoDB.

**Tech Stack:** Node.js, Express, TypeScript, PostgreSQL, MongoDB, TypeORM, Docker
**Features:** Multi-tenant architecture, soft deletes, audit trails, dual-database design
**Deployment:** Render + Supabase + MongoDB Atlas
**API Docs:** See API_DOCUMENTATION.md

[Live API](https://your-api.onrender.com/health) | [API Docs](./API_DOCUMENTATION.md)
```

### Demo Script

When showing to employers:

1. **Start with API docs** - Show comprehensive documentation
2. **Show health endpoint** - Prove it's live
3. **Demonstrate CRUD** - Use Postman to create/read/update/delete
4. **Explain architecture** - Multi-tenant, service layer, validation
5. **Highlight deployment** - Docker, migrations, seeding

### Talking Points

- ✅ "Built with production best practices: validation, error handling, soft deletes"
- ✅ "Multi-tenant architecture supporting workspace isolation"
- ✅ "Dual-database design: PostgreSQL for relational CRM data, MongoDB for flexible dashboard configs"
- ✅ "Comprehensive API documentation for frontend integration"
- ✅ "Dockerized and deployed on cloud platform with CI/CD ready setup"
- ✅ "TypeScript for type safety and better developer experience"

---

## Next Steps After Deployment

1. ✅ Test all endpoints with Postman
2. ✅ Share API documentation with frontend team
3. ✅ Add API URL to your resume/portfolio
4. ✅ Create Postman collection and share publicly
5. ✅ Write a blog post about the architecture
6. ✅ Add screenshots to README
7. ✅ Record a demo video (optional)

---

## Support Resources

### Platform Documentation
- **Render:** [https://render.com/docs](https://render.com/docs)
- **Railway:** [https://docs.railway.app](https://docs.railway.app)
- **Fly.io:** [https://fly.io/docs](https://fly.io/docs)
- **Supabase:** [https://supabase.com/docs](https://supabase.com/docs)
- **MongoDB Atlas:** [https://docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

### Community Help
- **Render Community:** [https://community.render.com](https://community.render.com)
- **Railway Discord:** [https://discord.gg/railway](https://discord.gg/railway)
- **Stack Overflow:** Tag questions with `express`, `typeorm`, `deployment`

---

**Good luck with your deployment! 🚀**

If you encounter issues, check the troubleshooting section or create an issue at: https://github.com/YOUR_USERNAME/analytics-dashboard-be/issues
