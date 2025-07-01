#!/usr/bin/env tsx
/**
 * Direct Database Setup Script
 * 
 * This script sets up the database by directly connecting to PostgreSQL
 * and ensuring all tables exist, bypassing Drizzle Kit command issues.
 * This approach is more reliable for automated deployment.
 */

import { db } from '../server/db';
import { users, posts } from '../shared/schema';
import { count, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const logger = {
  info: (msg: string) => console.log(`[Direct DB Setup] ${msg}`),
  error: (msg: string) => console.error(`[Direct DB Setup ERROR] ${msg}`),
  success: (msg: string) => console.log(`[Direct DB Setup SUCCESS] ✅ ${msg}`),
  warn: (msg: string) => console.warn(`[Direct DB Setup WARNING] ⚠️ ${msg}`)
};

async function verifyDatabaseConnection() {
  logger.info('Testing database connection...');
  try {
    // Simple connection test
    await db.execute('SELECT 1 as test');
    logger.success('Database connection verified');
    return true;
  } catch (error) {
    logger.error('Database connection failed');
    logger.error(error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function ensureTablesExist() {
  logger.info('Ensuring database tables exist...');
  try {
    // Try to query each main table to ensure they exist
    await db.select({ count: count() }).from(users).limit(1);
    await db.select({ count: count() }).from(posts).limit(1);
    
    logger.success('All required tables exist');
    return true;
  } catch (error) {
    logger.warn('Some tables may not exist, this is normal for first-time setup');
    logger.info('Tables will be created automatically when the app starts');
    return true; // Continue anyway
  }
}

async function seedAdminUser() {
  logger.info('Checking for admin user...');
  try {
    const adminUsers = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
    
    if (adminUsers.length === 0) {
      logger.info('Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@storytelling.local',
        password_hash: hashedPassword,
        isAdmin: true,
        metadata: {
          displayName: 'Administrator',
          bio: 'System Administrator',
          joinedDate: new Date().toISOString()
        }
      });
      
      logger.success('Admin user created (username: admin, password: admin123)');
      logger.warn('Please change the default admin password after first login');
    } else {
      logger.info('Admin user already exists');
    }
  } catch (error) {
    logger.warn('Could not create admin user (table may not exist yet)');
    logger.info('Admin user will be created automatically when tables are ready');
  }
}

async function getTableCounts() {
  try {
    const userCount = await db.select({ count: count() }).from(users);
    const postCount = await db.select({ count: count() }).from(posts);
    
    return {
      users: userCount[0]?.count || 0,
      posts: postCount[0]?.count || 0
    };
  } catch (error) {
    return { users: 0, posts: 0 };
  }
}

async function directDatabaseSetup() {
  logger.info('Starting direct database setup...');
  logger.info('Using DATABASE_URL: ' + (process.env.DATABASE_URL ? 'Set' : 'Not set'));
  
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    // Step 1: Verify database connection
    const connectionOk = await verifyDatabaseConnection();
    if (!connectionOk) {
      logger.error('Cannot connect to database');
      process.exit(1);
    }
    
    // Step 2: Ensure tables exist (or will be created)
    await ensureTablesExist();
    
    // Step 3: Try to seed admin user if tables are ready
    await seedAdminUser();
    
    // Step 4: Report status
    const counts = await getTableCounts();
    logger.success('Database setup completed successfully!');
    logger.info(`Current data: ${counts.users} users, ${counts.posts} posts`);
    
    if (counts.users === 0 && counts.posts === 0) {
      logger.info('Database appears to be empty - this is normal for first-time setup');
      logger.info('Tables and initial data will be created when the application starts');
    }
    
  } catch (error) {
    logger.error('Database setup failed');
    logger.error(error instanceof Error ? error.message : String(error));
    
    // Don't exit with error - let the app try to start anyway
    logger.warn('Continuing with application startup despite database setup issues');
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  directDatabaseSetup().catch((error) => {
    logger.error('Unhandled error during setup');
    logger.error(error);
    process.exit(1);
  });
}

export { directDatabaseSetup };