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
  type CommentReply,
  type InsertCommentReply,
  posts as postsTable, comments, readingProgress, secretProgress, users, contactMessages, sessions, postLikes, commentVotes, commentReplies
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
  getPosts(page?: number, limit?: number): Promise<{ posts: Post[], hasMore: boolean }>;
  getPost(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<void>;
  getSecretPosts(): Promise<Post[]>;
  unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post>;
  getPostWithComments(slug: string): Promise<Post & { comments: Comment[] }>;
  getPostsByAuthor(authorId: number, limit?: number): Promise<Post[]>;

  // Comments
  getComments(postId: number): Promise<Comment[]>;
  getRecentComments(): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<Comment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  getPendingComments(): Promise<Comment[]>;

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
  async getPosts(page: number = 1, limit: number = 10): Promise<{ posts: Post[], hasMore: boolean }> {
    try {
      const offset = (page - 1) * limit;

      // Get posts for current page
      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.isSecret, false))
        .orderBy(desc(postsTable.createdAt))
        .limit(limit + 1) // Fetch one extra to check if there are more
        .offset(offset);

      // Check if there are more posts
      const hasMore = posts.length > limit;
      const paginatedPosts = posts.slice(0, limit); // Remove the extra post we fetched

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
          throw new Error("Database schema error: Please check if the database is properly initialized");
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
    try {
      console.log('Storage: Creating new post with data:', {
        title: post.title,
        excerpt: post.excerpt,
        isSecret: post.isSecret,
        themeCategory: post.themeCategory
      });

      const [newPost] = await db.insert(postsTable)
        .values({ 
          ...post, 
          createdAt: new Date(),
          readingTimeMinutes: Math.ceil(post.content.split(/\s+/).length / 200)
        })
        .returning();

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

  async deletePost(id: number): Promise<void> {
    try {
      const result = await db.delete(postsTable)
        .where(eq(postsTable.id, id))
        .returning();

      if (!result.length) {
        throw new Error("Post not found");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      if (error instanceof Error && error.message === "Post not found") {
        throw error;
      }
      throw new Error("Failed to delete post");
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

  async getPendingComments(): Promise<Comment[]> {
    const commentsResult = await db.select()
      .from(comments)
      .where(eq(comments.approved, false))
      .orderBy(desc(comments.createdAt));

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

  async deleteComment(id: number): Promise<void> {
    try {
      const result = await db.delete(comments)
        .where(eq(comments.id, id))
        .returning();

      if (!result.length) {
        throw new Error("Comment not found");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      if (error instanceof Error && error.message === "Comment not found") {
        throw error;
      }
      throw new Error("Failed to delete comment");
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
    const [newReply] = await db.insert(commentReplies)
      .values({ ...reply, createdAt: new Date() })
      .returning();

    return {
      ...newReply,
      createdAt: newReply.createdAt instanceof Date ? newReply.createdAt : new Date(newReply.createdAt)
    };
  }
}

export const storage = new DatabaseStorage();