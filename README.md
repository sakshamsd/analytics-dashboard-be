# Analytics Dashboard Backend

A full-featured backend API for an analytics dashboard application, built with Node.js, Express, TypeScript, PostgreSQL, and MongoDB.

## 📚 Complete Documentation

**New to this project?** Start here:

| Document | Purpose |
|----------|---------|
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | **Start here!** Complete project overview and quick links |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference for frontend developers |
| [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) | TypeScript types, hooks, and integration examples |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Deploy to Render, Railway, Fly.io (step-by-step) |
| [DEPLOYMENT_READY_CHECKLIST.md](./DEPLOYMENT_READY_CHECKLIST.md) | Missing features and production readiness |
| [SEED_README.md](./SEED_README.md) | Seed data documentation |

**Current State:** ✅ 76% production-ready | Ready for demo/resume deployment

## Features

- RESTful API with Express.js
- TypeScript for type safety
- Dual database support (PostgreSQL + MongoDB)
- TypeORM for PostgreSQL entities and migrations
- Mongoose for MongoDB flexible schemas
- Security middleware (Helmet, CORS, Rate Limiting)
- Input validation with Zod
- Error handling middleware
- Health check endpoint

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Databases**:
  - PostgreSQL (via TypeORM) - Structured CRM data
  - MongoDB (via Mongoose) - Dashboard configurations
- **Validation**: Zod
- **Security**: Helmet, CORS, Express Rate Limit

## Prerequisites

- Node.js >= 18.x
- PostgreSQL database (Supabase, Railway, or local)
- MongoDB database (MongoDB Atlas or local)
- npm or yarn

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/sakshamsd/analytics-dashboard-be.git
cd analytics-dashboard-be
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `MONGO_URI` - MongoDB connection string
- `CORS_ORIGIN` - Allowed CORS origins (use * for development)

### 3. Database Setup

Run migrations to set up PostgreSQL schema:

```bash
npm run build
npm run migration:run
```

MongoDB collections will be created automatically on first use.

### 4. Run the Application

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:4000` (or your configured PORT).

## API Endpoints

### Health Check
- `GET /health` - Server health status

### CRM Resources
All CRM endpoints require headers:
- `x-workspace-id` - Workspace identifier
- `x-user-id` - User identifier

#### Companies
- `GET /api/v1/companies` - List all companies
- `GET /api/v1/companies/:id` - Get company by ID
- `POST /api/v1/companies` - Create company
- `PUT /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company

#### Contacts
- `GET /api/v1/contacts` - List all contacts
- `GET /api/v1/contacts/:id` - Get contact by ID
- `POST /api/v1/contacts` - Create contact
- `PUT /api/v1/contacts/:id` - Update contact
- `DELETE /api/v1/contacts/:id` - Delete contact

#### Deals
- `GET /api/v1/deals` - List all deals
- `GET /api/v1/deals/:id` - Get deal by ID
- `POST /api/v1/deals` - Create deal
- `PUT /api/v1/deals/:id` - Update deal
- `DELETE /api/v1/deals/:id` - Delete deal

#### Activities
- `GET /api/v1/activities` - List all activities
- `GET /api/v1/activities/:id` - Get activity by ID
- `POST /api/v1/activities` - Create activity
- `PUT /api/v1/activities/:id` - Update activity
- `DELETE /api/v1/activities/:id` - Delete activity

#### Users
- `GET /api/v1/users` - List workspace users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `PATCH /api/v1/users/:id/restore` - Restore deleted user
- `PATCH /api/v1/users/:id/role` - Update user role

#### Bootstrap (Dashboard Config)
- `GET /api/v1/bootstrap` - Get dashboard configuration
- `PUT /api/v1/bootstrap` - Update dashboard configuration

## Project Structure

```
src/
├── app.ts                  # Express app configuration
├── server.ts              # Server entry point
├── controllers/           # Request handlers
├── services/             # Business logic
├── routes/               # API route definitions
├── entities/             # TypeORM entities
├── migrations/           # Database migrations
├── middlewares/          # Custom middleware
├── validation/           # Zod schemas
├── errors/               # Custom error classes
├── database/             # Database connections
│   ├── data-source.ts   # TypeORM config
│   └── mongo.ts         # MongoDB config
└── mongo/
    └── models/          # Mongoose models
```

## Deployment Options

### Option 1: Render (Recommended for Demo)

**Pros**: Free tier, easy setup, automatic deploys
**Steps**:
1. Push code to GitHub
2. Go to [Render Dashboard](https://render.com)
3. Create new "Web Service"
4. Connect your repository
5. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables
6. Create PostgreSQL and MongoDB databases in Render
7. Deploy

**Databases**: Use Render's PostgreSQL add-on + MongoDB Atlas free tier

### Option 2: Railway

**Pros**: Simple, generous free tier, excellent DX
**Steps**:
1. Install Railway CLI or use web dashboard
2. `railway login`
3. `railway init`
4. `railway up`
5. Add PostgreSQL and MongoDB plugins
6. Set environment variables
7. Deploy

### Option 3: Fly.io

**Pros**: Edge deployment, free tier available
**Steps**:
1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. `fly auth login`
3. `fly launch` (will create fly.toml)
4. Add Postgres: `fly postgres create`
5. Use MongoDB Atlas for MongoDB
6. `fly deploy`

### Option 4: Heroku

**Pros**: Well-documented, many add-ons
**Steps**:
1. Install Heroku CLI
2. `heroku login`
3. `heroku create your-app-name`
4. Add buildpack: `heroku buildpacks:set heroku/nodejs`
5. Add Postgres: `heroku addons:create heroku-postgresql`
6. Use MongoDB Atlas for MongoDB
7. Set env vars: `heroku config:set KEY=value`
8. `git push heroku main`

### Option 5: Vercel (with limitations)

**Note**: Requires serverless adaptation
- Use Vercel Postgres for PostgreSQL
- Use MongoDB Atlas for MongoDB
- May need to refactor server.ts for serverless

### Database Options

**PostgreSQL**:
- Supabase (Free tier: 500MB)
- Railway Postgres (Free tier: 1GB)
- Render PostgreSQL (Free tier: 256MB)
- Neon (Free tier: 3GB)
- ElephantSQL (Free tier: 20MB)

**MongoDB**:
- MongoDB Atlas (Free tier: 512MB)
- Railway MongoDB plugin

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (not yet implemented)

## Security Features

- **Helmet**: Sets secure HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Request Size Limits**: 10MB max payload
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Protection**: TypeORM parameterized queries
- **NoSQL Injection Protection**: Mongoose sanitization

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | PostgreSQL URL | `postgresql://user:pass@host/db` |
| `MONGO_URI` | MongoDB URL | `mongodb+srv://...` |
| `CORS_ORIGIN` | Allowed origins | `https://yourdomain.com` |

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL and MONGO_URI are correct
- For PostgreSQL, check SSL settings (production requires SSL)
- For MongoDB, ensure IP whitelist includes your deployment IP

### Migration Issues
```bash
# Generate new migration
npm run build && npx typeorm migration:generate src/migrations/MigrationName -d dist/database/data-source.js

# Run migrations
npm run build && npx typeorm migration:run -d dist/database/data-source.js
```

### Build Issues
```bash
# Clear dist and rebuild
rm -rf dist
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Author

[Your Name](https://github.com/sakshamsd)

## Support

For issues and questions, please open an issue on GitHub.
