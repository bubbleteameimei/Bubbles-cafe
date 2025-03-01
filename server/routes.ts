import { Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import userSettingsRouter from './routes/user-settings';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import express from 'express';
import * as session from 'express-session';
import { z } from "zod";
import { insertPostSchema, insertCommentSchema, insertCommentReplySchema, type Post } from "@shared/schema";
import { moderateComment } from "./utils/comment-moderation";
import { log } from "./vite";
import { createTransport } from "nodemailer";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import moderationRouter from './routes/moderation';

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
export function registerRoutes(app: Express): Server {
  // Add security headers and middleware first
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
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
  app.use("/api", apiLimiter);

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

  //Register the user settings routes
  app.use(userSettingsRouter);


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

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message, subject = 'Contact Form Message' } = req.body;
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

      console.log('Saving message to database...');
      // Save to database first
      const savedMessage = await storage.createContactMessage({
        name,
        email,
        message,
        subject
      });
      console.log('Message saved successfully with ID:', savedMessage.id);

      // Attempt to send email notification
      let emailSent = false;
      try {
        console.log('Attempting to send email notification...');
        const emailBody = `
New message received from your horror blog contact form:

Sender Details:
--------------
Name: ${name}
Email: ${email}

Message Content:
---------------
${message}

Timestamp: ${new Date().toLocaleString()}
`;

        const emailHtml = `
<h2>New message received from your horror blog contact form</h2>

<h3>Sender Details:</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>

<h3>Message Content:</h3>
<p style="white-space: pre-wrap;">${message}</p>

<p><small>Received at: ${new Date().toLocaleString()}</small></p>
`;
        await transporter.sendMail({
          from: 'vantalison@gmail.com',
          to: 'vantalison@gmail.com',
          subject: `New Contact Form Message from ${name}`,
          text: emailBody,
          html: emailHtml
        });
        emailSent = true;
        console.log('Email notification sent successfully');
      } catch (emailError: any) {
        console.error('Email sending failed:', {
          error: emailError.message,
          code: emailError.code,
          command: emailError.command,
          response: emailError.response
        });
      }

      // Return appropriate response
      res.json({
        message: emailSent
          ? "Message sent successfully"
          : "Message saved successfully, but there was an issue with email notification. Our team has been notified.",
        data: savedMessage,
        emailStatus: emailSent ? 'sent' : 'failed'
      });
    } catch (error: unknown) {
      console.error("Contact form error:", error);
      res.status(500).json({
        message: "Failed to process your message. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      });
    }
  });

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
      const [posts, comments, users] = await Promise.all([
        storage.getPosts(1, 5),
        storage.getRecentComments(),
        storage.getAdminByEmail(req.user.email)
      ]);

      res.json({
        recentPosts: posts.posts.slice(0, 5),
        recentComments: comments,
        adminUsers: users
      });
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      res.status(500).json({ message: "Failed to fetch admin dashboard data" });
    }
  });

  // Update analytics endpoint to handle the new metric format
  app.post("/api/analytics/vitals", async (req: Request, res: Response) => {
    try {
      const { metricName, value, identifier, navigationType, url, userAgent } = req.body;

      console.log('[Analytics] Received performance metric:', {
        name: metricName,
        value: Math.round(value * 100) / 100,
        id: identifier,
        navigationType,
        url
      });

      // Validate required fields
      if (!metricName || typeof value !== 'number' || isNaN(value)) {
        return res.status(400).json({
          message: "Invalid metric data",
          details: "Metric name and numeric value are required"
        });
      }

      // Store the metric in database
      await storage.storePerformanceMetric({
        metricName,
        value: Math.round(value * 100) / 100,
        identifier,
        navigationType: navigationType || null,
        url,
        userAgent: userAgent || null
      });

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
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', err);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  // Mount the moderation router
  app.use('/api/moderation', moderationRouter);

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
        readingStreak,
        writerStreak,
        featuredAuthor,
        posts,
        totalLikes
      ] = await Promise.all([
        storage.getUserAchievements(userId),
        storage.getReadingStreak(userId),
        storage.getWriterStreak(userId),
        storage.getFeaturedAuthor(userId),
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
        readingStreak: readingStreak || {
          currentStreak: 0,
          longestStreak: 0,
          lastReadAt: null,
          totalReads: 0
        },
        writerStreak: writerStreak || {
          currentStreak: 0,
          longestStreak: 0,
          lastWriteAt: null,
          totalPosts: 0
        },
        featured: featuredAuthor ? {
          monthYear: featuredAuthor.monthYear,
          description: featuredAuthor.description
        } : null,
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
const transporter = createTransport({
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