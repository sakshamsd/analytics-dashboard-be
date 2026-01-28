# Database Seed Script

This script fills the database with realistic mock data for development and testing purposes.

## Prerequisites

Before running the seed script, ensure you have:

1. PostgreSQL database running and accessible
2. MongoDB database running and accessible
3. Properly configured `.env` file with database connection strings

## Environment Variables Required

Make sure your `.env` file contains:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
MONGO_URI=mongodb://localhost:27017/analytics-dashboard
```

For MongoDB Atlas, use:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/analytics-dashboard
```

## Running the Seed Script

```bash
npm run seed
```

## What Gets Created

The seed script will create:

- **2 Workspaces**: Sample workspace organizations
- **5 Users**: Mock users with authentication details
- **5 Workspace Members**: User-workspace associations with roles (OWNER, ADMIN, MEMBER)
- **20 Companies**: Mock companies across various industries
- **50 Contacts**: Contact persons associated with companies
- **30 Deals**: Sales deals in various stages (OPEN, WON, LOST)
- **100 Activities**: Notes, calls, emails, meetings, and tasks
- **5 Dashboard Configs**: Personalized dashboard configurations for each workspace member

## Data Characteristics

### Workspaces
- Acme Corporation
- TechStart Inc

### Users
- Randomly generated names
- Auth0 authentication provider
- Profile avatars
- Active status

### Companies
- Realistic company names
- Various industries (Technology, Healthcare, Finance, etc.)
- Company sizes from 1-10 to 1000+ employees
- Different statuses (prospect, customer, partner, inactive)

### Contacts
- Associated with companies
- Email addresses based on company domain
- Phone numbers
- Primary contact flags

### Deals
- Amount range: $10,000 to $500,000
- Stages: New, Qualification, Proposal, Negotiation, Closed Won, Closed Lost
- Associated with companies and contacts
- Expected close dates

### Activities
- Types: NOTE, CALL, EMAIL, MEETING, TASK
- Status: OPEN or DONE
- Linked to deals, companies, and contacts
- Due dates

## Important Notes

⚠️ **Warning**: This script will **DELETE ALL EXISTING DATA** in the following tables/collections:
- activities
- deals
- contacts
- companies
- workspace_members
- users
- workspaces
- dashboard_configs

**Do not run this script in production or against any database with data you want to keep!**

## Troubleshooting

### Connection Errors

If you see `ECONNREFUSED` errors:

1. **PostgreSQL**: Ensure your PostgreSQL server is running
   ```bash
   # Check if PostgreSQL is running
   psql -U your_username -d your_database -c "SELECT 1"
   ```

2. **MongoDB**: Ensure MongoDB is running
   ```bash
   # For local MongoDB
   mongosh

   # Check connection
   mongosh "your_connection_string"
   ```

### Permission Errors

Ensure your database user has permissions to:
- DELETE from tables
- INSERT into tables
- CREATE records

### Missing Environment Variables

If you see "environment variable is not set" errors:
- Verify your `.env` file exists in the project root
- Check that the variable names match exactly
- Ensure no typos in the connection strings

## After Seeding

Once the seed completes successfully, you can:

1. Start your development server: `npm run dev`
2. Access the API endpoints with populated data
3. Test your dashboard with real-looking data
4. Develop features with realistic data relationships

## Customization

To modify the seed data:

1. Edit [src/scripts/seed.ts](src/scripts/seed.ts)
2. Adjust the mock data arrays (industries, company names, etc.)
3. Change the number of records created
4. Modify relationships between entities

## Example Output

```
🌱 Starting database seed...

Connecting to PostgreSQL...
✓ PostgreSQL connected
Connecting to MongoDB...
✓ MongoDB connected

🗑️  Clearing existing data...
✓ Data cleared

📁 Creating workspaces...
✓ Created 2 workspaces

👥 Creating users...
✓ Created 5 users

🔗 Creating workspace members...
✓ Created 5 workspace members

🏢 Creating companies...
✓ Created 20 companies

📇 Creating contacts...
✓ Created 50 contacts

💼 Creating deals...
✓ Created 30 deals

📋 Creating activities...
✓ Created 100 activities

📊 Creating dashboard configs...
✓ Created 5 dashboard configs

==================================================
🎉 SEED COMPLETED SUCCESSFULLY
==================================================
📁 Workspaces: 2
👥 Users: 5
🔗 Workspace Members: 5
🏢 Companies: 20
📇 Contacts: 50
💼 Deals: 30
📋 Activities: 100
📊 Dashboard Configs: 5
==================================================

✓ Database connections closed
```
