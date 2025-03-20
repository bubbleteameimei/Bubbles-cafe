-- Create users table
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

CREATE INDEX IF NOT EXISTS email_idx ON users (email);
CREATE INDEX IF NOT EXISTS username_idx ON users (username);

-- Create posts table
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

-- Additional tables can be added as needed