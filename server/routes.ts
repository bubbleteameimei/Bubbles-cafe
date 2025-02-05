import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCommentSchema, insertProgressSchema, insertSecretProgressSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Get all public posts
  app.get("/api/posts", async (_req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  // Get secret posts
  app.get("/api/secret-posts", async (_req, res) => {
    const posts = await storage.getSecretPosts();
    res.json(posts);
  });

  // Unlock secret post
  app.post("/api/unlock-secret", async (req, res) => {
    const { postId, code } = req.body;
    try {
      const progress = await storage.unlockSecretPost({ postId, code });
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid code" });
    }
  });

  // Get single post
  app.get("/api/posts/:slug", async (req, res) => {
    const post = await storage.getPost(req.params.slug);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    res.json(post);
  });

  // Get recent comments across all posts
  app.get("/api/posts/comments/recent", async (_req, res) => {
    const comments = await storage.getRecentComments();
    res.json(comments);
  });

  // Get comments for post
  app.get("/api/posts/:postId/comments", async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.postId));
    res.json(comments);
  });

  // Create comment
  app.post("/api/posts/:postId/comments", async (req, res) => {
    const result = insertCommentSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid comment data" });
      return;
    }
    const comment = await storage.createComment(result.data);
    res.json(comment);
  });

  // Get reading progress
  app.get("/api/posts/:postId/progress", async (req, res) => {
    const progress = await storage.getProgress(parseInt(req.params.postId));
    res.json(progress);
  });

  // Update reading progress
  app.post("/api/posts/:postId/progress", async (req, res) => {
    const result = insertProgressSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid progress data" });
      return;
    }
    const progress = await storage.updateProgress(result.data);
    res.json(progress);
  });

  return createServer(app);
}