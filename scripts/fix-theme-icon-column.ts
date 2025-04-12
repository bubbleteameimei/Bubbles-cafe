/**
 * Migration script to fix the themeIcon column in posts table
 * This script will add the themeIcon column if it doesn't exist
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { createLogger } from '../server/utils/debug-logger';

const logger = createLogger('ThemeIconMigration');

async function fixThemeIconColumn() {
  logger.info('Starting migration to fix themeIcon column...');
  
  try {
    // Check if theme_icon column exists
    const checkColumnQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'theme_icon'
    `;
    
    const checkColumnResult = await db.execute(checkColumnQuery);
    const columnExists = checkColumnResult.rows.length > 0;
    
    if (!columnExists) {
      logger.info('theme_icon column does not exist. Creating it...');
      
      await db.execute(sql`
        ALTER TABLE posts 
        ADD COLUMN "theme_icon" TEXT
      `);
      
      logger.info('theme_icon column created successfully');
    } else {
      logger.info('theme_icon column already exists. No migration needed.');
    }
    
    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Error during migration:', error);
    throw error;
  }
}

// Self-executing async function
(async () => {
  try {
    await fixThemeIconColumn();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();