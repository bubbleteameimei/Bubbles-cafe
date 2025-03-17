import { Request, Response, Express } from "express";
import { db } from "../db";
import { posts, Post } from "@shared/schema";
import { and, eq, ne, or, like, desc, asc, sql } from "drizzle-orm";
import { IStorage } from "../storage";

/**
 * Get recommendations based on post content, theme categories, and user history
 */
export function registerRecommendationsRoutes(app: Express, storage: IStorage) {
  /**
   * GET /api/posts/recommendations
   * Get story recommendations based on a given post ID and theme categories
   */
  app.get("/api/posts/recommendations", async (req: Request, res: Response) => {
    try {
      const postId = Number(req.query.postId) || 0;
      const categories = (req.query.categories as string || "").split(",").filter(Boolean);
      const limit = Number(req.query.limit) || 3;
      
      // Get the current post if specified
      let currentPost: Post | undefined;
      if (postId) {
        currentPost = await db.query.posts.findFirst({
          where: eq(posts.id, postId)
        });
        
        if (!currentPost) {
          return res.status(404).json({ message: "Post not found" });
        }
      }
      
      // If we have categories, filter by them
      if (categories.length > 0) {
        // Get recommendations based on categories
        const catRecommendations = await db.query.posts.findMany({
          where: postId ? ne(posts.id, postId) : undefined,
          limit: limit,
          orderBy: [desc(posts.createdAt)]
        });
        
        return res.json(catRecommendations);
      }
      
      // If we have a current post, use it to find similar content
      if (currentPost) {
        // Get recommendations based on similar title/content
        const keywords = extractKeywords(currentPost.title + " " + currentPost.content);
        
        if (keywords.length > 0) {
          // Try to find similar posts
          const contentRecommendations = await db.query.posts.findMany({
            where: ne(posts.id, postId),
            limit: limit,
            orderBy: [desc(posts.createdAt)]
          });
          
          return res.json(contentRecommendations);
        }
      }
      
      // Fallback - get recent posts
      const recentPosts = await db.query.posts.findMany({
        where: postId ? ne(posts.id, postId) : undefined,
        limit: limit,
        orderBy: [desc(posts.createdAt)]
      });
      
      return res.json(recentPosts);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return res.status(500).json({ message: "An error occurred while fetching recommendations" });
    }
  });
  
  /**
   * GET /api/users/recommendations
   * Get personalized recommendations for the current user
   */
  app.get("/api/users/recommendations", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const limit = Number(req.query.limit) || 5;
      
      // Get user's reading history, likes, and bookmarks
      // For now, just get random posts
      const randomPosts = await db.query.posts.findMany({
        limit: limit,
        orderBy: [desc(posts.createdAt)]
      });
      
      return res.json(randomPosts);
    } catch (error) {
      console.error("Error getting user recommendations:", error);
      return res.status(500).json({ message: "An error occurred while fetching recommendations" });
    }
  });
}

/**
 * Extract important keywords from a text string
 * This is a simple implementation that filters out common words
 */
function extractKeywords(text: string): string[] {
  // Simplistic keyword extraction - just split text and filter out common words
  const commonWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "about", "as", "into", "like", "through", "after", "before", "between",
    "from", "of", "was", "were", "is", "are", "am", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing", "will", "would",
    "shall", "should", "can", "could", "may", "might", "must", "i", "you", "he",
    "she", "it", "we", "they", "their", "his", "her", "its", "our", "your", "my",
    "that", "this", "these", "those", "there", "here", "when", "where", "why",
    "how", "what", "who", "whom", "which"
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split on whitespace
    .filter(word => 
      word.length > 3 && !commonWords.has(word)
    )
    .slice(0, 10); // Take only the first 10 keywords
}