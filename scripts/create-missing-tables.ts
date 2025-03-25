import { db, pool } from '../server/db-connect';

async function createMissingTables() {
  console.log('🔄 Creating missing database tables...');

  try {
    // Connect to the database
    console.log('🔌 Connecting to database...');
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }

    const client = await pool.connect();
    try {
      console.log('📊 Checking for missing tables...');
      
      // Check if bookmarks table exists
      const bookmarksExistResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'bookmarks'
        );
      `);
      
      // Check if performance_metrics table exists
      const performanceMetricsExistResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'performance_metrics'
        );
      `);
      
      const bookmarksExist = bookmarksExistResult.rows[0]?.exists;
      const performanceMetricsExist = performanceMetricsExistResult.rows[0]?.exists;
      
      // Create bookmarks table if it doesn't exist
      if (!bookmarksExist) {
        console.log('🏗️ Creating bookmarks table...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS "bookmarks" (
            "id" SERIAL PRIMARY KEY,
            "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
            "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
            "notes" TEXT,
            "last_position" DECIMAL DEFAULT '0' NOT NULL,
            "tags" TEXT[]
          );
          
          -- Add unique constraint to ensure a user can bookmark a post only once
          ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_post_id_unique" 
            UNIQUE ("user_id", "post_id");
        `);
        console.log('✅ Bookmarks table created successfully');
      } else {
        console.log('ℹ️ Bookmarks table already exists');
      }
      
      // Create performance_metrics table if it doesn't exist
      if (!performanceMetricsExist) {
        console.log('🏗️ Creating performance_metrics table...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS "performance_metrics" (
            "id" SERIAL PRIMARY KEY,
            "metric_name" TEXT NOT NULL,
            "value" DOUBLE PRECISION NOT NULL,
            "identifier" TEXT NOT NULL,
            "navigation_type" TEXT,
            "timestamp" TIMESTAMP DEFAULT NOW() NOT NULL,
            "url" TEXT NOT NULL,
            "user_agent" TEXT
          );
        `);
        console.log('✅ Performance metrics table created successfully');
      } else {
        console.log('ℹ️ Performance metrics table already exists');
      }
      
      console.log('🎉 Missing tables created successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error creating missing tables:', error);
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('❌ Database operation failed:', error);
    return false;
  }
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createMissingTables().then(success => {
    if (success) {
      console.log('✅ Database tables are now complete');
      process.exit(0);
    } else {
      console.error('❌ Failed to create all needed tables');
      process.exit(1);
    }
  });
}

export default createMissingTables;