
import { Pool } from '@neondatabase/serverless';
import { db } from '../server/db';
import * as schema from "../shared/schema";
import { eq, sql } from 'drizzle-orm';

async function migrateData() {
  console.log('Starting schema consolidation migration...');

  // 1. Migrate comment replies to unified comments table
  console.log('Migrating comment replies to unified comments table...');
  const commentReplies = await db.query.commentReplies.findMany();
  
  for (const reply of commentReplies) {
    await db.insert(schema.comments).values({
      content: reply.content,
      parentId: reply.commentId,
      userId: reply.userId,
      approved: reply.approved,
      edited: false,
      metadata: reply.metadata,
      createdAt: reply.createdAt
    }).execute();
  }
  
  // 2. Migrate reading/writer streaks to unified user streaks table
  console.log('Migrating streaks to unified user streaks table...');
  
  // Migrate reading streaks
  const readingStreaks = await db.query.readingStreaks.findMany();
  for (const streak of readingStreaks) {
    await db.insert(schema.userStreaks).values({
      userId: streak.userId,
      streakType: 'reading',
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityAt: streak.lastReadAt,
      totalCount: streak.totalReads
    }).execute();
  }
  
  // Migrate writer streaks
  const writerStreaks = await db.query.writerStreaks.findMany();
  for (const streak of writerStreaks) {
    await db.insert(schema.userStreaks).values({
      userId: streak.userId,
      streakType: 'writing',
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityAt: streak.lastWriteAt,
      totalCount: streak.totalPosts
    }).execute();
  }
  
  // 3. Migrate reading/secret progress to unified user progress table
  console.log('Migrating progress to unified user progress table...');
  
  // Migrate reading progress
  const readingProgress = await db.query.readingProgress.findMany();
  for (const progress of readingProgress) {
    await db.insert(schema.userProgress).values({
      postId: progress.postId,
      userId: progress.userId,
      progressType: 'reading',
      progressValue: progress.progress,
      lastActivityAt: progress.lastReadAt,
      metadata: {}
    }).execute();
  }
  
  // Migrate secret progress
  const secretProgress = await db.query.secretProgress.findMany();
  for (const progress of secretProgress) {
    await db.insert(schema.userProgress).values({
      postId: progress.postId,
      userId: progress.userId,
      progressType: 'secret',
      progressValue: 1, // Fully discovered
      lastActivityAt: progress.discoveryDate,
      metadata: { discoveryDate: progress.discoveryDate }
    }).execute();
  }
  
  // 4. Migrate analytics and performance metrics to unified site analytics table
  console.log('Migrating analytics data to unified site analytics table...');
  
  // Migrate analytics
  const analyticsData = await db.query.analytics.findMany();
  for (const data of analyticsData) {
    // Create pageviews metric
    await db.insert(schema.siteAnalytics).values({
      metricType: 'page',
      entityId: data.postId,
      entityType: 'post',
      metricName: 'pageViews',
      metricValue: data.pageViews,
      dimensions: { isAggregate: true },
      timestamp: data.updatedAt,
      metadata: { deviceStats: data.deviceStats }
    }).execute();
    
    // Create unique visitors metric
    await db.insert(schema.siteAnalytics).values({
      metricType: 'page',
      entityId: data.postId,
      entityType: 'post',
      metricName: 'uniqueVisitors',
      metricValue: data.uniqueVisitors,
      dimensions: { isAggregate: true },
      timestamp: data.updatedAt,
      metadata: {}
    }).execute();
    
    // Create average read time metric
    await db.insert(schema.siteAnalytics).values({
      metricType: 'engagement',
      entityId: data.postId,
      entityType: 'post',
      metricName: 'averageReadTime',
      metricValue: data.averageReadTime,
      dimensions: { isAggregate: true },
      timestamp: data.updatedAt,
      metadata: {}
    }).execute();
    
    // Create bounce rate metric
    await db.insert(schema.siteAnalytics).values({
      metricType: 'engagement',
      entityId: data.postId,
      entityType: 'post',
      metricName: 'bounceRate',
      metricValue: data.bounceRate,
      dimensions: { isAggregate: true },
      timestamp: data.updatedAt,
      metadata: {}
    }).execute();
  }
  
  // Migrate performance metrics
  const perfMetrics = await db.query.performanceMetrics.findMany();
  for (const metric of perfMetrics) {
    await db.insert(schema.siteAnalytics).values({
      metricType: 'performance',
      entityType: 'page',
      metricName: metric.metricName,
      metricValue: metric.value,
      dimensions: { 
        url: metric.url,
        navigationType: metric.navigationType,
        userAgent: metric.userAgent
      },
      timestamp: metric.timestamp,
      metadata: { identifier: metric.identifier }
    }).execute();
  }
  
  console.log('Migration completed successfully!');
}

migrateData().catch(console.error);
