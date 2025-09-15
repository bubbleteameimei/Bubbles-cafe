/**
 * Database Initialization Script
 * 
 * This script creates all required tables and sets up the database schema
 * using the proper connection method for the PostgreSQL database.
 */
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless
const neonConfig = { webSocketConstructor: ws };

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function initializeDatabase() {
  console.log('🔄 Initializing PostgreSQL database...');
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const result = await pool.query('SELECT current_database(), current_user, version()');
    console.log('✅ Connected to database:', result.rows[0].current_database);
    console.log('👤 User:', result.rows[0].current_user);
    
    // Create tables using raw SQL to ensure proper creation
    console.log('🏗️ Creating database tables...');
    
    // Create users table first (as it's referenced by other tables)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS email_idx ON users(email);
      CREATE INDEX IF NOT EXISTS username_idx ON users(username);
    `);
    console.log('✅ Users table created');

    // Create posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        slug TEXT NOT NULL UNIQUE,
        author_id INTEGER NOT NULL REFERENCES users(id),
        is_secret BOOLEAN DEFAULT false NOT NULL,
        "isAdminPost" BOOLEAN DEFAULT false,
        mature_content BOOLEAN DEFAULT false NOT NULL,
        theme_category TEXT,
        reading_time_minutes INTEGER,
        "likesCount" INTEGER DEFAULT 0,
        "dislikesCount" INTEGER DEFAULT 0,
        metadata JSON DEFAULT '{}' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS post_author_idx ON posts(author_id);
      CREATE INDEX IF NOT EXISTS post_created_at_idx ON posts(created_at);
      CREATE INDEX IF NOT EXISTS post_theme_category_idx ON posts(theme_category);
      CREATE INDEX IF NOT EXISTS post_title_idx ON posts(title);
    `);
    console.log('✅ Posts table created');

    // Create comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        post_id INTEGER REFERENCES posts(id),
        parent_id INTEGER,
        user_id INTEGER REFERENCES users(id),
        is_approved BOOLEAN DEFAULT false NOT NULL,
        edited BOOLEAN DEFAULT false NOT NULL,
        edited_at TIMESTAMP,
        metadata JSON DEFAULT '{}' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      ALTER TABLE comments ADD CONSTRAINT parent_id_fk FOREIGN KEY (parent_id) REFERENCES comments(id);
      CREATE INDEX IF NOT EXISTS comment_post_id_idx ON comments(post_id);
      CREATE INDEX IF NOT EXISTS comment_user_id_idx ON comments(user_id);
      CREATE INDEX IF NOT EXISTS comment_parent_id_idx ON comments(parent_id);
      CREATE INDEX IF NOT EXISTS comment_created_at_idx ON comments(created_at);
      CREATE INDEX IF NOT EXISTS comment_approved_idx ON comments(is_approved);
    `);
    console.log('✅ Comments table created');

    // Create remaining tables
    const remainingTables = [
      {
        name: 'author_stats',
        sql: `
          CREATE TABLE IF NOT EXISTS author_stats (
            id SERIAL PRIMARY KEY,
            author_id INTEGER NOT NULL REFERENCES users(id),
            total_posts INTEGER DEFAULT 0 NOT NULL,
            total_likes INTEGER DEFAULT 0 NOT NULL,
            total_tips TEXT DEFAULT '0' NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'reading_progress',
        sql: `
          CREATE TABLE IF NOT EXISTS reading_progress (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            progress DECIMAL NOT NULL,
            last_read_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'secret_progress',
        sql: `
          CREATE TABLE IF NOT EXISTS secret_progress (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            discovery_date TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'contact_messages',
        sql: `
          CREATE TABLE IF NOT EXISTS contact_messages (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            metadata JSON,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'newsletter_subscriptions',
        sql: `
          CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            status TEXT DEFAULT 'active' NOT NULL,
            metadata JSON DEFAULT '{}',
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'sessions',
        sql: `
          CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL PRIMARY KEY,
            token TEXT NOT NULL UNIQUE,
            user_id INTEGER NOT NULL REFERENCES users(id),
            expires_at TIMESTAMP NOT NULL,
            last_accessed_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'reset_tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            token TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT false NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'post_likes',
        sql: `
          CREATE TABLE IF NOT EXISTS post_likes (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            is_like BOOLEAN NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'bookmarks',
        sql: `
          CREATE TABLE IF NOT EXISTS bookmarks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            post_id INTEGER NOT NULL REFERENCES posts(id),
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            notes TEXT,
            last_position DECIMAL DEFAULT 0 NOT NULL,
            tags TEXT[],
            UNIQUE(user_id, post_id)
          );
          CREATE INDEX IF NOT EXISTS bookmark_user_id_idx ON bookmarks(user_id);
          CREATE INDEX IF NOT EXISTS bookmark_post_id_idx ON bookmarks(post_id);
          CREATE INDEX IF NOT EXISTS bookmark_created_at_idx ON bookmarks(created_at);
        `
      },
      {
        name: 'site_settings',
        sql: `
          CREATE TABLE IF NOT EXISTS site_settings (
            id SERIAL PRIMARY KEY,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'activity_logs',
        sql: `
          CREATE TABLE IF NOT EXISTS activity_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            action TEXT NOT NULL,
            details JSON DEFAULT '{}' NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'analytics',
        sql: `
          CREATE TABLE IF NOT EXISTS analytics (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id),
            page_views INTEGER DEFAULT 0 NOT NULL,
            unique_visitors INTEGER DEFAULT 0 NOT NULL,
            average_read_time DOUBLE PRECISION DEFAULT 0 NOT NULL,
            bounce_rate DOUBLE PRECISION DEFAULT 0 NOT NULL,
            device_stats JSON DEFAULT '{}' NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
          CREATE INDEX IF NOT EXISTS analytics_post_id_idx ON analytics(post_id);
          CREATE INDEX IF NOT EXISTS analytics_updated_at_idx ON analytics(updated_at);
        `
      }
    ];

    for (const table of remainingTables) {
      await pool.query(table.sql);
      console.log(`✅ ${table.name} table created`);
    }

    // Create admin user if not exists
    console.log('👤 Creating admin user...');
    const adminExists = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@storytelling.com']);
    
    if (adminExists.rows.length === 0) {
      // Import bcrypt for password hashing
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4)
      `, ['admin', 'admin@storytelling.com', hashedPassword, true]);
      
      console.log('✅ Admin user created (email: admin@storytelling.com, password: admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Verify tables were created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:', tables.rows.map(row => row.table_name).join(', '));
    console.log('✅ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase().catch(console.error);