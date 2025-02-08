import { 
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type ReadingProgress, type InsertProgress,
  type SecretProgress, type InsertSecretProgress,
  type User, type InsertUser,
  type ContactMessage, type InsertContactMessage,
  posts as postsTable, comments, readingProgress, secretProgress, users, contactMessages
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
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
    try {
      console.log("Fetching posts from database...");
      const dbPosts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.isSecret, false))
        .orderBy(desc(postsTable.createdAt));

      console.log(`Found ${dbPosts.length} posts in database`);

      const transformedPosts = dbPosts.map(post => {
        let dateStr;
        try {
          dateStr = post.createdAt instanceof Date 
            ? post.createdAt.toISOString()
            : new Date(post.createdAt).toISOString();
        } catch (error) {
          console.error(`Error formatting date for post ${post.id}:`, error);
          dateStr = new Date().toISOString(); // Fallback to current date
        }

        console.log(`Processing post: ${post.title} (ID: ${post.id}) with date: ${dateStr}`);

        return {
          ...post,
          createdAt: dateStr
        };
      });

      console.log(`Returning ${transformedPosts.length} transformed posts`);
      return transformedPosts;
    } catch (error) {
      console.error("Error in getPosts:", error);
      throw error;
    }
  }

  async getSecretPosts(): Promise<Post[]> {
    try {
      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.isSecret, true))
        .orderBy(desc(postsTable.createdAt))
        .limit(20);

      return posts.map(post => {
        const dateStr = post.createdAt instanceof Date 
          ? post.createdAt.toISOString()
          : new Date(post.createdAt).toISOString();

        return {
          ...post,
          createdAt: dateStr
        };
      });
    } catch (error) {
      console.error("Error in getSecretPosts:", error);
      throw error;
    }
  }

  async getPost(slug: string): Promise<Post | undefined> {
    try {
      const [post] = await db.select()
        .from(postsTable)
        .where(eq(postsTable.slug, slug))
        .limit(1);

      if (!post) return undefined;

      const dateStr = post.createdAt instanceof Date 
        ? post.createdAt.toISOString()
        : new Date(post.createdAt).toISOString();

      return {
        ...post,
        createdAt: dateStr
      };
    } catch (error) {
      console.error("Error in getPost:", error);
      throw error;
    }
  }

  async createPost(post: InsertPost): Promise<Post> {
    try {
      const postDate = post.createdAt ? new Date(post.createdAt) : new Date();
      if (isNaN(postDate.getTime())) {
        throw new Error(`Invalid date provided: ${post.createdAt}`);
      }

      const [newPost] = await db.insert(postsTable)
        .values({
          ...post,
          createdAt: postDate
        })
        .returning();

      return {
        ...newPost,
        createdAt: newPost.createdAt.toISOString()
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(postsTable)
      .where(eq(postsTable.id, id));
  }

  async unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress> {
    const [newProgress] = await db.insert(secretProgress)
      .values(progress)
      .returning();
    return newProgress;
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post> {
    console.log("Updating post in storage:", id, post);

    // Get the existing post first
    const [existingPost] = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, id))
      .limit(1);

    if (!existingPost) {
      throw new Error("Post not found");
    }

    // Update the post while preserving the original createdAt and order
    const [updatedPost] = await db
      .update(postsTable)
      .set({
        ...post,
        createdAt: existingPost.createdAt // Preserve original creation date
      })
      .where(eq(postsTable.id, id))
      .returning();

    console.log("Post updated successfully:", updatedPost);
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

  // Contact Messages Implementation
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();