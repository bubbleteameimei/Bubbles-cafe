/**
 * Add isAdminPost Column Script
 * 
 * This script adds the is_admin_post column to the posts table
 * if it doesn't already exist.
 */
import { initializeDatabaseConnection } from './connect-db';

async function addAdminPostColumn() {
  console.log('🔄 Starting column addition process...');

  try {
    // Initialize database connection
    console.log('🔌 Connecting to database...');
    const connection = await initializeDatabaseConnection();
    const pool = connection.pool;
    
    // Get a client from the pool
    const client = await pool.connect();
    
    try {
      // Check if the column already exists
      console.log('🔍 Checking if is_admin_post column exists...');
      const columnCheckResult = await client.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'posts'
          AND column_name = 'is_admin_post'
        );
      `);
      
      const columnExists = columnCheckResult.rows[0]?.exists;
      
      if (columnExists) {
        console.log('✅ Column is_admin_post already exists');
      } else {
        console.log('🛠️ Adding is_admin_post column to posts table...');
        
        // Add the column
        await client.query(`
          ALTER TABLE posts
          ADD COLUMN is_admin_post BOOLEAN DEFAULT false;
        `);
        
        console.log('✅ Column is_admin_post added successfully');
      }
      
      // Update any existing posts that have isAdminPost in metadata
      console.log('🔄 Updating existing posts with metadata.isAdminPost values...');
      await client.query(`
        UPDATE posts
        SET is_admin_post = (metadata->>'isAdminPost')::boolean
        WHERE metadata->>'isAdminPost' IS NOT NULL;
      `);
      
      console.log('✅ Column migration completed successfully');
      
    } catch (error) {
      console.error('❌ Error adding column:', error);
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Column addition process failed:', error);
    return false;
  }
}

// Run the function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addAdminPostColumn().then(success => {
    if (success) {
      console.log('✅ Column addition completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Column addition failed');
      process.exit(1);
    }
  });
}

export default addAdminPostColumn;