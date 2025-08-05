import { Router, Request, Response } from "express";

import { insertPostSchema } from "@shared/schema";
import { createErrorFunction as createError } from "../utils/error-handler";
import { asyncHandler } from "../utils/error-handler";
import { storage } from '../storage';

const router = Router();

// Get all posts with filtering and pagination
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  try {
    const { limit, offset, themeCategory, search } = req.query;
    
    // Fix: Call getPosts with just limit and offset, handle filtering separately
    const posts = await storage.getPosts(Number(limit) || 10, Number(offset) || 0);
    
    // Apply additional filtering if needed
    let filteredPosts = posts.filter(post => !post.isSecret); // Only show public posts
    
    if (themeCategory) {
      filteredPosts = filteredPosts.filter(post => 
        post.themeCategory === themeCategory
      );
    }
    
    if (search) {
      const searchTerm = String(search).toLowerCase();
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm)
      );
    }

    res.json(filteredPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw createError(500, "Failed to fetch posts");
  }
}));

// Get single post by slug
router.get("/:slug", asyncHandler(async (req: Request, res: Response) => {
  try {
    const post = await storage.getPostBySlug(req.params.slug);
    
    if (!post) {
      throw createError(404, "Post not found");
    }

    // Don't show secret posts to non-authenticated users
    if (post.isSecret && !req.session?.user?.isAdmin) {
      throw createError(404, "Post not found");
    }

    res.json(post);
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError(404, "Post not found");
  }
}));

// Create new post
router.post("/", asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.session?.user) {
      throw createError(401, "Authentication required");
    }

    const validatedData = insertPostSchema.parse({
      ...req.body,
      authorId: req.session.user.id
    });

    const post = await storage.createPost(validatedData);
    res.status(201).json(post);
  } catch (error: any) {
    console.error("Error creating post:", error);
    if (error.statusCode) throw error;
    throw createError(500, "Failed to create post");
  }
}));

// Update post
router.put("/:id", asyncHandler(async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (!req.session?.user) {
      throw createError(401, "Authentication required");
    }

    // Check if post exists and user has permission
    const existingPost = await storage.getPost(postId);
    if (!existingPost) {
      throw createError(404, "Post not found");
    }

    if (existingPost.authorId !== req.session.user.id && !req.session.user.isAdmin) {
      throw createError(403, "Permission denied");
    }

    const updatedPost = await storage.updatePost(postId, req.body);
    if (!updatedPost) {
      throw createError(404, "Post not found");
    }

    res.json(updatedPost);
  } catch (error: any) {
    console.error("Error updating post:", error);
    if (error.statusCode) throw error;
    throw createError(500, "Failed to update post");
  }
}));

// Delete post
router.delete("/:id", asyncHandler(async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (!req.session?.user) {
      throw createError(401, "Authentication required");
    }

    // Check if post exists and user has permission
    const existingPost = await storage.getPost(postId);
    if (!existingPost) {
      throw createError(404, "Post not found");
    }

    if (existingPost.authorId !== req.session.user.id && !req.session.user.isAdmin) {
      throw createError(403, "Permission denied");
    }

    const deleted = await storage.deletePost(postId);
    if (!deleted) {
      throw createError(404, "Post not found");
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    if (error.statusCode) throw error;
    throw createError(500, "Failed to delete post");
  }
}));

export default router;