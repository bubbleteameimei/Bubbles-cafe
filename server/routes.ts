import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from "express";
import { createTransport } from "nodemailer";
import * as bcrypt from 'bcrypt';
import { z } from "zod"; // Add zod import
import { insertCommentSchema, insertPostSchema, insertCommentReplySchema } from "@shared/schema"; // Add schema import

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


// Admin middleware - uses passport's authentication
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Please log in again" });
  }
};

// Rate limiting configuration at the top of the file
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Reduced from 100 to 50 requests per 15 minutes
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export function registerRoutes(app: Express): Server {
  // Security headers for both API and SPA
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-eval
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: "same-origin" }
  }));

  // Apply rate limiting to specific routes
  app.use("/api/login", authLimiter);
  app.use("/api/admin", authLimiter);
  app.use("/api", apiLimiter);

  // Set up authentication routes BEFORE other routes
  setupAuth(app);

  // Admin-specific API routes with isAuthenticated middleware
  app.get("/api/admin/user", isAuthenticated, (req: Request, res: Response) => {
    // Now TypeScript knows req.user exists due to isAuthenticated middleware
    res.json({ isAdmin: req.user!.isAdmin });
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

  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      // Parse and validate the post data using our schema
      const postData = insertPostSchema.parse({
        ...req.body,
        authorId: req.user?.id || 1,
        triggerWarnings: req.body.triggerWarnings || []
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

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      // First check if post exists
      const post = await storage.getPost(postId.toString());
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      await storage.deletePost(postId);
      console.log(`Post ${postId} deleted successfully`);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      if (error instanceof Error) {
        if (error.message === "Post not found") {
          return res.status(404).json({ message: "Post not found" });
        }
      }
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Public routes
  app.get("/api/posts", async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      // Validate pagination parameters
      if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
        return res.status(400).json({
          message: "Invalid pagination parameters. Page and limit must be positive numbers."
        });
      }

      const { posts, hasMore } = await storage.getPosts(page, limit);
      res.json({ posts, hasMore });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
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
        unlockedBy: req.body.unlockedBy
      });
      res.json(progress);
    } catch (error) {
      console.error("Error unlocking secret post:", error);
      res.status(500).json({ message: "Failed to unlock secret post" });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.slug);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
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
      const { name, email, message, showEmail } = req.body;
      console.log('Received contact form submission from:', name);

      // Input validation
      if (!name || !email || !message) {
        console.log('Validation failed:', { name: !name, email: !email, message: !message });
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
        showEmail
      });
      console.log('Message saved successfully with ID:', savedMessage.id);

      // Attempt to send email notification
      let emailSent = false;
      try {
        console.log('Attempting to send email notification...');
        await transporter.sendMail({
          from: 'vantalison@gmail.com',
          to: 'vantalison@gmail.com',
          subject: `New Contact Form Message from ${name}`,
          text: `
New message received from your horror blog contact form:

Sender Details:
--------------
Name: ${name}
Email: ${showEmail ? email : '(Email hidden by sender preference)'}

Message Content:
---------------
${message}

Timestamp: ${new Date().toLocaleString()}
          `,
          html: `
          <h2>New message received from your horror blog contact form</h2>

          <h3>Sender Details:</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${showEmail ? email : '<em>(Email hidden by sender preference)</em>'}</p>

          <h3>Message Content:</h3>
          <p style="white-space: pre-wrap;">${message}</p>

          <p><small>Received at: ${new Date().toLocaleString()}</small></p>
          `
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
  app.get("/api/admin/messages", isAuthenticated, async (_req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

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

  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      await storage.deleteComment(commentId);
      console.log(`Comment ${commentId} deleted successfully`);
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
          return res.status(404).json({ message: "Comment not found" });
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

  app.post("/api/posts/:postId/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);

      // Get post to verify it exists
      const posts = await storage.getPosts();
      const post = posts.posts.find(p => p.id === postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Validate and parse the comment data using our schema
      const commentData = insertCommentSchema.parse({
        postId,
        ...req.body
      });

      // Check for filtered words
      const filteredWords = [
        'hate', 'kill', 'racist', 'offensive', 'slur',
        'violence', 'death', 'murder', 'abuse', 'discriminate'
        // Add more filtered words as needed
      ];

      const containsFilteredWord = filteredWords.some(word =>
        commentData.content.toLowerCase().includes(word.toLowerCase())
      );

      // Auto-approve if no filtered words are found
      const comment = await storage.createComment({
        ...commentData,
        approved: !containsFilteredWord
      });

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid comment data",
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post("/api/posts/:postId/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { isLike } = req.body;
      let userId = req.user?.id;

      // If no user is logged in, use a temporary ID based on their IP
      if (!userId) {
        const ip = req.ip || '127.0.0.1'; // Fallback to localhost if no IP
        const salt = await bcrypt.genSalt(5);
        const ipHash = await bcrypt.hash(ip, salt);
        userId = parseInt(ipHash.replace(/\D/g, '').slice(0, 9), 10);
      }

      console.log(`Processing like/dislike for post ${postId} by user ${userId}`);

      // Get existing like status
      const existingLike = await storage.getPostLike(postId, userId);

      if (existingLike) {
        // Update existing like
        if (existingLike.isLike === isLike) {
          console.log(`Removing ${isLike ? 'like' : 'dislike'} for post ${postId}`);
          // Remove like/dislike if clicking the same button
          await storage.removePostLike(postId, userId);
        } else {
          console.log(`Changing from ${existingLike.isLike ? 'like' : 'dislike'} to ${isLike ? 'like' : 'dislike'} for post ${postId}`);
          // Change from like to dislike or vice versa
          await storage.updatePostLike(postId, userId, isLike);
        }
      } else {
        console.log(`Creating new ${isLike ? 'like' : 'dislike'} for post ${postId}`);
        // Create new like
        await storage.createPostLike(postId, userId, isLike);
      }

      // Get updated counts
      const counts = await storage.getPostLikeCounts(postId);
      console.log(`Updated counts for post ${postId}:`, counts);
      res.json(counts);
    } catch (error) {
      console.error("Error handling post like:", error);
      res.status(500).json({ message: "Failed to update like status" });
    }
  });

  app.get("/api/posts/:postId/likes", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const counts = await storage.getPostLikeCounts(postId);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching post likes:", error);
      res.status(500).json({ message: "Failed to fetch like counts" });
    }
  });

  // Add these routes after existing comment routes
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
        // Convert hash to a number for userId
        userId = parseInt(ipHash.replace(/\D/g, '').slice(0, 9), 10);
      }

      // Check if user has already voted
      const existingVote = await storage.getCommentVote(commentId, userId);
      if (existingVote) {
        if (existingVote.isUpvote === isUpvote) {
          // Remove vote if clicking same button
          await storage.removeCommentVote(commentId, userId);
        } else {
          // Change vote
          await storage.updateCommentVote(commentId, userId, isUpvote);
        }
      } else {
        // Create new vote
        await storage.createCommentVote(commentId, userId, isUpvote);
      }

      // Get updated vote counts
      const counts = await storage.getCommentVoteCounts(commentId);
      res.json(counts);
    } catch (error) {
      console.error("Error handling comment vote:", error);
      res.status(500).json({ message: "Failed to update vote" });
    }
  });

  app.post("/api/comments/:commentId/replies", async (req, res) => {
    try {
      const commentId = parseInt(req.params.commentId);
      const { content, author } = req.body;

      // Validate input
      const replyData = insertCommentReplySchema.parse({
        commentId,
        content,
        author
      });

      // Check for filtered words
      const filteredWords = [
        'hate', 'kill', 'racist', 'offensive', 'slur',
        'violence', 'death', 'murder', 'abuse', 'discriminate'
      ];

      const containsFilteredWord = filteredWords.some(word =>
        content.toLowerCase().includes(word.toLowerCase())
      );

      // Auto-approve if no filtered words
      const reply = await storage.createCommentReply({
        ...replyData,
        approved: !containsFilteredWord
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

  // Create HTTP server
  const server = createServer(app);
  return server;
}