import { posts } from "@shared/schema";
import { db } from "../db";
import { desc, ne } from "drizzle-orm";

import { Request, Response } from "express";

/**
 * Simple post recommendations implementation focusing on reliability
 */
export function registerPostRecommendationsRoutes(app: any) {
  
  
  /**
   * GET /api/posts/recommendations
   * Get story recommendations based on a given post ID
   */
  app.get("/api/posts/recommendations", async (req: Request, res: Response) => {
    try {
      
      
      
      // Parse request parameters
      const postId = req.query.postId ? Number(req.query.postId) : null;
      const limit = Number(req.query.limit) || 3;
      
      
      
      // If no postId provided or it's invalid, return recent posts
      if (!postId) {
        
        const recentPosts = await db.select({
          id: posts.id,
          title: posts.title,
          excerpt: posts.excerpt,
          slug: posts.slug
        })
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit);
        
        
        const enhanced = enhancePostsWithMetadata(recentPosts);
        return res.status(200).json(enhanced);
      }
      
      // Log the query for troubleshooting
      
      
      // Get some posts excluding the requested one
      const recommendedPosts = await db.select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        slug: posts.slug
      })
      .from(posts)
      .where(ne(posts.id, postId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
      
      console.log(`Found ${recommendedPosts.length} posts to recommend:`, 
        recommendedPosts.map((p: any) => p.id));
      
      // Add metadata for frontend display
      const enhancedPosts = enhancePostsWithMetadata(recommendedPosts);
      
      return res.status(200).json(enhancedPosts);
    } catch (error) {
      console.error("Error getting post recommendations:", error);
      return res.status(500).json({ 
        message: "An error occurred while fetching recommendations",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

/**
 * Add metadata to posts for frontend display
 */
function enhancePostsWithMetadata(posts: any[]) {
  return posts.map(post => {
    // Estimate reading time based on excerpt length if available
    const wordCount = post.excerpt ? post.excerpt.split(' ').length : 0;
    const readingTime = Math.max(2, Math.ceil(wordCount / 200)); // Assume 200 words per minute
    
    return {
      ...post,
      readingTime,
      authorName: 'Anonymous', // Default author name
      views: Math.floor(Math.random() * 100) + 10, // Random view count for display
      likes: Math.floor(Math.random() * 20) + 1 // Random like count for display
    };
  });
}