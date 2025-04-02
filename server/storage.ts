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
  // Game types
  type GameSaveRecord, type InsertGameSave,
  type GameProgressRecord, type InsertGameProgress,
  type GameStatsRecord, type InsertGameStats, 
  // Tables
  posts as postsTable,
  comments,
  readingProgress,
  secretProgress,
  users,
  contactMessages,
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
  gameSaves,
  gameProgress,
  gameStats,
  type Achievement,
  type UserAchievement,
  achievements,
  userAchievements,
  type PerformanceMetric, type InsertPerformanceMetric,
  performanceMetrics
} from "@shared/schema";

// Removed: type FeaturedAuthor, type ReadingStreak, type WriterStreak, featuredAuthors, readingStreaks, writerStreaks

import type { CommentMetadata } from "@shared/schema";
import { db } from "./db";
import pkg from 'pg';
const { Pool } = pkg;

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
import { eq, desc, and, lt, gt, sql, avg, count, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from 'bcryptjs';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAdminByEmail(email: string): Promise<User[]>;
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

  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Post Likes
  getPostLike(postId: number, userId: number): Promise<PostLike | undefined>;
  removePostLike(postId: number, userId: number): Promise<void>;
  updatePostLike(postId: number, userId: number, isLike: boolean): Promise<void>;
  createPostLike(postId: number, userId: number, isLike: boolean): Promise<void>;
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
  getPostAnalytics(postId: number): Promise<Analytics | undefined>;
  getSiteAnalytics(): Promise<{ totalViews: number; uniqueVisitors: number; avgReadTime: number }>;
  

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

  // Add achievement methods to IStorage interface
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getUserPosts(userId: number): Promise<Post[]>;
  getUserTotalLikes(userId: number): Promise<number>;
  getPostById(id: number): Promise<Post | undefined>;

  // Add performance metrics method
  storePerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
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
  
  // Game Save methods
  getGameSaves(userId: number): Promise<GameSaveRecord[]>;
  getGameSave(saveId: string, userId?: number): Promise<GameSaveRecord | undefined>;
  createGameSave(save: InsertGameSave): Promise<string>;
  updateGameSave(saveId: string, userId: number | null, data: Partial<InsertGameSave>): Promise<boolean>;
  deleteGameSave(saveId: string, userId: number | null): Promise<boolean>;
  
  // Game Progress methods
  getGameProgress(userId: number): Promise<GameProgressRecord | undefined>;
  updateGameProgress(userId: number, progress: InsertGameProgress): Promise<number>;
  
  // Game Stats methods
  getGameStats(userId: number): Promise<GameStatsRecord | undefined>;
  updateGameStats(userId: number, stats: InsertGameStats): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

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
                error.message.includes('server closed')
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
      
      // Add an empty metadata field since it doesn't exist in the DB yet
      return {
        ...user,
        metadata: {}
      };
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      // Try a more basic approach as fallback using raw SQL
      try {
        const result = await pool.query(
          "SELECT id, username, email, password_hash, is_admin as \"isAdmin\", created_at as \"createdAt\" FROM users WHERE username = $1 LIMIT 1",
          [username]
        );
        return result.rows[0] || undefined;
      } catch (fallbackError) {
        console.error("Fallback error in getUserByUsername:", fallbackError);
        throw fallbackError;
      }
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Now include metadata column since it exists in the database
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
      .where(eq(users.email, email))
      .limit(1);
      
      return user;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      // Try a more basic approach as fallback using raw SQL
      try {
        const result = await pool.query(
          "SELECT id, username, email, password_hash, is_admin as \"isAdmin\", metadata, created_at as \"createdAt\" FROM users WHERE email = $1 LIMIT 1",
          [email]
        );
        return result.rows[0] || undefined;
      } catch (fallbackError) {
        console.error("Fallback error in getUserByEmail:", fallbackError);
        throw fallbackError;
      }
    }
  }

  async getAdminByEmail(email: string): Promise<User[]> {
    try {
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
        eq(users.email, email),
        eq(users.isAdmin, true)
      ));
      
      return adminUsers;
    } catch (error) {
      console.error("Error in getAdminByEmail:", error);
      // Try a more basic approach as fallback using raw SQL
      try {
        const result = await pool.query(
          "SELECT id, username, email, password_hash, is_admin as \"isAdmin\", metadata, created_at as \"createdAt\" FROM users WHERE email = $1 AND is_admin = true",
          [email]
        );
        return result.rows || [];
      } catch (fallbackError) {
        console.error("Fallback error in getAdminByEmail:", fallbackError);
        throw fallbackError;
      }
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Hash the password before storing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Extract email from user or metadata
      const email = (user.metadata as any)?.email || user.email;

      // Prepare user values including the metadata field
      const userValues = {
        username: user.username,
        email, // The email is still needed as a column in the users table
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
      console.log('[Storage] Updating user:', id, userData);
      
      // Remove sensitive fields that shouldn't be directly updated
      const { 
        password_hash, 
        id: userId, 
        createdAt,
        email, // Email changes should be handled separately with verification
        ...safeUserData 
      } = userData as any;
      
      // Keep metadata for profile updates if it exists
      // Note: metadata is a valid field in the users table
      
      // Update the user with remaining safe fields
      const [updatedUser] = await db.update(users)
        .set(safeUserData)
        .where(eq(users.id, id))
        .returning();
      
      if (!updatedUser) {
        throw new Error("User not found");
      }
      
      console.log('[Storage] User updated successfully:', id);
      return updatedUser;
    } catch (error) {
      console.error("Error in updateUser:", error);
      if (error instanceof Error) {
        if (error.message === "User not found") {
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
    limit: number = 16, 
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
    try {
      console.log(`[Storage] Fetching posts - page: ${page}, limit: ${limit}, filters:`, filters);
      const offset = (page - 1) * limit;

      // Start building the query
      let query = db.select()
        .from(postsTable)
        .where(eq(postsTable.isSecret, false));
      
      // Apply filtering based on metadata for community posts
      if (filters.authorId) {
        query = query.where(eq(postsTable.authorId, filters.authorId));
      }
      
      // Apply sorting
      if (filters.sort && filters.order) {
        if (filters.sort === 'date') {
          query = query.orderBy(
            filters.order === 'desc' ? desc(postsTable.createdAt) : postsTable.createdAt
          );
        } else {
          // Default sort by creation date desc
          query = query.orderBy(desc(postsTable.createdAt));
        }
      } else {
        // Default sort by creation date desc
        query = query.orderBy(desc(postsTable.createdAt));
      }
      
      // Execute the query with limit and offset
      query = query.limit(limit + 1).offset(offset);
      
      // Execute the query
      let posts = await query;
      
      // Post-query filtering for metadata fields like isCommunityPost and isAdminPost
      // This avoids database schema issues when these fields are missing
      if (filters.isCommunityPost !== undefined || filters.isAdminPost !== undefined || filters.category) {
        posts = posts.filter(post => {
          const metadata = post.metadata || {};
          
          // Check for community post flag in metadata
          if (filters.isCommunityPost !== undefined) {
            const isCommunityPost = metadata.isCommunityPost === true;
            if (isCommunityPost !== filters.isCommunityPost) return false;
          }
          
          // Check for admin post flag in metadata
          if (filters.isAdminPost !== undefined) {
            const isAdminPost = metadata.isAdminPost === true;
            if (isAdminPost !== filters.isAdminPost) return false;
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
    } catch (error) {
      console.error("Error in getPosts:", error);
      if (error instanceof Error) {
        if (error.message.includes('relation') || error.message.includes('column')) {
          console.warn("Database schema issue detected, attempting simpler query without problematic columns");
          
          try {
            // Define offset here to avoid ReferenceError in fallback query
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
            
            if (filters.isCommunityPost !== undefined || filters.isAdminPost !== undefined || filters.category) {
              filteredPosts = simplePosts.filter(post => {
                const metadata = post.metadata || {};
                
                // Check for community post flag in metadata
                if (filters.isCommunityPost !== undefined) {
                  const isCommunityPost = metadata.isCommunityPost === true;
                  if (isCommunityPost !== filters.isCommunityPost) return false;
                }
                
                // Check for admin post flag in metadata
                if (filters.isAdminPost !== undefined) {
                  const isAdminPost = metadata.isAdminPost === true;
                  if (isAdminPost !== filters.isAdminPost) return false;
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
            console.error("Fallback query also failed:", fallbackError);
            throw new Error("Database schema error: Please check if the database is properly initialized");
          }
        }
        if (error.message.includes('connection')) {
          throw new Error("Database connection error: Unable to connect to the database");
        }
      }
      throw new Error("Failed to fetch posts");
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
    try {
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
    } catch (error) {
      console.error("Error in getPost:", error);
      throw new Error("Failed to fetch post");
    }
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
      // Use a more explicit column selection to match actual database column names
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
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

      return commentsResult.map(comment => ({
        ...comment,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)
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
      const [likes] = await db.select({
        count: sql<string>`count(*)`
      })
        .from(postLikes)
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.isLike, true)
        ));

      const [dislikes] = await db.select({
        count: sql<string>`count(*)`
      })
        .from(postLikes)
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.isLike, false)
        ));

      const counts = {
        likesCount: Number(likes?.count || 0),
        dislikesCount: Number(dislikes?.count || 0)
      };

      console.log(`[Storage] Post ${postId} counts:`, counts);
      return counts;
    } catch (error) {
      console.error(`[Storage] Error getting like counts for post ${postId}:`, error);
      throw error;
    }
  }

  private async updatePostCounts(postId: number): Promise<void> {
    try {
      const counts = await this.getPostLikeCounts(postId);
      await db.update(postsTable)
        .set({ 
          likesCount: counts.likesCount, 
          dislikesCount: counts.dislikesCount 
        })
        .where(eq(postsTable.id, postId));

      console.log(`[Storage] Updated post ${postId} counts:`, counts);
    } catch (error) {
      console.error(`[Storage] Error updating post counts for ${postId}:`, error);
      throw error;
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

  async getSiteAnalytics(): Promise<{ totalViews: number; uniqueVisitors: number; avgReadTime: number }> {
    const [result] = await db.select({
      totalViews: sql`sum(${analytics.pageViews})`,
      uniqueVisitors: sql`sum(${analytics.uniqueVisitors})`,
      avgReadTime: avg(analytics.averageReadTime)
    })
      .from(analytics);

    return {
      totalViews: Number(result.totalViews) || 0,
      uniqueVisitors: Number(result.uniqueVisitors) || 0,
      avgReadTime: Number(result.avgReadTime) || 0
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
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      console.log('[Storage] Fetching all achievements');
      const achievementsList = await db.select()
        .from(achievements)
        .orderBy(achievements.id);
      return achievementsList;
    } catch (error) {
      console.error('[Storage] Error fetching achievements:', error);
      throw error;
    }
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    try {
      console.log(`[Storage] Fetching achievements for user: ${userId}`);
      const userAchievementList = await db.select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId))
        .orderBy(userAchievements.unlockedAt);
      return userAchievementList;
    } catch (error) {
      console.error('[Storage] Error fetching user achievements:', error);
      throw error;
    }
  }

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
        .orderBy(desc(readingProgress.lastRead));
      
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
              likes_count, dislikes_count
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
            dislikesCount: post.dislikes_count || 0
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
}

export const storage = new DatabaseStorage();