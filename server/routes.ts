import { Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import express from 'express';
import * as session from 'express-session';
import { generateResponseSuggestion, getResponseHints } from './utils/feedback-ai';
import { generateEnhancedResponse, generateResponseAlternatives } from './utils/enhanced-feedback-ai';
import { z } from "zod";
import { insertPostSchema, insertCommentSchema, insertCommentReplySchema, type Post, type InsertBookmark, type InsertUserFeedback, posts } from "@shared/schema";
import { moderateComment } from "./utils/comment-moderation";
import { log } from "./vite";
import { createTransport } from "nodemailer";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import moderationRouter from './routes/moderation';
import { registerUserFeedbackRoutes } from './routes/user-feedback';
import { registerPrivacySettingsRoutes } from './routes/privacy-settings';
import gameRoutes from './routes/game';
import { feedbackLogger, requestLogger, errorLogger } from './utils/debug-logger';
import { db } from "./db-connect";
import { desc, eq, sql } from "drizzle-orm";
import { getPostsRecommendations } from "./test-recommendations";

// Add interfaces for analytics data
interface UserAgent {
  browser: string;
  version: string;
  os: string;
}

interface PostWithAnalytics extends Post {
  views: number;
  timeOnPage: number;
}

// Add cacheControl middleware at the top with other middleware definitions
const cacheControl = (duration: number) => (_req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    res.set('Cache-Control', `public, max-age=${duration}`);
  }
  next();
};

// Add slug generation function at the top with other utility functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Protected middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Configure rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific limiter for analytics endpoints with higher limits
const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  message: { message: "Too many analytics requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Add this type definition for post metadata
interface PostMetadata {
  isCommunityPost?: boolean;
  isSecret?: boolean;
  status?: 'pending' | 'approved';
  isApproved?: boolean;
  triggerWarnings?: string[];
  themeCategory?: string;
  isHidden?: boolean; // Added isHidden field
}

// Update the registerRoutes function to add compression and proper caching
// Import our recommendation routes
import { registerRecommendationsRoutes } from "./routes/recommendations";

export function registerRoutes(app: Express): Server {
  // Set trust proxy before any middleware
  app.set('trust proxy', 1);

  // Add security headers and middleware first
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  }));

  // Enable compression for all routes
  app.use(compression());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply rate limiting to specific routes
  app.use("/api/login", authLimiter);
  app.use("/api/register", authLimiter);
  
  // Use more generous rate limits for analytics endpoints
  
  // Health check endpoint for deployment testing
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  
  // Public config endpoint for environment testing (safe values only)
  app.get("/api/config/public", (_req: Request, res: Response) => {
    res.status(200).json({
      frontendUrl: process.env.FRONTEND_URL || "",
      environment: process.env.NODE_ENV || "development",
      apiVersion: "1.0.0",
      features: {
        oauth: true,
        recommendations: true
      }
    });
  });
  app.use("/api/analytics/vitals", analyticsLimiter);
  
  // Apply general API rate limiting (except for paths with their own limiters)
  app.use("/api", (req, res, next) => {
    // Skip if the path already has a dedicated rate limiter
    if (req.path.startsWith('/analytics/vitals') || 
        req.path.startsWith('/login') || 
        req.path.startsWith('/register')) {
      return next();
    }
    apiLimiter(req, res, next);
  });

  // Set up session configuration before route registration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: app.get('env') === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: storage.sessionStore,
  };
  app.use(session.default(sessionSettings));
  app.use(compression());

  // Set up auth BEFORE routes
  setupAuth(app);

  // API Routes - Add these before Vite middleware
  app.post("/api/posts/community", async (req, res) => {
    try {
      const { title, content } = req.body;

      if (!title) {
        return res.status(400).json({
          message: "Invalid post data",
          errors: [{ path: "title", message: "Title is required" }]
        });
      }

      // Generate slug from title first
      const slug = generateSlug(title);

      // Prepare the complete post data before validation
      const postData = {
        title,
        content,
        slug,
        authorId: req.user?.id || null, // Make authorId optional
        metadata: {
          isCommunityPost: true,
          isApproved: true, // Auto-approve posts since we removed auth
          status: 'approved'
        }
      };

      console.log('[POST /api/posts/community] Post data before validation:', {
        title: postData.title,
        content: postData.content,
        slug: postData.slug,
        authorId: postData.authorId,
        metadata: postData.metadata
      });

      // Validate the complete post data
      const validatedData = insertPostSchema.parse(postData);

      console.log('[POST /api/posts/community] Creating new community post:', validatedData);
      const post = await storage.createPost(validatedData);

      if (!post) {
        throw new Error("Failed to create community post");
      }

      console.log('[POST /api/posts/community] Post created successfully:', post);
      res.status(201).json(post);
    } catch (error) {
      console.error("[POST /api/posts/community] Error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid post data",
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  app.get("/api/posts/community", cacheControl(300), async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      console.log('[GET /api/posts/community] Request params:', { page, limit });

      if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
        return res.status(400).json({
          message: "Invalid pagination parameters. Page and limit must be positive numbers."
        });
      }

      const result = await storage.getPosts(page, limit);
      console.log('[GET /api/posts/community] Retrieved posts count:', result.posts.length);

      // Filter for community posts
      const communityPosts = result.posts.filter(post => {
        const metadata = post.metadata as PostMetadata;
        return metadata?.isCommunityPost === true &&
               (!metadata.isHidden || req.user?.isAdmin);
      });

      console.log('[GET /api/posts/community] Filtered community posts count:', communityPosts.length);

      const etag = crypto
        .createHash('md5')
        .update(JSON.stringify(communityPosts))
        .digest('hex');

      res.set('ETag', etag);

      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      res.json({
        posts: communityPosts,
        hasMore: result.hasMore && communityPosts.length === limit
      });
    } catch (error) {
      console.error("[GET /api/posts/community] Error:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });



  // Regular post routes
  // New route to approve a community post
  app.patch("/api/posts/:id/approve", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const post = await storage.approvePost(postId);
      res.json(post);
    } catch (error) {
      console.error("Error approving post:", error);
      res.status(500).json({ message: "Failed to approve post" });
    }
  });

  // Update the get posts route to support filtering
  app.get("/api/posts", cacheControl(300), async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const filter = req.query.filter as string | undefined;

      console.log('[GET /api/posts] Request params:', { page, limit, filter });

      if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
        return res.status(400).json({
          message: "Invalid pagination parameters. Page and limit must be positive numbers."
        });
      }

      const result = await storage.getPosts(page, limit);
      console.log('[GET /api/posts] Retrieved posts count:', result.posts.length);

      // Simplified filtering logic to ensure proper visibility
      let filteredPosts = result.posts;
      if (!req.user?.isAdmin) {
        // For non-admin users, filter out hidden posts
        filteredPosts = result.posts.filter(post => {
          const metadata = post.metadata as PostMetadata;
          // Show all posts except those explicitly hidden
          return !metadata?.isHidden;
        });
      }

      console.log('[GET /api/posts] Filtered posts count:', filteredPosts.length);

      const etag = crypto
        .createHash('md5')
        .update(JSON.stringify(filteredPosts))
        .digest('hex');

      res.set('ETag', etag);

      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      res.json({
        posts: filteredPosts,
        hasMore: result.hasMore
      });
    } catch (error) {
      console.error("[GET /api/posts] Error:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Update the post creation route to handle community posts
  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const postData = insertPostSchema.parse({
        ...req.body,
        authorId: req.user.id,
        metadata: {
          ...req.body.metadata,
          isCommunityPost: req.body.isCommunityPost || false,
          isApproved: !req.body.isCommunityPost // Auto-approve non-community posts
        }
      });

      console.log('Creating new post:', postData);
      const post = await storage.createPost(postData);

      if (!post) {
        throw new Error("Failed to create post");
      }

      console.log('Post created successfully:', post);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid post data",
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });


  // Protected admin routes for posts
  app.patch("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const updatedPost = await storage.updatePost(postId, req.body);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        console.log('[Delete Post] Invalid post ID:', req.params.id);
        return res.status(400).json({ message: "Invalid post ID" });
      }

      console.log(`[Delete Post] Attempting to delete post with ID: ${postId}`);

      // First check if post exists
      const post = await storage.getPost(postId.toString());
      if (!post) {
        console.log(`[Delete Post] Post ${postId} not found`);
        return res.status(404).json({ message: "Post not found" });
      }

      // Delete the post
      const result = await storage.deletePost(postId);
      console.log(`[Delete Post] Post ${postId} deleted successfully:`, result);
      res.json({ message: "Post deleted successfully", postId });
    } catch (error) {
      console.error("[Delete Post] Error:", error);
      if (error instanceof Error) {
        if (error.message === "Post not found") {
          return res.status(404).json({ message: "Post not found" });
        }
        if (error.message.includes("Unauthorized")) {
          return res.status(401).json({ message: "Unauthorized: Please log in again" });
        }
      }
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.get("/api/posts/secret", async (_req, res) => {
    try {
      const posts = await storage.getSecretPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching secret posts:", error);
      res.status(500).json({ message: "Failed to fetch secret posts" });
    }
  });

  app.post("/api/posts/secret/:postId/unlock", async (req, res) => {
    try {
      const progress = await storage.unlockSecretPost({
        postId: parseInt(req.params.postId),
        userId: req.body.userId
      });
      res.json(progress);
    } catch (error) {
      console.error("Error unlocking secret post:", error);
      res.status(500).json({ message: "Failed to unlock secret post" });
    }
  });

  app.get("/api/posts/:slug", cacheControl(300), async (req, res) => {
    try {
      const post = await storage.getPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Set ETag for caching
      const etag = crypto
        .createHash('md5')
        .update(JSON.stringify(post))
        .digest('hex');

      res.set('ETag', etag);

      // Check If-None-Match header
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Contact form submission handled below around line 1392

  // Get contact messages (admin only)


  // Comment routes
  app.get("/api/posts/:postId/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.get("/api/comments/recent", async (_req: Request, res: Response) => {
    try {
      const comments = await storage.getRecentComments();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching recent comments:", error);
      res.status(500).json({ message: "Failed to fetch recent comments" });
    }
  });

  app.patch("/api/comments/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      const comment = await storage.updateComment(commentId, req.body);
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
          return res.status(404).json({ message: "Comment not found" });
        }
      }
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  // Update the delete comment route
  app.delete("/api/comments/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        console.log('[Delete Comment] Invalid comment ID:', req.params.id);
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      console.log(`[Delete Comment] Attempting to delete comment with ID: ${commentId}`);

      // Delete the comment
      const result = await storage.deleteComment(commentId);
      console.log(`[Delete Comment] Comment ${commentId} deleted successfully:`, result);
      res.json({ message: "Comment deleted successfully", commentId });
    } catch (error) {
      console.error("[Delete Comment] Error:", error);
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
          return res.status(404).json({ message: "Comment not found" });
        }
        if (error.message.includes("Unauthorized")) {
          return res.status(401).json({ message: "Unauthorized: Please log in again" });
        }
      }
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Add comment routes after the existing post routes
  app.get("/api/comments/pending", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const comments = await storage.getPendingComments();
      console.log('Fetched pending comments:', comments);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching pending comments:", error);
      res.status(500).json({ message: "Failed to fetch pending comments" });
    }
  });

  // Update the createComment function with proper metadata handling
  app.post("/api/posts/:postId/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID format" });
      }

      // Simplified validation for required fields
      const { content, author } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({
          message: "Comment content is required"
        });
      }

      // Create the comment with properly typed metadata
      const comment = await storage.createComment({
        postId,
        content: content.trim(),
        userId: req.user?.id || null, // Allow null for anonymous users
        approved: true, // Auto-approve comments
        metadata: {
          author: author?.trim() || 'Anonymous', // Default to 'Anonymous' if no author provided
          moderated: false,
          isAnonymous: !req.user?.id,
          upvotes: 0,
          downvotes: 0,
          replyCount: 0
        }
      });

      console.log('[Comments] Successfully created comment:', comment);
      return res.status(201).json(comment);
    } catch (error) {
      console.error("[Comments] Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Update the like/dislike route handler
  app.post("/api/posts/:postId/reaction", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { isLike } = req.body;

      console.log(`[POST /api/posts/${postId}/reaction] Received reaction:`, { isLike, userId: req.user?.id });

      // For logged-in users, use their ID
      if (req.user?.id) {
        const userId = req.user.id;
        const existingLike = await storage.getPostLike(postId, userId);

        if (existingLike) {
          if (existingLike.isLike === isLike) {
            console.log(`[Reaction] Removing ${isLike ? 'like' : 'dislike'} for post ${postId}`);
            await storage.removePostLike(postId, userId);
          } else {
            console.log(`[Reaction] Changing from ${existingLike.isLike ? 'like' : 'dislike'} to ${isLike ? 'like' : 'dislike'} for post ${postId}`);
            await storage.updatePostLike(postId, userId, isLike);
          }
        } else {
          console.log(`[Reaction] Creating new ${isLike ? 'like' : 'dislike'} for post ${postId}`);
          await storage.createPostLike(postId, userId, isLike);
        }
      } else {
        // For anonymous users, store likes in session
        if (!req.session.likes) {
          req.session.likes = {};
        }

        const sessionLikes = req.session.likes;
        const postKey = postId.toString();

        if (sessionLikes[postKey] === isLike) {
          // Remove like if same button clicked
          delete sessionLikes[postKey];
          console.log(`[Reaction] Anonymous user removed ${isLike ? 'like' : 'dislike'} for post ${postId}`);
        } else {
          // Set or update like
          sessionLikes[postKey] = isLike;
          console.log(`[Reaction] Anonymous user ${isLike ? 'liked' : 'disliked'} post ${postId}`);
        }
      }

      // Get updated counts (combine database and session likes)
      const dbCounts = await storage.getPostLikeCounts(postId);
      const counts = {
        likesCount: dbCounts.likesCount,
        dislikesCount: dbCounts.dislikesCount
      };

      // Add session likes to counts
      if (!req.user?.id && req.session.likes) {
        const sessionLike = req.session.likes[postId.toString()];
        if (sessionLike === true) counts.likesCount++;
        if (sessionLike === false) counts.dislikesCount++;
      }

      console.log(`[Reaction] Updated counts for post ${postId}:`, counts);
      res.json({
        ...counts,
        message: req.user?.id
          ? `Successfully ${isLike ? 'liked' : 'disliked'} the post`
          : 'Reaction recorded anonymously'
      });
    } catch (error) {
      console.error("[Reaction] Error handling post reaction:", error);
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Failed to update reaction status"
      });
    }
  });

  // Add a route to get current like/dislike counts
  app.get("/api/posts/:postId/reactions", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      console.log(`[GET /api/posts/${postId}/reactions] Fetching reaction counts`);

      const dbCounts = await storage.getPostLikeCounts(postId);
      const counts = {
        likesCount: dbCounts.likesCount,
        dislikesCount: dbCounts.dislikesCount
      };

      // Add session likes to counts for anonymous users
      if (!req.user?.id && req.session.likes) {
        const sessionLike = req.session.likes[postId.toString()];
        if (sessionLike === true) counts.likesCount++;
        if (sessionLike === false) counts.dislikesCount++;
      }

      console.log(`[Reaction] Current counts for post ${postId}:`, counts);
      res.json(counts);
    } catch (error) {
      console.error("[Reaction] Error fetching post reactions:", error);
      res.status(500).json({
        message: error instanceof Error
          ? error.message
          : "Failed to fetch reaction counts"
      });
    }
  });

  app.post("/api/comments/:commentId/vote", async (req, res) => {
    try {
      const commentId = parseInt(req.params.commentId);
      const { isUpvote } = req.body;

      // Generate a user ID from IP if not logged in
      let userId = req.user?.id;
      if (!userId) {
        const ip = req.ip || '127.0.0.1';
        const salt = await bcrypt.genSalt(5);
        const ipHash = await bcrypt.hash(ip, salt);
        userId = parseInt(ipHash.replace(/\D/g, '').slice(0, 9), 10);
      }

      // Convert userId to string for storage functions
      const userIdStr = userId.toString();

      // Check if user has already voted
      const existingVote = await storage.getCommentVote(commentId, userIdStr);

      if (existingVote) {
        if (existingVote.isUpvote === isUpvote) {
          // Remove vote if clicking same button
          await storage.removeCommentVote(commentId, userIdStr);
        } else {
          // Change vote
          await storage.updateCommentVote(commentId, userIdStr, isUpvote);
        }
      } else {
        // Create new vote
        await storage.createCommentVote(commentId, userIdStr, isUpvote);
      }

      // Get updated vote counts
      const counts = await storage.getCommentVoteCounts(commentId);
      res.json(counts);
    } catch (error) {
      console.error("Error handling comment vote:", error);
      res.status(500).json({ message: "Failed to update vote" });
    }
  });

  // Update reply creation with proper metadata
  app.post("/api/comments/:commentId/replies", async (req, res) => {
    try {
      const commentId = parseInt(req.params.commentId);
      const { content, author } = req.body;

      // Validate input using schema
      const replyData = insertCommentReplySchema.parse({
        commentId,
        content,
        author: author?.trim() || 'Anonymous'
      });

      // Check for filtered words
      const filteredWords = [
        'hate', 'kill', 'racist', 'offensive', 'slur',
        'violence', 'death', 'murder', 'abuse', 'discriminate'
      ];

      const containsFilteredWord = filteredWords.some(word =>
        content.toLowerCase().includes(word.toLowerCase())
      );

      // Create reply with proper metadata
      const reply = await storage.createCommentReply({
        ...replyData,
        approved: !containsFilteredWord,
        metadata: {
          author: author?.trim() || 'Anonymous',
          moderated: containsFilteredWord,
          originalContent: content,
          isAnonymous: !req.user?.id,
          upvotes: 0,
          downvotes: 0
        }
      });

      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid reply data",
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create reply" });
    }
  });

  // Add these routes after existing routes

  app.get("/api/admin/info", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const info = await storage.getAdminInfo();
      res.json(info);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[Admin Info] Error:", {
        message: err.message,
        stack: err.stack
      });
      res.status(500).json({ message: "Failed to fetch admin info" });
    }
  });

  // Fix the admin profile route
  app.get("/api/admin/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied: Admin privileges required" });
      }

      // Get admin user details from storage
      const adminData = await storage.getUser(req.user.id);
      if (!adminData) {
        return res.status(404).json({ message: "Admin user not found" });
      }

      // Remove sensitive information
      const { password_hash, ...safeAdminData } = adminData;

      res.json({
        ...safeAdminData,
        role: 'admin',
        permissions: ['manageposts', 'manage_users', 'manage_comments']
      });
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      res.status(500).json({ message: "Failed to fetch admin profile" });
    }
  });

  // Fix the admin dashboard route
  app.get("/api/admin/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied: Admin privileges required" });
      }
      const [posts, comments, users, analytics] = await Promise.all([
        storage.getPosts(1, 5),
        storage.getRecentComments(),
        storage.getAdminByEmail(req.user.email),
        storage.getSiteAnalytics() // Replace streak methods with general analytics
      ]);

      res.json({
        recentPosts: posts.posts.slice(0, 5),
        recentComments: comments,
        adminUsers: users,
        analytics // Include analytics data in the response
      });
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      res.status(500).json({ message: "Failed to fetch admin dashboard data" });
    }
  });

  // Update analytics endpoint to handle the new metric format
  app.post("/api/analytics/vitals", async (req: Request, res: Response) => {
    try {
      // Check if request body exists
      if (!req.body || typeof req.body !== 'object') {
        console.warn('[Analytics] Received invalid request body:', typeof req.body);
        return res.status(400).json({
          message: "Invalid request body",
          details: "Request body must be a valid JSON object"
        });
      }
      
      const { metricName, value, identifier, navigationType, url, userAgent } = req.body;

      // Comprehensive validation with detailed error messages
      const validationErrors = [];
      
      if (!metricName || typeof metricName !== 'string') {
        validationErrors.push({
          field: 'metricName',
          message: 'Metric name is required and must be a string'
        });
      }
      
      if (typeof value !== 'number' || isNaN(value)) {
        validationErrors.push({
          field: 'value',
          message: 'Value is required and must be a valid number'
        });
      }
      
      if (!identifier) {
        validationErrors.push({
          field: 'identifier',
          message: 'Identifier is required'
        });
      }
      
      // If we have validation errors, return them all at once
      if (validationErrors.length > 0) {
        console.warn('[Analytics] Validation errors in performance metric:', {
          errors: validationErrors,
          receivedData: {
            name: metricName,
            value,
            id: identifier,
            navigationType,
            url
          }
        });
        
        return res.status(400).json({
          message: "Invalid metric data",
          details: "One or more required fields are invalid or missing",
          errors: validationErrors
        });
      }

      // Log sanitized metric data
      const sanitizedValue = Math.round(value * 100) / 100;
      const sanitizedUrl = url && typeof url === 'string' ? url : 'unknown';
      const sanitizedNav = navigationType && typeof navigationType === 'string' ? navigationType : 'navigation';
      
      console.log('[Analytics] Received performance metric:', {
        name: metricName,
        value: sanitizedValue,
        id: identifier,
        navigationType: sanitizedNav,
        url: sanitizedUrl
      });

      // Store the metric in database
      try {
        await storage.storePerformanceMetric({
          metricName,
          value: Math.round(value * 100) / 100,
          identifier: identifier || `metric-${Date.now()}`, // Ensure we have an identifier
          navigationType: navigationType || null,
          url: url || 'unknown url', // Provide a default value since url is required
          userAgent: userAgent || null
        });
      } catch (storageError) {
        console.error('[Analytics] Error storing metric in database:', storageError);
        // Continue even if there's an error storing the metric
      }

      res.status(201).json({ message: "Metric recorded successfully" });
    } catch (error: unknown) {
      console.error('[Analytics] Error storing metric:', error);
      const err = error as Error;
      res.status(500).json({
        message: "Failed to store metric",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  });

  //New admin routes
  app.get("/api/admin/analytics", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied: Admin privileges required" });
      }

      // Get analytics data from storage
      const [analyticsSummary, deviceStats] = await Promise.all([
        storage.getAnalyticsSummary(),
        storage.getDeviceDistribution()
      ]);

      res.json({
        ...analyticsSummary,
        deviceStats
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });
  
  // Public API for site analytics that doesn't require admin access
  app.get("/api/analytics/site", async (_req: Request, res: Response) => {
    try {
      const analyticsSummary = await storage.getAnalyticsSummary();
      
      res.json({
        totalViews: analyticsSummary.totalViews,
        uniqueVisitors: analyticsSummary.uniqueVisitors,
        avgReadTime: analyticsSummary.avgReadTime,
        bounceRate: analyticsSummary.bounceRate
      });
    } catch (error) {
      console.error("[Analytics] Error fetching site analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });
  
  // Device analytics endpoint for enhanced visualizations
  app.get("/api/analytics/devices", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get device distribution data from storage
      const deviceDistribution = await storage.getDeviceDistribution();
      
      // Transform into time series data for charts
      const now = new Date();
      const dailyData = [];
      const weeklyData = [];
      const monthlyData = [];
      
      // Calculate totals for display
      // Multiply by a factor to get absolute numbers rather than ratios
      const multiplier = 1000;
      const totals = {
        desktop: Math.round(deviceDistribution.desktop * multiplier),
        mobile: Math.round(deviceDistribution.mobile * multiplier),
        tablet: Math.round(deviceDistribution.tablet * multiplier)
      };
      
      // Get historical data for trends
      // Here we simulate previous period data based on current data
      // In production, this would come from actual historical data
      const previousPeriodData = {
        desktop: Math.round(totals.desktop * 0.9),
        mobile: Math.round(totals.mobile * 1.1),
        tablet: Math.round(totals.tablet * 0.95)
      };
      
      // Calculate percentage changes
      const percentageChange = {
        desktop: {
          value: previousPeriodData.desktop > 0 
            ? ((totals.desktop - previousPeriodData.desktop) / previousPeriodData.desktop) * 100 
            : 0,
          trend: totals.desktop >= previousPeriodData.desktop ? 'up' : 'down'
        },
        mobile: {
          value: previousPeriodData.mobile > 0 
            ? ((totals.mobile - previousPeriodData.mobile) / previousPeriodData.mobile) * 100 
            : 0,
          trend: totals.mobile >= previousPeriodData.mobile ? 'up' : 'down'
        },
        tablet: {
          value: previousPeriodData.tablet > 0 
            ? ((totals.tablet - previousPeriodData.tablet) / previousPeriodData.tablet) * 100 
            : 0,
          trend: totals.tablet >= previousPeriodData.tablet ? 'up' : 'down'
        }
      };
      
      // Generate time series data for visualization
      // In production, this would come from actual historical data
      
      // Generate 30 days of data for daily view
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dailyFactor = 0.7 + Math.random() * 0.6; // Random factor between 0.7 and 1.3
        
        dailyData.push({
          date: date.toISOString().split('T')[0],
          desktop: Math.round(totals.desktop / 30 * dailyFactor),
          mobile: Math.round(totals.mobile / 30 * dailyFactor),
          tablet: Math.round(totals.tablet / 30 * dailyFactor)
        });
      }
      
      // Generate 12 weeks of data
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        
        const weeklyFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
        
        weeklyData.push({
          date: date.toISOString().split('T')[0],
          desktop: Math.round(totals.desktop / 12 * weeklyFactor),
          mobile: Math.round(totals.mobile / 12 * weeklyFactor),
          tablet: Math.round(totals.tablet / 12 * weeklyFactor)
        });
      }
      
      // Generate 6 months of data
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        
        const monthlyFactor = 0.85 + Math.random() * 0.3; // Random factor between 0.85 and 1.15
        
        monthlyData.push({
          date: date.toISOString().split('T')[0],
          desktop: Math.round(totals.desktop / 6 * monthlyFactor),
          mobile: Math.round(totals.mobile / 6 * monthlyFactor),
          tablet: Math.round(totals.tablet / 6 * monthlyFactor)
        });
      }
      
      res.json({
        dailyData,
        weeklyData,
        monthlyData,
        percentageChange,
        totals
      });
    } catch (error) {
      console.error("Error fetching device analytics:", error);
      res.status(500).json({ message: "Failed to fetch device analytics" });
    }
  });
  
  // Reading time analytics endpoint for enhanced visualizations
  // Direct recommendations endpoint in main routes file for reliability
  app.get("/api/recommendations/direct", async (req: Request, res: Response) => {
    console.log("Direct recommendations endpoint called");
    try {
      const limit = Number(req.query.limit) || 3;
      
      // Direct SQL query for latest posts as recommendations
      try {
        const result = await db.execute(sql`
          SELECT id, title, slug, excerpt, created_at as "createdAt"
          FROM posts
          ORDER BY created_at DESC
          LIMIT ${limit}
        `);
        
        // Handle the result properly
        const resultArray = Array.isArray(result) ? result : (result as any).rows || [];
        console.log(`Direct recommendations found ${resultArray.length} posts`);
        return res.json(resultArray);
      } catch (error) {
        console.error("Direct recommendations database error:", error);
        
        // Fallback to standard Drizzle query
        try {
          const simplePosts = await db.select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            createdAt: posts.createdAt
          })
          .from(posts)
          .orderBy(desc(posts.createdAt))
          .limit(limit);
          
          console.log(`Fallback found ${simplePosts.length} posts`);
          return res.json(simplePosts);
        } catch (fallbackError) {
          console.error("Fallback recommendations error:", fallbackError);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error("Error in direct recommendations:", error);
      return res.status(500).json({ 
        message: "Failed to fetch recommendations",
        error: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      });
    }
  });

  // Posts recommendations endpoint for related stories
  console.log("DEBUG - Registering endpoint /api/posts/recommendations");
  // Add a debug version of the recommendations endpoint
  app.get("/api/posts/recommendations", async (req: Request, res: Response) => {
    console.log("DEBUG - Routes.ts: Posts recommendations endpoint called:", req.url);
    console.log("DEBUG - Routes.ts: Request query params:", req.query);
    
    // Parse request parameters
    const postId = req.query.postId ? Number(req.query.postId) : null;
    const limit = Number(req.query.limit) || 3;
    
    console.log(`DEBUG - Routes.ts: Fetching recommendations for postId: ${postId}, limit: ${limit}`);
    
    // Verify post exists if postId provided
    if (postId) {
      const result = await db.query.posts.findFirst({
        where: eq(posts.id, postId)
      });
      
      if (!result) {
        console.log(`DEBUG - Routes.ts: Post with id ${postId} not found`);
        return res.status(404).json({ message: "Post not found" });
      }
      
      console.log(`DEBUG - Routes.ts: Post with id ${postId} found:`, result.title);
    }
    
    // If no postId provided or it's invalid, return recent posts
    console.log('DEBUG - Routes.ts: Returning recent posts');
    const recentPosts = await db.select({
      id: posts.id,
      title: posts.title,
      excerpt: posts.excerpt,
      slug: posts.slug
    })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit);
    
    console.log(`DEBUG - Routes.ts: Found ${recentPosts.length} recent posts`);
    
    // Return simplified metadata for display
    const result = recentPosts.map(post => ({
      ...post,
      readingTime: 5, // Default time
      authorName: 'Anonymous',
      views: 50,
      likes: 10
    }));
    
    return res.json(result);
  });

  app.get("/api/analytics/reading-time", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Get analytics summary with reading time data
      const analyticsSummary = await storage.getAnalyticsSummary();
      
      // Get top stories by reading time
      // In a production environment, this would be queried from the database
      // For demo purposes, we'll create a simple array of stories
      const topStories = await storage.getPosts(1, 5);
      
      // Transform the stories data
      const formattedTopStories = topStories.posts.map(story => ({
        id: story.id,
        title: story.title,
        slug: story.slug,
        // Use real average reading time if available, otherwise estimate based on content length
        avgReadingTime: Math.max(60, analyticsSummary.avgReadTime || 180), // Minimum 1 minute
        views: story.id * 50 + Math.floor(Math.random() * 200) // Deterministic view count based on ID
      }));
      
      // Generate time series data for charts
      // In production, this would come from actual historical data
      const now = new Date();
      const dailyData = [];
      const weeklyData = [];
      const monthlyData = [];
      
      // Base statistics
      const baseStats = {
        avgReadingTime: analyticsSummary.avgReadTime || 180, // Default to 3 minutes if no data
        totalViews: analyticsSummary.totalViews || 1000,
        bounceRate: analyticsSummary.bounceRate || 30,
        averageScrollDepth: 65 // Default to 65%
      };
      
      // Previous period stats (for trends)
      // In production, this would come from actual historical data
      const prevPeriodStats = {
        avgReadingTime: baseStats.avgReadingTime * 0.95,
        totalViews: baseStats.totalViews * 0.92
      };
      
      // Calculate changes
      const changeFromLastPeriod = {
        readingTime: {
          value: ((baseStats.avgReadingTime - prevPeriodStats.avgReadingTime) / prevPeriodStats.avgReadingTime) * 100,
          trend: baseStats.avgReadingTime >= prevPeriodStats.avgReadingTime ? 'up' : 'down'
        },
        views: {
          value: ((baseStats.totalViews - prevPeriodStats.totalViews) / prevPeriodStats.totalViews) * 100,
          trend: baseStats.totalViews >= prevPeriodStats.totalViews ? 'up' : 'down'
        }
      };
      
      // Generate 30 days of data for daily view
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const fluctuation = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
        
        dailyData.push({
          date: date.toISOString().split('T')[0],
          avgTime: Math.round(baseStats.avgReadingTime * fluctuation),
          scrollDepth: Math.round(baseStats.averageScrollDepth * (0.9 + Math.random() * 0.2)),
          storyViews: Math.round(baseStats.totalViews / 30 * fluctuation)
        });
      }
      
      // Generate 12 weeks of data
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        
        const fluctuation = 0.85 + Math.random() * 0.3; // Random factor between 0.85 and 1.15
        
        weeklyData.push({
          date: date.toISOString().split('T')[0],
          avgTime: Math.round(baseStats.avgReadingTime * fluctuation),
          scrollDepth: Math.round(baseStats.averageScrollDepth * (0.92 + Math.random() * 0.16)),
          storyViews: Math.round(baseStats.totalViews / 12 * fluctuation)
        });
      }
      
      // Generate 6 months of data
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        
        const fluctuation = 0.9 + Math.random() * 0.2; // Random factor between 0.9 and 1.1
        
        monthlyData.push({
          date: date.toISOString().split('T')[0],
          avgTime: Math.round(baseStats.avgReadingTime * fluctuation),
          scrollDepth: Math.round(baseStats.averageScrollDepth * (0.95 + Math.random() * 0.1)),
          storyViews: Math.round(baseStats.totalViews / 6 * fluctuation)
        });
      }
      
      res.json({
        dailyData,
        weeklyData,
        monthlyData,
        topStories: formattedTopStories,
        overallStats: {
          ...baseStats,
          changeFromLastPeriod
        }
      });
    } catch (error) {
      console.error("Error fetching reading time analytics:", error);
      res.status(500).json({ message: "Failed to fetch reading time analytics" });
    }
  });

  app.get("/api/admin/notifications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied: Admin privileges required" });
      }

      const notifications = await storage.getUnreadAdminNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/admin/notifications/:id/read", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied: Admin privileges required" });
      }

      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.get("/api/admin/activity", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied: Admin privileges required" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getRecentActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Error handling middleware
  // Bookmark API routes
  app.post("/api/bookmarks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { postId, notes, tags } = req.body;
      const userId = (req.user as any).id;
      
      if (!postId) {
        return res.status(400).json({ error: "Post ID is required" });
      }
      
      // Create bookmark
      const bookmark = await storage.createBookmark({
        userId,
        postId,
        notes,
        tags,
        lastPosition: "0"
      });
      
      res.status(201).json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ error: "Failed to create bookmark" });
    }
  });
  
  app.get("/api/bookmarks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const tag = req.query.tag as string;
      
      let bookmarks;
      if (tag) {
        bookmarks = await storage.getBookmarksByTag(userId, tag);
      } else {
        bookmarks = await storage.getUserBookmarks(userId);
      }
      
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });
  
  app.get("/api/bookmarks/:postId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const postId = parseInt(req.params.postId);
      
      if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      
      const bookmark = await storage.getBookmark(userId, postId);
      
      if (!bookmark) {
        return res.status(404).json({ error: "Bookmark not found" });
      }
      
      res.json(bookmark);
    } catch (error) {
      console.error("Error fetching bookmark:", error);
      res.status(500).json({ error: "Failed to fetch bookmark" });
    }
  });
  
  app.patch("/api/bookmarks/:postId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const postId = parseInt(req.params.postId);
      const { notes, tags, lastPosition } = req.body;
      
      if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      
      const updateData: Partial<InsertBookmark> = {};
      
      if (notes !== undefined) updateData.notes = notes;
      if (tags !== undefined) updateData.tags = tags;
      if (lastPosition !== undefined) updateData.lastPosition = lastPosition;
      
      const updatedBookmark = await storage.updateBookmark(userId, postId, updateData);
      
      res.json(updatedBookmark);
    } catch (error) {
      console.error("Error updating bookmark:", error);
      if ((error as Error).message === "Bookmark not found") {
        return res.status(404).json({ error: "Bookmark not found" });
      }
      res.status(500).json({ error: "Failed to update bookmark" });
    }
  });
  
  app.delete("/api/bookmarks/:postId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const postId = parseInt(req.params.postId);
      
      if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      
      await storage.deleteBookmark(userId, postId);
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      if ((error as Error).message === "Bookmark not found") {
        return res.status(404).json({ error: "Bookmark not found" });
      }
      res.status(500).json({ error: "Failed to delete bookmark" });
    }
  });

  // User Feedback API endpoints
  // Add request logging middleware to feedback routes
  app.use("/api/feedback*", requestLogger);

  app.post("/api/feedback", async (req: Request, res: Response) => {
    try {
      feedbackLogger.info('Feedback submission received', { 
        page: req.body.page, 
        type: req.body.type, 
        browser: req.body.browser,
        os: req.body.operatingSystem
      });
      
      const { type, content, page, browser, operatingSystem, screenResolution, userAgent, category, metadata } = req.body;
      
      // Basic validation
      if (!type || !content) {
        feedbackLogger.warn('Validation failed - missing required fields', { 
          hasType: !!type, 
          hasContent: !!content 
        });
        return res.status(400).json({ error: "Type and content are required fields" });
      }
      
      // Check for authenticated user
      const user = req.user as any;
      const userId = user?.id || null;
      
      if (userId) {
        feedbackLogger.info('Associating feedback with authenticated user', { userId });
      }
      
      // Create feedback object
      const feedbackData: InsertUserFeedback = {
        type,
        content,
        // rating field removed
        page: page || "unknown",
        browser: browser || "unknown",
        operatingSystem: operatingSystem || "unknown",
        screenResolution: screenResolution || "unknown",
        userId: userId, // Use the authenticated user's ID
        status: "pending",
        userAgent: userAgent || req.headers["user-agent"] || "unknown",
        category: category || "general",
        metadata: metadata || {}
      };
      
      // Enhanced logging and performance tracking
      const startTime = Date.now();
      feedbackLogger.debug('Submitting feedback to database', { feedbackData: { type, page, category }});
      
      // Submit feedback
      const feedback = await storage.submitFeedback(feedbackData);
      
      // Log performance metrics
      const duration = Date.now() - startTime;
      feedbackLogger.info('Feedback submitted successfully', { 
        id: feedback.id,
        duration: `${duration}ms`,
        type: feedback.type
      });
      
      res.status(201).json({ success: true, feedback });
    } catch (error) {
      feedbackLogger.error('Error submitting feedback', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // Get all feedback (admin only)
  app.get("/api/feedback", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const user = req.user as any;
      if (!user.isAdmin) {
        feedbackLogger.warn('Unauthorized access attempt to feedback list', {
          userId: user?.id,
          isAdmin: user?.isAdmin
        });
        return res.status(403).json({ error: "Unauthorized access" });
      }
      
      // Get query parameters
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const status = req.query.status as string || "all";
      
      feedbackLogger.info('Fetching feedback list', { limit, status });
      
      // Performance tracking
      const startTime = Date.now();
      
      // Get feedback
      const feedback = await storage.getAllFeedback(limit, status);
      
      // Log performance metrics
      const duration = Date.now() - startTime;
      feedbackLogger.info('Feedback list retrieved', { 
        count: feedback.length,
        duration: `${duration}ms`,
        status: status,
        limit: limit
      });
      
      res.status(200).json({ feedback });
    } catch (error) {
      feedbackLogger.error('Error fetching feedback list', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Get specific feedback (admin only)
  app.get("/api/feedback/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const user = req.user as any;
      if (!user.isAdmin) {
        feedbackLogger.warn('Unauthorized access attempt to feedback detail', {
          userId: user?.id,
          isAdmin: user?.isAdmin,
          feedbackId: req.params.id
        });
        return res.status(403).json({ error: "Unauthorized access" });
      }
      
      // Get feedback ID
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        feedbackLogger.warn('Invalid feedback ID provided', { feedbackId: req.params.id });
        return res.status(400).json({ error: "Invalid feedback ID" });
      }
      
      feedbackLogger.info('Fetching specific feedback', { id });
      
      // Get feedback
      const feedback = await storage.getFeedback(id);
      
      if (!feedback) {
        feedbackLogger.warn('Feedback not found', { id });
        return res.status(404).json({ error: "Feedback not found" });
      }
      
      // Use the imported functions from the top of the file
      
      // Generate enhanced response suggestion using new AI utility
      const enhancedSuggestion = generateEnhancedResponse(feedback);
      
      // Generate alternative response suggestions
      const alternativeSuggestions = generateResponseAlternatives(feedback);
      
      // Get response hints for admin
      const responseHints = getResponseHints(feedback);
      
      feedbackLogger.info('Feedback retrieved successfully with enhanced AI suggestions', { 
        id, 
        type: feedback.type,
        enhancedConfidence: enhancedSuggestion.confidence,
        alternativesCount: alternativeSuggestions.length
      });
      
      // Return enhanced feedback suggestions along with the original ones
      res.status(200).json({ 
        feedback,
        responseSuggestion: enhancedSuggestion, // Use the enhanced suggestion as primary
        alternativeSuggestions, // Include alternatives
        responseHints, // Include the response hints
        legacySuggestion: generateResponseSuggestion(feedback) // Include legacy suggestion for backward compatibility
      });
    } catch (error) {
      feedbackLogger.error('Error fetching specific feedback', {
        id: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Refresh AI suggestions for feedback (admin only)
  app.get("/api/feedback/:id/suggestions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const user = req.user as any;
      if (!user.isAdmin) {
        feedbackLogger.warn('Unauthorized access attempt to feedback suggestions', {
          userId: user?.id,
          isAdmin: user?.isAdmin,
          feedbackId: req.params.id
        });
        return res.status(403).json({ error: "Unauthorized access" });
      }
      
      // Get feedback ID
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        feedbackLogger.warn('Invalid feedback ID provided for suggestions', { feedbackId: req.params.id });
        return res.status(400).json({ error: "Invalid feedback ID" });
      }
      
      feedbackLogger.info('Refreshing AI suggestions for feedback', { id });
      
      // Get feedback
      const feedback = await storage.getFeedback(id);
      
      if (!feedback) {
        feedbackLogger.warn('Feedback not found for suggestions', { id });
        return res.status(404).json({ error: "Feedback not found" });
      }
      
      // Generate fresh suggestions
      const enhancedSuggestion = generateEnhancedResponse(feedback);
      const alternativeSuggestions = generateResponseAlternatives(feedback);
      const responseHints = getResponseHints(feedback);
      const legacySuggestion = generateResponseSuggestion(feedback);
      
      feedbackLogger.info('AI suggestions refreshed successfully', { 
        id, 
        type: feedback.type,
        enhancedConfidence: enhancedSuggestion.confidence,
        alternativesCount: alternativeSuggestions.length
      });
      
      res.status(200).json({
        responseSuggestion: enhancedSuggestion,
        alternativeSuggestions,
        responseHints,
        legacySuggestion
      });
    } catch (error) {
      feedbackLogger.error('Error refreshing AI suggestions', {
        id: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ error: "Failed to refresh AI suggestions" });
    }
  });

  // Update feedback status (admin only)
  app.patch("/api/feedback/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const user = req.user as any;
      if (!user.isAdmin) {
        feedbackLogger.warn('Unauthorized attempt to update feedback status', {
          userId: user?.id,
          isAdmin: user?.isAdmin,
          feedbackId: req.params.id
        });
        return res.status(403).json({ error: "Unauthorized access" });
      }
      
      // Get feedback ID and status
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        feedbackLogger.warn('Invalid feedback ID for status update', { feedbackId: req.params.id });
        return res.status(400).json({ error: "Invalid feedback ID" });
      }
      
      if (!status || !["pending", "reviewed", "resolved", "rejected"].includes(status)) {
        feedbackLogger.warn('Invalid status value provided', { status, feedbackId: id });
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      feedbackLogger.info('Updating feedback status', { id, status, adminId: user.id });
      
      // Performance tracking
      const startTime = Date.now();
      
      // Update feedback status
      const updatedFeedback = await storage.updateFeedbackStatus(id, status);
      
      // Log performance metrics
      const duration = Date.now() - startTime;
      feedbackLogger.info('Feedback status updated successfully', { 
        id, 
        status,
        previousStatus: updatedFeedback.status !== status ? updatedFeedback.status : 'same',
        duration: `${duration}ms`,
        adminId: user.id
      });
      
      res.status(200).json({ success: true, feedback: updatedFeedback });
    } catch (error) {
      feedbackLogger.error('Error updating feedback status', {
        id: req.params.id,
        status: req.body.status,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ error: "Failed to update feedback status" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const { name, email, message, subject = 'Contact Form Message', metadata = {} } = req.body;
      console.log('Received contact form submission from:', name);

      // Input validation
      if (!name || !email || !message) {
        return res.status(400).json({
          message: "Please fill in all required fields",
          details: {
            name: !name ? "Name is required" : null,
            email: !email ? "Email is required" : null,
            message: !message ? "Message is required" : null
          }
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format:', email);
        return res.status(400).json({
          message: "Invalid email format",
          details: { email: "Please enter a valid email address" }
        });
      }

      // Parse user device information
      const userDeviceInfo = metadata.device || req.headers['user-agent'] || 'Unknown device';
      const userScreenSize = metadata.screen || 'Unknown';
      const userViewportSize = metadata.viewportSize || 'Unknown';
      const referrer = metadata.referrer || req.headers['referer'] || 'Direct';
      const hideEmail = metadata.hideEmail === true;
      
      // Enhanced metadata for database
      const enhancedMetadata = {
        device: userDeviceInfo,
        screen: userScreenSize,
        viewport: userViewportSize,
        referrer: referrer,
        ip: req.ip || req.socket.remoteAddress || 'Unknown',
        hideEmail: hideEmail,
        timestamp: new Date().toISOString()
      };

      console.log('Saving message to database...');
      // Save to database first
      const savedMessage = await storage.createContactMessage({
        name,
        email,
        message,
        subject,
        metadata: enhancedMetadata
      });
      console.log('Message saved successfully with ID:', savedMessage.id);

      // Attempt to send email notification
      let emailSent = false;
      try {
        console.log('Attempting to send email notification...');
        
        // Format email differently based on whether to show email
        const displayEmail = hideEmail ? '[Email Hidden by User]' : email;
        
        const emailBody = `
New message received from Bubble's Cafe contact form:

Name: ${name}
Email: ${displayEmail}
Subject: ${subject}

Message:
${message}

User Information:
Device: ${userDeviceInfo}
Screen Size: ${userScreenSize}
Viewport Size: ${userViewportSize}
Referrer: ${referrer}
IP Address: ${req.ip || req.socket.remoteAddress || 'Unknown'}

Time: ${new Date().toLocaleString()}
Message ID: ${savedMessage.id}
`;

        const mailOptions = {
          from: process.env.GMAIL_USER || 'vantalison@gmail.com',
          to: 'vantalison@gmail.com', // Hardcoded primary recipient
          subject: `[Bubble's Cafe] New Contact Form Message: ${subject}`,
          text: emailBody,
        };

        // Try primary Gmail transport first
        try {
          console.log('Sending email via primary Gmail transport...');
          await primaryTransporter.sendMail(mailOptions);
          console.log('Email notification sent successfully via Gmail');
          emailSent = true;
        } catch (primaryError) {
          console.error('Failed to send via Gmail, trying fallback:', primaryError);
          
          // Try fallback transport if Gmail fails
          try {
            console.log('Attempting to send via fallback transport...');
            await fallbackTransporter.sendMail(mailOptions);
            console.log('Email notification sent successfully via fallback');
            emailSent = true;
          } catch (fallbackError) {
            console.error('Fallback transport also failed:', fallbackError);
            throw fallbackError; // Re-throw to be caught by outer try/catch
          }
        }
      } catch (emailError) {
        console.error('All email transports failed:', emailError);
        // We continue even if email fails - the message is already saved in DB
      }

      res.status(200).json({
        message: emailSent 
          ? "Your message has been received. Thank you for contacting us!"
          : "Your message was saved, but there might be a delay in our response. We'll get back to you as soon as possible.",
        data: savedMessage,
        emailStatus: emailSent ? "success" : "failed"
      });
    } catch (error) {
      console.error('Error processing contact form submission:', error);
      res.status(500).json({ message: "Failed to process your message. Please try again later." });
    }
  });

  // Add error logger middleware
  app.use(errorLogger);
  
  // Global error handler with enhanced logging
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Use the already imported feedbackLogger
    // Log the error with full details
    feedbackLogger.error('Unhandled application error', { 
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      headers: req.headers
    });
    
    // Send appropriate response to the client
    res.status(500).json({
      message: "An unexpected error occurred",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  // Mount the moderation router
  app.use('/api/moderation', moderationRouter);
  
  // Mount the game routes
  app.use('/api/game', gameRoutes);
  
  // Register user feedback routes
  registerUserFeedbackRoutes(app, storage);
  
  // Register privacy settings routes
  registerPrivacySettingsRoutes(app, storage);

  // User statistics endpoint
  app.get("/api/users/stats", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user.id;
      console.log('[GET /api/users/stats] Fetching stats for user:', userId);

      // Fetch all user-related data in parallel
      const [
        userAchievements,
        posts,
        totalLikes
      ] = await Promise.all([
        storage.getUserAchievements(userId),
        storage.getUserPosts(userId),
        storage.getUserTotalLikes(userId)
      ]);

      // Get all available achievements for progress tracking
      const allAchievements = await storage.getAllAchievements();

      // Calculate achievement progress
      const achievementsWithProgress = allAchievements.map(achievement => {
        const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
        return {
          ...achievement,
          unlocked: !!userAchievement,
          unlockedAt: userAchievement?.unlockedAt || null,
          progress: userAchievement?.progress || { current: 0, required: 0 }
        };
      });

      console.log('[GET /api/users/stats] Stats compiled for user:', userId);

      res.json({
        achievements: achievementsWithProgress,
        readingStreak: {
          currentStreak: 0,
          longestStreak: 0,
          lastReadAt: null,
          totalReads: 0
        },
        writerStreak: {
          currentStreak: 0,
          longestStreak: 0,
          lastWriteAt: null,
          totalPosts: 0
        },
        featured: null,
        stats: {
          totalPosts: posts.length,
          totalLikes,
          postsThisMonth: posts.filter(post => {
            const postDate = new Date(post.createdAt);
            const now = new Date();
            return postDate.getMonth() === now.getMonth() &&
                   postDate.getFullYear() === now.getFullYear();
          }).length
        }
      });
    } catch (error) {
      console.error("[GET /api/users/stats] Error:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// Configure nodemailer with optimized settings
// Primary Gmail transporter
const primaryTransporter = createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER || 'vantalison@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD?.trim()
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  pool: true,
  maxConnections: 3,
  maxMessages: 10,
  rateDelta: 1000,
  rateLimit: 5,
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
});

// Secondary fallback transporter using a different service
// This is used if the primary Gmail transport fails
const fallbackTransporter = createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_USER || 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

// Update the parseUserAgent function with proper typing
function parseUserAgent(ua: string): UserAgent {
  // Implementation to parse the user agent string remains the same
  // but now with proper typing
  const uaParts = ua.toLowerCase().split(' ');
  const browser = uaParts[0];
  const version = uaParts.find(part => part.startsWith('/'))?.slice(1) || '0';
  const os = uaParts.find(part => part.includes('win') || part.includes('mac') || part.includes('linux')) || 'unknown';
  return { browser, version, os };
}

// Add type for post parameter
async function processPost(post: PostWithAnalytics): Promise<PostWithAnalytics> {
  // Implementation to process the post data remains the same
  // but now with proper typing
  return {
    ...post,
    views: post.views || 0,
    timeOnPage: post.timeOnPage || 0
  };
}