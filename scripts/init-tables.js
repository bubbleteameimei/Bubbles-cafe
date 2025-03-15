import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Create a client connection
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

async function initializeTables() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');

    // Create tables for essential functionality
    console.log('Creating tables...');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        full_name TEXT,
        avatar TEXT,
        bio TEXT,
        metadata JSONB DEFAULT '{}',
        last_login TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS email_idx ON users(email);
      CREATE INDEX IF NOT EXISTS username_idx ON users(username);
    `);
    console.log('Created users table');

    // Posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        slug TEXT NOT NULL UNIQUE,
        author_id INTEGER NOT NULL REFERENCES users(id),
        is_secret BOOLEAN NOT NULL DEFAULT FALSE,
        mature_content BOOLEAN NOT NULL DEFAULT FALSE,
        theme_category TEXT,
        reading_time_minutes INTEGER,
        likes_count INTEGER DEFAULT 0,
        dislikes_count INTEGER DEFAULT 0,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created posts table');

    // User feedback table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL DEFAULT 'general',
        content TEXT NOT NULL,
        rating INTEGER DEFAULT 0,
        page TEXT DEFAULT 'unknown',
        status TEXT NOT NULL DEFAULT 'pending',
        user_id INTEGER REFERENCES users(id),
        browser TEXT DEFAULT 'unknown',
        operating_system TEXT DEFAULT 'unknown',
        screen_resolution TEXT DEFAULT 'unknown',
        user_agent TEXT DEFAULT 'unknown',
        category TEXT DEFAULT 'general',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created user_feedback table');

    // We'll need sessions for auth
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        expires_at TIMESTAMP NOT NULL,
        last_accessed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created sessions table');

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
  } finally {
    // Close the client connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the initialization
initializeTables();