import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";

declare module 'express-session' {
  interface SessionData {
    isAdmin: boolean;
    loginAttempts?: number;
    lockUntil?: number;
  }
}

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export function registerRoutes(app: Express): Server {
  // Session middleware with updated configuration
  app.use(session({
    secret: process.env.REPL_ID!,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  // Admin authentication routes with improved error handling and rate limiting
  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;

    // Check if account is locked
    if (req.session.lockUntil && req.session.lockUntil > Date.now()) {
      return res.status(429).json({ 
        message: "Account is temporarily locked. Please try again later." 
      });
    }

    try {
      const [admin] = await storage.getAdminByEmail(email);

      if (!admin) {
        req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;

        // Lock account after 5 failed attempts
        if (req.session.loginAttempts >= 5) {
          req.session.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
          return res.status(429).json({ 
            message: "Too many failed attempts. Account locked for 15 minutes." 
          });
        }

        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password_hash);

      if (!isValidPassword) {
        req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;

        if (req.session.loginAttempts >= 5) {
          req.session.lockUntil = Date.now() + 15 * 60 * 1000;
          return res.status(429).json({ 
            message: "Too many failed attempts. Account locked for 15 minutes." 
          });
        }

        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Reset login attempts on successful login
      req.session.loginAttempts = 0;
      req.session.lockUntil = undefined;
      req.session.isAdmin = true;

      await req.session.save();
      res.json({ message: "Logged in successfully" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Protected admin routes
  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const post = await storage.createPost(req.body);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePost(parseInt(req.params.id));
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Public routes
  app.get("/api/posts", async (_req, res) => {
    const posts = await storage.getPosts();
    const sortedPosts = posts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.json(sortedPosts);
  });

  app.get("/api/posts/secret", async (_req, res) => {
    const posts = await storage.getSecretPosts();
    res.json(posts);
  });

  app.post("/api/posts/secret/:postId/unlock", async (req, res) => {
    try {
      const progress = await storage.unlockSecretPost({
        postId: parseInt(req.params.postId),
        unlockedBy: req.body.unlockedBy
      });
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to unlock secret post" });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    const post = await storage.getPost(req.params.slug);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    res.json(post);
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.postId));
    res.json(comments);
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    const comment = await storage.createComment(req.body);
    res.json(comment);
  });

  return createServer(app);
}