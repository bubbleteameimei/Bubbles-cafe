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
    
    console.log('🧹 Analyzing tables for query optimization...');
    
    // Analyze tables for better query plans
    await db.execute(sql`ANALYZE posts`);
    await db.execute(sql`ANALYZE comments`);
    await db.execute(sql`ANALYZE users`);
    
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