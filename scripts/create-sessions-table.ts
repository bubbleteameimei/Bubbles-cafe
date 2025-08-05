import { initializeDatabaseConnection } from './connect-db';
import setupDatabase from './setup-db';

async function createSessionsTable() {
  console.log('🔄 Creating sessions table...');

  try {
    // First ensure DATABASE_URL is properly set
    const setupSuccess = await setupDatabase();
    if (!setupSuccess) {
      throw new Error('Database setup failed');
    }

    // Connect to the database
    console.log('🔌 Connecting to database...');
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    
    // Initialize database connection
    const connection = await initializeDatabaseConnection();
    const pool = connection.pool;

    console.log('📊 Creating sessions table...');
    
    const client = await pool.connect();
    try {
      // Check if sessions table exists
      const sessionsExistResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'sessions'
        );
      `);

      const sessionsExist = sessionsExistResult.rows[0]?.exists;

      if (sessionsExist) {
        console.log('🗑️ Dropping existing sessions table...');
        await client.query(`DROP TABLE IF EXISTS "sessions" CASCADE;`);
        console.log('✅ Dropped existing sessions table');
      }
      
      console.log('🏗️ Creating sessions table...');

      // Create sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "sessions" (
          "id" SERIAL PRIMARY KEY,
          "session_id" TEXT NOT NULL UNIQUE,
          "token" TEXT NOT NULL UNIQUE,
          "user_id" INTEGER REFERENCES "users"("id"),
          "session_data" JSONB DEFAULT '{}',
          "ip_address" TEXT,
          "user_agent" TEXT,
          "expires_at" TIMESTAMP NOT NULL,
          "last_accessed_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "csrf_token" TEXT,
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS "session_id_idx" ON "sessions" ("session_id");
        CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "sessions" ("user_id");
        CREATE INDEX IF NOT EXISTS "session_expires_at_idx" ON "sessions" ("expires_at");
        CREATE INDEX IF NOT EXISTS "session_ip_address_idx" ON "sessions" ("ip_address");
      `);

      console.log('✅ Sessions table created successfully');
    } finally {
      client.release();
    }

    console.log('🎉 Sessions table setup completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Sessions table creation failed:', error);
    return false;
  }
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSessionsTable().then(success => {
    if (success) {
      console.log('✅ Sessions table is ready to use');
      process.exit(0);
    } else {
      console.error('❌ Sessions table setup failed');
      process.exit(1);
    }
  });
}

export default createSessionsTable;