import { db } from "./db";
import { eq, desc, and, or, sql, like } from "drizzle-orm";
import {
  users, posts, comments, bookmarks, sessions, contactMessages, userFeedback,
  newsletterSubscriptions, readingProgress, resetTokens, secretProgress, authorStats, analytics, userPrivacySettings, siteSettings,
  type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment,
  type Bookmark, type InsertBookmark, type Session, type InsertSession,
  type ContactMessage, type InsertContactMessage, type UserFeedback, type InsertUserFeedback,
  type NewsletterSubscription, type InsertNewsletterSubscription,
  type ReadingProgress, type InsertProgress,
  type ResetToken, type InsertResetToken, type SecretProgress, type InsertSecretProgress,
  type AuthorStats, type Analytics, type PerformanceMetric, type InsertPerformanceMetric
} from "../shared/schema";

import * as bcrypt from 'bcryptjs';

// Export the db instance for use in other files
export { db };

// Storage interface definition with all required methods
export interface IStorage {
  // User management
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Post management
  getPostById(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPosts(options?: any): Promise<{ posts: Post[]; total: number }>;
  createPost(postData: InsertPost): Promise<Post>;
  updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Comment management
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(commentData: InsertComment): Promise<Comment>;
  updateComment(id: number, commentData: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Newsletter management
  subscribeNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined>;
  getNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  updateNewsletterSubscriptionStatus(id: number, status: string): Promise<NewsletterSubscription>;
  
  // Reading progress
  updateReadingProgress(progress: InsertProgress): Promise<ReadingProgress>;
  getReadingProgress(userId: number, postId: number): Promise<ReadingProgress | undefined>;
  
  // Analytics and stats
  getAuthorStats(authorId: number): Promise<AuthorStats | undefined>;
  updateAuthorStats(authorId: number, stats: Partial<AuthorStats>): Promise<void>;
  getSiteAnalytics(): Promise<any>;
  recordAnalytics(postId: number, data: Partial<Analytics>): Promise<void>;
  getPostAnalytics(postId: number): Promise<Analytics | undefined>;
  
  // Performance metrics
  storePerformanceMetric(metric: InsertPerformanceMetric): Promise<void>;
  getAnalyticsSummary(): Promise<any>;
  
  // Admin methods
  getAdminStats(): Promise<any>;
  getAdminInfo(): Promise<any>;
  getSiteSettingByKey(key: string): Promise<any>;
  setSiteSetting(key: string, value: string, category?: string, description?: string): Promise<void>;
  getAllSiteSettings(): Promise<any[]>;
  getPostCount(): Promise<number>;
  getRecentActivity(limit: number): Promise<any[]>;
  logActivity(activity: any): Promise<void>;
  getUnreadAdminNotifications(): Promise<any[]>;
  markNotificationAsRead(id: number): Promise<void>;
  getRecentActivityLogs(limit: number): Promise<any[]>;
  
  // Analytics methods
  getDeviceDistribution(): Promise<any>;
  getPerformanceMetricsByType(type: string): Promise<any[]>;
  getUniqueUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  getReturningUserCount(): Promise<number>;
  
  // Content methods
  getRecentPosts(): Promise<any[]>;
  getRecommendedPosts(postId: number, limit: number): Promise<any[]>;
  
  // Feedback methods
  submitFeedback(feedback: any): Promise<any>;
  updateFeedbackStatus(id: number, status: string): Promise<any>;
  getAllFeedback(limit?: number, status?: string): Promise<any[]>;
  
  // Other methods
  getContactMessages(): Promise<any[]>;
  getUserPrivacySettings(userId: number): Promise<any>;
  getPersonalizedRecommendations(userId: number, options?: any): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  // Alias for interface compatibility
  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { password?: string }): Promise<User> {
    // Handle both password (from registration) and password_hash (already hashed)
    let passwordHash: string;
    if ('password' in insertUser && insertUser.password) {
      passwordHash = await bcrypt.hash(insertUser.password, 10);
    } else if (insertUser.password_hash) {
      passwordHash = insertUser.password_hash;
    } else {
      throw new Error('Password or password_hash is required');
    }
    
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        email: insertUser.email,
        password_hash: passwordHash,
        isAdmin: insertUser.isAdmin || false,
        firebaseUid: insertUser.firebaseUid,
        avatar: insertUser.avatar,
        fullName: insertUser.fullName,
        isVerified: insertUser.isVerified || false,
        metadata: insertUser.metadata || {}
      })
      .returning();
    
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }

  async updateUserPassword(id: number, newPasswordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ password_hash: newPasswordHash })
      .where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getPosts(filters?: { 
    authorId?: number; 
    isSecret?: boolean; 
    isAdminPost?: boolean; 
    themeCategory?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: Post[]; total: number }> {
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;
    
    let query = db.select().from(posts);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(posts);
    
    const conditions = [];
    
    if (filters?.authorId) {
      conditions.push(eq(posts.authorId, filters.authorId));
    }
    
    if (filters?.isSecret !== undefined) {
      conditions.push(eq(posts.isSecret, filters.isSecret));
    }
    
    if (filters?.isAdminPost !== undefined) {
      conditions.push(eq(posts.isAdminPost, filters.isAdminPost));
    }
    
    if (filters?.themeCategory) {
      conditions.push(eq(posts.themeCategory, filters.themeCategory));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(posts.title, `%${filters.search}%`),
          like(posts.content, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
      countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    
    const [results, countResult] = await Promise.all([
      query
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset),
      countQuery
    ]);
    
    const total = countResult[0]?.count || 0;
    
    return { posts: results, total };
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  // Alias for interface compatibility
  async getPostById(id: number): Promise<Post | undefined> {
    return this.getPost(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post || undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    
    return post;
  }

  async updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined> {
    const [updatedPost] = await db
      .update(posts)
      .set(postData)
      .where(eq(posts.id, id))
      .returning();
    
    return updatedPost || undefined;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  // Alias for interface compatibility
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return this.getComments(postId);
  }

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({
        ...insertComment,
        // Remove reference to non-existent approved field
        // is_approved field is handled by the schema defaults
      })
      .returning();
    
    return comment;
  }

  async updateComment(id: number, commentData: Partial<InsertComment>): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set(commentData)
      .where(eq(comments.id, id))
      .returning();
    
    return updatedComment || undefined;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    
    return session;
  }

  async getSession(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));
    
    return session || undefined;
  }

  async deleteSession(token: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.token, token));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(sql`expires_at < NOW()`);
  }

  async createResetToken(insertToken: InsertResetToken): Promise<ResetToken> {
    const [token] = await db
      .insert(resetTokens)
      .values(insertToken)
      .returning();
    
    return token;
  }

  async getResetToken(token: string): Promise<ResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(resetTokens)
      .where(and(
        eq(resetTokens.token, token),
        eq(resetTokens.used, false),
        sql`expires_at > NOW()`
      ));
    
    return resetToken || undefined;
  }

  async useResetToken(token: string): Promise<boolean> {
    const result = await db
      .update(resetTokens)
      .set({ used: true })
      .where(eq(resetTokens.token, token));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const [bookmark] = await db
      .insert(bookmarks)
      .values(insertBookmark)
      .returning();
    
    return bookmark;
  }

  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async deleteBookmark(userId: number, postId: number): Promise<void> {
    await db
      .delete(bookmarks)
      .where(and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.postId, postId)
      ));
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(insertMessage)
      .returning();
    
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  async subscribeNewsletter(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values(insertSubscription)
      .returning();
    
    return subscription;
  }

  async unsubscribeNewsletter(email: string): Promise<boolean> {
    const result = await db
      .update(newsletterSubscriptions)
      .set({ status: 'unsubscribed' })
      .where(eq(newsletterSubscriptions.email, email));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    
    return subscription || undefined;
  }

  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db
      .select()
      .from(newsletterSubscriptions)
      .orderBy(desc(newsletterSubscriptions.createdAt));
  }

  async updateNewsletterSubscriptionStatus(id: number, status: string): Promise<NewsletterSubscription> {
    const [subscription] = await db
      .update(newsletterSubscriptions)
      .set({ status })
      .where(eq(newsletterSubscriptions.id, id))
      .returning();
    
    return subscription;
  }

  async updateReadingProgress(insertProgress: InsertProgress): Promise<ReadingProgress> {
    // Use upsert (INSERT ... ON CONFLICT)
    const [progress] = await db
      .insert(readingProgress)
      .values(insertProgress)
      .onConflictDoUpdate({
        target: [readingProgress.userId, readingProgress.postId],
        set: {
          progress: insertProgress.progress,
          lastReadAt: sql`NOW()`
        }
      })
      .returning();
    
    return progress;
  }

  async getReadingProgress(userId: number, postId: number): Promise<ReadingProgress | undefined> {
    const [progress] = await db
      .select()
      .from(readingProgress)
      .where(and(
        eq(readingProgress.userId, userId),
        eq(readingProgress.postId, postId)
      ));
    
    return progress || undefined;
  }

  async recordSecretDiscovery(insertDiscovery: InsertSecretProgress): Promise<SecretProgress> {
    const [discovery] = await db
      .insert(secretProgress)
      .values(insertDiscovery)
      .returning();
    
    return discovery;
  }

  async getSecretProgress(userId: number): Promise<SecretProgress[]> {
    return await db
      .select()
      .from(secretProgress)
      .where(eq(secretProgress.userId, userId))
      .orderBy(desc(secretProgress.discoveryDate));
  }

  async getAuthorStats(authorId: number): Promise<AuthorStats | undefined> {
    const [stats] = await db
      .select()
      .from(authorStats)
      .where(eq(authorStats.authorId, authorId));
    
    return stats || undefined;
  }

  async updateAuthorStats(authorId: number, updates: Partial<AuthorStats>): Promise<void> {
    await db
      .update(authorStats)
      .set(updates)
      .where(eq(authorStats.authorId, authorId));
  }

  async recordAnalytics(postId: number, data: Partial<Analytics>): Promise<void> {
    await db
      .insert(analytics)
      .values({
        postId,
        pageViews: data.pageViews || 0,
        uniqueVisitors: data.uniqueVisitors || 0,
        averageReadTime: data.averageReadTime || 0,
        bounceRate: data.bounceRate || 0,
        deviceStats: data.deviceStats || {}
      })
      .onConflictDoUpdate({
        target: [analytics.postId],
        set: {
          pageViews: sql`${analytics.pageViews} + ${data.pageViews || 0}`,
          uniqueVisitors: sql`${analytics.uniqueVisitors} + ${data.uniqueVisitors || 0}`,
          averageReadTime: data.averageReadTime || analytics.averageReadTime,
          bounceRate: data.bounceRate || analytics.bounceRate,
          deviceStats: data.deviceStats || analytics.deviceStats,
          updatedAt: sql`NOW()`
        }
      });
  }

  async getPostAnalytics(postId: number): Promise<Analytics | undefined> {
    const [analytics_result] = await db
      .select()
      .from(analytics)
      .where(eq(analytics.postId, postId));
    
    return analytics_result || undefined;
  }

  async getSiteAnalytics(): Promise<any> {
    // Return aggregated site analytics
    const totalPosts = await db.select({ count: sql<number>`count(*)` }).from(posts);
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalComments = await db.select({ count: sql<number>`count(*)` }).from(comments);
    
    return {
      totalPosts: totalPosts[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      totalComments: totalComments[0]?.count || 0
    };
  }

  async createUserFeedback(insertFeedback: InsertUserFeedback): Promise<UserFeedback> {
    const [feedback] = await db
      .insert(userFeedback)
      .values(insertFeedback)
      .returning();
    
    return feedback;
  }

  async getUserFeedback(): Promise<UserFeedback[]> {
    return await db
      .select()
      .from(userFeedback)
      .orderBy(desc(userFeedback.createdAt));
  }

  async getUserPrivacySettings(userId: number): Promise<any> {
    const [settings] = await db
      .select()
      .from(userPrivacySettings)
      .where(eq(userPrivacySettings.userId, userId));
    
    return settings || null;
  }

  async getPersonalizedRecommendations(userId: number, options?: any): Promise<any[]> {
    // Simple implementation - return recent posts by other users
    const limit = options?.limit || 10;
    
    const recommendations = await db
      .select()
      .from(posts)
      .where(and(
        eq(posts.isSecret, false),
        sql`${posts.authorId} != ${userId}`
      ))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
    
    return recommendations;
  }

  async storePerformanceMetric(metric: InsertPerformanceMetric): Promise<void> {
    try {
      await db.insert(performanceMetrics).values(metric).onConflictDoNothing();
    } catch (error) {
      console.error('Error storing performance metric:', error);
    }
  }

  async getAnalyticsSummary(): Promise<any> {
    return new Promise((resolve) => {
      db.select({ count: sql<number>`count(*)` }).from(users)
        .then(totalUsersResult => {
          db.select({ count: sql<number>`count(*)` }).from(posts)
            .then(totalPostsResult => {
              db.select({ count: sql<number>`count(*)` }).from(comments)
                .then(totalCommentsResult => {
                  resolve({
                    totalUsers: totalUsersResult[0]?.count || 0,
                    totalPosts: totalPostsResult[0]?.count || 0,
                    totalComments: totalCommentsResult[0]?.count || 0,
                    timestamp: new Date().toISOString()
                  });
                })
                .catch(error => {
                  console.error('Error getting total comments:', error);
                  resolve({
                    totalUsers: totalUsersResult[0]?.count || 0,
                    totalPosts: totalPostsResult[0]?.count || 0,
                    totalComments: 0,
                    timestamp: new Date().toISOString()
                  });
                });
            })
            .catch(error => {
              console.error('Error getting total posts:', error);
              resolve({
                totalUsers: totalUsersResult[0]?.count || 0,
                totalPosts: 0,
                totalComments: 0,
                timestamp: new Date().toISOString()
              });
            });
        })
        .catch(error => {
          console.error('Error getting total users:', error);
          resolve({
            totalUsers: 0,
            totalPosts: 0,
            totalComments: 0,
            timestamp: new Date().toISOString()
          });
        });
    });
  }

  async getAdminStats(): Promise<any> {
    // Placeholder for admin stats logic
    return { totalUsers: 0, totalPosts: 0, totalComments: 0 };
  }

  async getAdminInfo(): Promise<any> {
    // Placeholder for admin info logic
    return { siteName: 'My Blog', description: 'A simple blog application' };
  }

  async getSiteSettingByKey(key: string): Promise<any> {
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key));
    
    return setting || null;
  }

  async setSiteSetting(key: string, value: string, category?: string, description?: string): Promise<void> {
    await db
      .insert(siteSettings)
      .values({ 
        key, 
        value, 
        category: category || 'general',
        description: description || null
      })
      .onConflictDoUpdate({
        target: [siteSettings.key],
        set: { 
          value, 
          category: category || 'general',
          description: description || null
        }
      });
  }

  async getAllSiteSettings(): Promise<any[]> {
    return await db
      .select()
      .from(siteSettings);
  }

  async getPostCount(): Promise<number> {
    const [count] = await db.select({ count: sql<number>`count(*)` }).from(posts);
    return count?.count || 0;
  }

  async getRecentActivity(limit: number): Promise<any[]> {
    return await db
      .select()
      .from(userFeedback)
      .orderBy(desc(userFeedback.createdAt))
      .limit(limit);
  }

  async logActivity(activity: any): Promise<void> {
    await db
      .insert(userFeedback)
      .values({
        type: activity.type || 'activity',
        content: activity.content || JSON.stringify(activity),
        status: 'pending',
        category: activity.category || 'system',
        metadata: activity.metadata || {}
      });
  }

  async getUnreadAdminNotifications(): Promise<any[]> {
    return await db
      .select()
      .from(userFeedback)
      .where(and(
        eq(userFeedback.category, 'admin'),
        eq(userFeedback.status, 'pending')
      ))
      .orderBy(desc(userFeedback.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(userFeedback)
      .set({ status: 'reviewed' })
      .where(eq(userFeedback.id, id));
  }

  async getRecentActivityLogs(limit: number): Promise<any[]> {
    return await db
      .select()
      .from(userFeedback)
      .orderBy(desc(userFeedback.createdAt))
      .limit(limit);
  }

  async getDeviceDistribution(): Promise<any> {
    // Placeholder for device distribution logic
    return [];
  }

  async getPerformanceMetricsByType(_type: string): Promise<any[]> {
    // Placeholder for performance metrics by type logic
    return [];
  }

  async getUniqueUserCount(): Promise<number> {
    const [count] = await db.select({ count: sql<number>`count(DISTINCT "user_id")` }).from(userFeedback);
    return count?.count || 0;
  }

  async getActiveUserCount(): Promise<number> {
    // Placeholder for active user count logic
    return 0;
  }

  async getReturningUserCount(): Promise<number> {
    // Placeholder for returning user count logic
    return 0;
  }

  async getRecentPosts(): Promise<any[]> {
    return await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(10);
  }

  async getRecommendedPosts(_postId: number, _limit: number): Promise<any[]> {
    // Placeholder for recommended posts logic
    return [];
  }

  async submitFeedback(feedback: any): Promise<any> {
    const [f] = await db
      .insert(userFeedback)
      .values(feedback)
      .returning();
    
    return f;
  }

  async updateFeedbackStatus(id: number, status: string): Promise<any> {
    const [f] = await db
      .update(userFeedback)
      .set({ status })
      .where(eq(userFeedback.id, id))
      .returning();
    
    return f;
  }

  async getAllFeedback(limit?: number, status?: string): Promise<any[]> {
    let query = db.select().from(userFeedback);
    
    if (status) {
      query = query.where(eq(userFeedback.status, status)) as any;
    }
    
    query = query.orderBy(desc(userFeedback.createdAt)) as any;
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }
}

export const storage = new DatabaseStorage();