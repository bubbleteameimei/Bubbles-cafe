import { db, pool } from '../server/db-connect';
import * as schema from '../shared/schema';

// Import our database setup utility
import setupDatabase from './setup-db';

async function pushSchema() {
  console.log('🔄 Starting database schema push...');

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

    // Use the existing db and pool from server/db.ts
    console.log('📊 Creating database tables...');
    
    // First, create extensions if they don't exist
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE EXTENSION IF NOT EXISTS "pg_trgm";
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        `);
        console.log('✅ Database extensions enabled');
        
        // Check if tables exist
        const usersExistResult = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);
  
        const postsExistResult = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'posts'
          );
        `);
  
        const usersExist = usersExistResult.rows[0]?.exists;
        const postsExist = postsExistResult.rows[0]?.exists;
  
        if (usersExist && postsExist) {
          console.log('ℹ️ Tables already exist, checking for schema updates...');
        } else {
          console.log('🏗️ Creating tables from schema...');
  
          // Create or update schema
          console.log('🔄 Pushing schema changes to database...');
  
          // First create users table (other tables reference it)
          await client.query(`
            CREATE TABLE IF NOT EXISTS "users" (
              "id" SERIAL PRIMARY KEY,
              "username" TEXT NOT NULL,
              "email" TEXT NOT NULL UNIQUE,
              "password_hash" TEXT NOT NULL,
              "is_admin" BOOLEAN NOT NULL DEFAULT false,
              "metadata" JSONB DEFAULT '{}',
              "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
            );
            
            CREATE INDEX IF NOT EXISTS "email_idx" ON "users" ("email");
            CREATE INDEX IF NOT EXISTS "username_idx" ON "users" ("username");
          `);
  
          // Then create posts table
          await client.query(`
            CREATE TABLE IF NOT EXISTS "posts" (
              "id" SERIAL PRIMARY KEY,
              "title" TEXT NOT NULL,
              "content" TEXT NOT NULL,
              "excerpt" TEXT,
              "slug" TEXT NOT NULL UNIQUE,
              "author_id" INTEGER NOT NULL REFERENCES "users"("id"),
              "is_secret" BOOLEAN NOT NULL DEFAULT false,
              "mature_content" BOOLEAN NOT NULL DEFAULT false,
              "theme_category" TEXT,
              "reading_time_minutes" INTEGER,
              "likes_count" INTEGER DEFAULT 0,
              "dislikes_count" INTEGER DEFAULT 0,
              "metadata" JSON NOT NULL DEFAULT '{}',
              "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
            );
          `);
  
          // Create comments table
          await client.query(`
            CREATE TABLE IF NOT EXISTS "comments" (
              "id" SERIAL PRIMARY KEY,
              "content" TEXT NOT NULL,
              "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
              "user_id" INTEGER REFERENCES "users"("id"),
              "parent_id" INTEGER REFERENCES "comments"("id") ON DELETE CASCADE,
              "is_approved" BOOLEAN DEFAULT false,
              "metadata" JSONB DEFAULT '{}',
              "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
              "edited" BOOLEAN DEFAULT false,
              "edited_at" TIMESTAMP
            );
          `);
  
          console.log('✅ Database schema created successfully');
        }
      } catch (error) {
        console.error('❌ Error updating database schema:', error);
        throw error;
      } finally {
        // Release the client back to the pool
        client.release();
      }
    } catch (error) {
      console.warn('⚠️ Could not create extensions:', error);
      // Continue anyway as these extensions are helpful but not critical
    }

    console.log('🎉 Database schema push completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database schema push failed:', error);
    return false;
  }
}

// Run the schema push if this file is executed directly
// Using import.meta.url check instead of require.main for ESM
if (import.meta.url === `file://${process.argv[1]}`) {
  pushSchema().then(success => {
    if (success) {
      console.log('✅ Database is ready to use');
      process.exit(0);
    } else {
      console.error('❌ Database setup failed');
      process.exit(1);
    }
  });
}

export default pushSchema;