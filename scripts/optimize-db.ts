#!/usr/bin/env tsx

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

console.log('🔧 Starting database optimization...');

async function optimizeDatabase() {
  try {
    console.log('📊 Creating performance indexes...');
    
    // Create performance indexes
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_theme_created ON posts (theme_category, created_at DESC) WHERE theme_category IS NOT NULL`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_created ON comments (post_id, created_at DESC)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON users (email)`);

    // Text search optimization using pg_trgm for LIKE/ILIKE on title/excerpt/content
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_title_trgm ON posts USING gin (title gin_trgm_ops)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_excerpt_trgm ON posts USING gin (excerpt gin_trgm_ops)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_content_trgm ON posts USING gin (content gin_trgm_ops)`);

    // JSONB GIN index on metadata for frequent key lookups (status, isCommunityPost, wordpressId)
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_metadata_gin ON posts USING gin (metadata)`);
    // Expression index for wordpressId mapping
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_metadata_wp_id ON posts (((metadata->>'wordpressId')::int))`);
    // Functional index for metadata themeCategory lookups
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_metadata_theme ON posts ((metadata->>'themeCategory'))`);

    // Composite indexes for user-scoped tables
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_user_post_time ON reading_progress (user_id, post_id, last_read_at DESC)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_likes_post_islike ON post_likes (post_id, is_like)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_likes_user_post ON post_likes (user_id, post_id)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_votes_comment_isupvote ON comment_votes (comment_id, is_upvote)`);
    // Theme categories indexes for fast reads
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_theme_categories_key ON theme_categories (key)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_theme_categories_active_sort ON theme_categories (is_active, sort_order)`);

    console.log('🧹 Analyzing tables for query optimization...');
    
    // Analyze tables for better query plans
    await db.execute(sql`ANALYZE posts`);
    await db.execute(sql`ANALYZE comments`);
    await db.execute(sql`ANALYZE users`);
    await db.execute(sql`ANALYZE reading_progress`);
    await db.execute(sql`ANALYZE post_likes`);
    await db.execute(sql`ANALYZE bookmarks`);
    await db.execute(sql`ANALYZE comment_votes`);
    await db.execute(sql`ANALYZE theme_categories`);
);
    
    // Clean up old performance metrics if analytics table exists
    try {
      await db.execute(sql`DELETE FROM analytics WHERE updated_at < NOW() - INTERVAL '30 days'`);
    } catch (e) {
      console.log('📝 Analytics table not found, skipping cleanup');
    }
    
    console.log('✅ Database optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  }
}

optimizeDatabase();