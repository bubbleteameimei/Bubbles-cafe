import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

declare module 'express-session' {
  interface SessionData {
    isAdmin: boolean;
    loginAttempts?: number;
    lockUntil?: number;
  }
}

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.isAdmin) {
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
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (req.session.lockUntil && req.session.lockUntil > Date.now()) {
      return res.status(429).json({ 
        message: "Account is temporarily locked. Please try again later." 
      });
    }

    try {
      const [admin] = await storage.getAdminByEmail(email);

      if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
        req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;

        if (req.session.loginAttempts >= 5) {
          req.session.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
          return res.status(429).json({ 
            message: "Too many failed attempts. Account locked for 15 minutes." 
          });
        }

        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.loginAttempts = 0;
      req.session.lockUntil = undefined;
      req.session.isAdmin = true;

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ message: "Logged in successfully" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    if (!req.session) {
      return res.status(401).json({ message: "No active session" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Protected admin routes
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
      // Remove any duplicates by id
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
      const comment = await storage.createComment(req.body);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  return createServer(app);
}