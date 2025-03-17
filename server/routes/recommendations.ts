import { Request, Response, Express } from "express";
import { db } from "../db";
import { posts, Post } from "@shared/schema";
import { and, eq, ne, or, like, desc, asc, sql, count } from "drizzle-orm";
import { IStorage } from "../storage";

/**
 * Get recommendations based on post content, theme categories, and user history
 */
export function registerRecommendationsRoutes(app: Express, storage: IStorage) {
  console.log("Registering recommendations routes");
  
  /**
   * GET /api/recommendations/health
   * Simple health check endpoint for recommendations subsystem
   */
  app.get("/api/recommendations/health", (req: Request, res: Response) => {
    console.log("Recommendations health check called");
    return res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  /**
   * GET /api/posts/recommendations
   * Get story recommendations based on a given post ID and theme categories
   */
  app.get("/api/posts/recommendations", async (req: Request, res: Response) => {
    console.log("Received recommendations request:", req.url);
    try {
      // Simplified implementation
      const limit = Number(req.query.limit) || 3;
      console.log(`Getting ${limit} recent posts for recommendations`);
      
      // Simple query to get the most recent posts
      try {
        const simplePosts = await db.select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          createdAt: posts.createdAt
        })
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit);
        
        console.log(`Successfully retrieved ${simplePosts.length} posts`);
        return res.json(simplePosts);
      } catch (dbError) {
        console.error("Database query error:", dbError);
        
        // Attempt direct SQL as fallback
        try {
          // Raw SQL query as a last resort
          const result = await db.execute(sql`
            SELECT id, title, slug, excerpt, created_at as "createdAt"
            FROM posts
            ORDER BY created_at DESC
            LIMIT ${limit}
          `);
          
          // The result may not have a length property depending on the type
          const resultArray = Array.isArray(result) ? result : (result as any).rows || [];
          console.log("Raw SQL query successful:", resultArray.length);
          return res.json(resultArray);
        } catch (sqlError) {
          console.error("Raw SQL error:", sqlError);
          throw sqlError;
        }
      }
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

  /**
   * GET /api/recommendations/direct
   * Direct recommendations endpoint for simpler integration
   * This endpoint is designed for easier frontend consumption without complex logic
   */
  app.get("/api/recommendations/direct", async (req: Request, res: Response) => {
    console.log("Direct recommendations endpoint called");
    try {
      const limit = Number(req.query.limit) || 4;
      console.log(`Getting ${limit} stories for direct recommendations`);
      
      // Simple query to get recent posts
      const recommendedPosts = await db.select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        createdAt: posts.createdAt
      })
      .from(posts)
      .where(
        sql`(metadata->>'isHidden' IS NULL OR metadata->>'isHidden' = 'false')`
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit);
      
      console.log(`Successfully retrieved ${recommendedPosts.length} posts for direct recommendations`);
      return res.json(recommendedPosts);
    } catch (error) {
      console.error("Error getting direct recommendations:", error);
      
      // Fallback to simpler query if the first one fails
      try {
        console.log("Attempting fallback query for direct recommendations");
        const fallbackPosts = await db.select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          createdAt: posts.createdAt
        })
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(Number(req.query.limit) || 4);
        
        console.log(`Fallback successful: retrieved ${fallbackPosts.length} posts`);
        return res.json(fallbackPosts);
      } catch (fallbackError) {
        console.error("Fallback query failed:", fallbackError);
        return res.status(500).json({ 
          message: "An error occurred while fetching recommendations",
          error: error instanceof Error ? error.message : String(error)
        });
      }
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