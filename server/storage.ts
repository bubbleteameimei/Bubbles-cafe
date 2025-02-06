import { 
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type ReadingProgress, type InsertProgress,
  type SecretProgress, type InsertSecretProgress,
  type User, type InsertUser,
  posts, comments, readingProgress, secretProgress, users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAdminByEmail(email: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  // Posts
  getPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<void>;
  getSecretPosts(): Promise<Post[]>;
  unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post>;

  // Comments
  getComments(postId: number): Promise<Comment[]>;
  getRecentComments(): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Reading Progress
  getProgress(postId: number): Promise<ReadingProgress | undefined>;
  updateProgress(progress: InsertProgress): Promise<ReadingProgress>;
}

export class DatabaseStorage implements IStorage {
  // User operations with optimized queries
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user;
  }

  async getAdminByEmail(email: string): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  // Posts with optimized queries
  async getPosts(): Promise<Post[]> {
    // Use the created index for efficient sorting
    return await db.select()
      .from(posts)
      .where(eq(posts.isSecret, false))
      .orderBy(desc(posts.createdAt))
      .limit(50); // Paginate results for better performance
  }

  async getSecretPosts(): Promise<Post[]> {
    return await db.select()
      .from(posts)
      .where(eq(posts.isSecret, true))
      .orderBy(desc(posts.createdAt))
      .limit(20);
  }

  async getPost(slug: string): Promise<Post | undefined> {
    // Use the slug index for faster lookups
    const [post] = await db.select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts)
      .where(eq(posts.id, id));
  }

  async unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress> {
    const [newProgress] = await db.insert(secretProgress)
      .values(progress)
      .returning();
    return newProgress;
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post> {
    // Get the existing post first
    const [existingPost] = await db.select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!existingPost) {
      throw new Error("Post not found");
    }

    // Update the post while preserving the original createdAt
    const [updatedPost] = await db
      .update(posts)
      .set({
        ...post,
        createdAt: existingPost.createdAt // Preserve original creation date
      })
      .where(eq(posts.id, id))
      .returning();

    return updatedPost;
  }

  // Comments with optimized queries
  async getComments(postId: number): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt))
      .limit(100);
  }

  async getRecentComments(): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .orderBy(desc(comments.createdAt))
      .limit(10);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  // Reading Progress with optimized queries
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
}

export const storage = new DatabaseStorage();