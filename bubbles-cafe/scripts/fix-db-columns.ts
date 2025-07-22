/**
 * Fix Database Columns Script
 * 
 * This script adds the missing columns to the posts table:
 * - theme_icon
 * - is_admin_post
 */

import { Pool } from 'pg';

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a new pool with the DATABASE_URL
const pool = new Pool({
  connectionString: DATABASE_URL,
});

function log(message: string, error?: unknown): void {
  if (error !== undefined) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`[Fix-DB-Columns] ${message} ${errorMessage}`);
  } else {
    console.log(`[Fix-DB-Columns] ${message}`);
  }
}

async function fixDatabaseColumns() {
  let client;
  try {
    log('Starting database column fixes');
    client = await pool.connect();
    
    // Check if theme_icon column exists
    const themeIconResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'theme_icon'
    `);
    
    const themeIconExists = themeIconResult.rows.length > 0;
    
    if (!themeIconExists) {
      log('Adding theme_icon column to posts table');
      await client.query(`ALTER TABLE posts ADD COLUMN theme_icon TEXT`);
      log('Successfully added theme_icon column');
    } else {
      log('theme_icon column already exists');
    }
    
    // Check if is_admin_post column exists
    const isAdminPostResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'is_admin_post'
    `);
    
    const isAdminPostExists = isAdminPostResult.rows.length > 0;
    
    // Check if isAdminPost column exists (camelCase)
    const isAdminPostCamelResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'isAdminPost'
    `);
    
    const isAdminPostCamelExists = isAdminPostCamelResult.rows.length > 0;
    
    if (!isAdminPostExists && !isAdminPostCamelExists) {
      log('Adding is_admin_post column to posts table');
      await client.query(`ALTER TABLE posts ADD COLUMN is_admin_post BOOLEAN DEFAULT FALSE`);
      log('Successfully added is_admin_post column');
    } else if (isAdminPostExists && !isAdminPostCamelExists) {
      // Rename is_admin_post to isAdminPost to match schema
      log('Renaming is_admin_post column to isAdminPost');
      await client.query(`ALTER TABLE posts RENAME COLUMN is_admin_post TO "isAdminPost"`);
      log('Successfully renamed is_admin_post to isAdminPost');
    } else if (!isAdminPostExists && isAdminPostCamelExists) {
      log('isAdminPost column already exists (camelCase)');
    } else {
      log('Both is_admin_post and isAdminPost columns exist - cleaning up');
      // If both columns exist, migrate data and drop the snake_case one
      await client.query(`
        UPDATE posts 
        SET "isAdminPost" = is_admin_post 
        WHERE "isAdminPost" IS NULL
      `);
      
      await client.query(`ALTER TABLE posts DROP COLUMN is_admin_post`);
      log('Successfully migrated data and dropped duplicate is_admin_post column');
    }
    
    log('Database column fixes completed successfully');
    return true;
  } catch (error) {
    log('Error fixing database columns:', error);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Run the function
fixDatabaseColumns()
  .then(success => {
    if (success) {
      console.log('✅ Database columns fixed successfully');
      process.exit(0);
    } else {
      console.error('❌ Failed to fix database columns');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });