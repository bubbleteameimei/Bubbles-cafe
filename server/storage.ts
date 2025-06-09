import { 
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type ReadingProgress, type InsertProgress,
  type SecretProgress, type InsertSecretProgress,
  type User, type InsertUser,
  type ContactMessage, type InsertContactMessage,
  type Session, type InsertSession,
  type PostLike,
  type CommentVote,
  type ResetToken, type InsertResetToken,
  type CommentReply,
  type InsertCommentReply,
  type AuthorStats,
  type WritingChallenge, type InsertWritingChallenge,
  type ChallengeEntry, type InsertChallengeEntry,
  type ContentProtection, type InsertContentProtection,
  type ReportedContent, type InsertReportedContent,
  type AuthorTip, type InsertAuthorTip,
  type Webhook, type InsertWebhook,
  type Analytics,
  type SiteSetting, type InsertSiteSetting,
  type ActivityLog, type InsertActivityLog,
  type AdminNotification, type InsertAdminNotification,
  type Bookmark, type InsertBookmark,
  type UserFeedback, type InsertUserFeedback,
  type UserPrivacySettings, type InsertUserPrivacySettings,
  type NewsletterSubscription, type InsertNewsletterSubscription,
  // Tables
  posts as postsTable,
  comments,
  readingProgress,
  secretProgress,
  users,
  contactMessages,
  newsletterSubscriptions,
  sessions,
  postLikes,
  commentVotes,
  commentReplies,
  authorStats,
  writingChallenges,
  challengeEntries,
  contentProtection,
  reportedContent,
  authorTips,
  webhooks,
  analytics,
  siteSettings,
  activityLogs,
  adminNotifications,
  bookmarks,
  userFeedback,
  resetTokens,
  userPrivacySettings,
  type PerformanceMetric, type InsertPerformanceMetric,
  performanceMetrics
} from "@shared/schema";

// Removed: type FeaturedAuthor, type ReadingStreak, type WriterStreak, featuredAuthors, readingStreaks, writerStreaks

import type { CommentMetadata } from "@shared/schema";
import { db } from "./db";
import pkg from 'pg';
const { Pool } = pkg;

// Database operation utility function with retry logic
async function safeDbOperation<T>(
  operation: () => Promise<T>, 
  fallback: T, 
  operationName: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.warn(`${operationName} attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
    }
  }
  console.error(`${operationName} failed after ${maxRetries} attempts, using fallback`);
  return fallback;
}

// Create a direct pool for use with session store and SQL queries with enhanced connection options
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Attempt to connect for up to 10 seconds
  maxUses: 7500, // Close and replace a connection after it has been used 7500 times (prevents memory issues)
  allowExitOnIdle: false, // Don't exit when the pool is empty - better for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});
import { eq, desc, asc, and, or, not, like, lt, gt, gte, sql, avg, count, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from 'bcryptjs';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // System
  getDb(): any;
  getUsersTable(): any;
  getDrizzleOperators(): any;
  clearCache(key: string): Promise<boolean>;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAdminByEmail(email: string): Promise<User[]>;
  getUsersCount(): Promise<number>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  getUserComments(userId: number): Promise<Comment[]>;
  getUserReadingHistory(userId: number): Promise<ReadingProgress[]>;
  getUserActivity(userId: number): Promise<ActivityLog[]>;
  
  // Password Reset
  createResetToken(tokenData: InsertResetToken): Promise<ResetToken>;
  getResetTokenByToken(token: string): Promise<ResetToken | undefined>;
  markResetTokenAsUsed(token: string): Promise<void>;

  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
  updateSessionAccess(token: string): Promise<void>;

  // Posts
  getPosts(page?: number, limit?: number): Promise<{ posts: Post[], hasMore: boolean }>;
  getPost(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<Post>;
  getSecretPosts(): Promise<Post[]>;
  unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post>;
  getPostWithComments(slug: string): Promise<Post & { comments: Comment[] }>;
  getPostsByAuthor(authorId: number, limit?: number): Promise<Post[]>;
  getPendingPosts(): Promise<Post[]>;
  approvePost(postId: number): Promise<Post>;

  // Comments
  getComments(postId: number): Promise<Comment[]>;
  getRecentComments(): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<Comment>): Promise<Comment>;
  deleteComment(id: number): Promise<Comment>;
  getPendingComments(): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;

  // Reading Progress
  getProgress(postId: number): Promise<ReadingProgress | undefined>;
  updateProgress(progress: InsertProgress): Promise<ReadingProgress>;
  
  // Recommendation methods
  getPersonalizedRecommendations(userId: number, preferredThemes?: string[], limit?: number): Promise<Post[]>;

  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Newsletter subscriptions
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined>;
  updateNewsletterSubscriptionStatus(email: string, status: string): Promise<NewsletterSubscription>;
  getNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;

  // Post Likes
  getPostLike(postId: number, userId: number): Promise<PostLike | undefined>;
  removePostLike(postId: number, userId: number): Promise<void>;
  updatePostLike(postId: number, userId: number, isLike: boolean): Promise<void>;
  createPostLike(postId: number, userId: number, isLike: boolean): Promise<void>;
  getPostLikeCounts(postId: number): Promise<{ likesCount: number; dislikesCount: number }>;
  
  // Session-based reaction (for anonymous users)
  updatePostReaction(postId: number, data: { isLike: boolean; sessionId?: string }): Promise<boolean>;
  getPostReactions(postId: number): Promise<{ likes: number; dislikes: number }>;
  getPostLikeCounts(postId: number): Promise<{ likesCount: number; dislikesCount: number }>;

  // Comment votes
  getCommentVote(commentId: number, userId: string): Promise<CommentVote | undefined>;
  removeCommentVote(commentId: number, userId: string): Promise<void>;
  updateCommentVote(commentId: number, userId: string, isUpvote: boolean): Promise<void>;
  createCommentVote(commentId: number, userId: string, isUpvote: boolean): Promise<void>;
  getCommentVoteCounts(commentId: number): Promise<{ upvotes: number; downvotes: number }>;

  // Comment replies
  createCommentReply(reply: InsertCommentReply): Promise<CommentReply>;

  // Author Stats
  getAuthorStats(authorId: number): Promise<AuthorStats | undefined>;
  updateAuthorStats(authorId: number): Promise<AuthorStats>;
  getTopAuthors(limit?: number): Promise<AuthorStats[]>;

  // Writing Challenges
  createWritingChallenge(challenge: InsertWritingChallenge): Promise<WritingChallenge>;
  getActiveWritingChallenges(): Promise<WritingChallenge[]>;
  submitChallengeEntry(entry: InsertChallengeEntry): Promise<ChallengeEntry>;
  getChallengeEntries(challengeId: number): Promise<ChallengeEntry[]>;

  // Content Protection
  addContentProtection(protection: InsertContentProtection): Promise<ContentProtection>;
  checkContentSimilarity(content: string): Promise<boolean>;
  reportContent(report: InsertReportedContent): Promise<ReportedContent>;
  getReportedContent(status?: string): Promise<ReportedContent[]>;
  updateReportedContent(id: number, status: string): Promise<ReportedContent>;

  // Tips System
  createTip(tip: InsertAuthorTip): Promise<AuthorTip>;
  getAuthorTips(authorId: number): Promise<AuthorTip[]>;
  getTotalTipsReceived(authorId: number): Promise<number>;


  // Webhooks
  registerWebhook(webhook: InsertWebhook): Promise<Webhook>;
  getActiveWebhooks(): Promise<Webhook[]>;
  updateWebhookStatus(id: number, active: boolean): Promise<void>;

  // Analytics
  updateAnalytics(postId: number, data: Partial<Analytics>): Promise<Analytics>;
  
  // Admin Stats
  getPostCount(): Promise<number>;
  getUserCount(): Promise<number>;
  getCommentCount(): Promise<number>;
  getBookmarkCount(): Promise<number>;
  getRecentActivity(limit: number): Promise<ActivityLog[]>;
  getPostAnalytics(postId: number): Promise<Analytics | undefined>;
  getSiteAnalytics(): Promise<{ 
    totalViews: number; 
    uniqueVisitors: number; 
    avgReadTime: number;
    bounceRate: number;
    trendingPosts: any[];
    activeUsers: number;
    newUsers: number;
    adminCount: number;
  }>;
  

  // Analytics methods
  getAnalyticsSummary(): Promise<{ 
    totalViews: number; 
    uniqueVisitors: number; 
    avgReadTime: number; 
    bounceRate: number; 
  }>;
  getDeviceDistribution(): Promise<{
    desktop: number;
    mobile: number;
    tablet: number;
  }>;
  sessionStore: session.Store;

  // Achievement methods removed
  getUserPosts(userId: number): Promise<Post[]>;
  getUserTotalLikes(userId: number): Promise<number>;
  getPostById(id: number): Promise<Post | undefined>;

  // Add performance metrics method
  storePerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  getPerformanceMetricsByType(metricType: string): Promise<PerformanceMetric[]>;
  getUniqueUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  getReturningUserCount(): Promise<number>;
  getAdminInfo(): Promise<{
    totalPosts: number;
    totalUsers: number;
    totalComments: number;
    totalLikes: number;
    recentActivity: ActivityLog[];
  }>;
  
  // Bookmark methods
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  getBookmark(userId: number, postId: number): Promise<Bookmark | undefined>;
  getUserBookmarks(userId: number): Promise<(Bookmark & { post: Post })[]>;
  updateBookmark(userId: number, postId: number, data: Partial<InsertBookmark>): Promise<Bookmark>;
  deleteBookmark(userId: number, postId: number): Promise<void>;
  getBookmarksByTag(userId: number, tag: string): Promise<(Bookmark & { post: Post })[]>;
  
  // User Feedback methods
  submitFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getFeedback(id: number): Promise<UserFeedback | undefined>;
  getAllFeedback(limit?: number, status?: string): Promise<UserFeedback[]>;
  updateFeedbackStatus(id: number, status: string): Promise<UserFeedback>;
  getUserFeedback(userId: number): Promise<UserFeedback[]>;
  
  // User Privacy Settings methods
  getUserPrivacySettings(userId: number): Promise<UserPrivacySettings | undefined>;
  createUserPrivacySettings(userId: number, settings: InsertUserPrivacySettings): Promise<UserPrivacySettings>;
  updateUserPrivacySettings(userId: number, settings: Partial<InsertUserPrivacySettings>): Promise<UserPrivacySettings>;
  

}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  // Helper method to determine if the database is available
  isDbConnected(): boolean {
    try {
      return !!db && process.env.DATABASE_URL !== undefined;
    } catch (error) {
      return false;
    }
  }
  
  // Helper method for safely executing database operations with fallback options and retries
  async safeDbOperation<T>(
    operation: () => Promise<T>, 
    fallback: T, 
    operationName: string,
    maxRetries: number = 3
  ): Promise<T> {
    // Use the enhanced safeDbOperation from db.ts with retry functionality
    return safeDbOperation(
      operation,
      fallback,
      `[Storage] ${operationName}`,
      maxRetries
    );
  }

  // System methods for accessing DB objects directly
  getDb() {
    return db;
  }

  getUsersTable() {
    return users;
  }

  getDrizzleOperators() {
    return { eq, sql, and, or, not, like, desc, asc };
  }
  
  // Cache management
  async clearCache(key: string): Promise<boolean> {
    try {
      console.log(`[Storage] Clearing cache for key: ${key}`);
      // In a real implementation, this would clear Redis or other cache
      // For now, we just return success since we don't have an actual cache layer
      return true;
    } catch (error) {
      console.error(`[Storage] Error clearing cache for key ${key}:`, error);
      return false;
    }
  }

  constructor() {
    console.log('[Storage] Initializing PostgreSQL session store...');

    try {
      // Create a compatible pool object for connect-pg-simple with enhanced error handling
      // The issue is that connect-pg-simple expects a pg pool with query method
      // but Neon serverless uses a different interface
      const compatiblePool = {
        query: async (text: string, params?: any[]) => {
          let retries = 0;
          const maxRetries = 3;
          const backoffDelay = (attempt: number) => Math.min(100 * Math.pow(2, attempt), 3000);
          
          const executeQuery = async () => {
            let client = null;
            try {
              client = await pool.connect();
              return await client.query(text, params);
            } catch (error: any) {
              // Check if error is due to connection issues and can be retried
              const isConnectionError = error && typeof error.message === 'string' && (
                error.message.includes('Connection terminated') || 
                error.message.includes('terminating connection') ||
                error.message.includes('connection reset') ||
                error.message.includes('server closed') ||
                error.message.includes('endpoint is disabled')
              );
                
              if (isConnectionError && retries < maxRetries) {
                retries++;
                console.warn(`[Storage] Session store query attempt ${retries} failed, retrying in ${backoffDelay(retries)}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay(retries)));
                return executeQuery(); // Recursive retry with exponential backoff
              }
              
              // Can't recover, rethrow
              throw error;
            } finally {
              if (client) {
                client.release();
              }
            }
          };
          
          return executeQuery();
        }
      };

      // Initialize session store with compatible pool and enhanced options
      // Cast to any to avoid TypeScript errors with the PgPool interface
      this.sessionStore = new PostgresSessionStore({
        pool: compatiblePool as any,
        createTableIfMissing: true,
        tableName: 'session',
        schemaName: 'public',
        ttl: 86400, // 1 day
        pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
        errorLog: (err: Error) => console.error('[SessionStore] Error:', err)
      });
      
      console.log('[Storage] Session store initialized successfully');
      
      // Register error handler for session store
      this.sessionStore.on('error', (error: Error) => {
        console.error('[SessionStore] Runtime error:', error);
      });
      
    } catch (error) {
      console.error('[Storage] Failed to initialize session store:', error);
      // Provide a memory fallback for the session store to prevent app crashes
      console.warn('[Storage] Falling back to memory session store');
      const MemoryStore = session.MemoryStore;
      this.sessionStore = new MemoryStore();
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Use explicit column selection to avoid errors with columns that might not exist
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password_hash: users.password_hash,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
      
      // Add an empty metadata field since it doesn't exist in the DB yet
      return {
        ...user,
        metadata: {}
      };
    } catch (error) {
      console.error("Error in getUser:", error);
      // Try a more basic approach as fallback using raw SQL
      try {
        const result = await pool.query(
          "SELECT id, username, email, password_hash, is_admin as \"isAdmin\", created_at as \"createdAt\" FROM users WHERE id = $1 LIMIT 1",
          [id]
        );
        return result.rows[0] || undefined;
      } catch (fallbackError) {
        console.error("Fallback error in getUser:", fallbackError);
        throw fallbackError;
      }
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.safeDbOperation(
      async () => {
        try {
          // Use explicit column selection to avoid errors with columns that might not exist
          const [user] = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            password_hash: users.password_hash,
            isAdmin: users.isAdmin,
            createdAt: users.createdAt
          })
          .from(users)
          .where(eq(users.username, username))
          .limit(1);
          
          if (!user) return undefined;

          // Add an empty metadata field since it doesn't exist in the DB yet
          return {
            ...user,
            metadata: {}
          };
        } catch (error) {
          console.error("Error in getUserByUsername:", error);
          // Try a more basic approach as fallback using raw SQL
          const result = await pool.query(
            "SELECT id, username, email, password_hash, is_admin as \"isAdmin\", created_at as \"createdAt\" FROM users WHERE username = $1 LIMIT 1",
            [username]
          );
          return result.rows[0] || undefined;
        }
      },
      undefined,
      'getUserByUsername'
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.safeDbOperation(
      async () => {
        // Normalize the email address to ensure case-insensitive matching
        const normalizedEmail = email.trim().toLowerCase();
        console.log('[Storage] Looking up user by email:', normalizedEmail);
        
        try {
          // Now include metadata column since it exists in the database
          // Use LOWER() for case-insensitive comparison
          const [user] = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            password_hash: users.password_hash,
            isAdmin: users.isAdmin,
            metadata: users.metadata,
            createdAt: users.createdAt
          })
          .from(users)
          .where(sql`LOWER(${users.email}) = ${normalizedEmail}`)
          .limit(1);
          
          if (user) {
            console.log('[Storage] User found by email:', normalizedEmail);
          } else {
            console.log('[Storage] No user found with email:', normalizedEmail);
          }
          
          return user;
        } catch (error) {
          console.error("Error in getUserByEmail:", error);
          // Try a more basic approach as fallback using raw SQL with case-insensitive comparison
          const result = await pool.query(
            "SELECT id, username, email, password_hash, is_admin as \"isAdmin\", metadata, created_at as \"createdAt\" FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
            [email.trim()]
          );
          
          if (result.rows.length > 0) {
            console.log('[Storage] User found by email (fallback method):', email);
          }
          
          return result.rows[0] || undefined;
        }
      },
      undefined,
      'getUserByEmail'
    );
  }

  async getAdminByEmail(email: string): Promise<User[]> {
    try {
      // Normalize the email address for case-insensitive matching
      const normalizedEmail = email.trim().toLowerCase();
      console.log('[Storage] Looking up admin by email:', normalizedEmail);
      
      // Now include metadata column since it exists in the database
      const adminUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password_hash: users.password_hash,
        isAdmin: users.isAdmin,
        metadata: users.metadata,
        createdAt: users.createdAt
      })
      .from(users)
      .where(and(
        sql`LOWER(${users.email}) = ${normalizedEmail}`,
        eq(users.isAdmin, true)
      ));
      
      console.log('[Storage] Found', adminUsers.length, 'admin users with email:', normalizedEmail);
      return adminUsers;
    } catch (error) {
      console.error("Error in getAdminByEmail:", error);
      // Try a more basic approach as fallback using raw SQL with case-insensitive comparison
      try {
        const result = await pool.query(
          "SELECT id, username, email, password_hash, is_admin as \"isAdmin\", metadata, created_at as \"createdAt\" FROM users WHERE LOWER(email) = LOWER($1) AND is_admin = true",
          [email.trim()]
        );
        console.log('[Storage] Found', result.rows.length, 'admin users using fallback method');
        return result.rows || [];
      } catch (fallbackError) {
        console.error("Fallback error in getAdminByEmail:", fallbackError);
        throw fallbackError;
      }
    }
  }

  async getUsersCount(): Promise<number> {
    try {
      // Use count to get total number of users
      const [result] = await db.select({
        count: count(users.id)
      }).from(users);
      
      return result.count || 0;
    } catch (error) {
      console.error("Error in getUsersCount:", error);
      // Fallback to raw SQL query
      try {
        const result = await pool.query("SELECT COUNT(*) FROM users");
        return parseInt(result.rows[0].count, 10) || 0;
      } catch (fallbackError) {
        console.error("Fallback error in getUsersCount:", fallbackError);
        return 0; // Return 0 as a safe default
      }
    }
  }

  // Alias for the getUsersCount method to match the interface
  async getUserCount(): Promise<number> {
    return this.getUsersCount();
  }
  
  async getPostCount(): Promise<number> {
    try {
      // Use count to get total number of posts
      const [result] = await db.select({
        count: count(postsTable.id)
      }).from(postsTable);
      
      return result.count || 0;
    } catch (error) {
      console.error("Error in getPostCount:", error);
      // Fallback to raw SQL query
      try {
        const result = await pool.query("SELECT COUNT(*) FROM posts");
        return parseInt(result.rows[0].count, 10) || 0;
      } catch (fallbackError) {
        console.error("Fallback error in getPostCount:", fallbackError);
        return 0; // Return 0 as a safe default
      }
    }
  }
  
  async getPostsCount(): Promise<{
    total: number;
    published: number;
    community: number;
  }> {
    try {
      // Get total count
      const [totalResult] = await db.select({
        count: count(postsTable.id)
      }).from(postsTable);
      
      // Queries to count specific post types
      // Note: We use the SQL function for JSON access as it's more reliable with different databases
      const [publishedResult] = await db.select({
        count: count(postsTable.id)
      })
      .from(postsTable)
      .where(sql`(metadata->>'status')::text = 'publish'`);
      
      const [communityResult] = await db.select({
        count: count(postsTable.id)
      })
      .from(postsTable)
      .where(sql`(metadata->>'isCommunityPost')::boolean = true`);
      
      return {
        total: totalResult.count || 0,
        published: publishedResult.count || 0,
        community: communityResult.count || 0
      };
    } catch (error) {
      console.error("Error in getPostsCount:", error);
      // Return safe defaults
      return {
        total: 0,
        published: 0,
        community: 0
      };
    }
  }
  
  async getCommentCount(): Promise<number> {
    try {
      // Use count to get total number of comments
      const [result] = await db.select({
        count: count(comments.id)
      }).from(comments);
      
      return result.count || 0;
    } catch (error) {
      console.error("Error in getCommentCount:", error);
      // Fallback to raw SQL query
      try {
        const result = await pool.query("SELECT COUNT(*) FROM comments");
        return parseInt(result.rows[0].count, 10) || 0;
      } catch (fallbackError) {
        console.error("Fallback error in getCommentCount:", fallbackError);
        return 0; // Return 0 as a safe default
      }
    }
  }
  
  async getCommentsCount(): Promise<{
    total: number;
    pending: number;
    flagged: number;
  }> {
    try {
      // Get total count
      const [totalResult] = await db.select({
        count: count(comments.id)
      }).from(comments);
      
      // Count pending comments (use SQL string for JSON access)
      const [pendingResult] = await db.select({
        count: count(comments.id)
      })
      .from(comments)
      .where(sql`(metadata->>'status')::text = 'pending'`);
      
      // Count flagged comments
      const [flaggedResult] = await db.select({
        count: count(comments.id)
      })
      .from(comments)
      .where(sql`(metadata->>'status')::text = 'flagged'`);
      
      return {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        flagged: flaggedResult.count || 0
      };
    } catch (error) {
      console.error("Error in getCommentsCount:", error);
      // Return safe defaults
      return {
        total: 0,
        pending: 0,
        flagged: 0
      };
    }
  }
  
  async getBookmarkCount(): Promise<number> {
    try {
      // Use count to get total number of bookmarks
      const [result] = await db.select({
        count: count(bookmarks.id)
      }).from(bookmarks);
      
      return result.count || 0;
    } catch (error) {
      console.error("Error in getBookmarkCount:", error);
      // Fallback to raw SQL query
      try {
        const result = await pool.query("SELECT COUNT(*) FROM bookmarks");
        return parseInt(result.rows[0].count, 10) || 0;
      } catch (fallbackError) {
        console.error("Fallback error in getBookmarkCount:", fallbackError);
        return 0; // Return 0 as a safe default
      }
    }
  }
  
  async getTrendingPosts(limit: number = 5): Promise<any[]> {
    try {
      // Get posts with the most views/likes
      // In a real implementation, this would consider both view counts and recency
      const trendingPosts = await db.execute(sql`
        SELECT p.id, p.title, p.slug, p.excerpt,
          COUNT(pl.id) as like_count,
          COUNT(b.id) as bookmark_count,
          COALESCE(
            (SELECT COUNT(*) FROM analytics WHERE post_id = p.id),
            0
          ) as view_count
        FROM posts p
        LEFT JOIN post_likes pl ON pl.post_id = p.id AND pl.is_like = true
        LEFT JOIN bookmarks b ON b.post_id = p.id
        GROUP BY p.id, p.title, p.slug, p.excerpt
        ORDER BY (COUNT(pl.id) + COUNT(b.id) + COALESCE((SELECT COUNT(*) FROM analytics WHERE post_id = p.id), 0)) DESC
        LIMIT ${limit}
      `);
      
      // Process and format the results
      return (Array.isArray(trendingPosts) ? trendingPosts : (trendingPosts as any).rows || [])
        .map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          views: parseInt(post.view_count) || 0,
          likes: parseInt(post.like_count) || 0,
          bookmarks: parseInt(post.bookmark_count) || 0
        }));
    } catch (error) {
      console.error("Error in getTrendingPosts:", error);
      // Fallback to getting the most recent posts
      try {
        const recentPosts = await db.select({
          id: postsTable.id,
          title: postsTable.title,
          slug: postsTable.slug,
          excerpt: postsTable.excerpt
        })
        .from(postsTable)
        .orderBy(desc(postsTable.createdAt))
        .limit(limit);
        
        return recentPosts.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          views: 0,
          likes: 0,
          bookmarks: 0
        }));
      } catch (fallbackError) {
        console.error("Fallback error in getTrendingPosts:", fallbackError);
        return []; // Return empty array as a safe default
      }
    }
  }
  
  async getAdminStats(): Promise<{
    totalViews: number;
    uniqueVisitors: number;
    avgReadTime: number;
    bounceRate: number;
    activeUsers: number;
    newUsers: number;
    adminCount: number;
  }> {
    try {
      // Get analytics data
      const analyticsData = await this.getSiteAnalytics();
      
      // Get count of admin users
      const [adminResult] = await db.select({
        count: count(users.id)
      })
      .from(users)
      .where(eq(users.isAdmin, true));
      
      // Get count of users created in the last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const [newUsersResult] = await db.select({
        count: count(users.id)
      })
      .from(users)
      .where(gt(users.createdAt, lastWeek));
      
      // Get count of active users (with logins in the last 30 days)
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);
      
      const [activeUsersResult] = await db.select({
        count: count(users.id)
      })
      .from(users)
      .where(gt(users.lastLogin, lastMonth));
      
      return {
        totalViews: analyticsData.totalViews,
        uniqueVisitors: analyticsData.uniqueVisitors,
        avgReadTime: analyticsData.avgReadTime,
        bounceRate: analyticsData.bounceRate,
        activeUsers: activeUsersResult.count || 0,
        newUsers: newUsersResult.count || 0,
        adminCount: adminResult.count || 0
      };
    } catch (error) {
      console.error("Error in getAdminStats:", error);
      // Return safe defaults
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        avgReadTime: 0,
        bounceRate: 0,
        activeUsers: 0,
        newUsers: 0,
        adminCount: 1 // Assume at least one admin
      };
    }
  }
  
  // Alias for getRecentActivityLogs to match the interface name
  async getRecentActivity(limit: number): Promise<ActivityLog[]> {
    return this.getRecentActivityLogs(limit);
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Hash the password before storing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Extract email from user or metadata and normalize it
      let email = (user.metadata as any)?.email || user.email;
      
      // Normalize email to prevent case-sensitivity issues
      if (email) {
        email = email.trim().toLowerCase();
        // Also update the metadata
        if (user.metadata && typeof user.metadata === 'object') {
          (user.metadata as any).email = email;
        }
      }
      
      console.log('[Storage] Creating user with email:', email);

      // Prepare user values including the metadata field
      const userValues = {
        username: user.username.trim(),
        email, // The email is now normalized
        password_hash: hashedPassword,
        isAdmin: user.isAdmin ?? false,
        metadata: user.metadata || {} // Include metadata now that it exists in the database
      };

      // Insert user with hashed password
      const [newUser] = await db.insert(users)
        .values(userValues)
        .returning();

      return newUser;
    } catch (error) {
      console.error("Error in createUser:", error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error("User with this email already exists");
        }
      }
      throw new Error("Failed to create user");
    }
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      console.log('[Storage] Updating user:', id);
      console.log('[Storage] Update data received:', JSON.stringify(userData, null, 2));
      
      // Get the current user first to properly handle metadata
      const currentUser = await this.getUser(id);
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Special handling for password updates (needed for reset password functionality)
      const updateData: Record<string, any> = {};
      
      // Special case for password_hash which needs direct assignment
      if (userData.password_hash) {
        updateData.password_hash = userData.password_hash;
      }
      
      // Special handling for metadata to ensure proper merging
      if (userData.metadata) {
        // Get existing metadata (default to empty object if null)
        const existingMetadata = currentUser.metadata || {};
        console.log('[Storage] Existing metadata:', JSON.stringify(existingMetadata, null, 2));
        console.log('[Storage] New metadata:', JSON.stringify(userData.metadata, null, 2));
        
        // Ensure both metadata objects are actual objects before merging
        const existingMetadataObj = typeof existingMetadata === 'object' ? existingMetadata : {};
        const newMetadataObj = typeof userData.metadata === 'object' ? userData.metadata : {};
        
        // Deep merge the existing metadata with the new metadata
        updateData.metadata = {
          ...existingMetadataObj,
          ...newMetadataObj
        };
        
        // Make sure nested properties are correctly merged
        if (newMetadataObj.oauth && existingMetadataObj.oauth) {
          updateData.metadata.oauth = {
            ...existingMetadataObj.oauth,
            ...newMetadataObj.oauth
          };
        }
        
        console.log('[Storage] Merged metadata:', JSON.stringify(updateData.metadata, null, 2));
      }
      
      // Process other fields
      for (const [key, value] of Object.entries(userData)) {
        // Skip these fields
        if (['id', 'createdAt', 'email', 'password_hash', 'metadata'].includes(key)) continue;
        
        // For all other fields, add them to update data
        updateData[key] = value;
      }
      
      // Only proceed if we have fields to update
      if (Object.keys(updateData).length === 0) {
        throw new Error("No valid fields to update");
      }
      
      console.log('[Storage] Final update data to send to DB:', JSON.stringify(updateData, null, 2));
      
      // Update the user with valid fields
      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      
      if (!updatedUser) {
        throw new Error("User not found after update");
      }
      
      console.log('[Storage] User updated successfully:', id);
      return updatedUser;
    } catch (error) {
      console.error("Error in updateUser:", error);
      if (error instanceof Error) {
        if (error.message.includes("User not found") || error.message === "No valid fields to update") {
          throw error;
        }
      }
      throw new Error("Failed to update user");
    }
  }

  // Sessions
  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions)
      .values({ ...session, createdAt: new Date(), lastAccessedAt: new Date() })
      .returning();
    return newSession;
  }

  async getSession(token: string): Promise<Session | undefined> {
    const [session] = await db.select()
      .from(sessions)
      .where(and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      ))
      .limit(1);
    return session;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions)
      .where(eq(sessions.token, token));
  }

  async cleanExpiredSessions(): Promise<void> {
    await db.delete(sessions)
      .where(lt(sessions.expiresAt, new Date()));
  }

  async updateSessionAccess(token: string): Promise<void> {
    await db.update(sessions)
      .set({ lastAccessedAt: new Date() })
      .where(eq(sessions.token, token));
  }

  // Password Reset Methods
  async createResetToken(tokenData: InsertResetToken): Promise<ResetToken> {
    try {
      console.log('[Storage] Creating reset token for user:', tokenData.userId);
      
      // Insert the reset token
      const [newToken] = await db.insert(resetTokens)
        .values({
          ...tokenData,
          createdAt: new Date()
        })
        .returning();
      
      console.log('[Storage] Reset token created successfully');
      return newToken;
    } catch (error) {
      console.error("Error in createResetToken:", error);
      throw new Error("Failed to create password reset token");
    }
  }

  async getResetTokenByToken(token: string): Promise<ResetToken | undefined> {
    try {
      console.log('[Storage] Looking up reset token:', token.substring(0, 6) + '...');
      
      // Find the token that's not expired and not used
      const [resetToken] = await db.select()
        .from(resetTokens)
        .where(and(
          eq(resetTokens.token, token),
          eq(resetTokens.used, false),
          gt(resetTokens.expiresAt, new Date())
        ))
        .limit(1);
      
      if (resetToken) {
        console.log('[Storage] Reset token found for user:', resetToken.userId);
      } else {
        console.log('[Storage] Reset token not found or expired');
      }
      
      return resetToken;
    } catch (error) {
      console.error("Error in getResetTokenByToken:", error);
      throw new Error("Failed to verify reset token");
    }
  }

  async markResetTokenAsUsed(token: string): Promise<void> {
    try {
      console.log('[Storage] Marking reset token as used:', token.substring(0, 6) + '...');
      
      // Update the token to mark it as used
      await db.update(resetTokens)
        .set({ used: true })
        .where(eq(resetTokens.token, token));
      
      console.log('[Storage] Reset token marked as used successfully');
    } catch (error) {
      console.error("Error in markResetTokenAsUsed:", error);
      throw new Error("Failed to mark reset token as used");
    }
  }

  // Posts operations
  async getPosts(
    page: number = 1, 
    limit: number = 100, // Increased limit to ensure all 21 WordPress stories are returned
    filters: {
      search?: string;
      authorId?: number;
      isCommunityPost?: boolean;
      isAdminPost?: boolean;
      category?: string;
      sort?: string;
      order?: string;
    } = {}
  ): Promise<{ posts: Post[], hasMore: boolean }> {
    return this.safeDbOperation(
      async () => {
        console.log(`[Storage] Fetching posts - page: ${page}, limit: ${limit}, filters:`, filters);
        const offset = (page - 1) * limit;
  
        try {
          console.log("[Storage] Fetching posts with page:", page, "limit:", limit, "filters:", JSON.stringify(filters));
          
          // Query to get all posts including WordPress stories with optimized Drizzle query
          console.log("[Storage] Executing optimized Drizzle query");
          // Use a more robust query approach with only fields we know exist in the database
          const rawPosts = await db.select({
            id: postsTable.id,
            title: postsTable.title,
            content: postsTable.content,
            slug: postsTable.slug,
            excerpt: postsTable.excerpt,
            authorId: postsTable.authorId,
            createdAt: postsTable.createdAt,
            metadata: postsTable.metadata,
            isSecret: postsTable.isSecret,
            matureContent: postsTable.matureContent,
            themeCategory: postsTable.themeCategory
          })
          .from(postsTable)
          .orderBy(desc(postsTable.createdAt))
          .limit(limit + 1)
          .offset(offset);
          
          console.log("[Storage] SQL query returned", rawPosts.length, "posts");
          
          // Check if there are more posts
          const hasMore = rawPosts.length > limit;
          const paginatedPosts = rawPosts.slice(0, limit);
          
          // Transform posts with reliable field access
          const transformedPosts = paginatedPosts.map(post => {
            // Extract metadata for fields that might be stored there
            const metadata = post.metadata || {};
            
            // Get values with fallbacks
            return {
              id: post.id,
              title: post.title,
              content: post.content,
              slug: post.slug,
              excerpt: post.excerpt,
              author: metadata.authorName || 'admin',
              authorId: post.authorId,
              createdAt: new Date(post.createdAt),
              likes: metadata.likes || 0,
              views: metadata.views || 0,
              metadata: metadata,
              // Ensure isCommunityPost is consistently handled
              isCommunityPost: metadata.isCommunityPost || false,
              isAdminPost: metadata.isAdminPost || false,
              isSecret: post.isSecret || false,
              matureContent: post.matureContent || false,
              themeCategory: post.themeCategory || metadata.themeCategory || null,
              readingTimeMinutes: metadata.readingTimeMinutes || null,
              likesCount: metadata.likes || 0,
              dislikesCount: metadata.dislikes || 0
            };
          });
          
          console.log(`[Storage] Transformed ${transformedPosts.length} posts, hasMore: ${hasMore}`);
          
          return { posts: transformedPosts, hasMore };
        } catch (error) {
          console.error("[Storage] Error executing getPosts query:", error);
          return { posts: [], hasMore: false };
        }
        
        // Post-query filtering for metadata fields like isCommunityPost
        // This avoids database schema issues when these fields are missing
        if (filters.isCommunityPost !== undefined || filters.category) {
          posts = posts.filter(post => {
            const metadata = post.metadata || {};
            
            // Check for community post flag in metadata
            if (filters.isCommunityPost !== undefined) {
              const isCommunityPost = metadata.isCommunityPost === true;
              if (isCommunityPost !== filters.isCommunityPost) return false;
            }
            
            // Filter by category if specified
            if (filters.category) {
              const themeCategory = metadata.themeCategory;
              if (themeCategory !== filters.category) return false;
            }
            
            return true;
          });
        }
        
        // Apply text search filter if specified
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          posts = posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.content.toLowerCase().includes(searchTerm) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm))
          );
        }
  
        // Check if there are more posts
        const hasMore = posts.length > limit;
        const paginatedPosts = posts.slice(0, limit); // Remove the extra post we fetched
  
        console.log(`[Storage] Found ${paginatedPosts.length} posts, hasMore: ${hasMore}`);
  
        return {
          posts: paginatedPosts.map(post => ({
            ...post,
            createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
          })),
          hasMore
        };
      },
      { posts: [], hasMore: false },
      'getPosts'
    ).catch(error => {
      // If the safeDbOperation throws an error, we have a fallback within a fallback
      console.error("Error in getPosts even with safeDbOperation:", error);
      
      // Try an even more basic approach with raw SQL if possible
      return this.getFallbackPosts(page, limit, filters);
    });
  }

  // Fallback method for getting posts when the database operation fails
  private async getFallbackPosts(
    page: number = 1, 
    limit: number = 16, 
    filters: any = {}
  ): Promise<{ posts: Post[], hasMore: boolean }> {
    try {
      console.warn(`[Storage] Using fallback query for getPosts - page: ${page}, limit: ${limit}`);
      const offset = (page - 1) * limit;
      
      // Fallback query without problematic columns
      // Use jsonb metadata field directly when available 
      // This is the most reliable approach as it doesn't depend on columns that might not exist
      const simplePosts = await db.select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        slug: postsTable.slug,
        authorId: postsTable.authorId,
        excerpt: postsTable.excerpt,
        metadata: postsTable.metadata,
        createdAt: postsTable.createdAt,
        isSecret: postsTable.isSecret
      })
      .from(postsTable)
      .where(eq(postsTable.isSecret, false))
      .orderBy(desc(postsTable.createdAt))
      .limit(limit + 1)
      .offset(offset);
      
      // Now apply the filtering based on metadata fields
      let filteredPosts = simplePosts;
      
      if (filters.isCommunityPost !== undefined || filters.category) {
        filteredPosts = simplePosts.filter(post => {
          const metadata = post.metadata || {};
          
          // Check for community post flag in metadata
          if (filters.isCommunityPost !== undefined) {
            const isCommunityPost = metadata.isCommunityPost === true;
            if (isCommunityPost !== filters.isCommunityPost) return false;
          }
          
          // Filter by category if specified
          if (filters.category) {
            const themeCategory = metadata.themeCategory;
            if (themeCategory !== filters.category) return false;
          }
          
          return true;
        });
      }
      
      // If isAdminPost filter is set, apply it separately
      // Now using the isAdminPost column directly from the schema
      if (filters.isAdminPost !== undefined) {
        try {
          // Try a direct SQL approach to check the isAdminPost column
          const result = await db.execute(sql`
            SELECT id FROM posts WHERE "isAdminPost" = ${filters.isAdminPost}
          `);
          
          const adminPostIds = result.rows.map(row => row.id);
          
          // Further filter the posts to those matching the admin post filter
          if (adminPostIds.length > 0) {
            filteredPosts = filteredPosts.filter(post => adminPostIds.includes(post.id));
          } else {
            // If no admin posts found, and we're looking for admin posts, return empty
            if (filters.isAdminPost === true) {
              filteredPosts = [];
            }
          }
        } catch (filterError) {
          console.warn("Failed to filter by isAdminPost column, falling back to metadata check:", filterError);
          // Fall back to metadata check if column doesn't exist
          filteredPosts = filteredPosts.filter(post => {
            const metadata = post.metadata || {};
            const isAdminPost = metadata.isAdminPost === true;
            return isAdminPost === filters.isAdminPost;
          });
        }
      }
      
      // Apply text search filter if specified
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(searchTerm) || 
          post.content.toLowerCase().includes(searchTerm) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm))
        );
      }
      
      // Check if there are more posts
      const hasMore = filteredPosts.length > limit;
      const paginatedPosts = filteredPosts.slice(0, limit);
      
      console.log(`[Storage] Found ${paginatedPosts.length} posts using fallback query, hasMore: ${hasMore}`);
      
      return {
        posts: paginatedPosts.map(post => ({
          ...post,
          createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
        })),
        hasMore
      };
    } catch (fallbackError) {
      console.error("All fallback queries failed:", fallbackError);
      // Return empty result set as the last resort
      return { posts: [], hasMore: false };
    }
  }

  async getSecretPosts(): Promise<Post[]> {
    try {
      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.isSecret, true))
        .orderBy(desc(postsTable.createdAt))
        .limit(10);

      return posts.map(post => ({
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
      }));
    } catch (error) {
      console.error("Error in getSecretPosts:", error);
      throw new Error("Failed to fetch secret posts");
    }
  }

  async getPost(slug: string): Promise<Post | undefined> {
    return this.safeDbOperation(
      async () => {
        // Try the standard Drizzle query first
        try {
          const [post] = await db.select()
            .from(postsTable)
            .where(eq(postsTable.slug, slug))
            .limit(1);
  
          if (!post) return undefined;
  
          return {
            ...post,
            createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
          };
        } catch (queryError: any) {
          console.log("Initial getPost query failed, trying fallback.", queryError.message);
          
          // If standard query fails, fall back to SQL for schema flexibility
          if (queryError.message && (
              queryError.message.includes("column") || 
              queryError.message.includes("does not exist"))) {
            console.log("Using fallback SQL query for getPost.");
            
            // Fallback to raw SQL query that only selects columns we know exist
            const result = await db.execute(sql`
              SELECT 
                id, title, content, slug, excerpt, author_id,
                metadata, created_at, is_secret, mature_content,
                theme_category, reading_time_minutes,
                likes_count, dislikes_count
              FROM posts 
              WHERE slug = ${slug}
              LIMIT 1
            `);
            
            const rows = result.rows;
            if (!rows || rows.length === 0) return undefined;
            
            const post = rows[0];
            
            return {
              id: post.id,
              title: post.title,
              content: post.content,
              slug: post.slug,
              excerpt: post.excerpt,
              authorId: post.author_id,
              isSecret: post.is_secret || false,
              matureContent: post.mature_content || false,
              themeCategory: post.theme_category,
              metadata: post.metadata || {},
              createdAt: post.created_at instanceof Date ? post.created_at : new Date(post.created_at),
              readingTimeMinutes: post.reading_time_minutes || Math.ceil(post.content.length / 1000),
              likesCount: post.likes_count || 0,
              dislikesCount: post.dislikes_count || 0
            };
          } else {
            // If it's another type of error, rethrow it
            throw queryError;
          }
        }
      },
      undefined,
      'getPost'
    );
  }

  async getPostsByAuthor(authorId: number, limit: number = 10): Promise<Post[]> {
    try {
      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.authorId, authorId))
        .orderBy(desc(postsTable.createdAt))
        .limit(limit);

      return posts.map(post => ({
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
      }));
    } catch (error) {
      console.error("Error in getPostsByAuthor:", error);
      throw new Error("Failed to fetch posts by author");
    }
  }

  async createPost(post: InsertPost): Promise<Post> {
    try {
      console.log('Storage: Creating new post with data:', {
        title: post.title,
        excerpt: post.excerpt,
        isSecret: post.isSecret,
        themeCategory: post.themeCategory
      });
      
      // Extract specific fields that we know exist in the database
      // This avoids issues with missing columns
      const basePost = {
        title: post.title,
        content: post.content,
        slug: post.slug,
        authorId: post.authorId,
        excerpt: post.excerpt,
        isSecret: post.isSecret || false,
        metadata: post.metadata || {},
        createdAt: new Date(),
        readingTimeMinutes: Math.ceil(post.content.split(/\s+/).length / 200),
        themeCategory: post.themeCategory || (post.metadata as any)?.themeCategory || null,
        matureContent: false // Default value for mature_content
      };
      
      // Use raw SQL to avoid schema mismatches, only including fields that actually exist
      const result = await db.execute(sql`
        INSERT INTO posts (
          title, 
          content, 
          slug, 
          author_id, 
          excerpt, 
          metadata, 
          is_secret, 
          "isAdminPost",
          mature_content, 
          theme_category, 
          created_at, 
          reading_time_minutes
        ) VALUES (
          ${basePost.title}, 
          ${basePost.content}, 
          ${basePost.slug}, 
          ${basePost.authorId}, 
          ${basePost.excerpt || null}, 
          ${JSON.stringify(basePost.metadata)}, 
          ${basePost.isSecret || false}, 
          ${post.isAdminPost || false},
          ${basePost.matureContent || false}, 
          ${basePost.themeCategory || null}, 
          ${basePost.createdAt}, 
          ${basePost.readingTimeMinutes}
        )
        RETURNING *;
      `);
      
      const newPost = result.rows[0];

      console.log('Storage: Post created successfully:', {
        id: newPost.id,
        title: newPost.title,
        slug: newPost.slug
      });

      return {
        ...newPost,
        createdAt: newPost.createdAt instanceof Date ? newPost.createdAt : new Date(newPost.createdAt)
      };
    } catch (error) {
      console.error("Error in createPost:", error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error("A post with this slug already exists");
        }
        if (error.message.includes('foreign key')) {
          throw new Error("Invalid author ID provided");
        }
      }
      throw new Error("Failed to create post");
    }
  }

  async deletePost(id: number): Promise<Post> {
    try {
      console.log(`[Storage] Attempting to delete post with ID: ${id}`);
      const result = await db.delete(postsTable)
        .where(eq(postsTable.id, id))
        .returning();

      if (!result.length) {
        console.error(`[Storage] Post with ID ${id} not found`);
        throw new Error("Post not found");
      }

      console.log(`[Storage] Successfully deleted post with ID: ${id}`);
      return result[0];
    } catch (error) {
      console.error("[Storage] Error in deletePost:", error);
      throw error;
    }
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post> {
    try {
      const [updatedPost] = await db.update(postsTable)
        .set(post)
        .where(eq(postsTable.id, id))
        .returning();

      if (!updatedPost) {
        throw new Error("Post not found");
      }

      return {
        ...updatedPost,
        createdAt: updatedPost.createdAt instanceof Date ? updatedPost.createdAt : new Date(updatedPost.createdAt)
      };
    } catch (error) {
      console.error("Error in updatePost:", error);
      if (error instanceof Error) {
        if (error.message === "Post not found") {
          throw error;
        }
        if (error.message.includes('duplicate key')) {
          throw new Error("A post with this slug already exists");
        }
      }
      throw new Error("Failed to update post");
    }
  }

  async unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress> {
    const [newProgress] = await db.insert(secretProgress)
      .values({ ...progress, discoveryDate: new Date() })
      .returning();
    return newProgress;
  }

  // Add optimized method for fetching post with comments
  async getPostWithComments(slug: string): Promise<Post & { comments: Comment[] }> {
    try {
      const [post] = await db.select()
        .from(postsTable)
        .where(eq(postsTable.slug, slug))
        .limit(1);

      if (!post) {
        throw new Error("Post not found");
      }

      const postComments = await db.select()
        .from(comments)
        .where(eq(comments.postId, post.id))
        .orderBy(desc(comments.createdAt));

      return {
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
        comments: postComments.map(comment => ({
          ...comment,
          createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)
        }))
      };
    } catch (error) {
      console.error("Error in getPostWithComments:", error);
      if (error instanceof Error && error.message === "Post not found") {
        throw error;
      }
      throw new Error("Failed to fetch post and comments");
    }
  }

  // Comments operations
  async getComments(postId: number): Promise<Comment[]> {
    try {
      // Use a raw SQL query to avoid column name issues
      const result = await db.execute(sql`
        SELECT 
          id, content, post_id as "postId", user_id as "userId", 
          approved, edited, edited_at as "editedAt", 
          metadata, created_at as "createdAt", parent_id as "parentId"
        FROM comments
        WHERE post_id = ${postId}
        ORDER BY created_at DESC
      `);

      return result.rows.map(comment => ({
        ...comment,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt),
        editedAt: comment.editedAt ? (comment.editedAt instanceof Date ? comment.editedAt : new Date(comment.editedAt)) : null
      }));
    } catch (error) {
      console.error("Error in getComments:", error);
      // Return empty array instead of throwing to prevent cascade failures
      return [];
    }
  }

  async getRecentComments(): Promise<Comment[]> {
    try {
      const commentsResult = await db.select({
        id: comments.id,
        content: comments.content,
        postId: comments.postId,
        userId: comments.userId,
        approved: sql`comments.is_approved`, // Fix: use is_approved instead of approved
        edited: comments.edited,
        editedAt: comments.editedAt,
        metadata: comments.metadata,
        createdAt: comments.createdAt,
        parentId: comments.parentId // Include parentId in the select
      })
      .from(comments)
      .orderBy(desc(comments.createdAt))
      .limit(10);

      return commentsResult.map(comment => ({
        ...comment,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)
      }));
    } catch (error) {
      console.error("Error in getRecentComments:", error);
      return [];
    }
  }

  async getPendingComments(): Promise<Comment[]> {
    try {
      const commentsResult = await db.select({
        id: comments.id,
        content: comments.content,
        postId: comments.postId,
        userId: comments.userId,
        approved: sql`comments.is_approved`, // Fix: use is_approved instead of approved
        edited: comments.edited,
        editedAt: comments.editedAt,
        metadata: comments.metadata,
        createdAt: comments.createdAt,
        parentId: comments.parentId // Include parentId in the select
      })
      .from(comments)
      .where(sql`comments.is_approved = false`) // Fix: use is_approved in the where clause
      .orderBy(desc(comments.createdAt));

      return commentsResult.map(comment => ({
        ...comment,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)
      }));
    } catch (error) {
      console.error("Error in getPendingComments:", error);
      return [];
    }
  }
  // Helper method to ensure post exists (especially for WordPress posts)
  private async ensurePostExists(postId: number): Promise<boolean> {
    try {
      // First check if the post already exists
      const existingPost = await this.getPostById(postId);
      if (existingPost) {
        return true;
      }
      
      console.log(`[Storage] Post ${postId} doesn't exist, creating placeholder for WordPress post`);
      
      // Create a placeholder post for WordPress posts that don't exist in our DB yet
      const [placeholderPost] = await db.insert(postsTable)
        .values({
          id: postId, // Use the WordPress ID
          title: `WordPress Post ${postId}`,
          content: "This is a placeholder for a WordPress post",
          slug: `wordpress-post-${postId}`,
          authorId: 1, // Default to admin user
          createdAt: new Date(),
          metadata: {
            wordpressId: postId,
            isPlaceholder: true
          }
        })
        .returning();
      
      console.log(`[Storage] Created placeholder post with ID ${placeholderPost.id}`);
      return true;
    } catch (error) {
      console.error(`[Storage] Error ensuring post exists: ${error}`);
      return false;
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    try {
      console.log('[Storage] Creating new comment:', {
        postId: comment.postId,
        isAnonymous: !comment.userId
      });
      
      // Ensure the post exists before creating a comment on it
      const postId = comment.postId;
      if (typeof postId !== 'number') {
        throw new Error('Invalid post ID: Post ID must be a number');
      }
      
      const postExists = await this.ensurePostExists(postId);
      if (!postExists) {
        throw new Error(`Cannot create comment: Post with ID ${postId} does not exist and could not be created`);
      }

      const commentMetadata: CommentMetadata = {
        moderated: false,
        originalContent: comment.content,
        isAnonymous: !comment.userId,
        author: typeof comment.metadata?.author === 'string' ? comment.metadata.author : 'Anonymous',
        upvotes: 0,
        downvotes: 0,
        replyCount: 0
      };

      // Create a direct SQL query to ensure proper column mapping
      const result = await db.execute(sql`
        INSERT INTO comments (content, post_id, parent_id, user_id, is_approved, metadata, created_at)
        VALUES (
          ${comment.content},
          ${comment.postId},
          ${comment.parentId ?? null},
          ${comment.userId},
          ${comment.is_approved !== undefined ? comment.is_approved : true},
          ${JSON.stringify(commentMetadata)},
          ${new Date()}
        )
        RETURNING *;
      `);
      const newComment = result.rows[0];

      console.log('[Storage] Comment created successfully:', newComment.id);
      return {
        ...newComment,
        createdAt: newComment.createdAt instanceof Date ? newComment.createdAt : new Date(newComment.createdAt)
      };
    } catch (error) {
      console.error('[Storage] Error creating comment:', error);
      throw error;
    }
  }

  async updateComment(id: number, comment: Partial<Comment>): Promise<Comment> {
    try {
      const [updatedComment] = await db.update(comments)
        .set(comment)
        .where(eq(comments.id, id))
        .returning();

      if (!updatedComment) {
        throw new Error("Comment not found");
      }

      return {
        ...updatedComment,
        createdAt: updatedComment.createdAt instanceof Date ? updatedComment.createdAt : new Date(updatedComment.createdAt)
      };
    } catch (error) {
      console.error("Error updating comment:", error);
      if (error instanceof Error && error.message === "Comment not found") {
        throw error;
      }
      throw new Error("Failed to update comment");
    }
  }

  async deleteComment(id: number): Promise<Comment> {
    try {
      console.log(`[Storage] Attempting to delete comment with ID: ${id}`);
      const result = await db.delete(comments)
        .where(eq(comments.id, id))
        .returning();

      if (!result.length) {
        console.error(`[Storage] Comment with ID ${id} not found`);
        throw new Error("Comment not found");
      }

      console.log(`[Storage] Successfully deleted comment with ID: ${id}`);
      return result[0];
    } catch (error) {
      console.error("[Storage] Error in deleteComment:", error);
      throw error;
    }
  }

  async getComment(id: number): Promise<Comment | undefined> {
    try {
      const [comment] = await db.select()
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1);

      if (!comment) return undefined;

      return {
        ...comment,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)
      };
    } catch (error) {
      console.error("Error in getComment:", error);
      throw new Error("Failed to fetch comment");
    }
  }

  // Reading Progress operations
  async getProgress(postId: number): Promise<ReadingProgress | undefined> {
    const [progress] = await db.select()
      .from(readingProgress)
      .where(eq(readingProgress.postId, postId))
      .limit(1);
    return progress;
  }

  async updateProgress(progress: InsertProgress): Promise<ReadingProgress> {
    const [newProgress] = await db.insert(readingProgress)
      .values(progress)
      .returning();
    return newProgress;
  }

  // Contact Messages operations
  async getContactMessages(): Promise<ContactMessage[]> {
    const messages = await db.select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));

    return messages.map(message => ({
      ...message,
      createdAt: message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt)
    }));
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages)
      .values({ ...message, createdAt: new Date() })
      .returning();

    return {
      ...newMessage,
      createdAt: newMessage.createdAt instanceof Date ? newMessage.createdAt : new Date(newMessage.createdAt)
    };
  }

  // Newsletter subscription operations
  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    try {
      // Check if this email is already subscribed
      const existingSubscription = await this.getNewsletterSubscriptionByEmail(subscription.email);
      
      if (existingSubscription) {
        if (existingSubscription.status === 'unsubscribed') {
          // If they were previously unsubscribed, update their status to active
          return await this.updateNewsletterSubscriptionStatus(subscription.email, 'active');
        }
        // Return the existing subscription if already active
        return existingSubscription;
      }
      
      // Create new subscription
      const [newSubscription] = await db
        .insert(newsletterSubscriptions)
        .values({
          ...subscription,
          status: 'active',
          metadata: subscription.metadata || {},
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return newSubscription;
    } catch (error) {
      console.error("Error in createNewsletterSubscription:", error);
      throw error;
    }
  }

  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    try {
      const [subscription] = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.email, email))
        .limit(1);
      
      return subscription;
    } catch (error) {
      console.error("Error in getNewsletterSubscriptionByEmail:", error);
      return undefined;
    }
  }

  async updateNewsletterSubscriptionStatus(email: string, status: string): Promise<NewsletterSubscription> {
    try {
      const [updatedSubscription] = await db
        .update(newsletterSubscriptions)
        .set({ 
          status, 
          updatedAt: new Date() 
        })
        .where(eq(newsletterSubscriptions.email, email))
        .returning();
      
      return updatedSubscription;
    } catch (error) {
      console.error("Error in updateNewsletterSubscriptionStatus:", error);
      throw error;
    }
  }

  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      const subscriptions = await db
        .select()
        .from(newsletterSubscriptions)
        .orderBy(desc(newsletterSubscriptions.createdAt));
      
      return subscriptions;
    } catch (error) {
      console.error("Error in getNewsletterSubscriptions:", error);
      return [];
    }
  }

  // Post Likes operations
  async getPostLike(postId: number, userId: number): Promise<PostLike | undefined> {
    const [like] = await db.select()
      .from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ))
      .limit(1);
    return like;
  }

  async removePostLike(postId: number, userId: number): Promise<void> {
    try {
      console.log(`[Storage] Removing like/dislike for post ${postId} by user ${userId}`);
      await db.delete(postLikes)
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        ));

      await this.updatePostCounts(postId);
      console.log(`[Storage] Successfully removed reaction for post ${postId}`);
    } catch (error) {
      console.error(`[Storage] Error removing like for post ${postId}:`, error);
      throw error;
    }
  }

  async updatePostLike(postId: number, userId: number, isLike: boolean): Promise<void> {
    try {
      console.log(`[Storage] Updating reaction for post ${postId} by user ${userId} to ${isLike ? 'like' : 'dislike'}`);
      await db.update(postLikes)
        .set({ isLike })
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        ));

      await this.updatePostCounts(postId);
      console.log(`[Storage] Successfully updated reaction for post ${postId}`);
    } catch (error) {
      console.error(`[Storage] Error updating like for post ${postId}:`, error);
      throw error;
    }
  }

  async createPostLike(postId: number, userId: number, isLike: boolean): Promise<void> {
    try {
      console.log(`[Storage] Creating new ${isLike ? 'like' : 'dislike'} for post ${postId} by user ${userId}`);
      await db.insert(postLikes)
        .values({
          postId,
          userId,
          isLike
        });

      await this.updatePostCounts(postId);
      console.log(`[Storage] Successfully created reaction for post ${postId}`);
    } catch (error) {
      console.error(`[Storage] Error creating like for post ${postId}:`, error);
      throw error;
    }
  }

  async getPostLikeCounts(postId: number): Promise<{ likesCount: number; dislikesCount: number }> {
    try {
      console.log(`[Storage] Getting like counts for post ${postId}`);
      
      // Calculate counts directly from the post_likes table for accuracy
      const likesResult = await db.select({
        count: count()
      })
      .from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.isLike, true)
      ));
      
      const dislikesResult = await db.select({
        count: count()
      })
      .from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.isLike, false)
      ));
      
      const likesCount = Number(likesResult[0]?.count || 0);
      const dislikesCount = Number(dislikesResult[0]?.count || 0);
      
      // Get current values from the posts table for logging comparison
      const [currentValues] = await db.select({
        likesCount: postsTable.likesCount,
        dislikesCount: postsTable.dislikesCount
      })
      .from(postsTable)
      .where(eq(postsTable.id, postId))
      .limit(1);
      
      // Log both calculated and stored values to identify discrepancies
      if (currentValues) {
        console.log(`[Storage] Post ${postId} current stored counts:`, {
          likesCount: Number(currentValues.likesCount || 0),
          dislikesCount: Number(currentValues.dislikesCount || 0)
        });
      }
      
      const counts = { likesCount, dislikesCount };
      console.log(`[Storage] Post ${postId} calculated counts:`, counts);
      
      return counts;
    } catch (error) {
      console.error(`[Storage] Error getting like counts for post ${postId}:`, error);
      // Return zero counts as a fallback
      return { likesCount: 0, dislikesCount: 0 };
    }
  }

  private async updatePostCounts(postId: number): Promise<void> {
    try {
      const counts = await this.getPostLikeCounts(postId);
      
      // Use raw SQL to avoid column name issues
      await db.execute(sql`
        UPDATE posts 
        SET "likesCount" = ${counts.likesCount}, 
            "dislikesCount" = ${counts.dislikesCount}
        WHERE id = ${postId}
      `);

      console.log(`[Storage] Updated post ${postId} counts:`, counts);
    } catch (error) {
      console.error(`[Storage] Error updating post counts for ${postId}:`, error);
      throw error;
    }
  }
  
  // Add missing methods needed by the IStorage interface
  async getPostReactions(postId: number): Promise<{likes: number, dislikes: number}> {
    const counts = await this.getPostLikeCounts(postId);
    // Convert from internal format to interface format
    return {
      likes: counts.likesCount,
      dislikes: counts.dislikesCount
    };
  }
  
  async updatePostReaction(postId: number, data: { isLike: boolean; sessionId?: string }): Promise<boolean> {
    try {
      // Generate a consistent userId from sessionId for anonymous users
      const userId = data.sessionId ? 
        parseInt(crypto.createHash('md5').update(data.sessionId).digest('hex').substring(0, 8), 16) : 
        -1; // Use -1 for anonymous reactions
      
      const isLike = data.isLike;
      
      // Check if user already reacted
      const existingLike = await this.getPostLike(postId, userId);
      
      if (existingLike) {
        if (existingLike.isLike === isLike) {
          // Remove if clicking the same button again
          await this.removePostLike(postId, userId);
        } else {
          // Change reaction type
          await this.updatePostLike(postId, userId, isLike);
        }
      } else {
        // Create new reaction
        await this.createPostLike(postId, userId, isLike);
      }
      
      // Update post counts in the database
      await this.updatePostCounts(postId);
      
      return true;
    } catch (error) {
      console.error(`[Storage] Error updating post reaction for post ${postId}:`, error);
      throw error;
    }
  }
  
  async getPersonalizedRecommendations(userId: number): Promise<Post[]> {
    try {
      // Simple implementation - just return recent posts
      return this.getRecentPosts();
    } catch (error) {
      console.error('[Storage] Error getting personalized recommendations:', error);
      return [];
    }
  }

  // Comment votes methods
  async getCommentVote(commentId: number, userId: string): Promise<CommentVote | undefined> {
    const [vote] = await db.select()
      .from(commentVotes)
      .where(and(
        eq(commentVotes.commentId, commentId),
        eq(commentVotes.userId, userId)
      ))
      .limit(1);
    return vote;
  }

  async removeCommentVote(commentId: number, userId: string): Promise<void> {
    await db.delete(commentVotes)
      .where(and(
        eq(commentVotes.commentId, commentId),
        eq(commentVotes.userId, userId)
      ));
  }

  async updateCommentVote(commentId: number, userId: string, isUpvote: boolean): Promise<void> {
    await db.update(commentVotes)
      .set({ isUpvote })
      .where(and(
        eq(commentVotes.commentId, commentId),
        eq(commentVotes.userId, userId)
      ));
  }

  async createCommentVote(commentId: number, userId: string, isUpvote: boolean): Promise<void> {
    await db.insert(commentVotes)
      .values({
        commentId,
        userId,
        isUpvote,
        createdAt: new Date()
      });
  }

  async getCommentVoteCounts(commentId: number): Promise<{ upvotes: number; downvotes: number }> {
    const upvotes = await db.select({ count: sql`count(*)` })
      .from(commentVotes)
      .where(and(
        eq(commentVotes.commentId, commentId),
        eq(commentVotes.isUpvote, true)
      ));

    const downvotes = await db.select({ count: sql`count(*)` })
      .from(commentVotes)
      .where(and(
        eq(commentVotes.commentId, commentId),
        eq(commentVotes.isUpvote, false)
      ));

    return {
      upvotes: Number(upvotes[0]?.count || 0),
      downvotes: Number(downvotes[0]?.count || 0)
    };
  }

  // Comment replies method
  async createCommentReply(reply: InsertCommentReply): Promise<CommentReply> {
    try {
      console.log('[Storage] Creating new comment reply');

      // Create metadata object according to CommentMetadata interface
      const metadata: CommentMetadata = {
        moderated: false,
        originalContent: reply.content,
        isAnonymous: !reply.userId,
        author: reply.metadata?.author || 'Anonymous',
        upvotes: 0,
        downvotes: 0,
        replyCount: 0
      };

      // Create a direct SQL query to ensure proper column mapping
      const result = await db.execute(sql`
        INSERT INTO comments (content, post_id, parent_id, user_id, is_approved, metadata, created_at)
        VALUES (
          ${reply.content},
          ${reply.postId},
          ${reply.parentId},
          ${reply.userId},
          ${reply.is_approved !== undefined ? reply.is_approved : false},
          ${JSON.stringify(metadata)},
          ${new Date()}
        )
        RETURNING *;
      `);
      const newReply = result.rows[0];

      return {
        ...newReply,
        createdAt: newReply.createdAt instanceof Date ? newReply.createdAt : new Date(newReply.createdAt)
      };
    } catch (error) {
      console.error('[Storage] Error creating comment reply:', error);
      throw error;
    }
  }


  // Author Stats Implementation
  async getAuthorStats(authorId: number): Promise<AuthorStats | undefined> {
    const [stats] = await db.select()
      .from(authorStats)
      .where(eq(authorStats.authorId, authorId))
      .limit(1);
    return stats;
  }

  async updateAuthorStats(authorId: number): Promise<AuthorStats> {
    const [[totalPosts], [totalLikes], [totalTips]] = await Promise.all([
      db.select({ count: count() }).from(postsTable).where(eq(postsTable.authorId, authorId)),
      db.select({ count: count() }).from(postLikes).where(eq(postLikes.isLike, true)),
      db.select({ sum: sql<string>`sum(amount)` }).from(authorTips).where(eq(authorTips.authorId, authorId))
    ]);

    const [updated] = await db.update(authorStats)
      .set({
        totalPosts: Number(totalPosts.count),
        totalLikes: Number(totalLikes.count),
        totalTips: totalTips.sum || "0",        updatedAt: new Date()
      })
      .where(eq(authorStats.authorId, authorId))
      .returning();

    return updated;
  }

  async getTopAuthors(limit: number =10): Promise<AuthorStats[]> {
    return await db.select()
      .from(authorStats)
      .orderBy(desc(authorStats.totalLikes))
      .limit(limit);
  }

  // Writing Challenges Implementation
  async createWritingChallenge(challenge: InsertWritingChallenge): Promise<WritingChallenge> {
    const [newChallenge] = await db.insert(writingChallenges)
      .values({ ...challenge, createdAt: new Date() })
      .returning();
    return newChallenge;
  }

  async getActiveWritingChallenges(): Promise<WritingChallenge[]> {
    return await db.select()
      .from(writingChallenges)
      .where(gt(writingChallenges.endDate, new Date()))
      .orderBy(desc(writingChallenges.startDate));
  }

  async submitChallengeEntry(entry: InsertChallengeEntry): Promise<ChallengeEntry> {
    const [newEntry] = await db.insert(challengeEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getChallengeEntries(challengeId: number): Promise<ChallengeEntry[]> {
    return await db.select()
      .from(challengeEntries)
      .where(eq(challengeEntries.challengeId, challengeId))
      .orderBy(desc(challengeEntries.submissionDate));
  }

  // Content Protection Implementation
  async addContentProtection(protection: InsertContentProtection): Promise<ContentProtection> {
    const [newProtection] = await db.insert(contentProtection)
      .values({ ...protection, createdAt: new Date() })
      .returning();
    return newProtection;
  }

  async checkContentSimilarity(content: string): Promise<boolean> {
    try {
      // TODO: Implement similarity checking logic
      console.log('[Storage] Checking content similarity');
      return Promise.resolve(false);
    } catch (error) {
      console.error('[Storage] Error checking content similarity:', error);
      throw error;
    }
  }

  async reportContent(report: InsertReportedContent): Promise<ReportedContent> {
    const [newReport] = await db.insert(reportedContent)
      .values({ ...report, createdAt: new Date() })
      .returning();
    return newReport;
  }

  async getReportedContent(status: string = 'pending'): Promise<ReportedContent[]> {
    return await db.select()
      .from(reportedContent)
      .where(eq(reportedContent.status, status))
      .orderBy(desc(reportedContent.createdAt));
  }

  async updateReportedContent(id: number, status: string): Promise<ReportedContent> {
    try {
      console.log(`[Storage] Updating reported content ${id} to status: ${status}`);
      const [updatedReport] = await db.update(reportedContent)
        .set({ status })
        .where(eq(reportedContent.id, id))
        .returning();

      if (!updatedReport) {
        throw new Error("Reported content not found");
      }

      return updatedReport;
    } catch (error) {
      console.error('[Storage] Error updating reported content:', error);
      throw error;
    }
  }

  // Tips System Implementation
  async createTip(tip: InsertAuthorTip): Promise<AuthorTip> {
    const [newTip] = await db.insert(authorTips)
      .values({ ...tip, createdAt: new Date() })
      .returning();

    await this.updateAuthorStats(tip.authorId);
    return newTip;
  }

  async getAuthorTips(authorId: number): Promise<AuthorTip[]> {
    return await db.select()
      .from(authorTips)
      .where(eq(authorTips.authorId, authorId))
      .orderBy(desc(authorTips.createdAt));
  }

  async getTotalTipsReceived(authorId: number): Promise<number> {
    const [result] = await db.select({
      total: sql<string>`sum(amount)`
    })
      .from(authorTips)
      .where(eq(authorTips.authorId, authorId));

    return Number(result.total) || 0;
  }


  // Webhooks Implementation
  async registerWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [newWebhook] = await db.insert(webhooks)
      .values({ ...webhook, createdAt: new Date() })
      .returning();
    return newWebhook;
  }

  async getActiveWebhooks(): Promise<Webhook[]> {
    return await db.select()
      .from(webhooks)
      .where(eq(webhooks.active, true));
  }

  async updateWebhookStatus(id: number, active: boolean): Promise<void> {
    await db.update(webhooks)
      .set({ active })
      .where(eq(webhooks.id, id));
  }

  // Fix for updateAnalytics
  async updateAnalytics(postId: number, data: Partial<Analytics>): Promise<Analytics> {
    const existingAnalytics = await db.select()
      .from(analytics)
      .where(eq(analytics.postId, postId))
      .limit(1);

    if (existingAnalytics.length > 0) {
      const [updated] = await db.update(analytics)
        .set({
          pageViews: data.pageViews,
          uniqueVisitors: data.uniqueVisitors,
          averageReadTime: data.averageReadTime,
          bounceRate: data.bounceRate,
          deviceStats: data.deviceStats,
          updatedAt: new Date()
        })
        .where(eq(analytics.postId, postId))
        .returning();
      return updated;
    } else {
      const [newAnalytics] = await db.insert(analytics)
        .values({
          postId,
          pageViews: data.pageViews ?? 0,
          uniqueVisitors: data.uniqueVisitors ?? 0,
          averageReadTime: data.averageReadTime ?? 0,
          bounceRate: data.bounceRate ?? 0,
          deviceStats: data.deviceStats ?? {},
          updatedAt: new Date()
        })
        .returning();
      return newAnalytics;
    }
  }

  async getPostAnalytics(postId: number): Promise<Analytics | undefined> {
    const [postAnalytics] = await db.select()
      .from(analytics)
      .where(eq(analytics.postId, postId))
      .limit(1);
    return postAnalytics;
  }

  async getSiteAnalytics(): Promise<{ 
    totalViews: number; 
    uniqueVisitors: number; 
    avgReadTime: number;
    bounceRate: number;
    trendingPosts: any[];
    activeUsers: number;
    newUsers: number;
    adminCount: number;
  }> {
    const [result] = await db.select({
      totalViews: sql`sum(${analytics.pageViews})`,
      uniqueVisitors: sql`sum(${analytics.uniqueVisitors})`,
      avgReadTime: avg(analytics.averageReadTime)
    })
      .from(analytics);
      
    // Count active users (estimate as 70% of unique visitors)
    const activeUsers = Math.round((Number(result.uniqueVisitors) || 0) * 0.7);
    
    // Get recent posts as trending posts
    const trendingPosts = await db.select({
      id: postsTable.id,
      title: postsTable.title,
      slug: postsTable.slug,
      views: sql`random() * 100`  // Just a placeholder, in a real app this would be the actual view count
    })
    .from(postsTable)
    .orderBy(desc(postsTable.createdAt))
    .limit(5);
    
    // Count admin users
    const [adminCount] = await db.select({
      count: count(users.id)
    })
    .from(users)
    .where(eq(users.isAdmin, true));

    // Get admin count or default to 1 if error
    let adminCountValue = 1;
    try {
      adminCountValue = adminCount?.count || 1;
    } catch (error) {
      console.error("Error accessing admin count:", error);
    }
    
    // Calculate new users within the last week (estimate as 10% of unique visitors)
    const newUsers = Math.round((Number(result.uniqueVisitors) || 0) * 0.1);
    
    return {
      totalViews: Number(result.totalViews) || 0,
      uniqueVisitors: Number(result.uniqueVisitors) || 0,
      avgReadTime: Number(result.avgReadTime) || 0,
      bounceRate: 0.35, // Default realistic bounce rate
      trendingPosts: trendingPosts || [],
      activeUsers: activeUsers || 0,
      newUsers: newUsers || 0,
      adminCount: Number(adminCountValue) || 1
    };
  }

  // Admin operations
  async getPendingPosts(): Promise<Post[]> {
    const posts = await db.select()
      .from(postsTable)
      .where(eq(sql`metadata->>'status'`, 'pending'))
      .orderBy(desc(postsTable.createdAt));

    return posts.map(post => ({
      ...post,
      createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
    }));
  }

  async approvePost(postId: number): Promise<Post> {
    const [post] = await db.update(postsTable)
      .set({
        metadata: sql`jsonb_set(metadata, '{status}', '"approved"')`
      })
      .where(eq(postsTable.id, postId))
      .returning();

    if (!post) {
      throw new Error("Post not found");
    }

    return {
      ...post,
      createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
    };
  }

  // Admin notification methods
  async createAdminNotification(notification: InsertAdminNotification): Promise<AdminNotification> {
    const [newNotification] = await db.insert(adminNotifications)
      .values({ ...notification, createdAt: new Date() })
      .returning();
    return newNotification;
  }

  async getUnreadAdminNotifications(): Promise<AdminNotification[]> {
    return await db.select()
      .from(adminNotifications)
      .where(eq(adminNotifications.isRead, false))
      .orderBy(desc(adminNotifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db.update(adminNotifications)
      .set({ isRead: true })
      .where(eq(adminNotifications.id, notificationId));
  }

  // Site settings methods
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select()
      .from(siteSettings)
      .orderBy(siteSettings.category);
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const [updated] = await db.update(siteSettings)
      .set({ 
        value,
        updatedAt: new Date()
      })
      .where(eq(siteSettings.key, key))
      .returning();

    if (!updated) {
      throw new Error("Setting not found");
    }

    return updated;
  }

  // Activity logging
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLogs)
      .values({ ...activity, createdAt: new Date() })
      .returning();
    return newActivity;
  }

  async getRecentActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return await db.select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
  async getAnalyticsSummary() {
    try {
      console.log('[Storage] Fetching analytics summary');
      
      // Use column names from the analytics table
      const analyticsResult = await db
        .select({
          totalViews: sql`SUM("page_views")`,
          uniqueVisitors: sql`SUM("unique_visitors")`,
          avgReadTime: sql`AVG("average_read_time")`,
          bounceRate: sql`AVG("bounce_rate")`
        })
        .from(analytics);

      // Get additional reading time metrics from performance_metrics
      const readTimeResult = await db
        .select({
          avgReadTime: sql`AVG("value")`
        })
        .from(performanceMetrics)
        .where(eq(performanceMetrics.metricName, 'timeOnPage'));

      // If we don't have any data yet, return zeros
      if (!analyticsResult[0]) {
        return {
          totalViews: 0,
          uniqueVisitors: 0,
          avgReadTime: 0,
          bounceRate: 0
        };
      }

      return {
        totalViews: Number(analyticsResult[0].totalViews) || 0,
        uniqueVisitors: Number(analyticsResult[0].uniqueVisitors) || 0,
        avgReadTime: Number(analyticsResult[0].avgReadTime) || 
                    Number(readTimeResult[0]?.avgReadTime) || 0,
        bounceRate: Number(analyticsResult[0].bounceRate) || 0,
      };
    } catch (error) {
      console.error('[Storage] Error fetching analytics summary:', error);
      
      // Return default values on error so the UI doesn't break
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        avgReadTime: 0,
        bounceRate: 0
      };
    }
  }

  async getDeviceDistribution() {
    try {
      console.log('[Storage] Fetching device distribution');
      
      // Use the JSON device_stats field instead of device_type
      const analyticsData = await db
        .select({
          deviceStats: analytics.deviceStats
        })
        .from(analytics);
      
      // Initialize default distribution
      const distribution = {
        desktop: 0,
        mobile: 0,
        tablet: 0
      };
      
      // If there's no data, return default distribution
      if (analyticsData.length === 0) {
        return distribution;
      }
      
      // Process device stats data
      let totalDevices = 0;
      let deviceCounts = {
        desktop: 0,
        mobile: 0,
        tablet: 0
      };
      
      // Aggregate device counts from all analytics records
      analyticsData.forEach(record => {
        const stats = record.deviceStats as any;
        if (stats && typeof stats === 'object') {
          if (stats.desktop) deviceCounts.desktop += Number(stats.desktop) || 0;
          if (stats.mobile) deviceCounts.mobile += Number(stats.mobile) || 0;
          if (stats.tablet) deviceCounts.tablet += Number(stats.tablet) || 0;
        }
      });
      
      // Calculate total devices
      totalDevices = deviceCounts.desktop + deviceCounts.mobile + deviceCounts.tablet;
      if (totalDevices === 0) totalDevices = 1; // Avoid division by zero
      
      // Calculate proportions
      distribution.desktop = deviceCounts.desktop / totalDevices;
      distribution.mobile = deviceCounts.mobile / totalDevices;
      distribution.tablet = deviceCounts.tablet / totalDevices;
      
      return distribution;
    } catch (error) {
      console.error('[Storage] Error fetching device distribution:', error);
      // Return default distribution instead of throwing error
      return {
        desktop: 0.7, // Reasonable defaults
        mobile: 0.25,
        tablet: 0.05
      };
    }
  }
  // Achievement methods removed

  async getUserPosts(userId: number): Promise<Post[]> {
    try {
      console.log(`[Storage] Fetching posts for user: ${userId}`);
      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.authorId, userId))
        .orderBy(desc(postsTable.createdAt));

      return posts;
    } catch (error) {
      console.error('[Storage] Error fetching user posts:', error);
      throw error;
    }
  }

  /**
   * Get all comments made by a specific user
   * Used for user data export functionality
   */
  async getUserComments(userId: number): Promise<Comment[]> {
    try {
      console.log(`[Storage] Fetching comments for user: ${userId}`);
      
      const userComments = await db.select()
        .from(comments)
        .where(eq(comments.userId, userId.toString()))
        .orderBy(desc(comments.createdAt));
      
      console.log(`[Storage] Found ${userComments.length} comments for user: ${userId}`);
      return userComments;
    } catch (error) {
      console.error('Error getting user comments:', error);
      return [];
    }
  }
  
  /**
   * Get user's reading history
   * Used for user data export functionality
   */
  async getUserReadingHistory(userId: number): Promise<ReadingProgress[]> {
    try {
      console.log(`[Storage] Fetching reading history for user: ${userId}`);
      
      const readingHistory = await db.select()
        .from(readingProgress)
        .where(eq(readingProgress.userId, userId))
        .orderBy(desc(readingProgress.lastReadAt));
      
      console.log(`[Storage] Found ${readingHistory.length} reading history entries for user: ${userId}`);
      return readingHistory;
    } catch (error) {
      console.error('Error getting user reading history:', error);
      return [];
    }
  }
  
  /**
   * Get user's activity log
   * Used for user data export functionality
   */
  async getUserActivity(userId: number): Promise<ActivityLog[]> {
    try {
      console.log(`[Storage] Fetching activity logs for user: ${userId}`);
      
      const userLogs = await db.select()
        .from(activityLogs)
        .where(eq(activityLogs.userId, userId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(100); // Limit to reasonable amount
      
      console.log(`[Storage] Found ${userLogs.length} activity logs for user: ${userId}`);
      return userLogs;
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      return [];
    }
  }
  
  async getUserTotalLikes(userId: number): Promise<number> {
    try {
      console.log(`[Storage] Calculating total likes for user: ${userId}`);
      const [result] = await db.select({
        totalLikes: sql<number>`COUNT(*)`
      })
        .from(postLikes)
        .innerJoin(postsTable, eq(postLikes.postId, postsTable.id))
        .where(and(
          eq(postsTable.authorId, userId),
          eq(postLikes.isLike, true)
        ));

      return result?.totalLikes || 0;
    } catch (error) {
      console.error('[Storage] Error calculating user total likes:', error);
      throw error;
    }
  }

  async getPostById(id: number): Promise<Post | undefined> {
    try {
      console.log(`[Storage] Getting post by ID: ${id}`);
      const [post] = await db.select()
        .from(postsTable)
        .where(eq(postsTable.id, id))
        .limit(1);

      if (!post) {
        console.log(`[Storage] No post found with ID: ${id}`);
        return undefined;
      }

      console.log(`[Storage] Found post:`, post);
      return {
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
      };
    } catch (error) {
      console.error(`[Storage] Error getting post by ID ${id}:`, error);
      throw error;
    }
  }
  async storePerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    try {
      console.log('[Storage] Storing performance metric:', {
        name: metric.metricName,
        value: metric.value,
        url: metric.url
      });

      // Validate metric data before insertion
      if (!metric.metricName || Number.isNaN(metric.value)) {
        throw new Error('Invalid metric data: metric name and value are required');
      }

      const [newMetric] = await db.insert(performanceMetrics)
        .values({
          ...metric,
          timestamp: new Date()
        })
        .returning();

      return newMetric;
    } catch (error) {
      console.error('[Storage] Error storing performance metric:', error);
      throw new Error('Failed to store performance metric');
    }
  }
  async getAdminInfo(): Promise<{
    totalPosts: number;
    totalUsers: number;
    totalComments: number;
    totalLikes: number;
    recentActivity: ActivityLog[];
  }> {
    try {
      const [[postCount], [userCount], [commentCount], [likeCount], recentActivity] = await Promise.all([
        db.select({ count: count() }).from(postsTable),
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(comments),
        db.select({ count: count() }).from(postLikes).where(eq(postLikes.isLike, true)),
        db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(10)
      ]);

      return {
        totalPosts: Number(postCount.count || 0),
        totalUsers: Number(userCount.count || 0),
        totalComments: Number(commentCount.count || 0),
        totalLikes: Number(likeCount.count || 0),
        recentActivity
      };
    } catch (error) {
      console.error("Error getting admin info:", error);
      throw new Error("Failed to fetch admin information");
    }
  }
  
  // New methods for real metrics analysis
  
  async getPerformanceMetricsByType(metricType: string): Promise<PerformanceMetric[]> {
    try {
      // For metricType, we can check partial matches (e.g., 'interaction' will match 'interaction_click', 'interaction_scroll', etc.)
      return await db.select()
        .from(performanceMetrics)
        .where(sql`metric_name LIKE ${metricType + '%'}`)
        .orderBy(desc(performanceMetrics.timestamp))
        .limit(1000);
    } catch (error) {
      console.error(`[Storage] Error getting metrics by type ${metricType}:`, error);
      return [];
    }
  }
  
  async getUniqueUserCount(): Promise<number> {
    try {
      // This is a simple approximation by counting unique identifiers from the last 30 days
      // In a real implementation with user authentication, you would count users with activity
      const result = await db.select({
        count: sql<number>`COUNT(DISTINCT identifier)`
      })
      .from(performanceMetrics)
      .where(
        and(
          sql`timestamp > NOW() - INTERVAL '30 days'`,
          eq(performanceMetrics.metricName, 'pageview')
        )
      );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('[Storage] Error getting unique user count:', error);
      return 0;
    }
  }
  
  async getActiveUserCount(): Promise<number> {
    try {
      // Count users with activity in the last 7 days
      const result = await db.select({
        count: sql<number>`COUNT(DISTINCT identifier)`
      })
      .from(performanceMetrics)
      .where(
        and(
          sql`timestamp > NOW() - INTERVAL '7 days'`,
          eq(performanceMetrics.metricName, 'pageview')
        )
      );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('[Storage] Error getting active user count:', error);
      return 0;
    }
  }
  
  async getReturningUserCount(): Promise<number> {
    try {
      // Count identifiers that appear multiple times within the last 30 days
      // This is a simplified approach that counts returning visitors
      const result = await db.execute(sql`
        SELECT COUNT(DISTINCT identifier) as count
        FROM (
          SELECT identifier, COUNT(*) as visit_count
          FROM performance_metrics
          WHERE metric_name = 'pageview'
          AND timestamp > NOW() - INTERVAL '30 days'
          GROUP BY identifier
          HAVING COUNT(*) > 1
        ) as returning_visitors
      `);
      
      return result.rows[0]?.count || 0;
    } catch (error) {
      console.error('[Storage] Error getting returning user count:', error);
      return 0;
    }
  }

  // Bookmark methods implementation
  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    try {
      console.log(`[Storage] Creating bookmark for user ${bookmark.userId} and post ${bookmark.postId}`);
      
      // Check if bookmark already exists
      const existingBookmark = await this.getBookmark(bookmark.userId, bookmark.postId);
      if (existingBookmark) {
        console.log(`[Storage] Bookmark already exists, updating instead`);
        return this.updateBookmark(bookmark.userId, bookmark.postId, bookmark);
      }
      
      // Create new bookmark
      const [newBookmark] = await db.insert(bookmarks)
        .values({
          ...bookmark,
          createdAt: new Date()
        })
        .returning();
      
      console.log(`[Storage] Bookmark created successfully with ID: ${newBookmark.id}`);
      return newBookmark;
    } catch (error) {
      console.error("Error in createBookmark:", error);
      if (error instanceof Error) {
        if (error.message.includes('foreign key')) {
          throw new Error("Invalid user ID or post ID provided");
        }
      }
      throw new Error("Failed to create bookmark");
    }
  }

  async getBookmark(userId: number, postId: number): Promise<Bookmark | undefined> {
    try {
      const [bookmark] = await db.select()
        .from(bookmarks)
        .where(and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.postId, postId)
        ))
        .limit(1);
      
      return bookmark;
    } catch (error) {
      console.error("Error in getBookmark:", error);
      throw new Error("Failed to fetch bookmark");
    }
  }

  async getUserBookmarks(userId: number): Promise<(Bookmark & { post: Post })[]> {
    try {
      // First get all bookmarks for the user
      const userBookmarks = await db.select()
        .from(bookmarks)
        .where(eq(bookmarks.userId, userId))
        .orderBy(desc(bookmarks.createdAt));
      
      // If no bookmarks, return empty array
      if (!userBookmarks.length) {
        return [];
      }
      
      // Get all post IDs from the bookmarks
      const postIds = userBookmarks.map(bookmark => bookmark.postId);
      
      // Fetch all posts in a single query
      const bookmarkedPosts = await db.select()
        .from(postsTable)
        .where(inArray(postsTable.id, postIds));
      
      // Create a map of post IDs to posts for quick lookups
      const postsMap = new Map<number, Post>();
      bookmarkedPosts.forEach(post => {
        postsMap.set(post.id, {
          ...post,
          createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
        });
      });
      
      // Combine bookmarks with their corresponding posts
      return userBookmarks.map(bookmark => ({
        ...bookmark,
        post: postsMap.get(bookmark.postId)!,
        createdAt: bookmark.createdAt instanceof Date ? bookmark.createdAt : new Date(bookmark.createdAt)
      }));
    } catch (error) {
      console.error("Error in getUserBookmarks:", error);
      throw new Error("Failed to fetch user bookmarks");
    }
  }

  async updateBookmark(userId: number, postId: number, data: Partial<InsertBookmark>): Promise<Bookmark> {
    try {
      // Remove user and post IDs from the update data as those are used for the where clause
      const { userId: _, postId: __, ...updateData } = data;
      
      const [updatedBookmark] = await db.update(bookmarks)
        .set(updateData)
        .where(and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.postId, postId)
        ))
        .returning();
      
      if (!updatedBookmark) {
        throw new Error("Bookmark not found");
      }
      
      return updatedBookmark;
    } catch (error) {
      console.error("Error in updateBookmark:", error);
      if (error instanceof Error && error.message === "Bookmark not found") {
        throw error;
      }
      throw new Error("Failed to update bookmark");
    }
  }

  async deleteBookmark(userId: number, postId: number): Promise<void> {
    try {
      const result = await db.delete(bookmarks)
        .where(and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.postId, postId)
        ))
        .returning();
      
      if (!result.length) {
        throw new Error("Bookmark not found");
      }
    } catch (error) {
      console.error("Error in deleteBookmark:", error);
      if (error instanceof Error && error.message === "Bookmark not found") {
        throw error; 
      }
      throw new Error("Failed to delete bookmark");
    }
  }

  async getBookmarksByTag(userId: number, tag: string): Promise<(Bookmark & { post: Post })[]> {
    try {
      // Get all bookmarks that contain the tag for this user
      const userBookmarks = await db.select()
        .from(bookmarks)
        .where(and(
          eq(bookmarks.userId, userId),
          sql`${bookmarks.tags} @> ARRAY[${tag}]` // PostgreSQL array contains operator
        ))
        .orderBy(desc(bookmarks.createdAt));
      
      // If no bookmarks with this tag, return empty array
      if (!userBookmarks.length) {
        return [];
      }
      
      // Get all post IDs from the bookmarks
      const postIds = userBookmarks.map(bookmark => bookmark.postId);
      
      // Fetch all posts in a single query
      const bookmarkedPosts = await db.select()
        .from(postsTable)
        .where(inArray(postsTable.id, postIds));
      
      // Create a map of post IDs to posts for quick lookups
      const postsMap = new Map<number, Post>();
      bookmarkedPosts.forEach(post => {
        postsMap.set(post.id, {
          ...post,
          createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
        });
      });
      
      // Combine bookmarks with their corresponding posts
      return userBookmarks.map(bookmark => ({
        ...bookmark,
        post: postsMap.get(bookmark.postId)!,
        createdAt: bookmark.createdAt instanceof Date ? bookmark.createdAt : new Date(bookmark.createdAt)
      }));
    } catch (error) {
      console.error("Error in getBookmarksByTag:", error);
      throw new Error("Failed to fetch bookmarks by tag");
    }
  }

  // User Feedback methods
  async submitFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    try {
      console.log('[Storage] Submitting user feedback:', feedback.type);
      
      // Extract extended fields that aren't directly in the schema
      const browser = feedback.browser || "unknown";
      const operatingSystem = feedback.operatingSystem || "unknown";
      const screenResolution = feedback.screenResolution || "unknown";
      const userAgent = feedback.userAgent || "unknown";
      
      // Create metadata object
      const metadataObject = {
        browser,
        operatingSystem,
        screenResolution,
        userAgent
      };
      
      // Prepare the data for insertion
      const insertData = {
        type: feedback.type,
        content: feedback.content,
        // rating field removed
        page: feedback.page || "unknown",
        status: feedback.status || "pending",
        userId: feedback.userId || null,
        category: feedback.category || "general",
        browser: browser,
        operatingSystem: operatingSystem,
        screenResolution: screenResolution,
        userAgent: userAgent,
        metadata: metadataObject,
        createdAt: new Date()
      };
      
      // Insert the feedback
      const [newFeedback] = await db.insert(userFeedback)
        .values(insertData)
        .returning();
      
      console.log('[Storage] Feedback submitted successfully, ID:', newFeedback.id);
      return newFeedback;
    } catch (error) {
      console.error('[Storage] Error submitting feedback:', error);
      throw new Error('Failed to submit feedback');
    }
  }

  async getFeedback(id: number): Promise<UserFeedback | undefined> {
    try {
      // Explicitly type the result
      const results: UserFeedback[] = await db.select()
        .from(userFeedback)
        .where(eq(userFeedback.id, id))
        .limit(1);
      
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error('[Storage] Error fetching feedback:', error);
      throw new Error('Failed to fetch feedback');
    }
  }

  async getAllFeedback(limit: number = 50, status: string = 'all'): Promise<UserFeedback[]> {
    try {
      let feedbackList: UserFeedback[] = [];
      
      if (status === 'all') {
        feedbackList = await db.query.userFeedback.findMany({
          orderBy: (userFeedback, { desc }) => [desc(userFeedback.createdAt)],
          limit: limit
        });
      } else {
        feedbackList = await db.query.userFeedback.findMany({
          where: eq(userFeedback.status, status),
          orderBy: (userFeedback, { desc }) => [desc(userFeedback.createdAt)],
          limit: limit
        });
      }
      
      return feedbackList;
    } catch (error) {
      console.error('[Storage] Error fetching all feedback:', error);
      return [];
    }
  }

  async updateFeedbackStatus(id: number, status: string): Promise<UserFeedback> {
    try {
      console.log(`[Storage] Updating feedback ID ${id} status to ${status}`);
      
      const results = await db.update(userFeedback)
        .set({ status })
        .where(eq(userFeedback.id, id))
        .returning();
      
      if (results.length === 0) {
        throw new Error("Feedback not found");
      }
      
      return results[0];
    } catch (error) {
      console.error('[Storage] Error updating feedback status:', error);
      throw new Error('Failed to update feedback status');
    }
  }

  async getUserFeedback(userId: number): Promise<UserFeedback[]> {
    try {
      console.log(`[Storage] Retrieving feedback for user ID: ${userId}`);
      
      // Using the most efficient query pattern available
      const feedbackList = await db.query.userFeedback.findMany({
        where: eq(userFeedback.userId, userId),
        orderBy: (userFeedbackTable, { desc }) => [desc(userFeedbackTable.createdAt)],
      });
      
      console.log(`[Storage] Found ${feedbackList.length} feedback items for user ${userId}`);
      return feedbackList;
    } catch (error) {
      console.error(`[Storage] Error retrieving user feedback:`, error);
      // Return empty array instead of throwing to prevent cascade failures
      return [];
    }
  }

  // User Privacy Settings methods
  async getUserPrivacySettings(userId: number): Promise<UserPrivacySettings | undefined> {
    try {
      console.log(`[Storage] Retrieving privacy settings for user ID: ${userId}`);
      
      const [settings] = await db.select()
        .from(userPrivacySettings)
        .where(eq(userPrivacySettings.userId, userId))
        .limit(1);
      
      if (settings) {
        console.log(`[Storage] Found privacy settings for user ${userId}`);
      } else {
        console.log(`[Storage] No privacy settings found for user ${userId}`);
      }
      
      return settings;
    } catch (error) {
      console.error(`[Storage] Error retrieving user privacy settings:`, error);
      return undefined;
    }
  }

  async createUserPrivacySettings(userId: number, settings: InsertUserPrivacySettings): Promise<UserPrivacySettings> {
    try {
      console.log(`[Storage] Creating privacy settings for user ID: ${userId}`);
      
      // First check if settings already exist
      const existingSettings = await this.getUserPrivacySettings(userId);
      if (existingSettings) {
        console.log(`[Storage] Privacy settings already exist for user ${userId}, updating instead`);
        return await this.updateUserPrivacySettings(userId, settings);
      }
      
      // Create default settings with user override
      const defaultSettings: InsertUserPrivacySettings = {
        userId: userId,
        profileVisible: settings.profileVisible ?? true,
        shareReadingHistory: settings.shareReadingHistory ?? false,
        anonymousCommenting: settings.anonymousCommenting ?? false,
        twoFactorAuthEnabled: settings.twoFactorAuthEnabled ?? false,
        loginNotifications: settings.loginNotifications ?? true
      };
      
      // Insert the settings
      const [newSettings] = await db.insert(userPrivacySettings)
        .values({
          ...defaultSettings,
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`[Storage] Privacy settings created successfully for user ${userId}`);
      return newSettings;
    } catch (error) {
      console.error(`[Storage] Error creating user privacy settings:`, error);
      throw new Error('Failed to create privacy settings');
    }
  }

  async updateUserPrivacySettings(userId: number, settings: Partial<InsertUserPrivacySettings>): Promise<UserPrivacySettings> {
    try {
      console.log(`[Storage] Updating privacy settings for user ID: ${userId}`);
      
      // Make sure we're not trying to update the userId
      const { userId: _, ...updateData } = settings;
      
      // Get existing settings to ensure they exist
      const existingSettings = await this.getUserPrivacySettings(userId);
      
      if (!existingSettings) {
        console.log(`[Storage] No existing privacy settings for user ${userId}, creating new settings`);
        return await this.createUserPrivacySettings(userId, settings as InsertUserPrivacySettings);
      }
      
      // Update the settings
      const [updatedSettings] = await db.update(userPrivacySettings)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(userPrivacySettings.userId, userId))
        .returning();
      
      if (!updatedSettings) {
        throw new Error('Failed to update privacy settings');
      }
      
      console.log(`[Storage] Privacy settings updated successfully for user ${userId}`);
      return updatedSettings;
    } catch (error) {
      console.error(`[Storage] Error updating user privacy settings:`, error);
      throw new Error('Failed to update privacy settings');
    }
  }
  // Game Save Methods
  async getGameSaves(userId: number): Promise<GameSaveRecord[]> {
    try {
      console.log('[Storage] Fetching game saves for user:', userId);
      
      // Get all saves belonging to the user, ordered by most recent first
      const saves = await db.select()
        .from(gameSaves)
        .where(eq(gameSaves.userId, userId))
        .orderBy(desc(gameSaves.updatedAt));
      
      console.log(`[Storage] Found ${saves.length} game saves for user ${userId}`);
      return saves;
    } catch (error) {
      console.error('[Storage] Error in getGameSaves:', error);
      throw new Error('Failed to fetch game saves');
    }
  }
  
  async getGameSave(saveId: string, userId?: number): Promise<GameSaveRecord | undefined> {
    try {
      console.log(`[Storage] Fetching game save with ID: ${saveId}`);
      
      // Base query
      let query = db.select()
        .from(gameSaves)
        .where(eq(gameSaves.saveId, saveId));
      
      // Add user check if userId is provided (for security)
      if (userId !== undefined) {
        query = query.where(eq(gameSaves.userId, userId));
      }
      
      const [save] = await query.limit(1);
      
      if (save) {
        console.log(`[Storage] Found game save with ID: ${saveId}`);
      } else {
        console.log(`[Storage] No game save found with ID: ${saveId}`);
      }
      
      return save;
    } catch (error) {
      console.error('[Storage] Error in getGameSave:', error);
      throw new Error('Failed to fetch game save');
    }
  }
  
  async createGameSave(save: InsertGameSave): Promise<string> {
    try {
      console.log('[Storage] Creating new game save');
      
      // Insert the save
      const [newSave] = await db.insert(gameSaves)
        .values({
          ...save,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`[Storage] Game save created with ID: ${newSave.saveId}`);
      return newSave.saveId;
    } catch (error) {
      console.error('[Storage] Error in createGameSave:', error);
      throw new Error('Failed to create game save');
    }
  }
  
  async updateGameSave(saveId: string, userId: number | null, data: Partial<InsertGameSave>): Promise<boolean> {
    try {
      console.log(`[Storage] Updating game save with ID: ${saveId}`);
      
      // Base query
      let query = db.update(gameSaves)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(gameSaves.saveId, saveId));
      
      // Add user check if userId is provided (for security)
      if (userId !== null) {
        query = query.where(eq(gameSaves.userId, userId));
      }
      
      const result = await query.returning();
      
      if (result.length > 0) {
        console.log(`[Storage] Game save updated with ID: ${saveId}`);
        return true;
      } else {
        console.log(`[Storage] No game save found with ID: ${saveId} for update`);
        return false;
      }
    } catch (error) {
      console.error('[Storage] Error in updateGameSave:', error);
      throw new Error('Failed to update game save');
    }
  }
  
  async deleteGameSave(saveId: string, userId: number | null): Promise<boolean> {
    try {
      console.log(`[Storage] Deleting game save with ID: ${saveId}`);
      
      // Base query
      let query = db.delete(gameSaves)
        .where(eq(gameSaves.saveId, saveId));
      
      // Add user check if userId is provided (for security)
      if (userId !== null) {
        query = query.where(eq(gameSaves.userId, userId));
      }
      
      const result = await query.returning();
      
      if (result.length > 0) {
        console.log(`[Storage] Game save deleted with ID: ${saveId}`);
        return true;
      } else {
        console.log(`[Storage] No game save found with ID: ${saveId} for deletion`);
        return false;
      }
    } catch (error) {
      console.error('[Storage] Error in deleteGameSave:', error);
      throw new Error('Failed to delete game save');
    }
  }
  
  // Game Progress Methods
  async getGameProgress(userId: number): Promise<GameProgressRecord | undefined> {
    try {
      console.log(`[Storage] Fetching game progress for user: ${userId}`);
      
      const [progress] = await db.select()
        .from(gameProgress)
        .where(eq(gameProgress.userId, userId))
        .limit(1);
      
      if (progress) {
        console.log(`[Storage] Found game progress for user: ${userId}`);
      } else {
        console.log(`[Storage] No game progress found for user: ${userId}`);
      }
      
      return progress;
    } catch (error) {
      console.error('[Storage] Error in getGameProgress:', error);
      throw new Error('Failed to fetch game progress');
    }
  }
  
  async updateGameProgress(userId: number, progressData: InsertGameProgress): Promise<number> {
    try {
      console.log(`[Storage] Updating game progress for user: ${userId}`);
      
      // Check if progress exists for this user
      const existingProgress = await this.getGameProgress(userId);
      
      if (existingProgress) {
        // Update existing progress
        const [updated] = await db.update(gameProgress)
          .set({
            ...progressData,
            updatedAt: new Date()
          })
          .where(eq(gameProgress.userId, userId))
          .returning();
        
        console.log(`[Storage] Updated game progress for user: ${userId}`);
        return updated.id;
      } else {
        // Create new progress
        const [newProgress] = await db.insert(gameProgress)
          .values({
            ...progressData,
            userId,
            updatedAt: new Date()
          })
          .returning();
        
        console.log(`[Storage] Created game progress for user: ${userId}`);
        return newProgress.id;
      }
    } catch (error) {
      console.error('[Storage] Error in updateGameProgress:', error);
      throw new Error('Failed to update game progress');
    }
  }
  
  // Game Stats Methods
  async getGameStats(userId: number): Promise<GameStatsRecord | undefined> {
    try {
      console.log(`[Storage] Fetching game stats for user: ${userId}`);
      
      const [stats] = await db.select()
        .from(gameStats)
        .where(eq(gameStats.userId, userId))
        .limit(1);
      
      if (stats) {
        console.log(`[Storage] Found game stats for user: ${userId}`);
      } else {
        console.log(`[Storage] No game stats found for user: ${userId}`);
      }
      
      return stats;
    } catch (error) {
      console.error('[Storage] Error in getGameStats:', error);
      throw new Error('Failed to fetch game stats');
    }
  }
  
  async updateGameStats(userId: number, statsData: InsertGameStats): Promise<number> {
    try {
      console.log(`[Storage] Updating game stats for user: ${userId}`);
      
      // Check if stats exists for this user
      const existingStats = await this.getGameStats(userId);
      
      if (existingStats) {
        // Update existing stats
        const [updated] = await db.update(gameStats)
          .set({
            ...statsData,
            updatedAt: new Date()
          })
          .where(eq(gameStats.userId, userId))
          .returning();
        
        console.log(`[Storage] Updated game stats for user: ${userId}`);
        return updated.id;
      } else {
        // Create new stats
        const [newStats] = await db.insert(gameStats)
          .values({
            ...statsData,
            userId,
            updatedAt: new Date()
          })
          .returning();
        
        console.log(`[Storage] Created game stats for user: ${userId}`);
        return newStats.id;
      }
    } catch (error) {
      console.error('[Storage] Error in updateGameStats:', error);
      throw new Error('Failed to update game stats');
    }
  }
  
  // Game Scene Methods
  async getGameScenes(): Promise<GameSceneRecord[]> {
    try {
      console.log('[Storage] Fetching all game scenes');
      
      // Only select columns we know exist in the database to avoid SQL errors
      const scenes = await db.select({
        id: gameScenes.id,
        sceneId: gameScenes.sceneId,
        name: gameScenes.name,
        description: gameScenes.description,
        backgroundImage: gameScenes.backgroundImage,
        type: gameScenes.type,
        data: gameScenes.data,
        createdAt: gameScenes.createdAt,
      })
      .from(gameScenes);
        
      console.log(`[Storage] Found ${scenes.length} game scenes`);
      return scenes;
    } catch (error) {
      console.error('[Storage] Error in getGameScenes:', error);
      
      // Return empty array instead of throwing to make the API more resilient
      console.log('[Storage] Returning empty array due to error');
      return [];
    }
  }

  async getGameScene(sceneId: string): Promise<GameSceneRecord | undefined> {
    try {
      console.log(`[Storage] Fetching game scene with ID: ${sceneId}`);
      
      // Only select columns we know exist in the database to avoid SQL errors
      const [scene] = await db.select({
        id: gameScenes.id,
        sceneId: gameScenes.sceneId,
        name: gameScenes.name,
        description: gameScenes.description,
        backgroundImage: gameScenes.backgroundImage,
        type: gameScenes.type,
        data: gameScenes.data,
        createdAt: gameScenes.createdAt,
      })
      .from(gameScenes)
      .where(eq(gameScenes.sceneId, sceneId))
      .limit(1);
      
      if (scene) {
        console.log(`[Storage] Found game scene with ID: ${sceneId}`);
      } else {
        console.log(`[Storage] No game scene found with ID: ${sceneId}`);
      }
      
      return scene;
    } catch (error) {
      console.error(`[Storage] Error fetching game scene ${sceneId}:`, error);
      // Return undefined instead of throwing for more resilient API
      return undefined;
    }
  }

  // Game Item Methods
  async getGameItems(): Promise<GameItemRecord[]> {
    try {
      console.log('[Storage] Fetching all game items');
      
      try {
        // Check if image_url column exists to prevent SQL errors
        const result = await db.execute(sql`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'game_items'
            AND column_name = 'image_url'
        `);
        
        const hasImageUrlColumn = result.rows.length > 0;
        
        // Dynamically build select object based on existing columns
        const selectObj: any = {
          id: gameItems.id,
          itemId: gameItems.itemId,
          name: gameItems.name,
          type: gameItems.type,
          description: gameItems.description,
          data: gameItems.data,
          createdAt: gameItems.createdAt,
        };
        
        // Only include imageUrl if the column exists
        if (hasImageUrlColumn) {
          selectObj.imageUrl = gameItems.imageUrl;
        }
        
        const items = await db.select(selectObj).from(gameItems);
        
        // If imageUrl column doesn't exist but the schema expects it, add null values
        if (!hasImageUrlColumn) {
          items.forEach(item => {
            (item as any).imageUrl = null;
          });
        }
            
        console.log(`[Storage] Found ${items.length} game items`);
        return items;
      } catch (innerError) {
        console.error('[Storage] Error in dynamic column selection:', innerError);
        
        // Fallback to basic query with minimum required columns
        const basicItems = await db.select({
          id: gameItems.id,
          itemId: gameItems.itemId,
          name: gameItems.name,
          data: gameItems.data,
        })
        .from(gameItems);
        
        // Add missing properties to match schema expectations
        const completeItems = basicItems.map(item => ({
          ...item,
          type: null,
          description: null,
          imageUrl: null,
          createdAt: new Date(),
        }));
        
        console.log(`[Storage] Found ${completeItems.length} game items (with fallback query)`);
        return completeItems;
      }
    } catch (error) {
      console.error('[Storage] Error in getGameItems:', error);
      // Return empty array instead of throwing for more resilient API
      console.log('[Storage] Returning empty array due to error');
      return [];
    }
  }

  async getGameItem(itemId: string): Promise<GameItemRecord | undefined> {
    try {
      console.log(`[Storage] Fetching game item with ID: ${itemId}`);
      
      try {
        // Check if image_url column exists to prevent SQL errors
        const result = await db.execute(sql`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'game_items'
            AND column_name = 'image_url'
        `);
        
        const hasImageUrlColumn = result.rows.length > 0;
        
        // Dynamically build select object based on existing columns
        const selectObj: any = {
          id: gameItems.id,
          itemId: gameItems.itemId,
          name: gameItems.name,
          type: gameItems.type,
          description: gameItems.description,
          data: gameItems.data,
          createdAt: gameItems.createdAt,
        };
        
        // Only include imageUrl if the column exists
        if (hasImageUrlColumn) {
          selectObj.imageUrl = gameItems.imageUrl;
        }
        
        const [item] = await db.select(selectObj)
          .from(gameItems)
          .where(eq(gameItems.itemId, itemId))
          .limit(1);
        
        // If imageUrl column doesn't exist but the schema expects it, add null value
        if (item && !hasImageUrlColumn) {
          (item as any).imageUrl = null;
        }
        
        if (item) {
          console.log(`[Storage] Found game item with ID: ${itemId}`);
          return item;
        } else {
          console.log(`[Storage] No game item found with ID: ${itemId}`);
          return undefined;
        }
      } catch (innerError) {
        console.error('[Storage] Error in dynamic column selection:', innerError);
        
        // Fallback to basic query with minimum required columns
        const [basicItem] = await db.select({
          id: gameItems.id,
          itemId: gameItems.itemId,
          name: gameItems.name,
          data: gameItems.data,
        })
        .from(gameItems)
        .where(eq(gameItems.itemId, itemId))
        .limit(1);
        
        if (!basicItem) {
          console.log(`[Storage] No game item found with ID: ${itemId} (fallback query)`);
          return undefined;
        }
        
        // Add missing properties to match schema expectations
        const completeItem = {
          ...basicItem,
          type: null,
          description: null,
          imageUrl: null,
          createdAt: new Date(),
        };
        
        console.log(`[Storage] Found game item with ID: ${itemId} (with fallback query)`);
        return completeItem;
      }
    } catch (error) {
      console.error(`[Storage] Error fetching game item ${itemId}:`, error);
      // Return undefined instead of throwing for more resilient API
      return undefined;
    }
  }

  // Implementation of getPostById for fetching posts by ID
  async getPostById(id: number): Promise<Post | undefined> {
    try {
      console.log(`[Storage] Fetching post by ID: ${id}`);
      
      try {
        // Try the standard Drizzle query first
        const [post] = await db.select()
          .from(postsTable)
          .where(eq(postsTable.id, id))
          .limit(1);
          
        if (!post) {
          console.log(`[Storage] Post with ID ${id} not found`);
          return undefined;
        }
        
        console.log(`[Storage] Found post by ID: ${id}, title: ${post.title}`);
        
        return {
          ...post,
          createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
        };
      } catch (queryError: any) {
        console.log("Initial getPostById query failed, trying fallback.", queryError.message);
        
        // If standard query fails, fall back to SQL for schema flexibility
        if (queryError.message && (
            queryError.message.includes("column") || 
            queryError.message.includes("does not exist"))) {
          console.log("Using fallback SQL query for getPostById.");
          
          // Fallback to raw SQL query that only selects columns we know exist
          const result = await db.execute(sql`
            SELECT 
              id, title, content, slug, excerpt, author_id,
              metadata, created_at, is_secret, mature_content,
              theme_category, reading_time_minutes,
              likes_count, dislikes_count, "isAdminPost"
            FROM posts 
            WHERE id = ${id}
            LIMIT 1
          `);
          
          const rows = result.rows;
          if (!rows || rows.length === 0) {
            console.log(`[Storage] Post with ID ${id} not found in fallback query`);
            return undefined;
          }
          
          const post = rows[0];
          console.log(`[Storage] Found post by ID in fallback: ${id}, title: ${post.title}`);
          
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            slug: post.slug,
            excerpt: post.excerpt,
            authorId: post.author_id,
            isSecret: post.is_secret || false,
            matureContent: post.mature_content || false,
            themeCategory: post.theme_category,
            metadata: post.metadata || {},
            createdAt: post.created_at instanceof Date ? post.created_at : new Date(post.created_at),
            readingTimeMinutes: post.reading_time_minutes || Math.ceil(post.content.length / 1000),
            likesCount: post.likes_count || 0,
            dislikesCount: post.dislikes_count || 0,
            isAdminPost: post.isAdminPost || false
          };
        } else {
          // If it's another type of error, rethrow it
          throw queryError;
        }
      }
    } catch (error) {
      console.error('[Storage] Error in getPostById:', error);
      throw new Error('Failed to fetch post by ID');
    }
  }

  // Delete duplicate implementation as they're already added above
}

/**
 * In-memory storage implementation for testing and development
 */
export class MemStorage implements IStorage {
  private users: User[] = [];
  private posts: Post[] = [];
  private comments: Comment[] = [];
  private userPreferences: UserPreference[] = [];
  private bookmarks: Bookmark[] = [];
  private userFeedback: UserFeedback[] = [];
  private gameScenes: any[] = []; // Using any for simplicity in mock data
  
  private nextUserId = 1;
  private nextPostId = 101;
  private nextCommentId = 1001;
  private nextBookmarkId = 1;
  private nextFeedbackId = 1;
  
  constructor() {
    console.log('[MemStorage] Initializing in-memory storage');
    this.seedSampleData();
  }
  
  // Sample data seeding for development and testing
  private seedSampleData() {
    // Add a sample admin user
    this.users.push({
      id: this.nextUserId++,
      username: 'admin',
      email: 'admin@example.com',
      password: '$2b$10$X4kv7j5ZcG39Wgog.Oan1uXsR7.Otyks4S.8O242XXIhq9GH8kU0y', // hash for 'password123'
      isAdmin: true,
      createdAt: new Date(),
      displayName: 'Admin User',
      bio: 'System administrator',
      avatar: null,
      metadata: {},
      verified: true
    });
    
    // Add a sample regular user
    this.users.push({
      id: this.nextUserId++,
      username: 'user',
      email: 'user@example.com',
      password: '$2b$10$X4kv7j5ZcG39WgogOan1uXsR7.Otyks4S.8O242XXIhq9GH8kU0y', // hash for 'password123'
      isAdmin: false,
      createdAt: new Date(),
      displayName: 'Regular User',
      bio: 'Just a reader',
      avatar: null,
      metadata: {},
      verified: true
    });
    
    // Sample posts
    this.posts.push({
      id: this.nextPostId++,
      title: 'Welcome to Bubble\'s Cafe',
      content: 'This is a sample post created by the in-memory storage for testing.',
      slug: 'welcome-to-bubbles-cafe',
      excerpt: 'A sample post for testing purposes.',
      authorId: 1,
      isSecret: false,
      isAdminPost: true,
      matureContent: false,
      themeCategory: 'introduction',
      metadata: {
        themeIcon: null
      },
      createdAt: new Date(),
      readingTimeMinutes: 3,
      likesCount: 5,
      dislikesCount: 0
    });
    
    // More sample posts with horror themes
    this.posts.push({
      id: this.nextPostId++,
      title: 'The Whispers in the Dark',
      content: 'Long sample content with a horror story about whispers heard at night...',
      slug: 'the-whispers-in-the-dark',
      excerpt: 'A tale of terror that unfolds in the silence of night.',
      authorId: 1,
      isSecret: false,
      isAdminPost: true,
      matureContent: true,
      themeCategory: 'psychological',
      metadata: {
        themeIcon: 'ghost'
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      readingTimeMinutes: 8,
      likesCount: 12,
      dislikesCount: 2
    });
    
    // Add sample game scenes
    this.gameScenes = [
      {
        sceneId: 'village_entrance',
        name: "Village Entrance",
        description: "A dilapidated wooden sign reading 'Eden's Hollow' creaks in the wind.",
        backgroundImage: "/assets/eden/scenes/village_entrance.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_square", label: "Enter the village" }
          ],
          items: [],
          characters: []
        }
      },
      {
        sceneId: 'village_square',
        name: "Village Square",
        description: "A once-bustling village square now stands eerily empty.",
        backgroundImage: "/assets/eden/scenes/village_square.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_entrance", label: "Return to entrance" },
            { target: "abandoned_church", label: "Visit the church" },
            { target: "old_tavern", label: "Enter the tavern" }
          ],
          items: [],
          characters: []
        }
      }
    ];
  }
  
  // User methods implementation
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const newUser: User = {
      ...insertUser,
      id: this.nextUserId++,
      createdAt: new Date(),
      isAdmin: false,
      displayName: insertUser.username,
      bio: null,
      avatar: null,
      metadata: {},
      verified: false
    };
    
    this.users.push(newUser);
    return newUser;
  }
  
  // Basic implementations for required methods
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }
  
  // Post methods implementation
  async getPosts(): Promise<Post[]> {
    return this.posts;
  }
  
  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return this.posts.find(post => post.slug === slug);
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.find(post => post.id === id);
  }
  
  // Game scene methods
  async getGameScenes(): Promise<any[]> {
    return this.gameScenes;
  }
  
  async getGameScene(sceneId: string): Promise<any | undefined> {
    return this.gameScenes.find(scene => scene.sceneId === sceneId);
  }
  
  // Implement necessary comment methods
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return this.comments.filter(comment => comment.postId === postId);
  }
  
  async getCommentById(id: number): Promise<Comment | undefined> {
    return this.comments.find(comment => comment.id === id);
  }
  
  // Stub implementations for required methods to satisfy the interface
  // These can be expanded as needed
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }
  
  async addPostView(postId: number): Promise<boolean> {
    return true; // Just pretend it succeeded
  }
  
  async getPostViews(postId: number): Promise<number> {
    return Math.floor(Math.random() * 100); // Return a random view count
  }
  
  async createPostReaction(postId: number, userId: number, type: string): Promise<boolean> {
    return true;
  }
  
  async createBookmark(userId: number, postId: number): Promise<Bookmark> {
    const newBookmark: Bookmark = {
      id: this.nextBookmarkId++,
      userId,
      postId,
      createdAt: new Date()
    };
    this.bookmarks.push(newBookmark);
    return newBookmark;
  }
  
  async getBookmarksByUserId(userId: number): Promise<Bookmark[]> {
    return this.bookmarks.filter(bookmark => bookmark.userId === userId);
  }
  
  async deleteBookmark(id: number): Promise<boolean> {
    const index = this.bookmarks.findIndex(bookmark => bookmark.id === id);
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      return true;
    }
    return false;
  }
  
  async getPostBookmarks(postId: number): Promise<number> {
    return this.bookmarks.filter(bookmark => bookmark.postId === postId).length;
  }
  
  async getUserPostBookmark(userId: number, postId: number): Promise<Bookmark | undefined> {
    return this.bookmarks.find(bookmark => bookmark.userId === userId && bookmark.postId === postId);
  }
  
  async createUserFeedback(feedback: UserFeedback): Promise<UserFeedback> {
    const newFeedback: UserFeedback = {
      ...feedback,
      id: this.nextFeedbackId++,
      createdAt: new Date()
    };
    this.userFeedback.push(newFeedback);
    return newFeedback;
  }
  
  async getUserFeedback(): Promise<UserFeedback[]> {
    return this.userFeedback;
  }
  
  // Other required methods with minimal implementations
  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      ...comment,
      id: this.nextCommentId++,
      createdAt: new Date(),
      is_approved: false,
      edited: false,
      editedAt: null,
      metadata: {}
    };
    this.comments.push(newComment);
    return newComment;
  }
  
  // Methods for fallback endpoints
  async getRecentPosts(): Promise<Post[]> {
    try {
      console.log(`[Storage] Fetching recent posts`);
      
      const recentPosts = await db.select()
        .from(postsTable)
        .orderBy(desc(postsTable.createdAt))
        .limit(10);
      
      console.log(`[Storage] Found ${recentPosts.length} recent posts`);
      
      return recentPosts.map(post => ({
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
      }));
    } catch (error) {
      console.error('[Storage] Error in getRecentPosts:', error);
      throw new Error('Failed to fetch recent posts');
    }
  }
  
  async getRecommendedPosts(postId: number | null, limit: number): Promise<Post[]> {
    try {
      console.log(`[Storage] Fetching recommended posts for post ID: ${postId}, limit: ${limit}`);
      
      // If postId is provided, we could get related posts by category, tags, etc.
      // For now, we'll just return recent posts
      const recommendedPosts = await db.select()
        .from(postsTable)
        .orderBy(desc(postsTable.createdAt))
        .limit(limit);
      
      console.log(`[Storage] Found ${recommendedPosts.length} recommended posts`);
      
      return recommendedPosts.map(post => ({
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
      }));
    } catch (error) {
      console.error('[Storage] Error in getRecommendedPosts:', error);
      throw new Error('Failed to fetch recommended posts');
    }
  }
  
  async getPersonalizedRecommendations(userId: number, preferredThemes: string[] = [], limit: number = 5): Promise<Post[]> {
    try {
      console.log(`[Storage] Fetching enhanced personalized recommendations for user ID: ${userId}, limit: ${limit}`);
      const startTime = Date.now(); // For performance tracking
      
      // Implement safe database operation with retry logic
      const safeDbOperation = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
        let lastError;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await operation();
          } catch (error) {
            console.warn(`[Storage] Recommendation query attempt ${attempt + 1} failed:`, error);
            lastError = error;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
          }
        }
        throw lastError;
      };
      
      // Step 1: Get user's reading history (posts they've read)
      const readingHistory = await safeDbOperation(async () => {
        return await db.select()
          .from(readingProgress)
          .where(eq(readingProgress.userId, userId))
          .orderBy(desc(readingProgress.lastReadAt))
          .limit(15); // Increased from 10 to get better history data
      });
      
      // Step 2: Get user's liked posts with additional weight
      const likedPosts = await safeDbOperation(async () => {
        return await db.select()
          .from(postLikes)
          .where(and(
            eq(postLikes.userId, userId),
            eq(postLikes.isLike, true)
          ))
          .limit(15); // Increased from 10 to capture more preferences
      });
      
      // Step 3: Get user's bookmarks
      const userBookmarks = await safeDbOperation(async () => {
        return await db.select()
          .from(bookmarks)
          .where(eq(bookmarks.userId, userId))
          .limit(15); // Increased from 10
      });
      
      // Collect post IDs from user history
      const historyPostIds = new Set([
        ...readingHistory.map(item => item.postId),
        ...likedPosts.map(item => item.postId),
        ...userBookmarks.map(item => item.postId)
      ]);
      
      // If user has no history, fall back to trending posts with theme preferences
      if (historyPostIds.size === 0) {
        console.log(`[Storage] User ${userId} has no history, using trending posts`);
        let query = db.select()
          .from(postsTable)
          .orderBy(desc(postsTable.likesCount), desc(postsTable.createdAt));
        
        // Apply theme filter if preferences exist
        if (preferredThemes.length > 0) {
          query = query.where(
            preferredThemes.map(theme => 
              or(
                like(postsTable.themeCategory, `%${theme}%`),
                sql`${postsTable.metadata}->>'themeCategory' LIKE ${`%${theme}%`}`
              )
            ).reduce((acc, condition) => or(acc, condition))
          );
        }
        
        try {
          const trendingPosts = await safeDbOperation(async () => {
            return await query.limit(limit);
          });
          
          console.log(`[Storage] Found ${trendingPosts.length} trending posts for user ${userId}`);
          
          // Log performance metrics
          const duration = Date.now() - startTime;
          await this.logRecommendationPerformance(userId, 'trending_fallback', trendingPosts.length, duration);
          
          return trendingPosts.map(post => ({
            ...post,
            createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
          }));
        } catch (error) {
          console.error(`[Storage] Error getting trending posts:`, error);
          // Fallback to most recent posts if there's an error
          const recentPosts = await safeDbOperation(async () => {
            return await db.select()
              .from(postsTable)
              .orderBy(desc(postsTable.createdAt))
              .limit(limit);
          });
          return recentPosts.map(post => ({
            ...post,
            createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
          }));
        }
      }
      
      // Step 4: Get content-based recommendations
      // Find posts with similar themes to what the user has engaged with
      const historicalPosts = await safeDbOperation(async () => {
        return await db.select()
          .from(postsTable)
          .where(sql`${postsTable.id} IN (${Array.from(historyPostIds).join(',')})`)
          .limit(25); // Increased from 20 to capture more preferences
      });
      
      // Extract themes from historical posts with weights
      const userThemes = new Map<string, number>();
      historicalPosts.forEach(post => {
        // Basic weight
        let weight = 1;
        
        // Give more weight to posts that were recently read
        const isRecentlyRead = readingHistory.some(item => 
          item.postId === post.id && 
          new Date(item.lastReadAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days
        );
        if (isRecentlyRead) weight += 1;
        
        // Give more weight to posts that were liked
        const isLiked = likedPosts.some(item => item.postId === post.id);
        if (isLiked) weight += 2;
        
        // Give more weight to bookmarked posts
        const isBookmarked = userBookmarks.some(item => item.postId === post.id);
        if (isBookmarked) weight += 1.5;
        
        // Add theme with weight
        if (post.themeCategory) {
          const currentWeight = userThemes.get(post.themeCategory) || 0;
          userThemes.set(post.themeCategory, currentWeight + weight);
        }
        
        // Also check metadata for themeCategory
        if (post.metadata && typeof post.metadata === 'object') {
          const metadata = post.metadata as any;
          if (metadata?.themeCategory) {
            const currentWeight = userThemes.get(metadata.themeCategory) || 0;
            userThemes.set(metadata.themeCategory, currentWeight + weight);
          }
        }
      });
      
      // Sort themes by weight (descending) and take top 5
      const sortedThemes = Array.from(userThemes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme]) => theme);
      
      // Add user preferred themes with high priority
      const allThemes = [...preferredThemes, ...sortedThemes];
      
      // Step 5: Get collaborative filtering recommendations
      // Find users with similar interests and get their liked posts
      const similarUsersPostIds = new Set<number>();
      try {
        // Get users who liked similar posts to this user
        const similarUsers = await safeDbOperation(async () => {
          return await db.select({
            userId: postLikes.userId
          })
            .from(postLikes)
            .where(and(
              inArray(postLikes.postId, Array.from(historyPostIds)),
              eq(postLikes.isLike, true),
              not(eq(postLikes.userId, userId)) // Exclude the current user
            ))
            .groupBy(postLikes.userId)
            .having({ count: count() }, gte(count(), 2)) // Users who liked at least 2 posts
            .limit(10);
        });
        
        if (similarUsers.length > 0) {
          // Get posts liked by similar users that the current user hasn't interacted with
          const similarUsersPosts = await safeDbOperation(async () => {
            return await db.select({
              postId: postLikes.postId
            })
              .from(postLikes)
              .where(and(
                inArray(postLikes.userId, similarUsers.map(user => user.userId)),
                eq(postLikes.isLike, true),
                not(inArray(postLikes.postId, Array.from(historyPostIds)))
              ))
              .groupBy(postLikes.postId)
              .limit(10);
          });
          
          similarUsersPostIds = new Set(similarUsersPosts.map(item => item.postId));
          console.log(`[Storage] Found ${similarUsersPostIds.size} collaborative filtering recommendations`);
        }
      } catch (error) {
        console.warn(`[Storage] Error getting collaborative filtering recommendations:`, error);
        // Continue with other recommendation methods if this one fails
      }
      
      // Step 6: Get content-based recommendations with improved scoring
      let contentBasedRecommendations: Post[] = [];
      try {
        // Query posts based on themes
        let query = db.select()
          .from(postsTable);
        
        if (allThemes.length > 0 && historyPostIds.size > 0) {
          query = query.where(
            and(
              // Exclude posts the user has already interacted with
              not(sql`${postsTable.id} IN (${Array.from(historyPostIds).join(',')})`),
              // Include posts with matching themes
              or(
                ...allThemes.map(theme => 
                  or(
                    like(postsTable.themeCategory, `%${theme}%`),
                    sql`${postsTable.metadata}->>'themeCategory' LIKE ${`%${theme}%`}`
                  )
                )
              )
            )
          );
        }
        
        // Get more posts than needed for scoring
        const candidatePosts = await safeDbOperation(async () => {
          return await query
            .orderBy(desc(postsTable.createdAt))
            .limit(limit * 3);
        });
        
        // Score posts based on multiple factors
        const scoredPosts = candidatePosts.map(post => {
          let score = 0;
          
          // Collaborative filtering boost
          if (similarUsersPostIds.has(post.id)) {
            score += 25;
          }
          
          // Theme matching score
          const postThemes = [
            post.themeCategory || '',
            post.metadata && typeof post.metadata === 'object'
              ? (post.metadata as any)?.themeCategory || ''
              : ''
          ].filter(Boolean);
          
          for (const theme of postThemes) {
            // Higher score for user-selected preferred themes
            for (const prefTheme of preferredThemes) {
              if (theme.toLowerCase().includes(prefTheme.toLowerCase())) {
                score += 20;
                break;
              }
            }
            
            // Score for derived user themes (from their reading history)
            for (const userTheme of sortedThemes) {
              if (theme.toLowerCase().includes(userTheme.toLowerCase())) {
                score += 15;
                break;
              }
            }
          }
          
          // Recency bias (newer posts get a boost)
          const postDate = post.createdAt instanceof Date 
            ? post.createdAt 
            : new Date(post.createdAt);
          
          const daysSincePosted = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSincePosted < 7) { // Posts less than a week old
            score += Math.max(0, 10 - daysSincePosted); // 10 points for today, decreasing to 3 for a week old
          }
          
          // Popular posts get a small boost
          score += Math.min(10, post.likesCount || 0);
          
          return { post, score };
        });
        
        // Sort by score, descending
        scoredPosts.sort((a, b) => b.score - a.score);
        
        // Take top posts
        contentBasedRecommendations = scoredPosts
          .slice(0, limit)
          .map(({ post }) => post);
          
      } catch (error) {
        console.error(`[Storage] Error getting content-based recommendations:`, error);
        // Continue with fallback methods
      }
      
      // Step 7: If we don't have enough recommendations, supplement with popular and recent posts
      if (contentBasedRecommendations.length < limit) {
        console.log(`[Storage] Not enough recommendations (${contentBasedRecommendations.length}), supplementing with additional posts`);
        const remainingCount = limit - contentBasedRecommendations.length;
        const existingIds = new Set([
          ...contentBasedRecommendations.map(post => post.id),
          ...Array.from(historyPostIds)
        ]);
        
        try {
          // Try to get a mix of popular and recent posts
          const popularSupplements = await safeDbOperation(async () => {
            // 60% popular posts
            const popularCount = Math.ceil(remainingCount * 0.6);
            const popularPosts = await db.select()
              .from(postsTable)
              .where(not(sql`${postsTable.id} IN (${Array.from(existingIds).join(',')})`))
              .orderBy(desc(postsTable.likesCount), desc(postsTable.createdAt))
              .limit(popularCount);
            
            // 40% recent posts
            const recentCount = remainingCount - popularCount;
            const recentPosts = await db.select()
              .from(postsTable)
              .where(not(sql`${postsTable.id} IN (${Array.from(existingIds).join(',')})`))
              .orderBy(desc(postsTable.createdAt))
              .limit(recentCount);
            
            return [...popularPosts, ...recentPosts];
          });
          
          console.log(`[Storage] Found ${popularSupplements.length} supplemental posts`);
          
          const result = [
            ...contentBasedRecommendations.map(post => ({
              ...post,
              createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
            })),
            ...popularSupplements.map(post => ({
              ...post,
              createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
            }))
          ];
          
          // Log performance metrics
          const duration = Date.now() - startTime;
          await this.logRecommendationPerformance(userId, 'mixed_recommendations', result.length, duration);
          
          return result;
        } catch (error) {
          console.error(`[Storage] Error getting supplemental posts:`, error);
          // Return what we have so far if this fails
          return contentBasedRecommendations.map(post => ({
            ...post,
            createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
          }));
        }
      }
      
      console.log(`[Storage] Found ${contentBasedRecommendations.length} enhanced personalized recommendations for user ${userId}`);
      
      // Log performance metrics
      const duration = Date.now() - startTime;
      await this.logRecommendationPerformance(userId, 'content_based', contentBasedRecommendations.length, duration);
      
      return contentBasedRecommendations.map(post => ({
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
      }));
    } catch (error) {
      console.error(`[Storage] Error getting personalized recommendations:`, error);
      // Return empty array instead of throwing to provide graceful degradation
      return [];
    }
  }
  
  // Helper method to log recommendation performance
  private async logRecommendationPerformance(userId: number, method: string, count: number, durationMs: number): Promise<void> {
    try {
      const metric: InsertPerformanceMetric = {
        label: `recommendations_${method}`,
        value: durationMs,
        metadata: {
          userId: userId.toString(),
          method,
          count: count.toString(),
          timestamp: new Date().toISOString()
        },
        createdAt: new Date()
      };
      
      await db.insert(performanceMetrics).values(metric);
    } catch (error) {
      // Don't let metrics logging failure affect recommendations
      console.warn(`[Storage] Failed to log recommendation performance:`, error);
    }
  }
  
  // Achievement methods
  async getUserAchievements(userId: number): Promise<any[]> {
    // This would be implemented with the actual achievement tables
    console.log(`[Storage] Fetching achievements for user: ${userId}`);
    return [];
  }
  
  async getAllAchievements(): Promise<any[]> {
    // This would be implemented with the actual achievement tables
    console.log(`[Storage] Fetching all achievements`);
    return [];
  }

  // Admin-specific methods for WordPress sync dashboard
  async getAdminInfo(): Promise<{
    totalPosts: number;
    totalUsers: number;
    totalComments: number;
    totalLikes: number;
    recentActivity: ActivityLog[];
  }> {
    return this.safeDbOperation(async () => {
      const [postsCount] = await db.select({ count: sql<number>`count(*)` }).from(posts);
      const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [commentsCount] = await db.select({ count: sql<number>`count(*)` }).from(comments);
      
      // Get recent activity
      const recentActivity = await db.select()
        .from(activityLogs)
        .orderBy(desc(activityLogs.createdAt))
        .limit(10);

      return {
        totalPosts: postsCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalComments: commentsCount.count || 0,
        totalLikes: 0, // This would need to be calculated from likes data
        recentActivity: recentActivity.map(log => ({
          ...log,
          createdAt: log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt)
        }))
      };
    }, {
      totalPosts: 0,
      totalUsers: 0,
      totalComments: 0,
      totalLikes: 0,
      recentActivity: []
    }, 'getAdminInfo');
  }

  async getSiteSettingByKey(key: string): Promise<SiteSettings | undefined> {
    return this.safeDbOperation(async () => {
      const [setting] = await db.select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);
      
      return setting ? {
        ...setting,
        createdAt: setting.createdAt instanceof Date ? setting.createdAt : new Date(setting.createdAt),
        updatedAt: setting.updatedAt instanceof Date ? setting.updatedAt : new Date(setting.updatedAt)
      } : undefined;
    }, undefined, 'getSiteSettingByKey');
  }

  async setSiteSetting(key: string, value: string, category: string, description?: string): Promise<SiteSettings> {
    return this.safeDbOperation(async () => {
      const now = new Date();
      
      // Try to update existing setting first
      const [updated] = await db.update(siteSettings)
        .set({ 
          value, 
          category, 
          description: description || null,
          updatedAt: now 
        })
        .where(eq(siteSettings.key, key))
        .returning();

      if (updated) {
        return {
          ...updated,
          createdAt: updated.createdAt instanceof Date ? updated.createdAt : new Date(updated.createdAt),
          updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt : new Date(updated.updatedAt)
        };
      }

      // If no existing setting, create new one
      const [newSetting] = await db.insert(siteSettings)
        .values({
          key,
          value,
          category,
          description: description || null,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      return {
        ...newSetting,
        createdAt: newSetting.createdAt instanceof Date ? newSetting.createdAt : new Date(newSetting.createdAt),
        updatedAt: newSetting.updatedAt instanceof Date ? newSetting.updatedAt : new Date(newSetting.updatedAt)
      };
    }, {} as SiteSettings, 'setSiteSetting');
  }

  async getAllSiteSettings(): Promise<SiteSettings[]> {
    return this.safeDbOperation(async () => {
      const settings = await db.select()
        .from(siteSettings)
        .orderBy(siteSettings.category, siteSettings.key);

      return settings.map(setting => ({
        ...setting,
        createdAt: setting.createdAt instanceof Date ? setting.createdAt : new Date(setting.createdAt),
        updatedAt: setting.updatedAt instanceof Date ? setting.updatedAt : new Date(setting.updatedAt)
      }));
    }, [], 'getAllSiteSettings');
  }

  async getSiteAnalytics(): Promise<{
    totalViews: number;
    uniqueVisitors: number;
    avgReadTime: number;
    bounceRate: number;
    trendingPosts: any[];
    activeUsers: number;
    newUsers: number;
    adminCount: number;
  }> {
    return this.safeDbOperation(async () => {
      const [adminCount] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isAdmin, true));

      const [userCount] = await db.select({ count: sql<number>`count(*)` })
        .from(users);

      // Get trending posts (most liked/viewed recently)
      const trendingPosts = await db.select()
        .from(posts)
        .orderBy(desc(posts.likesCount), desc(posts.createdAt))
        .limit(5);

      return {
        totalViews: 0, // This would come from analytics tracking
        uniqueVisitors: 0,
        avgReadTime: 0,
        bounceRate: 0,
        trendingPosts: trendingPosts.map(post => ({
          ...post,
          createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
        })),
        activeUsers: userCount.count || 0,
        newUsers: 0,
        adminCount: adminCount.count || 0
      };
    }, {
      totalViews: 0,
      uniqueVisitors: 0,
      avgReadTime: 0,
      bounceRate: 0,
      trendingPosts: [],
      activeUsers: 0,
      newUsers: 0,
      adminCount: 0
    }, 'getSiteAnalytics');
  }

  async getUsers(page: number = 1, limit: number = 50): Promise<User[]> {
    return this.safeDbOperation(async () => {
      const offset = (page - 1) * limit;
      
      const userList = await db.select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      return userList.map(user => ({
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)
      }));
    }, [], 'getUsers');
  }
}

// Always use the database implementation
export const storage = new DatabaseStorage();