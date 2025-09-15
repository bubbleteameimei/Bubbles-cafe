# Database Setup Guide

This guide explains how the database is automatically set up for the Interactive Storytelling Platform.

## Automatic Setup

The database setup is now **completely automatic** and runs every time you start the application. Here's what happens:

### 1. Startup Process

When you run `npm run dev`, the following happens automatically:

1. **Environment Check** - Verifies DATABASE_URL is available
2. **Database Connection** - Tests connection to PostgreSQL
3. **Table Verification** - Ensures all required tables exist
4. **Admin User Setup** - Creates default admin user if needed
5. **Content Sync** - Syncs content from WordPress API

### 2. Database Commands Available

The system supports multiple database commands for different versions of Drizzle Kit:

- `npx drizzle-kit push` (newest format)
- `npx drizzle-kit push:pg` (PostgreSQL specific)
- `npx drizzle-kit up:pg` (migration format)

The startup script automatically tries these in order until one succeeds.

### 3. Manual Setup (if needed)

If you need to run database setup manually:

```bash
# Quick setup using Node.js script
node db-setup.js

# Or use TypeScript version
npx tsx scripts/direct-db-setup.ts

# Or use permanent startup script
npx tsx scripts/permanent-startup.ts
```

## Default Admin User

The system automatically creates an admin user with these credentials:

- **Username:** admin
- **Email:** admin@storytelling.local
- **Password:** admin123

⚠️ **Important:** Change the default password after first login!

## Database Schema

The database includes these main tables:

- `users` - User accounts and profiles
- `posts` - Stories and content
- `comments` - User comments on stories
- `bookmarks` - User bookmarks
- `categories` - Content categories
- `tags` - Content tags
- `sessions` - User sessions
- `analytics` - Usage analytics

## Environment Variables

Required environment variables (automatically provided by Replit):

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

### Connection Issues

If you see database connection errors:

1. Check that DATABASE_URL is set: `echo $DATABASE_URL`
2. Verify the database is running
3. Try manual setup: `node db-setup.js`

### Table Issues

If tables don't exist:

1. The app will create them automatically
2. Or run: `npx drizzle-kit push` (or `push:pg` for older versions)

### Permission Issues

If you get permission errors:

1. Check your database user has CREATE permissions
2. Verify the DATABASE_URL includes correct credentials

## Replit Integration

This setup is designed to work seamlessly with Replit:

- **Automatic startup** - Database setup runs on every Replit start
- **Remix support** - Setup runs when someone remixes your project  
- **Environment ready** - All required environment variables are available
- **Zero configuration** - No manual setup needed

## Development Workflow

For development, the database setup is integrated into the development workflow:

1. **Start development:** `npm run dev`
2. **Database automatically sets up**
3. **Application starts on port 3003**
4. **WordPress content syncs every 5 minutes**

## Production Deployment

For production deployment:

1. Database setup runs automatically on first deployment
2. Environment variables are preserved
3. Admin user is created if it doesn't exist
4. Content syncing continues automatically

## Version Compatibility

This setup works with:

- Drizzle Kit v0.19.1+ (current version)
- Drizzle ORM v0.39.3+
- PostgreSQL 12+
- Node.js 18+

The system automatically adapts to different Drizzle Kit versions by trying multiple command formats.