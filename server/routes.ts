import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { createTransport } from "nodemailer";

// Configure nodemailer
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: 'vantalison@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Admin middleware - uses passport's authentication
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Please log in again" });
  }
};

export function registerRoutes(app: Express): Server {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Admin-specific routes
  app.get("/api/admin/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized: Please log in again" });
    }
    res.json({ isAdmin: req.user.isAdmin });
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

      // Save to database
      const savedMessage = await storage.createContactMessage({
        name,
        email,
        message,
        showEmail
      });

      // Send email notification
      await transporter.sendMail({
        from: 'vantalison@gmail.com',
        to: 'vantalison@gmail.com',
        subject: `New Contact Form Message from ${name}`,
        text: `
Name: ${name}
${showEmail ? `Email: ${email}` : '(Email hidden by sender preference)'}
Message: ${message}
        `
      });

      res.json(savedMessage);
    } catch (error) {
      console.error("Error handling contact form:", error);
      res.status(500).json({ message: "Failed to send message" });
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

  return createServer(app);
}