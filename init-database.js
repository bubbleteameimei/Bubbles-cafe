// Database initialization script
import { Client } from 'pg';
import bcrypt from 'bcryptjs';

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create all tables based on schema
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Posts table
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        slug TEXT NOT NULL UNIQUE,
        author_id INTEGER REFERENCES users(id) NOT NULL,
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

      -- Comments table
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        post_id INTEGER REFERENCES posts(id),
        parent_id INTEGER REFERENCES comments(id),
        user_id INTEGER REFERENCES users(id),
        is_approved BOOLEAN DEFAULT false NOT NULL,
        edited BOOLEAN DEFAULT false NOT NULL,
        edited_at TIMESTAMP,
        metadata JSON DEFAULT '{}' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Bookmarks table
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        post_id INTEGER REFERENCES posts(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        notes TEXT,
        last_position DECIMAL DEFAULT 0 NOT NULL,
        tags TEXT[],
        UNIQUE(user_id, post_id)
      );

      -- Analytics table
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) NOT NULL,
        page_views INTEGER DEFAULT 0 NOT NULL,
        unique_visitors INTEGER DEFAULT 0 NOT NULL,
        average_read_time DOUBLE PRECISION DEFAULT 0 NOT NULL,
        bounce_rate DOUBLE PRECISION DEFAULT 0 NOT NULL,
        device_stats JSON DEFAULT '{}' NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Site settings table
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Sessions table for authentication
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        last_accessed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS email_idx ON users(email);
      CREATE INDEX IF NOT EXISTS username_idx ON users(username);
      CREATE INDEX IF NOT EXISTS post_author_idx ON posts(author_id);
      CREATE INDEX IF NOT EXISTS post_created_at_idx ON posts(created_at);
      CREATE INDEX IF NOT EXISTS post_theme_category_idx ON posts(theme_category);
      CREATE INDEX IF NOT EXISTS comment_post_id_idx ON comments(post_id);
      CREATE INDEX IF NOT EXISTS analytics_post_id_idx ON analytics(post_id);
      CREATE INDEX IF NOT EXISTS bookmark_user_id_idx ON bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS bookmark_post_id_idx ON bookmarks(post_id);
    `;

    await client.query(createTablesSQL);
    console.log('✅ Database tables created successfully');

    // Create admin user if not exists
    const adminExists = await client.query('SELECT id FROM users WHERE email = $1', ['admin@storytelling.com']);
    
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4)
      `, ['admin', 'admin@storytelling.com', hashedPassword, true]);
      
      console.log('✅ Admin user created (email: admin@storytelling.com, password: admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Verify tables were created
    const tables = await client.query(`
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
    await client.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });