import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function createTables() {
  console.log('🚀 Setting up database tables...');
  
  const databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=require`;
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('Creating users table...');
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
    
    console.log('Creating posts table...');
    await pool.query(`
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
      CREATE INDEX IF NOT EXISTS post_author_idx ON posts(author_id);
    `);
    
    console.log('Creating comments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        post_id INTEGER REFERENCES posts(id),
        user_id INTEGER REFERENCES users(id),
        parent_id INTEGER REFERENCES comments(id),
        is_approved BOOLEAN DEFAULT true,
        edited BOOLEAN DEFAULT false,
        edited_at TIMESTAMP,
        metadata JSON DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log('Creating sessions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
      ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);
    `);
    
    console.log('Creating bookmarks table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        post_id INTEGER REFERENCES posts(id) NOT NULL,
        notes TEXT,
        last_position TEXT DEFAULT '',
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log('Creating site_settings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    console.log('✅ All database tables created successfully!');
    
    // Create default admin user
    console.log('Creating default admin user...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, is_admin) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (email) DO NOTHING
    `, ['admin', 'admin@example.com', hashedPassword, true]);
    
    console.log('✅ Default admin user created (admin@example.com / admin123)');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createTables().catch(error => {
  console.error('Database setup failed:', error);
  process.exit(1);
});