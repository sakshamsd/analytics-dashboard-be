# Quick Start Checklist

Use this checklist to get your backend up and running quickly.

---

## Local Development Setup

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] PostgreSQL running (or Supabase account)
- [ ] MongoDB running (or Atlas account)
- [ ] Git installed

### Setup Steps

```bash
# 1. Clone and install
- [ ] git clone <repo-url>
- [ ] cd analytics-dashboard-be
- [ ] npm install

# 2. Environment setup
- [ ] cp .env.example .env
- [ ] Edit .env with database URLs
- [ ] Verify PORT, NODE_ENV, DATABASE_URL, MONGO_URI, CORS_ORIGIN

# 3. Database setup
- [ ] npm run build
- [ ] npm run migration:run
- [ ] npm run seed (optional but recommended)

# 4. Start development
- [ ] npm run dev
- [ ] Open http://localhost:4000/health
- [ ] Verify: {"status":"ok","timestamp":"..."}
```

### Test API
- [ ] Test health endpoint: `curl http://localhost:4000/health`
- [ ] Get workspace ID from seed output or database
- [ ] Get user ID from seed output or database
- [ ] Test create company with Postman/Thunder Client
- [ ] Test list companies

---

## Deployment to Render (Free) - 10 Minutes

### Step 1: Set Up Databases (5 minutes)

**Supabase (PostgreSQL):**
- [ ] Go to https://supabase.com
- [ ] Create account and new project
- [ ] Name: "analytics-dashboard"
- [ ] Wait for provisioning (2-3 min)
- [ ] Go to Settings → Database → Copy Connection String (URI)
- [ ] Save connection string with password filled in

**MongoDB Atlas:**
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create account and new cluster (M0 Free)
- [ ] Select region (same as Supabase if possible)
- [ ] Network Access → Add IP → Allow 0.0.0.0/0
- [ ] Database Access → Add User → Save credentials
- [ ] Connect → Drivers → Copy connection string
- [ ] Replace `<password>` and set database name: `analytics-dashboard`
- [ ] Save connection string

### Step 2: Run Migrations (2 minutes)

```bash
# On your local machine
- [ ] export DATABASE_URL="your-supabase-url"
- [ ] export MONGO_URI="your-mongodb-atlas-url"
- [ ] npm run migration:run
- [ ] npm run seed
```

### Step 3: Deploy to Render (3 minutes)

**Push to GitHub:**
- [ ] Create GitHub repository
- [ ] git remote add origin <github-url>
- [ ] git push -u origin main

**Deploy on Render:**
- [ ] Go to https://render.com
- [ ] Sign up with GitHub
- [ ] New → Web Service
- [ ] Connect your repository
- [ ] Name: "analytics-dashboard-be"
- [ ] Runtime: Docker
- [ ] Instance Type: Free

**Add Environment Variables:**
- [ ] PORT = 4000
- [ ] NODE_ENV = production
- [ ] DATABASE_URL = (paste Supabase URL)
- [ ] MONGO_URI = (paste MongoDB Atlas URL)
- [ ] CORS_ORIGIN = * (or your frontend URL)

**Deploy:**
- [ ] Click "Create Web Service"
- [ ] Wait 3-5 minutes for build
- [ ] Copy your API URL: `https://your-app.onrender.com`

### Step 4: Verify Deployment (1 minute)

- [ ] Test: `curl https://your-app.onrender.com/health`
- [ ] Expected: `{"status":"ok","timestamp":"..."}`
- [ ] Test create company with Postman

### Step 5: Keep It Awake (Optional)

**For free Render (prevents sleeping):**
- [ ] Go to https://uptimerobot.com
- [ ] Create free account
- [ ] Add New Monitor
- [ ] Type: HTTP(s)
- [ ] URL: `https://your-app.onrender.com/health`
- [ ] Monitoring Interval: 5 minutes
- [ ] Create monitor

---

## Frontend Integration

### Get IDs from Database

**Option 1: From Seed Output**
```bash
# When you ran npm run seed, it printed:
# ✅ Workspace created: [workspace-id]
# ✅ Users created: [user-id]
```

**Option 2: Query Database**
```sql
-- PostgreSQL
SELECT id, name FROM workspaces LIMIT 1;
SELECT id, full_name FROM users LIMIT 1;
```

**Option 3: Use Default Seed IDs**
Check [SEED_README.md](./SEED_README.md) for default IDs

### Frontend Setup

**Create .env in frontend:**
```bash
# React / Vite
- [ ] VITE_API_URL=https://your-app.onrender.com
- [ ] VITE_WORKSPACE_ID=<from-database>
- [ ] VITE_USER_ID=<from-database>

# Next.js
- [ ] NEXT_PUBLIC_API_URL=https://your-app.onrender.com
- [ ] NEXT_PUBLIC_WORKSPACE_ID=<from-database>
- [ ] NEXT_PUBLIC_USER_ID=<from-database>
```

**Copy Types:**
- [ ] Open [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
- [ ] Copy TypeScript types to your frontend
- [ ] Copy API service layer code
- [ ] Copy hooks examples

**Test Integration:**
- [ ] Test health endpoint from frontend
- [ ] Test fetching companies
- [ ] Test creating a company
- [ ] Test updating a company
- [ ] Test deleting a company

---

## Documentation Checklist

### For Your Resume/Portfolio

- [ ] Add deployment URL to README.md
- [ ] Test all endpoints with Postman
- [ ] Create Postman collection (export and add to repo)
- [ ] Take screenshots of API responses
- [ ] Write demo script

### Update Documentation

- [ ] Update GitHub repo description
- [ ] Add badges (build status, license)
- [ ] Add live demo link
- [ ] List tech stack
- [ ] Highlight key features

### Portfolio Highlights

**Copy this for your resume:**

```markdown
Analytics Dashboard Backend
- Built RESTful API with Node.js, Express, TypeScript
- Multi-tenant SaaS architecture with PostgreSQL + MongoDB
- Comprehensive API documentation and frontend integration guide
- Docker deployment on cloud platform (Render/Railway/Fly.io)
- Tech: TypeScript, Express, TypeORM, MongoDB, Docker, Zod

[Live API](https://your-app.onrender.com/health) | [Documentation](./API_DOCUMENTATION.md) | [GitHub](https://github.com/your-username/analytics-dashboard-be)
```

---

## Pre-Demo Checklist

Before showing to employers/recruiters:

### Test Everything
- [ ] Health endpoint returns 200
- [ ] Can create companies
- [ ] Can list companies
- [ ] Can update companies
- [ ] Can delete companies (soft delete)
- [ ] Repeat for contacts, deals, activities
- [ ] Test error handling (invalid data)
- [ ] Test rate limiting

### Prepare Demo Materials
- [ ] Postman collection ready
- [ ] Know workspace and user IDs by heart
- [ ] Have example data ready to create
- [ ] Understand architecture diagram
- [ ] Can explain multi-tenant design
- [ ] Know why you chose dual databases

### Documentation Review
- [ ] API docs are complete
- [ ] All endpoints documented with examples
- [ ] TypeScript types provided
- [ ] Deployment guide accurate
- [ ] README up to date

### Performance Check
- [ ] First request (cold start) tested
- [ ] Average response time < 200ms
- [ ] UptimeRobot keeping Render awake (if using free tier)
- [ ] Database connections stable

---

## Troubleshooting Checklist

### If API won't start:
- [ ] Check environment variables are set correctly
- [ ] Verify DATABASE_URL is valid
- [ ] Verify MONGO_URI is valid
- [ ] Check database is running
- [ ] Check migrations ran successfully
- [ ] Check logs for specific errors

### If migrations fail:
- [ ] Verify DATABASE_URL is correct
- [ ] Check database is accessible
- [ ] Run `npm run build` first
- [ ] Try `npm run migration:revert` then re-run
- [ ] Check database has correct permissions

### If CORS errors:
- [ ] Set CORS_ORIGIN=* for testing
- [ ] Or set to specific frontend URL
- [ ] Restart server after changing env vars
- [ ] Clear browser cache

### If headers error:
- [ ] Ensure x-workspace-id header is sent
- [ ] Ensure x-user-id header is sent
- [ ] Check header values are valid UUIDs
- [ ] Check user/workspace exists in database

### If Render app sleeping:
- [ ] Set up UptimeRobot
- [ ] Or upgrade to paid tier ($7/month)
- [ ] Or accept cold starts for demo

---

## Maintenance Checklist

### Weekly
- [ ] Check UptimeRobot status (if using)
- [ ] Monitor Render/Railway dashboard for errors
- [ ] Check database storage usage
- [ ] Review application logs

### Monthly
- [ ] Update npm packages: `npm outdated`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review rate limit needs
- [ ] Check database backups exist

### Before Interview/Demo
- [ ] Wake up app (visit health endpoint)
- [ ] Test all key endpoints
- [ ] Check Postman collection works
- [ ] Review documentation one more time
- [ ] Practice explaining architecture

---

## Next Steps After Deployment

### Immediate (This Week)
- [ ] Share API docs with frontend team
- [ ] Add deployment URL to resume
- [ ] Create demo video (optional)
- [ ] Write blog post about architecture (optional)

### Short Term (Next 2 Weeks)
- [ ] Add pagination to list endpoints
- [ ] Add filtering and search
- [ ] Implement structured logging
- [ ] Add restore endpoints for soft-deleted entities

### Long Term (Optional)
- [ ] Add authentication (JWT/OAuth)
- [ ] Write automated tests
- [ ] Set up CI/CD pipeline
- [ ] Add performance monitoring
- [ ] Implement WebSocket for real-time updates

---

## Resources Quick Links

- **Full Docs:** [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- **API Reference:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Frontend Guide:** [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
- **Deployment:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Missing Features:** [DEPLOYMENT_READY_CHECKLIST.md](./DEPLOYMENT_READY_CHECKLIST.md)

---

**Print this checklist and check off items as you complete them!**

Good luck! 🚀
