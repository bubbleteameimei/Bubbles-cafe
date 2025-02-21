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
  type AuthorStats,
  type WritingChallenge, type InsertWritingChallenge,
  type ChallengeEntry, type InsertChallengeEntry,
  type ContentProtection, type InsertContentProtection,
  type ReportedContent, type InsertReportedContent,
  type AuthorTip, type InsertAuthorTip,
  type Webhook, type InsertWebhook,
  type Analytics,
  type SiteSetting, type InsertSiteSetting,
  type ActivityLog, type InsertActivityLog,
  type AdminNotification, type InsertAdminNotification,
  // Tables
  posts as postsTable,
  comments,
  readingProgress,
  secretProgress,
  users,
  contactMessages,
  sessions,
  postLikes,
  commentVotes,
  commentReplies,
  authorStats,
  writingChallenges,
  challengeEntries,
  contentProtection,
  reportedContent,
  authorTips,
  webhooks,
  analytics,
  siteSettings,
  activityLogs,
  adminNotifications,
  type Achievement,
  type UserAchievement,
  type ReadingStreak,
  type WriterStreak,
  type FeaturedAuthor,
  achievements,
  userAchievements,
  readingStreaks,
  writerStreaks,
  featuredAuthors
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, lt, gt, sql, avg, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from 'bcrypt';

const PostgresSessionStore = connectPg(session);

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
  deletePost(id: number): Promise<Post>;
  getSecretPosts(): Promise<Post[]>;
  unlockSecretPost(progress: InsertSecretProgress): Promise<SecretProgress>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post>;
  getPostWithComments(slug: string): Promise<Post & { comments: Comment[] }>;
  getPostsByAuthor(authorId: number, limit?: number): Promise<Post[]>;
  getPendingPosts(): Promise<Post[]>;
  approvePost(postId: number): Promise<Post>;

  // Comments
  getComments(postId: number): Promise<Comment[]>;
  getRecentComments(): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<Comment>): Promise<Comment>;
  deleteComment(id: number): Promise<Comment>;
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

  // Author Stats
  getAuthorStats(authorId: number): Promise<AuthorStats | undefined>;
  updateAuthorStats(authorId: number): Promise<AuthorStats>;
  getTopAuthors(limit?: number): Promise<AuthorStats[]>;

  // Writing Challenges
  createWritingChallenge(challenge: InsertWritingChallenge): Promise<WritingChallenge>;
  getActiveWritingChallenges(): Promise<WritingChallenge[]>;
  submitChallengeEntry(entry: InsertChallengeEntry): Promise<ChallengeEntry>;
  getChallengeEntries(challengeId: number): Promise<ChallengeEntry[]>;

  // Content Protection
  addContentProtection(protection: InsertContentProtection): Promise<ContentProtection>;
  checkContentSimilarity(content: string): Promise<boolean>;
  reportContent(report: InsertReportedContent): Promise<ReportedContent>;
  getReportedContent(status?: string): Promise<ReportedContent[]>;
  updateReportedContent(id: number, status: string): Promise<ReportedContent>;

  // Tips System
  createTip(tip: InsertAuthorTip): Promise<AuthorTip>;
  getAuthorTips(authorId: number): Promise<AuthorTip[]>;
  getTotalTipsReceived(authorId: number): Promise<number>;


  // Webhooks
  registerWebhook(webhook: InsertWebhook): Promise<Webhook>;
  getActiveWebhooks(): Promise<Webhook[]>;
  updateWebhookStatus(id: number, active: boolean): Promise<void>;

  // Analytics
  updateAnalytics(postId: number, data: Partial<Analytics>): Promise<Analytics>;
  getPostAnalytics(postId: number): Promise<Analytics | undefined>;
  getSiteAnalytics(): Promise<{ totalViews: number; uniqueVisitors: number; avgReadTime: number }>;
  
  // Analytics methods
  getAnalyticsSummary(): Promise<{ 
    totalViews: number; 
    uniqueVisitors: number; 
    avgReadTime: number; 
    bounceRate: number; 
  }>;
  getDeviceDistribution(): Promise<{
    desktop: number;
    mobile: number;
    tablet: number;
  }>;
  sessionStore: session.Store;

  // Add achievement methods to IStorage interface
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getReadingStreak(userId: number): Promise<ReadingStreak | undefined>;
  getWriterStreak(userId: number): Promise<WriterStreak | undefined>;
  getFeaturedAuthor(userId: number): Promise<FeaturedAuthor | undefined>;
  getUserPosts(userId: number): Promise<Post[]>;
  getUserTotalLikes(userId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    console.log('[Storage] Initializing PostgreSQL session store...');

    try {
      // Initialize session store with PostgreSQL
      this.sessionStore = new PostgresSessionStore({
        pool: pool,
        createTableIfMissing: true,
        tableName: 'session',
        schemaName: 'public',
        ttl: 86400 // 1 day
      });
      console.log('[Storage] Session store initialized successfully');
    } catch (error) {
      console.error('[Storage] Failed to initialize session store:', error);
      throw error;
    }
  }

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
    try {
      // Hash the password before storing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Insert user with hashed password
      const [newUser] = await db.insert(users)
        .values({
          username: user.username,
          email: user.email,
          password_hash: hashedPassword,
          isAdmin: user.isAdmin ?? false
        })
        .returning();

      return newUser;
    } catch (error) {
      console.error("Error in createUser:", error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error("User with this email already exists");
        }
      }
      throw new Error("Failed to create user");
    }
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
  async getPosts(page: number = 1, limit: number = 16): Promise<{ posts: Post[], hasMore: boolean }> {
    try {
      console.log(`[Storage] Fetching posts - page: ${page}, limit: ${limit}`);
      const offset = (page - 1) * limit;

      // Get posts for current page with increased limit
      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.isSecret, false))
        .orderBy(desc(postsTable.createdAt))
        .limit(limit + 1) // Fetch one extra to check if there are more
        .offset(offset);

      // Check if there are more posts
      const hasMore = posts.length > limit;
      const paginatedPosts = posts.slice(0, limit); // Remove the extra post we fetched

      console.log(`[Storage] Found ${paginatedPosts.length} posts, hasMore: ${hasMore}`);

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

  async deletePost(id: number): Promise<Post> {
    try {
      console.log(`[Storage] Attempting to delete post with ID: ${id}`);
      const result = await db.delete(postsTable)
        .where(eq(postsTable.id, id))
        .returning();

      if (!result.length) {
        console.error(`[Storage] Post with ID ${id} not found`);
        throw new Error("Post not found");
      }

      console.log(`[Storage] Successfully deleted post with ID: ${id}`);
      return result[0];
    } catch (error) {
      console.error("[Storage] Error in deletePost:", error);
      throw error;
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
    try {
      console.log('[Storage] Creating new comment');
      const [newComment] = await db.insert(comments)
        .values({
          content: comment.content,
          postId: comment.postId,
          userId: comment.userId,
          approved: comment.approved,
          createdAt: new Date()
        })
        .returning();

      return {
        ...newComment,
        createdAt: newComment.createdAt instanceof Date ? newComment.createdAt : new Date(newComment.createdAt)
      };
    } catch (error) {
      console.error('[Storage] Error creating comment:', error);
      throw error;
    }
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

  async deleteComment(id: number): Promise<Comment> {
    try {
      console.log(`[Storage] Attempting to delete comment with ID: ${id}`);
      const result = await db.delete(comments)
        .where(eq(comments.id, id))
        .returning();

      if (!result.length) {
        console.error(`[Storage] Comment with ID ${id} not found`);
        throw new Error("Comment not found");
      }

      console.log(`[Storage] Successfully deleted comment with ID: ${id}`);
      return result[0];
    } catch (error) {
      console.error("[Storage] Error in deleteComment:", error);
      throw error;
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
    try {
      console.log(`[Storage] Removing like/dislike for post ${postId} by user ${userId}`);
      await db.delete(postLikes)
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        ));

      await this.updatePostCounts(postId);
      console.log(`[Storage] Successfully removed reaction for post ${postId}`);
    } catch (error) {
      console.error(`[Storage] Error removing like for post ${postId}:`, error);
      throw error;
    }
  }

  async updatePostLike(postId: number, userId: number, isLike: boolean): Promise<void> {
    try {
      console.log(`[Storage] Updating reaction for post ${postId} by user ${userId} to ${isLike ? 'like' : 'dislike'}`);
      await db.update(postLikes)
        .set({ isLike })
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        ));

      await this.updatePostCounts(postId);
      console.log(`[Storage] Successfully updated reaction for post ${postId}`);
    } catch (error) {
      console.error(`[Storage] Error updating like for post ${postId}:`, error);
      throw error;
    }
  }

  async createPostLike(postId: number, userId: number, isLike: boolean): Promise<void> {
    try {
      console.log(`[Storage] Creating new ${isLike ? 'like' : 'dislike'} for post ${postId} by user ${userId}`);
      await db.insert(postLikes)
        .values({
          postId,
          userId,
          isLike
        });

      await this.updatePostCounts(postId);
      console.log(`[Storage] Successfully created reaction for post ${postId}`);
    } catch (error) {
      console.error(`[Storage] Error creating like for post ${postId}:`, error);
      throw error;
    }
  }

  async getPostLikeCounts(postId: number): Promise<{ likesCount: number; dislikesCount: number }> {
    try {
      console.log(`[Storage] Getting like counts for post ${postId}`);
      const [likes] = await db.select({
        count: sql<string>`count(*)`
      })
        .from(postLikes)
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.isLike, true)
        ));

      const [dislikes] = await db.select({
        count: sql<string>`count(*)`
      })
        .from(postLikes)
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.isLike, false)
        ));

      const counts = {
        likesCount: Number(likes?.count || 0),
        dislikesCount: Number(dislikes?.count || 0)
      };

      console.log(`[Storage] Post ${postId} counts:`, counts);
      return counts;
    } catch (error) {
      console.error(`[Storage] Error getting like counts for post ${postId}:`, error);
      throw error;
    }
  }

  private async updatePostCounts(postId: number): Promise<void> {
    try {
      const counts = await this.getPostLikeCounts(postId);
      await db.update(postsTable)
        .set({ 
          likesCount: counts.likesCount, 
          dislikesCount: counts.dislikesCount 
        })
        .where(eq(postsTable.id, postId));

      console.log(`[Storage] Updated post ${postId} counts:`, counts);
    } catch (error) {
      console.error(`[Storage] Error updating post counts for ${postId}:`, error);
      throw error;
    }
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
    try {
      console.log('[Storage] Creating new comment reply');
      const [newReply] = await db.insert(commentReplies)
        .values({
          content: reply.content,
          userId: reply.userId,
          commentId: reply.commentId,
          approved: reply.approved,
          createdAt: new Date()
        })
        .returning();

      return {
        ...newReply,
        createdAt: newReply.createdAt instanceof Date ? newReply.createdAt : new Date(newReply.createdAt)
      };
    } catch (error) {
      console.error('[Storage] Error creating comment reply:', error);
      throw error;
    }
  }


  // Author Stats Implementation
  async getAuthorStats(authorId: number): Promise<AuthorStats | undefined> {
    const [stats] = await db.select()
      .from(authorStats)
      .where(eq(authorStats.authorId, authorId))
      .limit(1);
    return stats;
  }

  async updateAuthorStats(authorId: number): Promise<AuthorStats> {
    const [[totalPosts], [totalLikes], [totalTips]] = await Promise.all([
      db.select({ count: count() }).from(postsTable).where(eq(postsTable.authorId, authorId)),
      db.select({ count: count() }).from(postLikes).where(eq(postLikes.isLike, true)),
      db.select({ sum: sql<string>`sum(amount)` }).from(authorTips).where(eq(authorTips.authorId, authorId))
    ]);

    const [updated] = await db.update(authorStats)
      .set({
        totalPosts: Number(totalPosts.count),
        totalLikes: Number(totalLikes.count),
        totalTips: totalTips.sum || "0",
        updatedAt: new Date()
      })
      .where(eq(authorStats.authorId, authorId))
      .returning();

    return updated;
  }

  async getTopAuthors(limit: number = 10): Promise<AuthorStats[]> {
    return await db.select()
      .from(authorStats)
      .orderBy(desc(authorStats.totalLikes))
      .limit(limit);
  }

  // Writing Challenges Implementation
  async createWritingChallenge(challenge: InsertWritingChallenge): Promise<WritingChallenge> {
    const [newChallenge] = await db.insert(writingChallenges)
      .values({ ...challenge, createdAt: new Date() })
      .returning();
    return newChallenge;
  }

  async getActiveWritingChallenges(): Promise<WritingChallenge[]> {
    return await db.select()
      .from(writingChallenges)
      .where(gt(writingChallenges.endDate, new Date()))
      .orderBy(desc(writingChallenges.startDate));
  }

  async submitChallengeEntry(entry: InsertChallengeEntry): Promise<ChallengeEntry> {
    const [newEntry] = await db.insert(challengeEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getChallengeEntries(challengeId: number): Promise<ChallengeEntry[]> {
    return await db.select()
      .from(challengeEntries)
      .where(eq(challengeEntries.challengeId, challengeId))
      .orderBy(desc(challengeEntries.submissionDate));
  }

  // Content Protection Implementation
  async addContentProtection(protection: InsertContentProtection): Promise<ContentProtection> {
    const [newProtection] = await db.insert(contentProtection)
      .values({ ...protection, createdAt: new Date()})
      .returning();
    return newProtection;
  }

  async checkContentSimilarity(content: string): Promise<boolean> {
    try {
      // TODO: Implement similarity checking logic
      console.log('[Storage] Checking content similarity');
      return Promise.resolve(false);
    } catch (error) {
      console.error('[Storage] Error checking content similarity:', error);
      throw error;
    }
  }

  async reportContent(report: InsertReportedContent): Promise<ReportedContent> {
    const [newReport] = await db.insert(reportedContent)
      .values({ ...report, createdAt: new Date() })
      .returning();
    return newReport;
  }

  async getReportedContent(status: string = 'pending'): Promise<ReportedContent[]> {
    return await db.select()
      .from(reportedContent)
      .where(eq(reportedContent.status, status))
      .orderBy(desc(reportedContent.createdAt));
  }

  async updateReportedContent(id: number, status: string): Promise<ReportedContent> {
    try {
      console.log(`[Storage] Updating reported content ${id} to status: ${status}`);
      const [updatedReport] = await db.update(reportedContent)
        .set({ status })
        .where(eq(reportedContent.id, id))
        .returning();

      if (!updatedReport) {
        throw new Error("Reported content not found");
      }

      return updatedReport;
    } catch (error) {
      console.error('[Storage] Error updating reported content:', error);
      throw error;
    }
  }

  // Tips System Implementation
  async createTip(tip: InsertAuthorTip): Promise<AuthorTip> {
    const [newTip] = await db.insert(authorTips)
      .values({ ...tip, createdAt: new Date() })
      .returning();

    await this.updateAuthorStats(tip.authorId);
    return newTip;
  }

  async getAuthorTips(authorId: number): Promise<AuthorTip[]> {
    return await db.select()
      .from(authorTips)
      .where(eq(authorTips.authorId, authorId))
      .orderBy(desc(authorTips.createdAt));
  }

  async getTotalTipsReceived(authorId: number): Promise<number> {
    const [result] = await db.select({
      total: sql<string>`sum(amount)`
    })
      .from(authorTips)
      .where(eq(authorTips.authorId, authorId));

    return Number(result.total) || 0;
  }


  // Webhooks Implementation
  async registerWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [newWebhook] = await db.insert(webhooks)
      .values({ ...webhook, createdAt: new Date() })
      .returning();
    return newWebhook;
  }

  async getActiveWebhooks(): Promise<Webhook[]> {
    return await db.select()
      .from(webhooks)
      .where(eq(webhooks.active, true));
  }

  async updateWebhookStatus(id: number, active: boolean): Promise<void> {
    await db.update(webhooks)
      .set({ active })
      .where(eq(webhooks.id, id));
  }

  // Fix for updateAnalytics
  async updateAnalytics(postId: number, data: Partial<Analytics>): Promise<Analytics> {
    const existingAnalytics = await db.select()
      .from(analytics)
      .where(eq(analytics.postId, postId))
      .limit(1);

    if (existingAnalytics.length > 0) {
      const [updated] = await db.update(analytics)
        .set({
          pageViews: data.pageViews,
          uniqueVisitors: data.uniqueVisitors,
          averageReadTime: data.averageReadTime,
          bounceRate: data.bounceRate,
          deviceStats: data.deviceStats,
          updatedAt: new Date()
        })
        .where(eq(analytics.postId, postId))
        .returning();
      return updated;
    } else {
      const [newAnalytics] = await db.insert(analytics)
        .values({
          postId,
          pageViews: data.pageViews ?? 0,
          uniqueVisitors: data.uniqueVisitors ?? 0,
          averageReadTime: data.averageReadTime ?? 0,
          bounceRate: data.bounceRate ?? 0,
          deviceStats: data.deviceStats ?? {},
          updatedAt: new Date()
        })
        .returning();
      return newAnalytics;
    }
  }

  async getPostAnalytics(postId: number): Promise<Analytics | undefined> {
    const [postAnalytics] = await db.select()
      .from(analytics)
      .where(eq(analytics.postId, postId))
      .limit(1);
    return postAnalytics;
  }

  async getSiteAnalytics(): Promise<{ totalViews: number; uniqueVisitors: number; avgReadTime: number }> {
    const [result] = await db.select({
      totalViews: sql`sum(${analytics.pageViews})`,
      uniqueVisitors: sql`sum(${analytics.uniqueVisitors})`,
      avgReadTime: avg(analytics.averageReadTime)
    })
      .from(analytics);

    return {
      totalViews: Number(result.totalViews) || 0,
      uniqueVisitors: Number(result.uniqueVisitors) || 0,
      avgReadTime: Number(result.avgReadTime) || 0
    };
  }

  // Admin operations
  async getPendingPosts(): Promise<Post[]> {
    const posts = await db.select()
      .from(postsTable)
      .where(eq(sql`metadata->>'status'`, 'pending'))
      .orderBy(desc(postsTable.createdAt));

    return posts.map(post => ({
      ...post,
      createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
    }));
  }

  async approvePost(postId: number): Promise<Post> {
    const [post] = await db.update(postsTable)
      .set({
        metadata: sql`jsonb_set(metadata, '{status}', '"approved"')`
      })
      .where(eq(postsTable.id, postId))
      .returning();

    if (!post) {
      throw new Error("Post not found");
    }

    return {
      ...post,
      createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt)
    };
  }

  // Admin notification methods
  async createAdminNotification(notification: InsertAdminNotification): Promise<AdminNotification> {
    const [newNotification] = await db.insert(adminNotifications)
      .values({ ...notification, createdAt: new Date() })
      .returning();
    return newNotification;
  }

  async getUnreadAdminNotifications(): Promise<AdminNotification[]> {
    return await db.select()
      .from(adminNotifications)
      .where(eq(adminNotifications.isRead, false))
      .orderBy(desc(adminNotifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db.update(adminNotifications)
      .set({ isRead: true })
      .where(eq(adminNotifications.id, notificationId));
  }

  // Site settings methods
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select()
      .from(siteSettings)
      .orderBy(siteSettings.category);
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const [updated] = await db.update(siteSettings)
      .set({ 
        value,
        updatedAt: new Date()
      })
      .where(eq(siteSettings.key, key))
      .returning();

    if (!updated) {
      throw new Error("Setting not found");
    }

    return updated;
  }

  // Activity logging
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLogs)
      .values({ ...activity, createdAt: new Date() })
      .returning();
    return newActivity;
  }

  async getRecentActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return await db.select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
  async getAnalyticsSummary() {
    try {
      console.log('[Storage] Fetching analytics summary');
      const [result] = await db
        .select({
          totalViews: sql`sum(views)`,
          uniqueVisitors: sql`count(distinct visitor_id)`,
          avgReadTime: sql`avg(read_time)`,
          bounceRate: sql`(sum(case when page_views = 1 then 1 else 0 end) * 100.0 / count(*))`,
        })
        .from(analytics);

      return {
        totalViews: Number(result.totalViews) || 0,
        uniqueVisitors: Number(result.uniqueVisitors) || 0,
        avgReadTime: Number(result.avgReadTime) || 0,
        bounceRate: Number(result.bounceRate) || 0,
      };
    } catch (error) {
      console.error('[Storage] Error fetching analytics summary:', error);
      throw error;
    }
  }

  async getDeviceDistribution() {
    try {
      console.log('[Storage] Fetching device distribution');
      const totalSessions = await db
        .select({ count: sql`count(*)` })
        .from(analytics);

      const deviceCounts = await db
        .select({
          device: sql`device_type`,
          count: sql`count(*)`
        })
        .from(analytics)
        .groupBy(sql`device_type`);

      const total = Number(totalSessions[0]?.count) || 1; // Avoid division by zero
      const distribution = {
        desktop: 0,
        mobile: 0,
        tablet: 0
      };

      deviceCounts.forEach(row => {
        const device = row.device as keyof typeof distribution;
        if (device in distribution) {
          distribution[device] = Number(row.count) / total;
        }
      });

      return distribution;
    } catch (error) {
      console.error('[Storage] Error fetching device distribution:', error);
      throw error;
    }
  }
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      console.log('[Storage] Fetching all achievements');
      const achievementsList = await db.select()
        .from(achievements)
        .orderBy(achievements.id);
      return achievementsList;
    } catch (error) {
      console.error('[Storage] Error fetching achievements:', error);
      throw error;
    }
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    try {
      console.log(`[Storage] Fetching achievements for user: ${userId}`);
      const userAchievementList = await db.select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId))
        .orderBy(userAchievements.unlockedAt);
      return userAchievementList;
    } catch (error) {
      console.error('[Storage] Error fetching user achievements:', error);
      throw error;
    }
  }

  async getReadingStreak(userId: number): Promise<ReadingStreak | undefined> {
    try {
      console.log(`[Storage] Fetching reading streak for user: ${userId}`);
      const [streak] = await db.select()
        .from(readingStreaks)
        .where(eq(readingStreaks.userId, userId))
        .limit(1);
      return streak;
    } catch (error) {
      console.error('[Storage] Error fetching reading streak:', error);
      throw error;
    }
  }

  async getWriterStreak(userId: number): Promise<WriterStreak | undefined> {
    try {
      console.log(`[Storage] Fetching writer streak for user: ${userId}`);
      const [streak] = await db.select()
        .from(writerStreaks)
        .where(eq(writerStreaks.userId, userId))
        .limit(1);
      return streak;
    } catch (error) {
      console.error('[Storage] Error fetching writer streak:', error);
      throw error;
    }
  }

  async getFeaturedAuthor(userId: number): Promise<FeaturedAuthor | undefined> {
    try {
      console.log(`[Storage] Checking featured author status for user: ${userId}`);
      const currentDate = new Date();
      const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      const [featured] = await db.select()
        .from(featuredAuthors)
        .where(and(
          eq(featuredAuthors.userId, userId),
          eq(featuredAuthors.monthYear, monthYear)
        ))
        .limit(1);

      return featured;
    } catch (error) {
      console.error('[Storage] Error fetching featured author:', error);
      throw error;
    }
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    try {
      console.log(`[Storage] Fetching posts for user: ${userId}`);
      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.authorId, userId))
        .orderBy(desc(postsTable.createdAt));

      return posts;
    } catch (error) {
      console.error('[Storage] Error fetching user posts:', error);
      throw error;
    }
  }

  async getUserTotalLikes(userId: number): Promise<number> {
    try {
      console.log(`[Storage] Calculating total likes for user: ${userId}`);
      const [result] = await db.select({
        totalLikes: sql<number>`COUNT(*)`
      })
        .from(postLikes)
        .innerJoin(postsTable, eq(postLikes.postId, postsTable.id))
        .where(and(
          eq(postsTable.authorId, userId),
          eq(postLikes.isLike, true)
        ));

      return result?.totalLikes || 0;
    } catch (error) {
      console.error('[Storage] Error calculating user total likes:', error);
      throw error;
    }
  }

}

export const storage = new DatabaseStorage();