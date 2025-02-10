import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from "express";
import { createTransport } from "nodemailer";
import * as bcrypt from 'bcrypt'; // Import bcrypt

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

export function registerRoutes(app: Express): Server {
  // Security headers for both API and SPA
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting to auth endpoints
  app.use("/api/login", authLimiter);
  app.use("/api/admin/*", authLimiter);

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
      const post = await storage.createPost(req.body);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePost(parseInt(req.params.id));
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Public routes
  app.get("/api/posts", async (_req, res) => {
    try {
      const posts = await storage.getPosts();
      const uniquePosts = Array.from(new Map(posts.map(post => [post.id, post])).values());
      res.json(uniquePosts);
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

  // Comment routes
  app.get("/api/comments", isAuthenticated, async (_req, res) => {
    try {
      const comments = await storage.getComments();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.patch("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const comment = await storage.updateComment(parseInt(req.params.id), req.body);
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteComment(parseInt(req.params.id));
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

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

  app.get("/api/posts/comments/recent", async (_req, res) => {
    try {
      const comments = await storage.getRecentComments();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching recent comments:", error);
      res.status(500).json({ message: "Failed to fetch recent comments" });
    }
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(parseInt(req.params.postId));
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comment = await storage.createComment({
        ...req.body,
        postId: parseInt(req.params.postId)
      });
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Add these routes after the existing post routes
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

  // Create HTTP server
  const server = createServer(app);
  return server;
}