import { db } from "./db";
import { eq, desc, and, or, like, asc } from "drizzle-orm";
import {
  users, posts, comments, contactMessages, bookmarks, sessions, userFeedback, newsletterSubscriptions,
  readingProgress, postLikes
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<any | undefined>;
  getUserByEmail(email: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  updateUser(id: number, user: Partial<any>): Promise<any | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<any[]>;

  // Post operations
  getPost(id: number): Promise<any | undefined>;
  getPostBySlug(slug: string): Promise<any | undefined>;
  getPosts(limit?: number, offset?: number): Promise<any[]>;
  getPostsByAuthor(authorId: number): Promise<any[]>;
  createPost(post: any): Promise<any>;
  updatePost(id: number, post: Partial<any>): Promise<any | undefined>;
  deletePost(id: number): Promise<boolean>;
  searchPosts(query: string): Promise<any[]>;

  // Comment operations
  getComment(id: number): Promise<any | undefined>;
  getCommentsByPost(postId: number): Promise<any[]>;
  createComment(comment: any): Promise<any>;
  updateComment(id: number, comment: Partial<any>): Promise<any | undefined>;
  deleteComment(id: number): Promise<boolean>;

  // Bookmark operations
  createBookmark(bookmark: any): Promise<any>;
  deleteBookmark(userId: number, postId: number): Promise<boolean>;
  getUserBookmarks(userId: number): Promise<any[]>;

  // Session operations
  createSession(session: any): Promise<any>;
  getSession(token: string): Promise<any | undefined>;
  deleteSession(token: string): Promise<boolean>;

  // Contact message operations
  createContactMessage(message: any): Promise<any>;
  getContactMessages(): Promise<any[]>;

  // User feedback operations
  createUserFeedback(feedback: any): Promise<any>;
  getUserFeedback(): Promise<any[]>;
  getAllFeedback(): Promise<any[]>;
  getFeedback(id: number): Promise<any | undefined>;

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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<any | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: any): Promise<any> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<any>): Promise<any | undefined> {
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

  async getAllUsers(): Promise<any[]> {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getPost(id: number): Promise<any | undefined> {
    try {
      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      return post || undefined;
    } catch (error) {
      console.error('Error getting post:', error);
      return undefined;
    }
  }

  async getPostBySlug(slug: string): Promise<any | undefined> {
    try {
      const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
      return post || undefined;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return undefined;
    }
  }

  async getPosts(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      return await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  async getPostsByAuthor(authorId: number): Promise<any[]> {
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

  async createPost(post: any): Promise<any> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, post: Partial<any>): Promise<any | undefined> {
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

  async searchPosts(query: string): Promise<any[]> {
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

  async getComment(id: number): Promise<any | undefined> {
    try {
      const [comment] = await db.select().from(comments).where(eq(comments.id, id));
      return comment || undefined;
    } catch (error) {
      console.error('Error getting comment:', error);
      return undefined;
    }
  }

  async getCommentsByPost(postId: number): Promise<any[]> {
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

  async createComment(comment: any): Promise<any> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async updateComment(id: number, comment: Partial<any>): Promise<any | undefined> {
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

  async createBookmark(bookmark: any): Promise<any> {
    const [newBookmark] = await db.insert(bookmarks).values(bookmark).returning();
    return newBookmark;
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

  async getUserBookmarks(userId: number): Promise<any[]> {
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

  async createSession(session: any): Promise<any> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async getSession(token: string): Promise<any | undefined> {
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

  async createContactMessage(message: any): Promise<any> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessages(): Promise<any[]> {
    try {
      return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    } catch (error) {
      console.error('Error getting contact messages:', error);
      return [];
    }
  }

  async createUserFeedback(feedback: any): Promise<any> {
    const [newFeedback] = await db.insert(userFeedback).values(feedback).returning();
    return newFeedback;
  }

  async getUserFeedback(): Promise<any[]> {
    try {
      return await db.select().from(userFeedback).orderBy(desc(userFeedback.createdAt));
    } catch (error) {
      console.error('Error getting user feedback:', error);
      return [];
    }
  }

  async getAllFeedback(): Promise<any[]> {
    return this.getUserFeedback();
  }

  async getFeedback(id: number): Promise<any | undefined> {
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

  async updateNewsletterSubscriptionStatus(id: number, newStatus: string): Promise<any> {
    try {
      const [updatedSubscription] = await db
        .update(newsletterSubscriptions)
        .set({ status: newStatus })
        .where(eq(newsletterSubscriptions.id, id))
        .returning();
      
      return updatedSubscription;
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
      const [updatedReport] = await db
        .update(contactMessages)
        .set({ status })
        .where(eq(contactMessages.id, id))
        .returning();
      return updatedReport || undefined;
    } catch (error) {
      console.error('Error updating reported content:', error);
      return undefined;
    }
  }

  async reportContent(report: any): Promise<any> {
    const [newReport] = await db.insert(contactMessages).values(report).returning();
    return newReport;
  }

  async createCommentReply(reply: any): Promise<any> {
    const [newReply] = await db.insert(contactMessages).values(reply).returning();
    return newReply;
  }

  async createActivityLog(log: any): Promise<any> {
    const [newLog] = await db.insert(contactMessages).values(log).returning();
    return newLog;
  }

  async getUserPrivacySettings(userId: number): Promise<any> {
    try {
      // Return default privacy settings for now
      return {
        profileVisibility: 'public',
        emailNotifications: true,
        dataCollection: true,
        analyticsOptOut: false
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

  async getPersonalizedRecommendations(userId: number, options?: any): Promise<any[]> {
    try {
      // Return basic recommendations based on recent posts
      const recentPosts = await this.getPosts(10);
      return recentPosts.map(post => ({
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
}

export const storage = new DatabaseStorage();