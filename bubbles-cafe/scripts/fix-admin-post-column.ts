/**
 * Migration script to fix the isAdminPost column in posts table
 * This script will rename the column from "is_admin_post" to "isAdminPost"
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { createLogger } from '../server/utils/debug-logger';

const logger = createLogger('MigrationScript');

async function fixAdminPostColumn() {
  logger.info('Starting migration to fix isAdminPost column...');
  
  try {
    // Check if is_admin_post column exists
    const checkColumnQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'is_admin_post'
    `;
    
    const checkColumnResult = await db.execute(checkColumnQuery);
    const columnExists = checkColumnResult.rows.length > 0;
    
    if (!columnExists) {
      logger.info('is_admin_post column does not exist. Checking if isAdminPost column exists...');
      
      const checkNewColumnQuery = sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'isAdminPost'
      `;
      
      const checkNewColumnResult = await db.execute(checkNewColumnQuery);
      const newColumnExists = checkNewColumnResult.rows.length > 0;
      
      if (!newColumnExists) {
        // Neither column exists, create isAdminPost column
        logger.info('Neither column exists. Creating isAdminPost column...');
        
        await db.execute(sql`
          ALTER TABLE posts 
          ADD COLUMN "isAdminPost" BOOLEAN DEFAULT FALSE
        `);
        
        logger.info('isAdminPost column created successfully');
      } else {
        logger.info('isAdminPost column already exists. No migration needed.');
      }
    } else {
      logger.info('is_admin_post column exists. Checking if isAdminPost column exists...');
      
      const checkNewColumnQuery = sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'isAdminPost'
      `;
      
      const checkNewColumnResult = await db.execute(checkNewColumnQuery);
      const newColumnExists = checkNewColumnResult.rows.length > 0;
      
      if (!newColumnExists) {
        // is_admin_post exists but isAdminPost doesn't, rename the column
        logger.info('Renaming is_admin_post column to isAdminPost...');
        
        await db.execute(sql`
          ALTER TABLE posts 
          RENAME COLUMN is_admin_post TO "isAdminPost"
        `);
        
        logger.info('Column renamed successfully from is_admin_post to isAdminPost');
      } else {
        // Both columns exist, migrate data and drop is_admin_post
        logger.info('Both columns exist. Migrating data and dropping is_admin_post...');
        
        await db.execute(sql`
          UPDATE posts 
          SET "isAdminPost" = is_admin_post 
          WHERE "isAdminPost" IS NULL
        `);
        
        await db.execute(sql`
          ALTER TABLE posts 
          DROP COLUMN is_admin_post
        `);
        
        logger.info('Data migrated and is_admin_post column dropped');
      }
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
    await fixAdminPostColumn();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();