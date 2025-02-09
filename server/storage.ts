import { 
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type ReadingProgress, type InsertProgress,
  type SecretProgress, type InsertSecretProgress,
  type User, type InsertUser,
  type ContactMessage, type InsertContactMessage,
  type Session, type InsertSession,
  type PostLike,
  posts as postsTable, comments, readingProgress, secretProgress, users, contactMessages, sessions, postLikes
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt, gt, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAdminByEmail(email: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
  updateSessionAccess(token: string): Promise<void>;

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

  // Post Likes
  getPostLike(postId: number, userId: number): Promise<PostLike | undefined>;
  removePostLike(postId: number, userId: number): Promise<void>;
  updatePostLike(postId: number, userId: number, isLike: boolean): Promise<void>;
  createPostLike(postId: number, userId: number, isLike: boolean): Promise<void>;
  getPostLikeCounts(postId: number): Promise<{ likesCount: number; dislikesCount: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  async getAdminByEmail(email: string): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.isAdmin, true)
      ));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users)
      .values({ ...user, createdAt: new Date() })
      .returning();
    return newUser;
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

  // Posts operations
  async getPosts(): Promise<Post[]> {
    try {
      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.isSecret, false))
        .orderBy(desc(postsTable.createdAt))
        .limit(20);

      return posts.map(post => ({
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
      }));
    } catch (error) {
      console.error("Error in getPosts:", error);
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
      const [post] = await db.select()
        .from(postsTable)
        .where(eq(postsTable.slug, slug))
        .limit(1);

      if (!post) return undefined;

      return {
        ...post,
        createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
      };
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
    const [newPost] = await db.insert(postsTable)
      .values({ ...post, createdAt: new Date() })
      .returning();

    return {
      ...newPost,
      createdAt: newPost.createdAt instanceof Date ? newPost.createdAt : new Date(newPost.createdAt)
    };
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(postsTable)
      .where(eq(postsTable.id, id));
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post> {
    const [updatedPost] = await db.update(postsTable)
      .set(post)
      .where(eq(postsTable.id, id))
      .returning();

    return {
      ...updatedPost,
      createdAt: updatedPost.createdAt instanceof Date ? updatedPost.createdAt : new Date(updatedPost.createdAt)
    };
  }

  async unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress> {
    const [newProgress] = await db.insert(secretProgress)
      .values({ ...progress, discoveryDate: new Date() })
      .returning();
    return newProgress;
  }

  // Comments operations
  async getComments(postId: number): Promise<Comment[]> {
    const commentsResult = await db.select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return commentsResult.map(comment => ({
      ...comment,
      createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)
    }));
  }

  async getRecentComments(): Promise<Comment[]> {
    const commentsResult = await db.select()
      .from(comments)
      .orderBy(desc(comments.createdAt))
      .limit(10);

    return commentsResult.map(comment => ({
      ...comment,
      createdAt: comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)
    }));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments)
      .values({ ...comment, createdAt: new Date() })
      .returning();

    return {
      ...newComment,
      createdAt: newComment.createdAt instanceof Date ? newComment.createdAt : new Date(newComment.createdAt)
    };
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
    await db.delete(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ));

    await this.updatePostCounts(postId);
  }

  async updatePostLike(postId: number, userId: number, isLike: boolean): Promise<void> {
    await db.update(postLikes)
      .set({ isLike })
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ));

    await this.updatePostCounts(postId);
  }

  async createPostLike(postId: number, userId: number, isLike: boolean): Promise<void> {
    await db.insert(postLikes)
      .values({
        postId,
        userId,
        isLike,
        createdAt: new Date()
      });

    await this.updatePostCounts(postId);
  }

  async getPostLikeCounts(postId: number): Promise<{ likesCount: number; dislikesCount: number }> {
    const likes = await db.select({ count: sql`count(*)` })
      .from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.isLike, true)
      ));

    const dislikes = await db.select({ count: sql`count(*)` })
      .from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.isLike, false)
      ));

    return {
      likesCount: Number(likes[0]?.count || 0),
      dislikesCount: Number(dislikes[0]?.count || 0)
    };
  }

  private async updatePostCounts(postId: number): Promise<void> {
    const counts = await this.getPostLikeCounts(postId);
    await db.update(postsTable)
      .set({ likesCount: counts.likesCount, dislikesCount: counts.dislikesCount })
      .where(eq(postsTable.id, postId));
  }
}

export const storage = new DatabaseStorage();