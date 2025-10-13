
import { db } from '../server/db';
import * as schema from "../shared/schema";
import { sql } from 'drizzle-orm';

async function migrateData() {
  console.log('Starting schema consolidation migration...');

  // 1. Migrate comment replies to unified comments table
  console.log('Migrating comment replies to unified comments table...');
  const commentReplies = await db.query.commentReplies.findMany();
  
  for (const reply of commentReplies) {
    await db.insert(schema.comments).values({
      content: reply.content,
      parentId: reply.parentId,
      userId: reply.userId,
      edited: false,
      metadata: reply.metadata,
      createdAt: reply.createdAt
    }).execute();
  }
  
  // 2. Migrate reading/secret progress to unified user progress table
  console.log('Migrating progress to unified user progress table...');
  
  // Migrate reading progress
  const readingProgress = await db.query.readingProgress.findMany();
  for (const progress of readingProgress) {
    await db.insert(schema.userProgress).values({
      postId: progress.postId,
      userId: progress.userId,
      progressType: 'reading',
      progress: progress.progress,
      lastActivityAt: progress.lastReadAt
    }).execute();
  }
  
  // Migrate secret progress
  const secretProgress = await db.query.secretProgress.findMany();
  for (const progress of secretProgress) {
    await db.insert(schema.userProgress).values({
      postId: progress.postId,
      userId: progress.userId,
      progressType: 'secret',
      progress: '1',
      lastActivityAt: progress.discoveryDate
    }).execute();
  }
  
  // 3. Migrate analytics and performance metrics to unified site analytics table
  console.log('Migrating analytics data to unified site analytics table...');
  
  // Migrate analytics
  const analyticsData = await db.query.analytics.findMany();
  for (const data of analyticsData) {
    // Create pageviews metric
    await db.insert(schema.siteAnalytics).values({
      identifier: `post:${data.postId}`,
      pageViews: data.pageViews,
      uniqueVisitors: data.uniqueVisitors,
      averageReadTime: data.averageReadTime,
      bounceRate: data.bounceRate,
      deviceStats: data.deviceStats,
      timestamp: data.updatedAt
    }).execute();
  }
  
  // Migrate performance metrics
  const perfMetrics = await db.query.performanceMetrics.findMany();
  for (const metric of perfMetrics) {
    await db.insert(schema.siteAnalytics).values({
      identifier: metric.identifier,
      pageViews: 0,
      uniqueVisitors: 0,
      averageReadTime: 0,
      bounceRate: 0,
      deviceStats: {},
      timestamp: metric.timestamp
    }).execute();
  }
  
  console.log('Migration completed successfully!');
}

migrateData().catch(err => {
  console.error('Migration failed:', err);
});
