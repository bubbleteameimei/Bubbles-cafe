import { 
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type User, type InsertUser,
  type ContactMessage, type InsertContactMessage,
  type Session, type InsertSession,
  type Bookmark, type InsertBookmark,
  type UserFeedback, type InsertUserFeedback,
  // Tables
  posts as postsTable,
  comments,
  users,
  contactMessages,
  sessions,
  bookmarks,
  userFeedback
} from "@shared/schema";

import { db } from "./db";
import { eq, desc, asc, and, or, like } from "drizzle-orm";

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
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
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

  // Bookmark operations
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: number, postId: number): Promise<boolean>;
  getUserBookmarks(userId: number): Promise<Bookmark[]>;

  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<boolean>;

  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;

  // User feedback operations
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getUserFeedback(): Promise<UserFeedback[]>;
}

export class DatabaseStorage implements IStorage {
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
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
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
      const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id));
      return post || undefined;
    } catch (error) {
      console.error('Error getting post:', error);
      return undefined;
    }
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    try {
      const [post] = await db.select().from(postsTable).where(eq(postsTable.slug, slug));
      return post || undefined;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return undefined;
    }
  }

  async getPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(postsTable)
        .orderBy(desc(postsTable.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  async getPostsByAuthor(authorId: number): Promise<Post[]> {
    try {
      return await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.authorId, authorId))
        .orderBy(desc(postsTable.createdAt));
    } catch (error) {
      console.error('Error getting posts by author:', error);
      return [];
    }
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(postsTable).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, post: Partial<Post>): Promise<Post | undefined> {
    try {
      const [updatedPost] = await db
        .update(postsTable)
        .set(post)
        .where(eq(postsTable.id, id))
        .returning();
      return updatedPost || undefined;
    } catch (error) {
      console.error('Error updating post:', error);
      return undefined;
    }
  }

  async deletePost(id: number): Promise<boolean> {
    try {
      const result = await db.delete(postsTable).where(eq(postsTable.id, id));
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
        .from(postsTable)
        .where(
          or(
            like(postsTable.title, `%${query}%`),
            like(postsTable.content, `%${query}%`),
            like(postsTable.excerpt, `%${query}%`)
          )
        )
        .orderBy(desc(postsTable.createdAt));
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
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
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

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
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
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
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
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
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
    const [newFeedback] = await db.insert(userFeedback).values(feedback).returning();
    return newFeedback;
  }

  async getUserFeedback(): Promise<UserFeedback[]> {
    try {
      return await db.select().from(userFeedback).orderBy(desc(userFeedback.createdAt));
    } catch (error) {
      console.error('Error getting user feedback:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();