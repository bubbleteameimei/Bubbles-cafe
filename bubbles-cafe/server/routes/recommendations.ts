import { Request, Response, Express } from "express";
import { db } from "../db-connect";
import { posts, Post, readingProgress, postLikes, bookmarks } from "@shared/schema";
import { and, eq, ne, or, like, desc, asc, sql, count, not } from "drizzle-orm";
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

  // Post recommendations endpoint moved to posts-recommendations.ts
  
  /**
   * GET /api/users/recommendations
   * Get personalized recommendations for the current user based on reading history,
   * preferences, and collaborative filtering
   */
  app.get("/api/users/recommendations", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const limit = Number(req.query.limit) || 5;
      
      // Extract user preferences if provided
      const preferredThemes = req.query.themes ? 
        (Array.isArray(req.query.themes) ? req.query.themes : [req.query.themes]) : 
        [];
        
      // Implement safe database operation with retry logic
      const safeDbOperation = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
        let lastError;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await operation();
          } catch (error) {
            console.warn(`Recommendation query attempt ${attempt + 1} failed:`, error);
            lastError = error;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
          }
        }
        throw lastError;
      };
      
      // Step 1: Get user's reading history (posts they've read)
      const readingHistory = await safeDbOperation(async () => {
        return await db.query.readingProgress.findMany({
          where: eq(readingProgress.userId, userId),
          orderBy: [desc(readingProgress.lastReadAt)],
          limit: 10
        });
      });
      
      // Step 2: Get user's liked posts
      const likedPosts = await safeDbOperation(async () => {
        return await db.query.postLikes.findMany({
          where: and(
            eq(postLikes.userId, userId),
            eq(postLikes.isLike, true)
          ),
          limit: 10
        });
      });
      
      // Step 3: Get user's bookmarks
      const userBookmarks = await safeDbOperation(async () => {
        return await db.query.bookmarks.findMany({
          where: eq(bookmarks.userId, userId),
          limit: 10
        });
      });
      
      // Collect post IDs from user history
      const historyPostIds = new Set([
        ...readingHistory.map((item: {postId: number}) => item.postId),
        ...likedPosts.map((item: {postId: number}) => item.postId),
        ...userBookmarks.map((item: {postId: number}) => item.postId)
      ]);
      
      // If user has no history, fall back to trending posts with theme preferences
      if (historyPostIds.size === 0) {
        let query = db.select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          themeCategory: posts.themeCategory,
          createdAt: posts.createdAt,
          metadata: posts.metadata
        })
        .from(posts)
        .orderBy(desc(posts.likesCount), desc(posts.createdAt));
        
        // Apply theme filter if preferences exist
        if (preferredThemes.length > 0) {
          query = query.where(
            preferredThemes.map(theme => 
              or(
                like(posts.themeCategory, `%${theme}%`),
                sql`${posts.metadata}->>'themeCategory' LIKE ${`%${theme}%`}`
              )
            ).reduce((acc, condition) => or(acc, condition))
          );
        }
        
        const trendingPosts = await safeDbOperation(async () => {
          return await query.limit(limit);
        });
        
        return res.json(trendingPosts);
      }
      
      // Step 4: Get content-based recommendations
      // Find posts with similar themes to what the user has engaged with
      const historicalPosts = await safeDbOperation(async () => {
        return await db.query.posts.findMany({
          where: sql`${posts.id} IN (${Array.from(historyPostIds).join(',')})`,
        });
      });
      
      // Extract themes from historical posts
      const userThemes = new Set<string>();
      historicalPosts.forEach((post: {themeCategory?: string, metadata?: any}) => {
        if (post.themeCategory) {
          userThemes.add(post.themeCategory);
        }
        // Also check metadata for themeCategory
        const metadata = post.metadata as any;
        if (metadata?.themeCategory) {
          userThemes.add(metadata.themeCategory);
        }
      });
      
      // Combine user preferences with derived themes
      const allThemes = [...Array.from(userThemes), ...preferredThemes];
      
      // Get recommendations based on themes
      const contentBasedRecommendations = await safeDbOperation(async () => {
        let query = db.select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          themeCategory: posts.themeCategory,
          createdAt: posts.createdAt,
          metadata: posts.metadata
        })
        .from(posts)
        .where(
          and(
            // Exclude posts the user has already interacted with
            not(sql`${posts.id} IN (${Array.from(historyPostIds).join(',')})`),
            // Include posts with matching themes
            allThemes.map(theme => 
              or(
                like(posts.themeCategory, `%${theme}%`),
                sql`${posts.metadata}->>'themeCategory' LIKE ${`%${theme}%`}`
              )
            ).reduce((acc, condition) => or(acc, condition), sql`1=0`)
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(limit);
        
        return await query;
      });
      
      // Step 5: If we don't have enough recommendations, supplement with popular posts
      if (contentBasedRecommendations.length < limit) {
        const remainingCount = limit - contentBasedRecommendations.length;
        const existingIds = new Set([
          ...contentBasedRecommendations.map((post: {id: number}) => post.id),
          ...Array.from(historyPostIds)
        ]);
        
        const popularSupplements = await safeDbOperation(async () => {
          return await db.select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            themeCategory: posts.themeCategory,
            createdAt: posts.createdAt,
            metadata: posts.metadata
          })
          .from(posts)
          .where(not(sql`${posts.id} IN (${Array.from(existingIds).join(',')})`))
          .orderBy(desc(posts.likesCount), desc(posts.createdAt))
          .limit(remainingCount);
        });
        
        return res.json([...contentBasedRecommendations, ...popularSupplements]);
      }
      
      return res.json(contentBasedRecommendations);
    } catch (error) {
      console.error("Error getting user recommendations:", error);
      return res.status(500).json({ 
        message: "An error occurred while fetching personalized recommendations",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * GET /api/recommendations/personalized
   * Enhanced personalized recommendations endpoint using the improved algorithm
   * This endpoint uses the new storage method with advanced user preference tracking
   */
  app.get("/api/recommendations/personalized", async (req: Request, res: Response) => {
    console.log("Enhanced personalized recommendations endpoint called");
    try {
      // Check if user is authenticated
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const limit = Number(req.query.limit) || 5;
      
      // Extract user preferences if provided
      const preferredThemes = req.query.themes ? 
        (Array.isArray(req.query.themes) ? req.query.themes : [req.query.themes]) : 
        [];
        
      console.log(`Getting personalized recommendations for user ${userId} with limit ${limit}`);
      console.log(`User preferences: ${preferredThemes.join(', ') || 'None specified'}`);
      
      // Use the new storage method with enhanced personalization
      const recommendedPosts = await storage.getPersonalizedRecommendations(
        userId, 
        preferredThemes as string[], 
        limit
      );
      
      console.log(`Found ${recommendedPosts.length} personalized recommendations`);
      
      // Add helpful metadata to the response
      const response = {
        recommendations: recommendedPosts,
        meta: {
          count: recommendedPosts.length,
          userPreferences: preferredThemes.length > 0,
          generatedAt: new Date().toISOString()
        }
      };
      
      return res.json(response);
    } catch (error) {
      console.error("Error getting enhanced personalized recommendations:", error);
      return res.status(500).json({ 
        message: "An error occurred while fetching personalized recommendations",
        error: error instanceof Error ? error.message : String(error)
      });
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
      .orderBy(desc(posts.createdAt))
      .limit(limit);
      
      console.log(`Direct recommendations found ${recommendedPosts.length} posts`);
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