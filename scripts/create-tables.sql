-- Create all required tables for the Interactive Storytelling Platform

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

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS email_idx ON users(email);
CREATE INDEX IF NOT EXISTS username_idx ON users(username);

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

-- Create indexes for posts table
CREATE INDEX IF NOT EXISTS post_author_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS post_created_at_idx ON posts(created_at);
CREATE INDEX IF NOT EXISTS post_theme_category_idx ON posts(theme_category);
CREATE INDEX IF NOT EXISTS post_title_idx ON posts(title);

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

-- Create indexes for comments table
CREATE INDEX IF NOT EXISTS comment_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS comment_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comment_parent_id_idx ON comments(parent_id);
CREATE INDEX IF NOT EXISTS comment_created_at_idx ON comments(created_at);
CREATE INDEX IF NOT EXISTS comment_approved_idx ON comments(is_approved);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_accessed_at TIMESTAMP NOT NULL,
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

-- Create indexes for bookmarks table
CREATE INDEX IF NOT EXISTS bookmark_user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmark_post_id_idx ON bookmarks(post_id);
CREATE INDEX IF NOT EXISTS bookmark_created_at_idx ON bookmarks(created_at);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
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

-- Create indexes for analytics table
CREATE INDEX IF NOT EXISTS analytics_post_id_idx ON analytics(post_id);
CREATE INDEX IF NOT EXISTS analytics_updated_at_idx ON analytics(updated_at);

-- Author stats table
CREATE TABLE IF NOT EXISTS author_stats (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id) NOT NULL,
    total_posts INTEGER DEFAULT 0 NOT NULL,
    total_likes INTEGER DEFAULT 0 NOT NULL,
    total_tips TEXT DEFAULT '0' NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    type TEXT DEFAULT 'general' NOT NULL,
    content TEXT NOT NULL,
    page TEXT DEFAULT 'unknown',
    status TEXT DEFAULT 'pending' NOT NULL,
    user_id INTEGER REFERENCES users(id),
    browser TEXT DEFAULT 'unknown',
    operating_system TEXT DEFAULT 'unknown',
    screen_resolution TEXT DEFAULT 'unknown',
    user_agent TEXT DEFAULT 'unknown',
    category TEXT DEFAULT 'general',
    metadata JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' NOT NULL,
    metadata JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert default admin user
INSERT INTO users (username, email, password_hash, is_admin, metadata, created_at) 
VALUES (
    'admin', 
    'admin@storytelling.local', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/.BCzxPHHsNeLgpK2u', -- 'admin123'
    true, 
    '{"fullName": "Site Administrator", "bio": "Welcome to our digital storytelling platform"}',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value, category, description) VALUES
('site_name', 'Interactive Storytelling Platform', 'general', 'The name of the website'),
('site_description', 'A modern platform for interactive storytelling', 'general', 'Site description for SEO'),
('wordpress_sync_enabled', 'true', 'sync', 'Enable WordPress content synchronization'),
('wordpress_api_url', 'https://bubbleteameimei.wordpress.com/wp-json/wp/v2/posts', 'sync', 'WordPress API endpoint for content sync')
ON CONFLICT (key) DO NOTHING;