import { db } from "./db";
import { 
  users, 
  posts, 
  comments, 
  sessions,
  resetTokens,
  postLikes,
  bookmarks,
  analytics,
  authorStats,
  writingChallenges,
  challengeEntries,
  reportedContent,
  authorTips,
  activityLogs,
  userProgress,
  siteAnalytics,
  userFeedback,
  userPrivacySettings,
  contactMessages,
  newsletterSubscriptions,
  readingProgress,
  secretProgress,
  commentReactions,
  commentVotes,
  contentProtection,
  webhooks,
  adminNotifications,
  siteSettings,
  performanceMetrics
} from '@shared/schema';
import type { 
  User, 
  InsertUser, 
  Post, 
  InsertPost, 
  Comment, 
  InsertComment,
  Session,
  InsertSession,
  ResetToken,
  InsertResetToken,
  PostLike,
  ReadingProgress,
  InsertProgress,
  SecretProgress,
  InsertSecretProgress,
  ContactMessage,
  InsertContactMessage,
  NewsletterSubscription,
  InsertNewsletterSubscription,
  AuthorStats,
  WritingChallenge,
  InsertWritingChallenge,
  ChallengeEntry,
  InsertChallengeEntry,
  ReportedContent,
  InsertReportedContent,
  AuthorTip,
  InsertAuthorTip,
  Analytics,
  UserFeedback,
  InsertUserFeedback,
  InsertBookmark,
  Bookmark
} from '@shared/schema';
import { eq, desc, and, or, sql, like, count, sum } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: number, newPasswordHash: string): Promise<void>;

  // Post management
  getPosts(filters?: { 
    authorId?: number; 
    isSecret?: boolean; 
    isAdminPost?: boolean; 
    themeCategory?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: Post[]; hasMore: boolean }>;
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;

  // Comments
  getComments(postId: number): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, updates: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;

  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<boolean>;
  cleanupExpiredSessions(): Promise<void>;

  // Password reset
  createResetToken(token: InsertResetToken): Promise<ResetToken>;
  getResetToken(token: string): Promise<ResetToken | undefined>;
  useResetToken(token: string): Promise<boolean>;

  // Bookmarks
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  getUserBookmarks(userId: number): Promise<Bookmark[]>;
  deleteBookmark(userId: number, postId: number): Promise<void>;

  // Contact messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;

  // Newsletter
  subscribeNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  unsubscribeNewsletter(email: string): Promise<boolean>;

  // Reading progress
  updateReadingProgress(progress: InsertProgress): Promise<ReadingProgress>;
  getReadingProgress(userId: number, postId: number): Promise<ReadingProgress | undefined>;

  // Secret progress
  recordSecretDiscovery(discovery: InsertSecretProgress): Promise<SecretProgress>;
  getSecretProgress(userId: number): Promise<SecretProgress[]>;

  // Author stats
  getAuthorStats(authorId: number): Promise<AuthorStats | undefined>;
  updateAuthorStats(authorId: number, stats: Partial<AuthorStats>): Promise<void>;

  // Analytics
  recordAnalytics(postId: number, data: Partial<Analytics>): Promise<void>;
  getPostAnalytics(postId: number): Promise<Analytics | undefined>;

  // User feedback
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getUserFeedback(): Promise<UserFeedback[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        email: insertUser.email,
        password_hash: hashedPassword,
        isAdmin: insertUser.isAdmin || false,
        metadata: insertUser.metadata || {}
      })
      .returning();
    
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    return user || undefined;
  }

  async updateUserPassword(id: number, newPasswordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ password_hash: newPasswordHash })
      .where(eq(users.id, id));
  }

  async getPosts(filters?: { 
    authorId?: number; 
    isSecret?: boolean; 
    isAdminPost?: boolean; 
    themeCategory?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: Post[]; hasMore: boolean }> {
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;
    
    let query = db.select().from(posts);
    
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
      query = query.where(and(...conditions));
    }
    
    const results = await query
      .orderBy(desc(posts.createdAt))
      .limit(limit + 1)
      .offset(offset);
    
    const hasMore = results.length > limit;
    const posts_result = hasMore ? results.slice(0, -1) : results;
    
    return { posts: posts_result, hasMore };
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
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

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    
    return post || undefined;
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

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({
        ...insertComment,
        is_approved: insertComment.approved !== undefined ? insertComment.approved : false
      })
      .returning();
    
    return comment;
  }

  async updateComment(id: number, updates: Partial<Comment>): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set(updates)
      .where(eq(comments.id, id))
      .returning();
    
    return comment || undefined;
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
}

export const storage = new DatabaseStorage();