import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCommentSchema } from "@shared/schema";

// Set specific admin credentials
const ADMIN_EMAIL = "Vantalison@gmail.com";
const ADMIN_PASSWORD = "powerPUFF70";

export function registerRoutes(app: Express): Server {
  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Get all public posts ordered by update date
  app.get("/api/posts", async (_req, res) => {
    const posts = await storage.getPosts();
    // Sort posts by createdAt in descending order
    const sortedPosts = posts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.json(sortedPosts);
  });

  // Create new post (admin only)
  app.post("/api/posts", async (req, res) => {
    try {
      const post = await storage.createPost(req.body);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Get single post by slug
  app.get("/api/posts/:slug", async (req, res) => {
    const post = await storage.getPost(req.params.slug);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    res.json(post);
  });

  // Handle post interactions (likes/dislikes)
  app.post("/api/posts/:postId/interaction", async (req, res) => {
    const { type } = req.body;
    const postId = parseInt(req.params.postId);

    if (!['like', 'dislike', null].includes(type)) {
      res.status(400).json({ message: "Invalid interaction type" });
      return;
    }

    try {
      const post = await storage.updatePostInteraction(postId, type);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to update interaction" });
    }
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

  return createServer(app);
}