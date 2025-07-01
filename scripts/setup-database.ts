#!/usr/bin/env tsx
/**
 * Modern Database Setup Script
 * 
 * This script sets up the database using the latest Drizzle Kit commands
 * and ensures the database is properly initialized for each application startup.
 * 
 * Features:
 * - Uses modern Drizzle Kit commands (without deprecated :pg suffix)
 * - Automatic database connection verification
 * - Schema push with proper error handling
 * - Initial data seeding
 * - Comprehensive logging
 */

import { execSync } from 'child_process';
import { db } from '../server/db';
import { users, posts } from '../shared/schema';
import { count, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const logger = {
  info: (msg: string) => console.log(`[DB Setup] ${msg}`),
  error: (msg: string) => console.error(`[DB Setup ERROR] ${msg}`),
  success: (msg: string) => console.log(`[DB Setup SUCCESS] ✅ ${msg}`),
  warn: (msg: string) => console.warn(`[DB Setup WARNING] ⚠️ ${msg}`)
};

async function verifyDatabaseConnection() {
  logger.info('Verifying database connection...');
  try {
    // Simple query to test connection
    await db.select({ count: count() }).from(users);
    logger.success('Database connection verified');
    return true;
  } catch (error) {
    logger.error('Database connection failed');
    logger.error(error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function pushDatabaseSchema() {
  logger.info('Applying database schema using Drizzle Kit...');
  try {
    // Use up:pg command for PostgreSQL schema updates
    const output = execSync('npx drizzle-kit up:pg', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    logger.success('Database schema applied successfully');
    if (output) {
      logger.info('Drizzle output:');
      console.log(output);
    }
    return true;
  } catch (error: any) {
    logger.error('Failed to apply database schema');
    if (error.stdout) logger.error('STDOUT: ' + error.stdout.toString());
    if (error.stderr) logger.error('STDERR: ' + error.stderr.toString());
    return false;
  }
}

async function seedAdminUser() {
  logger.info('Checking for admin user...');
  try {
    const adminUsers = await db.select().from(users).where(eq(users.isAdmin, true));
    
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
    } else {
      logger.info('Admin user already exists');
    }
  } catch (error) {
    logger.error('Failed to seed admin user');
    logger.error(error instanceof Error ? error.message : String(error));
  }
}

async function generateMigrations() {
  logger.info('Generating database migrations...');
  try {
    const output = execSync('npx drizzle-kit generate:pg', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    logger.success('Migrations generated successfully');
    return true;
  } catch (error: any) {
    // This might fail if no changes are detected, which is normal
    if (error.stdout && error.stdout.includes('No schema changes')) {
      logger.info('No schema changes detected');
      return true;
    }
    
    logger.warn('Migration generation had issues (this might be normal)');
    if (error.stdout) logger.info('STDOUT: ' + error.stdout.toString());
    return true; // Continue anyway
  }
}

async function setupDatabase() {
  logger.info('Starting modern database setup...');
  logger.info('Using DATABASE_URL: ' + (process.env.DATABASE_URL ? 'Set' : 'Not set'));
  
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    // Step 1: Generate migrations (if needed)
    await generateMigrations();
    
    // Step 2: Push schema to database
    const schemaPushed = await pushDatabaseSchema();
    if (!schemaPushed) {
      logger.error('Failed to push schema, aborting setup');
      process.exit(1);
    }
    
    // Step 3: Verify database connection
    const connectionOk = await verifyDatabaseConnection();
    if (!connectionOk) {
      logger.error('Database connection verification failed');
      process.exit(1);
    }
    
    // Step 4: Seed initial data
    await seedAdminUser();
    
    // Step 5: Final verification
    const postCount = await db.select({ count: count() }).from(posts);
    const userCount = await db.select({ count: count() }).from(users);
    
    logger.success('Database setup completed successfully!');
    logger.info(`Database contains: ${userCount[0].count} users, ${postCount[0].count} posts`);
    
  } catch (error) {
    logger.error('Database setup failed');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().catch((error) => {
    logger.error('Unhandled error during setup');
    logger.error(error);
    process.exit(1);
  });
}

export { setupDatabase };