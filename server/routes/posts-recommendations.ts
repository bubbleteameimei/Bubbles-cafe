import { Request, Response } from 'express';
import type { Application } from 'express';
import { db } from '../db';
import { posts } from "../../shared/schema";
import { and, eq, ne, or, desc, sql } from "drizzle-orm";

/**
 * Register routes specifically for post recommendations
 */
export function registerPostRecommendationsRoutes(app: Application) {
  
  
  /**
   * GET /api/posts/recommendations
   * Get story recommendations based on a given post ID and theme categories
   */
  app.get("/api/posts/recommendations", async (req: Request, res: Response) => {
    
    try {
      const postId = req.query.postId ? Number(req.query.postId) : null;
      const limit = Number(req.query.limit) || 3;
      
      
      
      // If no postId provided, just return recent posts
      if (!postId) {
        
        const recentPosts = await fetchRecentPosts(limit);
        const enhancedPosts = enhancePostsWithMetadata(recentPosts);
        return res.json(enhancedPosts);
      }
      
      // Get all posts first to log IDs for debugging
      // const _allPosts = await db.select({ id: posts.id, title: posts.title })
      //   .from(posts)
      //   .limit(20);
      
      
      
      // If we have a postId, try to find related posts
      // First, get the source post to extract metadata
      
      let sourcePost = await db.query.posts.findFirst({
        where: eq(posts.id, postId)
      });
      
      if (!sourcePost) {
        const sourcePosts = await db.select()
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);
        if (sourcePosts && sourcePosts.length > 0) {
          sourcePost = sourcePosts[0];
        }
      }
      if (!sourcePost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      
      
      // Extract theme category if available
      let themeCategory = null;
      const metadata = sourcePost.metadata;
      
      if (typeof metadata === 'string') {
        try {
          const parsedMetadata = JSON.parse(metadata);
          themeCategory = parsedMetadata?.themeCategory || null;
        } catch (e) {
          
        }
      } else if (metadata && typeof metadata === 'object') {
        // Using any here to avoid TypeScript errors with dynamic properties
        const metadataObj = metadata as any;
        themeCategory = metadataObj.themeCategory || null;
      }
      
      // Try to find posts with the same theme category if available
      let recommendedPosts = [];
      if (themeCategory) {
        
        
        recommendedPosts = await db.select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          createdAt: posts.createdAt
        })
        .from(posts)
        .where(
          and(
            ne(posts.id, postId),
            or(
              sql`${posts.metadata}->>'themeCategory' = ${themeCategory}`,
              sql`${posts.title} ILIKE ${`%${sourcePost.title.split(' ')[0]}%`}`
            )
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(limit);
      } else {
        // Fallback to keyword matching
        
        
        // Extract keywords from title for matching
        const titleKeywords = sourcePost.title
          .toLowerCase()
          .split(' ')
          .filter((word: string) => word.length > 3)
          .slice(0, 3);
          
        if (titleKeywords.length > 0) {
          
          
          const conditions = titleKeywords.map((keyword: string) => 
            sql`${posts.title} ILIKE ${`%${keyword}%`} OR ${posts.excerpt} ILIKE ${`%${keyword}%`}`
          );
          
          recommendedPosts = await db.select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            createdAt: posts.createdAt
          })
          .from(posts)
          .where(
            and(
              ne(posts.id, postId),
              or(...conditions)
            )
          )
          .orderBy(desc(posts.createdAt))
          .limit(limit);
        } else {
          // If no meaningful keywords, just get recent posts
          recommendedPosts = await fetchRecentPosts(limit, postId);
        }
      }
      
      // If we didn't find enough posts, supplement with recent ones
      if (recommendedPosts.length < limit) {
        
        
        if (recommendedPosts.length === 0) {
          // If no related posts found, just get recent posts
          recommendedPosts = await fetchRecentPosts(limit, postId);
        } else {
          // Otherwise, add more posts to reach the limit
          const existingIds = recommendedPosts.map((p: any) => p.id);
          
          // Only try to supplement if we have existing posts and there are at least 2 ids
          if (existingIds.length > 0) {
            try {
              const additionalPosts = await db.select({
                id: posts.id,
                title: posts.title,
                slug: posts.slug,
                excerpt: posts.excerpt,
                createdAt: posts.createdAt
              })
              .from(posts)
              .where(
                and(
                  ne(posts.id, postId),
                  sql`${posts.id} NOT IN (${existingIds.join(',')})` 
                )
              )
              .orderBy(desc(posts.createdAt))
              .limit(limit - recommendedPosts.length);
              
              recommendedPosts = [...recommendedPosts, ...additionalPosts];
            } catch (err) {
              console.error("Error supplementing posts:", err);
              // Fallback if the NOT IN clause fails
              const fallbackPosts = await fetchRecentPosts(limit - recommendedPosts.length, postId);
              recommendedPosts = [...recommendedPosts, ...fallbackPosts];
            }
          }
        }
      }
      
      
      
      // Add estimated reading time and other metadata
      const enhancedPosts = enhancePostsWithMetadata(recommendedPosts);
      return res.json(enhancedPosts);
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
 * Fetch recent posts, excluding a specific post if needed
 */
async function fetchRecentPosts(limit: number, excludeId?: number | null) {
  try {
    const query = db.select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt
    })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit);
    
    if (excludeId) {
      query.where(ne(posts.id, excludeId));
    }
    
    return await query;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    return [];
  }
}

/**
 * Add metadata to posts for frontend display
 */
function enhancePostsWithMetadata(posts: any[]) {
  return posts.map(post => {
    // Estimate reading time based on excerpt length
    const wordCount = post.excerpt ? post.excerpt.split(' ').length : 0;
    const readingTime = Math.max(2, Math.ceil(wordCount / 200)); // Assume 200 words per minute
    
    return {
      ...post,
      readingTime,
      authorName: 'Anonymous', // Default author
      views: Math.floor(Math.random() * 100) + 10, // Random view count 
      likes: Math.floor(Math.random() * 20) + 1 // Random like count
    };
  });
}