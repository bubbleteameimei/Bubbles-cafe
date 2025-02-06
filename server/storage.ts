import { 
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type ReadingProgress, type InsertProgress,
  type SecretProgress, type InsertSecretProgress,
  type User, type InsertUser,
  posts, comments, readingProgress, secretProgress, users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Posts
  getPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  getSecretPosts(): Promise<Post[]>;
  unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress>;

  // Comments
  getComments(postId: number): Promise<Comment[]>;
  getRecentComments(): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Reading Progress
  getProgress(postId: number): Promise<ReadingProgress | undefined>;
  updateProgress(progress: InsertProgress): Promise<ReadingProgress>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Existing methods remain unchanged
  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.isSecret, false));
  }

  async getSecretPosts(): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.isSecret, true));
  }

  async getPost(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress> {
    const [newProgress] = await db.insert(secretProgress)
      .values(progress)
      .returning();
    return newProgress;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId));
  }

  async getRecentComments(): Promise<Comment[]> {
    return await db.select().from(comments).orderBy(desc(comments.id)).limit(10);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getProgress(postId: number): Promise<ReadingProgress | undefined> {
    const [progress] = await db.select()
      .from(readingProgress)
      .where(eq(readingProgress.postId, postId));
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