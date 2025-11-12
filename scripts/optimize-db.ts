#!/usr/bin/env tsx

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

console.log('🔧 Starting database optimization...');

async function optimizeDatabase() {
  try {
    console.log('📊 Creating performance indexes...');

    // Create performance indexes (CONCURRENTLY to avoid long locks)
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_theme_created ON posts (theme_category, created_at DESC) WHERE theme_category IS NOT NULL`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_created ON comments (post_id, created_at DESC)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON users (email)`);

    // Additional indexes to address common filters and JSONB lookups
    // Posts: isAdminPost filter is used frequently
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_is_admin_post ON posts ("isAdminPost")`);

    // Posts: GIN index on metadata for JSONB queries (status, isCommunityPost, wordpressId, etc.)
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_metadata_gin ON posts USING gin (metadata jsonb_path_ops)`);

    // Posts: Expression index for wordpressId lookup used in mappings
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_wp_id_expr ON posts ((metadata->>'wordpressId'))`);

    // Reading progress: optimize latest-by-user-post queries
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_user_post_time ON reading_progress (user_id, post_id, last_read_at DESC)`);

    // Post likes: optimize counts and existence checks
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_likes_post_like ON post_likes (post_id, is_like)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_likes_user_post ON post_likes (user_id, post_id)`);

    // Comment votes: optimize vote lookups and counts
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_votes_comment_user ON comment_votes (comment_id, user_id)`);
    await db.execute(sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comment_votes_comment_upvote ON comment_votes (comment_id, is_upvote)`);

    // Full-Text Search index for posts (title + content)
    try {
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_fts
        ON posts
        USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')))
      `);
    } catch (e) {
      console.log('📝 FTS index creation failed or not supported in this context, continuing:', (e as any)?.message || e);
    }

    console.log('🧹 Analyzing tables for query optimization...');

    // Analyze tables for better query plans
    await db.execute(sql`ANALYZE posts`);
    await db.execute(sql`ANALYZE comments`);
    await db.execute(sql`ANALYZE users`);
    await db.execute(sql`ANALYZE post_likes`);
    await db.execute(sql`ANALYZE reading_progress`);
    await db.execute(sql`ANALYZE comment_votes`);

    console.log('🗑️ Cleaning up unused data...');

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