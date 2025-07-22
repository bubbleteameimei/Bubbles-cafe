# Database Migration Guide: Replit to Render

This guide walks you through the process of migrating your PostgreSQL database from Replit to Render when deploying your interactive storytelling platform.

## Overview of Migration Process

1. Create a backup of your Replit database
2. Create a new PostgreSQL database on Render
3. Restore the backup to your Render database
4. Update your application's environment variables
5. Verify the migration

## Step 1: Create a Backup of Your Replit Database

### Option A: Using pg_dump (Recommended)

The `pg_dump` utility creates a consistent snapshot of your database:

```bash
# Run this command in your Replit Shell
pg_dump -U $PGUSER -h $PGHOST -p $PGPORT -d $PGDATABASE -F c -f backup.dump
```

This creates a compressed binary dump file (`backup.dump`) that preserves all data and schema information.

### Option B: Using the Backup Script

We've provided a backup script that you can run:

```bash
# Run the backup script
node scripts/full-backup.ts
```

This script will:
1. Generate a full SQL dump of your database
2. Save it to `backup.sql` in your project root
3. Log the backup status

## Step 2: Download the Backup File

After creating the backup, download it to your local machine:

1. In Replit, right-click on the `backup.dump` or `backup.sql` file
2. Select "Download" from the context menu
3. Save the file to a location where you can access it later

## Step 3: Create a PostgreSQL Database on Render

1. Log in to your Render account
2. Navigate to the Dashboard
3. Click on "New" and select "PostgreSQL"
4. Configure your database:
   - **Name**: Choose a name for your database
   - **PostgreSQL Version**: Select the same version as your Replit database (13 or higher)
   - **Region**: Choose a region close to your users
   - **Database**: Enter a name for your database (e.g., `storyapp`)
   - **User**: This will be auto-generated
5. Click "Create Database"

Render will provision your PostgreSQL instance and provide you with:
- A connection string (DATABASE_URL)
- Username, password, host, and port information

## Step 4: Restore the Backup to Render

### Option A: Using pg_restore (for binary dumps)

If you used `pg_dump` with the `-F c` option:

```bash
# Replace the placeholders with your Render database credentials
pg_restore -h <RENDER_HOST> -p <RENDER_PORT> -U <RENDER_USER> -d <RENDER_DATABASE> -v backup.dump
```

When prompted, enter your Render database password.

### Option B: Using psql (for SQL dumps)

If you have a SQL dump file:

```bash
# Replace the placeholders with your Render database credentials
psql -h <RENDER_HOST> -p <RENDER_PORT> -U <RENDER_USER> -d <RENDER_DATABASE> -f backup.sql
```

### Option C: Using Render's Dashboard

For smaller databases, you can use Render's dashboard:

1. Go to your PostgreSQL service in the Render dashboard
2. Click on the "Shell" tab
3. Enter `psql` to access the PostgreSQL CLI
4. Copy and paste the contents of your SQL backup file

## Step 5: Update Environment Variables

1. In your Render Web Service (backend):
   - Go to the "Environment" tab
   - Update the `DATABASE_URL` variable to point to your new Render PostgreSQL instance
   - This value should look like: `postgres://user:password@host:port/database`

2. If you're using individual connection parameters:
   - Update `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` values

## Step 6: Verify the Migration

1. Deploy your backend to Render
2. Once deployed, check the logs for any database connection errors
3. Execute a simple database query to ensure connectivity:

```javascript
// Test connection and basic query
const { sql } = require('drizzle-orm');
const db = require('./server/db');

async function testDatabase() {
  try {
    // Simple query to verify connection
    const result = await db.execute(sql`SELECT COUNT(*) FROM users`);
    console.log('Database connection successful! User count:', result[0].count);
    return true;
  } catch (error) {
    console.error('Database verification failed:', error);
    return false;
  }
}

testDatabase();
```

4. Verify that your application can perform all database operations

## Troubleshooting Common Issues

### Connection Errors

If you encounter connection errors:

1. Verify the DATABASE_URL is correct
2. Check if your Render database allows connections from your service
3. Ensure you've included the SSL certificate if required:
   ```
   ?sslmode=require
   ```

### Data Migration Issues

If data didn't migrate correctly:

1. Check for any error messages during the restore process
2. Verify the database schema matches what your application expects
3. Look for any constraints or foreign key violations

### Schema Differences

If your schema changed during migration:

1. Run database migrations:
   ```bash
   npm run db:push
   ```
2. Alternatively, use the Drizzle Kit to synchronize schemas:
   ```bash
   npx drizzle-kit push
   ```

## Scheduled Backups on Render

For ongoing backups on Render:

1. Render automatically creates daily backups of your PostgreSQL database
2. These backups are retained for 7 days
3. You can create manual backups from the dashboard anytime

For custom backup schedules:

1. Create a Render cron job service
2. Add a script that performs the backup and uploads it to cloud storage
3. Configure the schedule according to your needs

## Migrating Large Databases

For databases larger than 1GB:

1. Consider a phased migration approach:
   - Migrate schema first
   - Import critical data
   - Import historical data in batches
2. Use compression options in pg_dump to reduce file size
3. Consider using a streaming approach for very large datasets:
   ```bash
   pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE | psql -h <RENDER_HOST> -U <RENDER_USER> -d <RENDER_DATABASE>
   ```

## Render Database Scaling

As your application grows:

1. You can upgrade your Render database plan at any time
2. Scaling is done without downtime in most cases
3. Consider using connection pooling for high-traffic applications

## Database Security Best Practices

For enhanced security on Render:

1. Use IP allowlisting to restrict database access
2. Rotate credentials periodically
3. Enable disk encryption (available on all Render PostgreSQL instances)
4. Set up data retention policies for compliance requirements

---

By following this guide, you should be able to successfully migrate your PostgreSQL database from Replit to Render with minimal downtime. If you encounter specific issues during migration, consult the [Render PostgreSQL documentation](https://render.com/docs/databases) for more detailed guidance.