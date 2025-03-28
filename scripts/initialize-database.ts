/**
 * Database Initialization Script
 * 
 * This script:
 * 1. Tests the database connection
 * 2. Creates required PostgreSQL extensions (if needed)
 * 3. Pushes the schema to the database
 * 4. Verifies table creation
 */
import { initializeDatabaseConnection } from './connect-db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');

  try {
    // Step 1: Initialize and test database connection
    const { pool, db } = await initializeDatabaseConnection();

    // Step 2: Create necessary PostgreSQL extensions
    console.log('🔧 Creating necessary PostgreSQL extensions...');
    try {
      // Using raw SQL through drizzle to create extensions if they don't exist
      await db.execute(sql`
        CREATE EXTENSION IF NOT EXISTS "pg_trgm";
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      `);
      console.log('✅ PostgreSQL extensions setup complete');
    } catch (err) {
      console.warn('⚠️ Could not create extensions, continuing anyway:', err);
    }

    // Step 3: Generate migrations if they don't exist
    console.log('📄 Checking for migrations directory...');
    const migrationsDir = path.join(process.cwd(), 'migrations');
    if (!fs.existsSync(migrationsDir) || fs.readdirSync(migrationsDir).length === 0) {
      console.log('⚠️ Migrations directory not found or empty, generating migrations...');
      try {
        await execPromise('npx drizzle-kit generate:pg');
        console.log('✅ Migration files generated successfully');
      } catch (err) {
        console.error('❌ Failed to generate migrations:', err);
        console.log('🔄 Trying to push schema directly...');
      }
    } else {
      console.log('✅ Migrations directory exists');
    }

    // Step 4: Push schema to database
    console.log('🔄 Pushing schema to database...');
    try {
      await execPromise('npx drizzle-kit push:pg');
      console.log('✅ Schema pushed successfully');
    } catch (err) {
      console.error('❌ Failed to push schema:', err);
      process.exit(1);
    }

    // Step 5: Verify tables were created
    console.log('🔍 Verifying table creation...');
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`✅ Found ${tablesResult.rows.length} tables in database:`);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.error('❌ No tables found in database after schema push');
      process.exit(1);
    }

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});