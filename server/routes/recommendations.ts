import { Request, Response } from 'express';
import type { Application } from 'express';
import { posts, readingProgress, postLikes, bookmarks } from "../../shared/schema";
import { and, eq, or, like, desc, sql, not } from "drizzle-orm";
import { db } from '../db';

/**
 * Get recommendations based on post content, theme categories, and user history
 */
export function registerRecommendationsRoutes(app: Application, storageInstance: any) {
  
  
  /**
   * GET /api/recommendations/health
   * Simple health check endpoint for recommendations subsystem
   */
  app.get("/api/recommendations/health", (_req: Request, res: Response) => {
    
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
      const historyPostIds = new Set<number>(
        ([] as number[])
          .concat((readingHistory as Array<{ postId: number }>).map((item) => item.postId))
          .concat((likedPosts as Array<{ postId: number }>).map((item) => item.postId))
          .concat((userBookmarks as Array<{ postId: number }>).map((item) => item.postId))
      );
      
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
          const themeConditions = preferredThemes.map(theme => 
            or(
              like(posts.themeCategory, `%${theme}%`),
              sql`${posts.metadata}->>'themeCategory' LIKE ${`%${theme}%`}`
            )
          );
          
          const combinedCondition = themeConditions.reduce((acc, condition) => 
            acc ? or(acc, condition) : condition
          );
          
          query = query.where(combinedCondition) as any;
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
      
      // Analyze historical data for better recommendations
      const categoryFrequency: { [key: string]: number } = {};
      historicalPosts.forEach((post: any) => {
        if (post.themeCategory) {
          const category = post.themeCategory;
          categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
        }
        
        if (post.metadata && typeof post.metadata === 'object' && post.metadata.themeCategory) {
          const metaCategory = post.metadata.themeCategory;
          categoryFrequency[metaCategory] = (categoryFrequency[metaCategory] || 0) + 1;
        }
      });
      
      // Combine user preferences with derived themes
      const allThemes = [...preferredThemes];
      
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
        
      
      
      
      // Use the new storage method with enhanced personalization
      const recommendedPosts = await storageInstance.getPersonalizedRecommendations(
        userId, 
        preferredThemes as string[], 
        limit
      );
      
      
      
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
    
    try {
      const limit = Number(req.query.limit) || 4;
      
      
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
      
      
      return res.json(recommendedPosts);
    } catch (error) {
      console.error("Error getting direct recommendations:", error);
      
      // Fallback to simpler query if the first one fails
      try {
        
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