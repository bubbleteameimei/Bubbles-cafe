import { 
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type ReadingProgress, type InsertProgress,
  posts, comments, readingProgress
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Posts
  getPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  getSecretPosts(): Promise<Post[]>;

  // Comments
  getComments(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Reading Progress
  getProgress(postId: number): Promise<ReadingProgress | undefined>;
  updateProgress(progress: InsertProgress): Promise<ReadingProgress>;
}

export class DatabaseStorage implements IStorage {
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

  async getComments(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId));
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