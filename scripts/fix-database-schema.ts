
/**
 * Database Schema Fix Script
 * 
 * This script adds missing columns to the existing Neon database
 * to ensure compatibility with the application
 */
import { initializeDatabaseConnection } from './connect-db';

async function fixDatabaseSchema() {
  console.log('🔧 Starting database schema fix...');
  
  try {
    const { pool, db } = await initializeDatabaseConnection();
    
    // Add missing columns to posts table
    console.log('📝 Adding missing columns to posts table...');
    
    const alterQueries = [
      // Add is_admin_post column if it doesn't exist
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_admin_post BOOLEAN DEFAULT FALSE`,
      
      // Add other potentially missing columns
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS mature_content BOOLEAN DEFAULT FALSE NOT NULL`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS theme_category TEXT`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata JSON DEFAULT '{}'::json NOT NULL`,
      
      // Ensure indexes exist
      `CREATE INDEX IF NOT EXISTS post_author_idx ON posts(author_id)`,
      `CREATE INDEX IF NOT EXISTS post_created_at_idx ON posts(created_at)`,
      `CREATE INDEX IF NOT EXISTS post_theme_category_idx ON posts(theme_category)`,
      `CREATE INDEX IF NOT EXISTS post_title_idx ON posts(title)`
    ];
    
    for (const query of alterQueries) {
      try {
        await pool.query(query);
        console.log(`✅ Executed: ${query.substring(0, 50)}...`);
      } catch (error: any) {
        if (error.code === '42701') {
          console.log(`⏭️ Column already exists, skipping...`);
        } else {
          console.warn(`⚠️ Warning executing query: ${error.message}`);
        }
      }
    }
    
    // Check if users table has required columns
    console.log('📝 Checking users table...');
    const userAlterQueries = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`,
      `CREATE INDEX IF NOT EXISTS email_idx ON users(email)`,
      `CREATE INDEX IF NOT EXISTS username_idx ON users(username)`
    ];
    
    for (const query of userAlterQueries) {
      try {
        await pool.query(query);
        console.log(`✅ Executed: ${query.substring(0, 50)}...`);
      } catch (error: any) {
        if (error.code === '42701') {
          console.log(`⏭️ Column already exists, skipping...`);
        } else {
          console.warn(`⚠️ Warning executing query: ${error.message}`);
        }
      }
    }
    
    // Verify the changes
    console.log('🔍 Verifying database schema...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'posts' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Posts table columns:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    await pool.end();
    console.log('✅ Database schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fixDatabaseSchema();
}

export { fixDatabaseSchema };
