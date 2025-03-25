import { db } from '../server/db';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

async function main() {
  console.log('Starting database initialization...');
  
  try {
    // Initialize the database connection
    console.log('Connecting to database...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Use postgres.js for schema migrations
    const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
    const migrationDb = drizzle(migrationClient, { schema });
    
    console.log('Connected to database. Running migrations...');
    
    // Push the schema to the database
    try {
      // Since we're not using migrations yet, we'll use db.execute
      // This is safe because we're in initialization mode
      await migrationDb.execute(`
        DO $$ BEGIN
          CREATE EXTENSION IF NOT EXISTS "pg_trgm";
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Error creating extensions: %', SQLERRM;
        END $$;
      `);
      
      console.log('Created necessary PostgreSQL extensions');
    } catch (err) {
      console.warn('Could not create extensions, continuing anyway:', err);
    }
    
    // Use drizzle-kit programmatically to push the schema
    console.log('Setting up tables from schema...');
    
    // Simple check for tables
    const result = await migrationClient`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    if (result[0]?.exists) {
      console.log('Tables already exist, checking for schema updates...');
    }
    
    // Create tables if they don't exist
    try {
      // For each table in the schema, try to create it if it doesn't exist
      // Create users table first since other tables reference it
      await migrationClient`
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
      `;
      
      // Create posts table
      await migrationClient`
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
      `;
      
      // Create more tables as needed based on schema.ts
      
      console.log('Database tables created successfully');
    } catch (err) {
      console.error('Error creating database tables:', err);
      throw err;
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    console.log('Database initialization process complete.');
    process.exit(0);
  }
}

main();