import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export function registerRoutes(app: Express): Server {
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

  // Get comments for post
  app.get("/api/posts/:postId/comments", async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.postId));
    res.json(comments);
  });

  // Create comment
  app.post("/api/posts/:postId/comments", async (req, res) => {
    const comment = await storage.createComment(req.body);
    res.json(comment);
  });

  return createServer(app);
}