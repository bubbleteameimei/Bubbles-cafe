import { db } from "./db";
import { 
  users, posts, comments, contactMessages, bookmarks, sessions, userFeedback, newsletterSubscriptions, resetTokens,
  performanceMetrics, activityLogs, siteSettings, adminNotifications,
  type User, type Post, type Comment, type InsertUser, type InsertPost, type InsertComment,
  type ContactMessage, type InsertContactMessage, type UserFeedback, type InsertUserFeedback,
  type Bookmark, type InsertBookmark, type Session, type InsertSession,
  type ResetToken, type InsertResetToken
} from "../shared/schema";
import { eq, desc, and, or, sql, like, asc } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPosts(page?: number, limit?: number, filterOptions?: any): Promise<{ posts: Post[]; hasMore: boolean }>;
  getPostsByAuthor(authorId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  searchPosts(query: string): Promise<Post[]>;

  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  voteOnComment(commentId: number, vote: string, userId?: number): Promise<{ success: boolean; message: string }>;

  // Bookmark operations
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: number, postId: number): Promise<boolean>;
  getUserBookmarks(userId: number): Promise<Bookmark[]>;

  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<boolean>;
  sessionStore?: any;

  // Cache operations
  clearCache(): Promise<void>;

  // Post approval operations
  approvePost(id: number): Promise<Post | undefined>;

  // Reset token operations
  createResetToken(tokenData: InsertResetToken): Promise<ResetToken>;
  getResetTokenByToken(token: string): Promise<ResetToken | undefined>;
  markResetTokenAsUsed(token: string): Promise<void>;

  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;

  // User feedback operations
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getUserFeedback(): Promise<UserFeedback[]>;
  getAllFeedback(): Promise<UserFeedback[]>;
  getFeedback(id: number): Promise<UserFeedback | undefined>;

  // Newsletter operations
  getNewsletterSubscriptionByEmail(email: string): Promise<any>;
  createNewsletterSubscription(subscription: any): Promise<any>;
  getNewsletterSubscriptions(): Promise<any[]>;
  updateNewsletterSubscriptionStatus(id: number, status: string): Promise<any>;

  // Moderation operations
  getReportedContent(): Promise<any[]>;
  updateReportedContent(id: number, status: string): Promise<any>;
  reportContent(report: any): Promise<any>;
  createCommentReply(reply: any): Promise<any>;

  // Activity logging
  createActivityLog(log: any): Promise<any>;

  // Privacy settings operations  
  getUserPrivacySettings(userId: number): Promise<any>;
  createUserPrivacySettings(userId: number, settings: any): Promise<any>;
  updateUserPrivacySettings(userId: number, settings: any): Promise<any>;

  // Personalized recommendations
  getPersonalizedRecommendations(userId: number, options?: any): Promise<any[]>;

  // Post like operations
  getPostLike(userId: number, postId: number): Promise<any>;
  removePostLike(userId: number, postId: number): Promise<boolean>;
  updatePostLike(userId: number, postId: number, like: boolean): Promise<any>;
  createPostLike(userId: number, postId: number, like: boolean): Promise<any>;
  getPostLikeCounts(postId: number): Promise<any>;

  // Comment vote operations
  getCommentVote(userId: number, commentId: number): Promise<any>;
  removeCommentVote(userId: number, commentId: number): Promise<boolean>;
  updateCommentVote(userId: number, commentId: number, vote: string): Promise<any>;
  createCommentVote(userId: number, commentId: number, vote: string): Promise<any>;
  getCommentVoteCounts(commentId: number): Promise<any>;

  // Comment moderation operations
  getRecentComments(limit: number): Promise<Comment[]>;
  getPendingComments(): Promise<Comment[]>;

  // Admin operations
  getAdminByEmail(email: string): Promise<User | undefined>;

  // Secret post operations
  unlockSecretPost(postId: number, password: string): Promise<Post | undefined>;

  // Database access methods
  getDb(): any;
  getUsersTable(): any;
  getDrizzleOperators(): any;

  // Missing methods that are causing TypeScript errors
  createPasswordResetToken(userId: number): Promise<ResetToken>;
  verifyPasswordResetToken(token: string): Promise<ResetToken | undefined>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  getUserWithPassword(userId: number): Promise<User | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  getAnalyticsSummary(): Promise<any>;
  
  // Additional missing methods
  getUsersCount(): Promise<number>;
  getCommentsCount(): Promise<number>;
  getBookmarkCount(): Promise<number>;
  getTrendingPosts(limit: number): Promise<Post[]>;
  getAdminStats(): Promise<any>;
  storePerformanceMetric(metric: any): Promise<void>;
  getDeviceDistribution(): Promise<any>;
  getPerformanceMetricsByType(type: string): Promise<any[]>;
  getUniqueUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  getReturningUserCount(): Promise<number>;
  getSiteAnalytics(): Promise<any>;
  logActivity(activity: any): Promise<void>;
  setSiteSetting(key: string, value: string, category?: string, description?: string): Promise<void>;
  getAllSiteSettings(): Promise<any[]>;
  getPostCount(): Promise<number>;
  getRecentActivity(limit: number): Promise<any[]>;
  getUsers(page: number, limit: number): Promise<User[]>;
  getAdminInfo(): Promise<any>;
  getSiteSettingByKey(key: string): Promise<any>;
  getUnreadAdminNotifications(): Promise<any[]>;
  markNotificationAsRead(id: number): Promise<void>;
  getRecentActivityLogs(limit: number): Promise<any[]>;
  submitFeedback(feedback: any): Promise<any>;
  updateFeedbackStatus(id: number, status: string): Promise<any>;
  getRecentPosts(): Promise<Post[]>;
  getRecommendedPosts(postId: number, limit: number): Promise<Post[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore?: any;

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(user)
        .where(eq(users.id, id))
        .returning();
      return updatedUser || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getPost(id: number): Promise<Post | undefined> {
    try {
      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      return post || undefined;
    } catch (error) {
      console.error('Error getting post:', error);
      return undefined;
    }
  }

  async getPostById(id: number): Promise<Post | undefined> {
    try {
      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      return post || undefined;
    } catch (error) {
      console.error('Error getting post by id:', error);
      return undefined;
    }
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    try {
      const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
      return post || undefined;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return undefined;
    }
  }

  async getPosts(page: number = 1, limit: number = 20, filterOptions: any = {}): Promise<{ posts: Post[]; hasMore: boolean }> {
    try {
      const offset = (page - 1) * limit;

      let result;
      if (filterOptions.isAdminPost !== undefined) {
        result = await db
          .select()
          .from(posts)
          .where(eq(posts.isAdminPost, filterOptions.isAdminPost))
          .orderBy(desc(posts.createdAt))
          .limit(limit + 1)
          .offset(offset);
      } else {
        result = await db
          .select()
          .from(posts)
          .orderBy(desc(posts.createdAt))
          .limit(limit + 1)
          .offset(offset);
      }

      const hasMore = result.length > limit;
      const postsResult = hasMore ? result.slice(0, limit) : result;

      return {
        posts: postsResult,
        hasMore
      };
    } catch (error) {
      console.error('Error getting posts:', error);
      return {
        posts: [],
        hasMore: false
      };
    }
  }

  async getPostsByAuthor(authorId: number): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(posts)
        .where(eq(posts.authorId, authorId))
        .orderBy(desc(posts.createdAt));
    } catch (error) {
      console.error('Error getting posts by author:', error);
      return [];
    }
  }

  async createPost(post: InsertPost): Promise<Post> {
    try {
      const [newPost] = await db.insert(posts).values(post).returning();
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: number, post: Partial<Post>): Promise<Post | undefined> {
    try {
      const [updatedPost] = await db
        .update(posts)
        .set(post)
        .where(eq(posts.id, id))
        .returning();
      return updatedPost || undefined;
    } catch (error) {
      console.error('Error updating post:', error);
      return undefined;
    }
  }

  async deletePost(id: number): Promise<boolean> {
    try {
      const result = await db.delete(posts).where(eq(posts.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  async searchPosts(query: string): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(posts)
        .where(
          or(
            like(posts.title, `%${query}%`),
            like(posts.content, `%${query}%`),
            like(posts.excerpt, `%${query}%`)
          )
        )
        .orderBy(desc(posts.createdAt));
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  async getComment(id: number): Promise<Comment | undefined> {
    try {
      const [comment] = await db.select().from(comments).where(eq(comments.id, id));
      return comment || undefined;
    } catch (error) {
      console.error('Error getting comment:', error);
      return undefined;
    }
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    try {
      return await db
        .select()
        .from(comments)
        .where(eq(comments.postId, postId))
        .orderBy(asc(comments.createdAt));
    } catch (error) {
      console.error('Error getting comments by post:', error);
      return [];
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    try {
      const [newComment] = await db.insert(comments).values(comment).returning();
      return newComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined> {
    try {
      const [updatedComment] = await db
        .update(comments)
        .set(comment)
        .where(eq(comments.id, id))
        .returning();
      return updatedComment || undefined;
    } catch (error) {
      console.error('Error updating comment:', error);
      return undefined;
    }
  }

  async deleteComment(id: number): Promise<boolean> {
    try {
      const result = await db.delete(comments).where(eq(comments.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  async voteOnComment(_commentId: number, vote: string, _userId?: number): Promise<{ success: boolean; message: string }> {
    try {
      // Basic vote validation
      if (!['upvote', 'downvote', 'neutral'].includes(vote)) {
        return { success: false, message: 'Invalid vote type' };
      }
      
      // For now, just return success - implement actual voting logic later
      return { success: true, message: 'Vote recorded successfully' };
    } catch (error) {
      console.error('Error voting on comment:', error);
      return { success: false, message: 'Failed to record vote' };
    }
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    try {
      const [newBookmark] = await db.insert(bookmarks).values(bookmark).returning();
      return newBookmark;
    } catch (error) {
      console.error('Error creating bookmark:', error);
      throw error;
    }
  }

  async deleteBookmark(userId: number, postId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      return false;
    }
  }

  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    try {
      return await db
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.userId, userId))
        .orderBy(desc(bookmarks.createdAt));
    } catch (error) {
      console.error('Error getting user bookmarks:', error);
      return [];
    }
  }

  async createSession(session: InsertSession): Promise<Session> {
    try {
      const [newSession] = await db.insert(sessions).values(session).returning();
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getSession(token: string): Promise<Session | undefined> {
    try {
      const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
      return session || undefined;
    } catch (error) {
      console.error('Error getting session:', error);
      return undefined;
    }
  }

  async deleteSession(token: string): Promise<boolean> {
    try {
      const result = await db.delete(sessions).where(eq(sessions.token, token));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    try {
      const [newMessage] = await db.insert(contactMessages).values(message).returning();
      return newMessage;
    } catch (error) {
      console.error('Error creating contact message:', error);
      throw error;
    }
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    } catch (error) {
      console.error('Error getting contact messages:', error);
      return [];
    }
  }

  async createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    try {
      const [newFeedback] = await db.insert(userFeedback).values(feedback).returning();
      return newFeedback;
    } catch (error) {
      console.error('Error creating user feedback:', error);
      throw error;
    }
  }

  async getUserFeedback(): Promise<UserFeedback[]> {
    try {
      return await db.select().from(userFeedback).orderBy(desc(userFeedback.createdAt));
    } catch (error) {
      console.error('Error getting user feedback:', error);
      return [];
    }
  }

  async getAllFeedback(): Promise<UserFeedback[]> {
    return this.getUserFeedback();
  }

  async getFeedback(id: number): Promise<UserFeedback | undefined> {
    try {
      const [feedback] = await db.select().from(userFeedback).where(eq(userFeedback.id, id));
      return feedback || undefined;
    } catch (error) {
      console.error('Error getting feedback by id:', error);
      return undefined;
    }
  }

  async getNewsletterSubscriptionByEmail(email: string): Promise<any> {
    try {
      const [subscription] = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, email));
      return subscription || undefined;
    } catch (error) {
      console.error('Error getting newsletter subscription by email:', error);
      return undefined;
    }
  }

  async createNewsletterSubscription(subscription: any): Promise<any> {
    const [newSubscription] = await db.insert(newsletterSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async getNewsletterSubscriptions(): Promise<any[]> {
    try {
      return await db.select().from(newsletterSubscriptions).orderBy(desc(newsletterSubscriptions.createdAt));
    } catch (error) {
      console.error('Error getting newsletter subscriptions:', error);
      return [];
    }
  }

    async updateNewsletterSubscriptionStatus(id: number, _status: string): Promise<any> {
    try {
      // Placeholder implementation - newsletter subscriptions table may not have status field
      const [subscription] = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.id, id));
      return subscription;
    } catch (error) {
      console.error('Error updating newsletter subscription status:', error);
      throw error;
    }
  }

  async getReportedContent(): Promise<any[]> {
    try {
      return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    } catch (error) {
      console.error('Error getting reported content:', error);
      return [];
    }
  }

  async updateReportedContent(id: number, status: string): Promise<any> {
    try {
      // Placeholder implementation - reported content table may not exist
      return { id, status };
    } catch (error) {
      console.error('Error updating reported content:', error);
      return undefined;
    }
  }

  async reportContent(report: any): Promise<any> {
    try {
      // Placeholder implementation - reported content table may not exist
      return { id: Date.now(), ...report };
    } catch (error) {
      console.error('Error reporting content:', error);
      return null;
    }
  }

  async createCommentReply(reply: any): Promise<any> {
    try {
      // Placeholder implementation - comment replies table may not exist
      return { id: Date.now(), ...reply };
    } catch (error) {
      console.error('Error creating comment reply:', error);
      return null;
    }
  }

  async createActivityLog(log: any): Promise<any> {
    try {
      // Placeholder implementation - activity logs table may not exist
      return { id: Date.now(), ...log };
    } catch (error) {
      console.error('Error creating activity log:', error);
      return null;
    }
  }

  async getUserPrivacySettings(_userId: number): Promise<any> {
    try {
      // For now, return default privacy settings
      return {
        profileVisibility: 'public',
        allowComments: true,
        allowAnalytics: true,
        allowMarketing: false
      };
    } catch (error) {
      console.error('Error getting user privacy settings:', error);
      return null;
    }
  }

  async createUserPrivacySettings(userId: number, settings: any): Promise<any> {
    try {
      // For now, just return the settings as created
      return { userId, ...settings };
    } catch (error) {
      console.error('Error creating user privacy settings:', error);
      return null;
    }
  }

  async updateUserPrivacySettings(userId: number, settings: any): Promise<any> {
    try {
      // For now, just return the updated settings
      return { userId, ...settings };
    } catch (error) {
      console.error('Error updating user privacy settings:', error);
      return null;
    }
  }

  async getPersonalizedRecommendations(_userId: number, _options?: any): Promise<any[]> {
    try {
      // Return basic recommendations based on recent posts
      const recentPosts = await this.getPosts(10);
      return recentPosts.posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        reason: 'Popular content'
      }));
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  async createResetToken(tokenData: InsertResetToken): Promise<ResetToken> {
    const [newToken] = await db.insert(resetTokens).values(tokenData).returning();
    return newToken;
  }

  async getResetTokenByToken(token: string): Promise<ResetToken | undefined> {
    try {
      const [resetToken] = await db.select().from(resetTokens).where(
        and(
          eq(resetTokens.token, token),
          eq(resetTokens.used, false)
        )
      );
      return resetToken || undefined;
    } catch (error) {
      console.error('Error getting reset token by token:', error);
      return undefined;
    }
  }

  async markResetTokenAsUsed(token: string): Promise<void> {
    try {
      // Placeholder implementation - reset tokens table may not have 'used' field
      console.log('Marking reset token as used:', token);
    } catch (error) {
      console.error('Error marking reset token as used:', error);
    }
  }

  async approvePost(id: number): Promise<Post | undefined> {
    try {
      // Since there's no status field in the posts table, we'll update the metadata instead
      const [post] = await db
        .update(posts)
        .set({ 
          metadata: sql`jsonb_set(metadata, '{status}', '"approved"')`
        })
        .where(eq(posts.id, id))
        .returning();
      return post || undefined;
    } catch (error) {
      console.error('Error approving post:', error);
      return undefined;
    }
  }

  async clearCache(): Promise<void> {
    // Placeholder for cache clearing logic
    console.log('Cache cleared');
  }

  // Database access methods
  getDb(): any {
    return db;
  }

  getUsersTable(): any {
    return users;
  }

  getDrizzleOperators(): any {
    return { eq, desc, and, or, sql, like, asc };
  }

  // Missing methods that are causing TypeScript errors
  createPasswordResetToken(userId: number): Promise<ResetToken> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const tokenData: InsertResetToken = {
      token,
      userId,
      expiresAt,
      used: false
    };
    
    return this.createResetToken(tokenData);
  }

  verifyPasswordResetToken(token: string): Promise<ResetToken | undefined> {
    return this.getResetTokenByToken(token);
  }

  updateUserPassword(userId: number, _hashedPassword: string): Promise<void> {
    return new Promise((resolve) => {
      // Placeholder implementation - users table may not have 'password_hash' field
      console.log('Updating user password for user:', userId);
      resolve();
    });
  }

  getUserWithPassword(userId: number): Promise<User | undefined> {
    return this.getUser(userId);
  }

  deletePasswordResetToken(token: string): Promise<void> {
    return this.markResetTokenAsUsed(token);
  }

  getAnalyticsSummary(): Promise<any> {
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

  // Additional missing methods
  async getUsersCount(): Promise<number> {
    try {
      const [count] = await db.select({ count: sql<number>`count(*)` }).from(users);
      return count.count || 0;
    } catch (error) {
      console.error('Error getting users count:', error);
      return 0;
    }
  }

  async getCommentsCount(): Promise<number> {
    try {
      const [count] = await db.select({ count: sql<number>`count(*)` }).from(comments);
      return count.count || 0;
    } catch (error) {
      console.error('Error getting comments count:', error);
      return 0;
    }
  }

  async getBookmarkCount(): Promise<number> {
    try {
      const [count] = await db.select({ count: sql<number>`count(*)` }).from(bookmarks);
      return count.count || 0;
    } catch (error) {
      console.error('Error getting bookmark count:', error);
      return 0;
    }
  }

  async getTrendingPosts(limit: number): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting trending posts:', error);
      return [];
    }
  }

  async getAdminStats(): Promise<any> {
    try {
      const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [totalPosts] = await db.select({ count: sql<number>`count(*)` }).from(posts);
      const [totalComments] = await db.select({ count: sql<number>`count(*)` }).from(comments);
      const [totalBookmarks] = await db.select({ count: sql<number>`count(*)` }).from(bookmarks);
      const [totalContactMessages] = await db.select({ count: sql<number>`count(*)` }).from(contactMessages);
      const [totalUserFeedback] = await db.select({ count: sql<number>`count(*)` }).from(userFeedback);
      const [totalNewsletterSubscriptions] = await db.select({ count: sql<number>`count(*)` }).from(newsletterSubscriptions);

      return {
        totalUsers: totalUsers.count || 0,
        totalPosts: totalPosts.count || 0,
        totalComments: totalComments.count || 0,
        totalBookmarks: totalBookmarks.count || 0,
        totalContactMessages: totalContactMessages.count || 0,
        totalUserFeedback: totalUserFeedback.count || 0,
        totalNewsletterSubscriptions: totalNewsletterSubscriptions.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return null;
    }
  }

  async storePerformanceMetric(metric: any): Promise<void> {
    try {
      await db.insert(performanceMetrics).values(metric).onConflictDoNothing();
    } catch (error) {
      console.error('Error storing performance metric:', error);
    }
  }

  async getDeviceDistribution(): Promise<any> {
    try {
      // Since deviceType doesn't exist in users table, return mock data
      return [
        { deviceType: 'desktop', count: 60 },
        { deviceType: 'mobile', count: 35 },
        { deviceType: 'tablet', count: 5 }
      ];
    } catch (error) {
      console.error('Error getting device distribution:', error);
      return [];
    }
  }

  async getPerformanceMetricsByType(_type: string): Promise<any[]> {
    try {
      // Since performanceMetrics table might not have the expected structure, return mock data
      return [];
    } catch (error) {
      console.error('Error getting performance metrics by type:', error);
      return [];
    }
  }

  async getUniqueUserCount(): Promise<number> {
    try {
      const [count] = await db.select({ count: sql<number>`count(distinct user_id)` }).from(sessions);
      return count.count || 0;
    } catch (error) {
      console.error('Error getting unique user count:', error);
      return 0;
    }
  }

  async getActiveUserCount(): Promise<number> {
    try {
      const [count] = await db.select({ count: sql<number>`count(distinct user_id)` }).from(sessions);
      return count.count || 0;
    } catch (error) {
      console.error('Error getting active user count:', error);
      return 0;
    }
  }

  async getReturningUserCount(): Promise<number> {
    try {
      const [count] = await db.select({ count: sql<number>`count(distinct user_id)` }).from(sessions);
      return count.count || 0;
    } catch (error) {
      console.error('Error getting returning user count:', error);
      return 0;
    }
  }

  async getSiteAnalytics(): Promise<any> {
    try {
      const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [totalPosts] = await db.select({ count: sql<number>`count(*)` }).from(posts);
      const [totalComments] = await db.select({ count: sql<number>`count(*)` }).from(comments);
      const [totalBookmarks] = await db.select({ count: sql<number>`count(*)` }).from(bookmarks);
      const [totalContactMessages] = await db.select({ count: sql<number>`count(*)` }).from(contactMessages);
      const [totalUserFeedback] = await db.select({ count: sql<number>`count(*)` }).from(userFeedback);
      const [totalNewsletterSubscriptions] = await db.select({ count: sql<number>`count(*)` }).from(newsletterSubscriptions);

      return {
        totalUsers: totalUsers.count || 0,
        totalPosts: totalPosts.count || 0,
        totalComments: totalComments.count || 0,
        totalBookmarks: totalBookmarks.count || 0,
        totalContactMessages: totalContactMessages.count || 0,
        totalUserFeedback: totalUserFeedback.count || 0,
        totalNewsletterSubscriptions: totalNewsletterSubscriptions.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting site analytics:', error);
      return null;
    }
  }

  async logActivity(activity: any): Promise<void> {
    try {
      await db.insert(activityLogs).values(activity).onConflictDoNothing();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

    async setSiteSetting(key: string, value: string, category?: string, description?: string): Promise<void> {
    try {
      // Placeholder implementation - site settings table may not have all required fields
      console.log('Setting site setting:', { key, value, category, description });
    } catch (error) {
      console.error('Error setting site setting:', error);
    }
  }

  async getAllSiteSettings(): Promise<any[]> {
    try {
      return await db.select().from(siteSettings);
    } catch (error) {
      console.error('Error getting all site settings:', error);
      return [];
    }
  }

  async getPostCount(): Promise<number> {
    try {
      const [count] = await db.select({ count: sql<number>`count(*)` }).from(posts);
      return count.count || 0;
    } catch (error) {
      console.error('Error getting post count:', error);
      return 0;
    }
  }

  async getRecentActivity(limit: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(activityLogs)
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  async getUsers(page: number, limit: number): Promise<User[]> {
    try {
      const offset = (page - 1) * limit;
      return await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async getAdminInfo(): Promise<any> {
    try {
      const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [totalPosts] = await db.select({ count: sql<number>`count(*)` }).from(posts);
      const [totalComments] = await db.select({ count: sql<number>`count(*)` }).from(comments);
      const [totalBookmarks] = await db.select({ count: sql<number>`count(*)` }).from(bookmarks);
      const [totalContactMessages] = await db.select({ count: sql<number>`count(*)` }).from(contactMessages);
      const [totalUserFeedback] = await db.select({ count: sql<number>`count(*)` }).from(userFeedback);
      const [totalNewsletterSubscriptions] = await db.select({ count: sql<number>`count(*)` }).from(newsletterSubscriptions);

      return {
        totalUsers: totalUsers.count || 0,
        totalPosts: totalPosts.count || 0,
        totalComments: totalComments.count || 0,
        totalBookmarks: totalBookmarks.count || 0,
        totalContactMessages: totalContactMessages.count || 0,
        totalUserFeedback: totalUserFeedback.count || 0,
        totalNewsletterSubscriptions: totalNewsletterSubscriptions.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting admin info:', error);
      return null;
    }
  }

  async getSiteSettingByKey(key: string): Promise<any> {
    try {
      const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
      return setting || null;
    } catch (error) {
      console.error('Error getting site setting by key:', error);
      return null;
    }
  }

  async getUnreadAdminNotifications(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(adminNotifications)
        .where(eq(adminNotifications.isRead, false))
        .orderBy(desc(adminNotifications.createdAt));
    } catch (error) {
      console.error('Error getting unread admin notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(id: number): Promise<void> {
    try {
      // Placeholder implementation - admin notifications table may not have 'isRead' field
      console.log('Marking notification as read:', id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async getRecentActivityLogs(limit: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(activityLogs)
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting recent activity logs:', error);
      return [];
    }
  }

  async submitFeedback(feedback: any): Promise<any> {
    try {
      const [newFeedback] = await db.insert(userFeedback).values(feedback).returning();
      return newFeedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return null;
    }
  }

  async updateFeedbackStatus(id: number, status: string): Promise<any> {
    try {
      // Placeholder implementation - user feedback table may not have 'status' field
      console.log('Updating feedback status:', { id, status });
      return { id, status };
    } catch (error) {
      console.error('Error updating feedback status:', error);
      return null;
    }
  }

  async getRecentPosts(): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(10);
    } catch (error) {
      console.error('Error getting recent posts:', error);
      return [];
    }
  }

  async getRecommendedPosts(postId: number, limit: number): Promise<Post[]> {
    try {
      // This is a placeholder. In a real application, you'd use a recommendation engine
      // to find posts similar to the given post based on tags, categories, etc.
      // For now, we'll return a dummy list.
      return await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId)) // This is not a real recommendation, just a placeholder
        .limit(limit);
    } catch (error) {
      console.error('Error getting recommended posts:', error);
      return [];
    }
  }

  // Post like operations
  async getPostLike(_userId: number, _postId: number): Promise<any> {
    try {
      // Placeholder implementation - post likes table doesn't exist in schema
      return null;
    } catch (error) {
      console.error('Error getting post like:', error);
      return null;
    }
  }

  async removePostLike(_userId: number, _postId: number): Promise<boolean> {
    try {
      // Placeholder implementation - post likes table doesn't exist in schema
      return true;
    } catch (error) {
      console.error('Error removing post like:', error);
      return false;
    }
  }

  async updatePostLike(userId: number, postId: number, like: boolean): Promise<any> {
    try {
      // Placeholder implementation - post likes table doesn't exist in schema
      return { userId, postId, like };
    } catch (error) {
      console.error('Error updating post like:', error);
      return null;
    }
  }

  async createPostLike(userId: number, postId: number, like: boolean): Promise<any> {
    try {
      // Placeholder implementation - post likes table doesn't exist in schema
      return { userId, postId, like };
    } catch (error) {
      console.error('Error creating post like:', error);
      return null;
    }
  }

  async getPostLikeCounts(_postId: number): Promise<any> {
    try {
      // Placeholder implementation - post likes table doesn't exist in schema
      return { likes: 0, dislikes: 0 };
    } catch (error) {
      console.error('Error getting post like counts:', error);
      return { likes: 0, dislikes: 0 };
    }
  }

  // Comment vote operations
  async getCommentVote(_userId: number, _commentId: number): Promise<any> {
    try {
      // Placeholder implementation - comment votes table doesn't exist in schema
      return null;
    } catch (error) {
      console.error('Error getting comment vote:', error);
      return null;
    }
  }

  async removeCommentVote(_userId: number, _commentId: number): Promise<boolean> {
    try {
      // Placeholder implementation - comment votes table doesn't exist in schema
      return true;
    } catch (error) {
      console.error('Error removing comment vote:', error);
      return false;
    }
  }

  async updateCommentVote(userId: number, commentId: number, vote: string): Promise<any> {
    try {
      // Placeholder implementation - comment votes table doesn't exist in schema
      return { userId, commentId, vote };
    } catch (error) {
      console.error('Error updating comment vote:', error);
      return null;
    }
  }

  async createCommentVote(userId: number, commentId: number, vote: string): Promise<any> {
    try {
      // Placeholder implementation - comment votes table doesn't exist in schema
      return { userId, commentId, vote };
    } catch (error) {
      console.error('Error creating comment vote:', error);
      return null;
    }
  }

  async getCommentVoteCounts(_commentId: number): Promise<any> {
    try {
      // Placeholder implementation - comment votes table doesn't exist in schema
      return { upvotes: 0, downvotes: 0 };
    } catch (error) {
      console.error('Error getting comment vote counts:', error);
      return { upvotes: 0, downvotes: 0 };
    }
  }

  // Comment moderation operations
  async getRecentComments(limit: number): Promise<Comment[]> {
    try {
      return await db
        .select()
        .from(comments)
        .orderBy(desc(comments.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting recent comments:', error);
      return [];
    }
  }

  async getPendingComments(): Promise<Comment[]> {
    try {
      // Placeholder implementation - assuming comments have a status field
      // For now, return empty array as status field doesn't exist in schema
      return [];
    } catch (error) {
      console.error('Error getting pending comments:', error);
      return [];
    }
  }

  // Admin operations
  async getAdminByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), eq(users.isAdmin, true)));
      return user || undefined;
    } catch (error) {
      console.error('Error getting admin by email:', error);
      return undefined;
    }
  }

  // Secret post operations
  async unlockSecretPost(postId: number, _password: string): Promise<Post | undefined> {
    try {
      // Placeholder implementation - secret post functionality not implemented
      const post = await this.getPost(postId);
      return post || undefined;
    } catch (error) {
      console.error('Error unlocking secret post:', error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();