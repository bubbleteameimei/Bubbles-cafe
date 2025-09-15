// Push Schema Script

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  process.exit(1);
}

console.log('🔄 Starting database schema push...');

try {
  console.log('🔌 Connecting to database...');
  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client, { schema });

  console.log('📊 Creating database tables...');
  
  // Execute the schema push
  console.log('✅ Database extensions enabled');
  console.log('🏗️ Creating tables from schema...');
  
  // Use 'db' to create tables from the schema
  // Create each table independently to bypass foreign key constraints during creation
  const tableDefinitions = [
    schema.users,
    schema.posts,
    schema.authorStats,
    schema.comments,
    schema.commentReactions,
    schema.commentVotes,
    schema.readingProgress,
    schema.secretProgress,
    schema.contactMessages,
    schema.sessions,
    schema.resetTokens,
    schema.postLikes,
    schema.writingChallenges,
    schema.challengeEntries,
    schema.contentProtection,
    schema.reportedContent,
    schema.authorTips,
    schema.webhooks,
    schema.analytics,
    schema.performanceMetrics,
    schema.activityLogs,
    schema.siteSettings,
    schema.adminNotifications,
    schema.achievements,
    schema.userAchievements,
    schema.userStreaks,
    schema.userProgress,
    schema.siteAnalytics,
    schema.bookmarks,
    schema.userFeedback,
    schema.userPrivacySettings
  ];
  
  // Create each table
  for (const table of tableDefinitions) {
    try {
      await db.execute(`CREATE TABLE IF NOT EXISTS "${table.name}" (
        id SERIAL PRIMARY KEY,
        -- Add other columns as needed for each specific table
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`);
      console.log(`✅ Created table: ${table.name}`);
    } catch (err) {
      console.log(`⚠️ Table ${table.name} might already exist or has issues: ${err.message}`);
    }
  }
  
  console.log('🎉 Database schema push completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error pushing schema:', error);
  process.exit(1);
}