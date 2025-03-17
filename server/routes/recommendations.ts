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
      // Parse query parameters with safe defaults
      const postIdParam = req.query.postId;
      const postId = postIdParam ? Number(postIdParam) : 0;
      const categories = (req.query.categories as string || "").split(",").filter(Boolean);
      const limit = Number(req.query.limit) || 3;
      
      // Get the current post if a postId is explicitly provided
      let currentPost: Post | undefined;
      if (postIdParam && postId > 0) {
        currentPost = await db.query.posts.findFirst({
          where: eq(posts.id, postId)
        });
        
        if (!currentPost) {
          // Only return error if a postId was explicitly provided but not found
          return res.status(404).json({ message: "Post not found" });
        }
      }
      // No else branch needed - if no postId is provided, we'll just continue with general recommendations
      
      // If we have categories, filter by them
      if (categories.length > 0) {
        // Build the where conditions for categories
        const whereConditions = [];
        
        // Add category conditions if we have them
        // For now, we're just getting recent posts, but in a real implementation,
        // we would filter by metadata.themeCategory or similar field
        
        // Exclude current post if we have a postId
        if (postId > 0) {
          whereConditions.push(ne(posts.id, postId));
        }
        
        // Get recommendations based on categories
        const catRecommendations = await db.query.posts.findMany({
          where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
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
          // Try to find similar posts based on content keywords
          // In a full implementation, we would use the keywords to find similar posts
          const contentRecommendations = await db.query.posts.findMany({
            where: ne(posts.id, postId),
            limit: limit,
            orderBy: [desc(posts.createdAt)]
          });
          
          return res.json(contentRecommendations);
        }
      }
      
      // Fallback - get recent posts
      // Create an array of where conditions
      const fallbackWhereConditions = [];
      
      // Only exclude the current post if we have a valid postId
      if (postId > 0) {
        fallbackWhereConditions.push(ne(posts.id, postId));
      }
      
      const recentPosts = await db.query.posts.findMany({
        where: fallbackWhereConditions.length > 0 ? and(...fallbackWhereConditions) : undefined,
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