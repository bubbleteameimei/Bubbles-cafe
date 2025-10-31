import { Request, Response, Express } from "express";
import { db } from "../db";
import { posts, analytics } from "@shared/schema";
import { desc, eq, and, ne, or, sql, not, inArray } from "drizzle-orm";

/**
 * Register routes specifically for post recommendations
 */
export function registerPostRecommendationsRoutes(app: Express) {
  console.log("Registering post recommendations routes");
  
  /**
   * GET /api/posts/recommendations
   * Get story recommendations based on a given post ID and theme categories
   */
  app.get("/api/posts/recommendations", async (req: Request, res: Response) => {
    console.log("Post recommendations endpoint called:", req.url);
    try {
      const postId = req.query.postId ? Number(req.query.postId) : null;
      const limit = Number(req.query.limit) || 3;
      
      console.log(`Fetching recommendations for postId: ${postId}, limit: ${limit}`);
      
      // If no postId provided, just return recent posts
      if (!postId) {
        console.log('No postId provided, returning recent posts');
        const recentPosts = await fetchRecentPosts(limit);
        const enhancedPosts = await enhancePostsWithMetadata(recentPosts);
        return res.json(enhancedPosts);
      }
      
      // Get source post details
      const sourcePostResult = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      if (sourcePostResult.length === 0) {
        return res.status(404).json({ error: 'Source post not found' });
      }
      const sourcePost = sourcePostResult[0];
      
      console.log(`Found source post: ${sourcePost.title}`);
      
      // Extract metadata for theme-based recommendations
      const metadata = sourcePost.metadata as any;
      
      // Extract theme category if available
      let themeCategory: string | null = null;
      
      if (typeof metadata === 'string') {
        try {
          const parsedMetadata = JSON.parse(metadata);
          themeCategory = parsedMetadata?.themeCategory || null;
        } catch (e) {
          console.log('Error parsing metadata string:', e);
        }
      } else if (metadata && typeof metadata === 'object') {
        themeCategory = (metadata as any)?.themeCategory || null;
      }
      
      // Try to find posts with the same theme category if available
      let recommendedPosts: Array<{ 
        id: number; 
        title: string; 
        slug: string; 
        excerpt: string | null; 
        createdAt: Date;
        content: string;
        metadata: any;
        readingTimeMinutes: number | null;
        likesCount: number | null;
      }> = [];
      if (themeCategory) {
        console.log(`Finding posts with theme: ${themeCategory}`);
        
        recommendedPosts = await db.select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          createdAt: posts.createdAt,
          content: posts.content,
          metadata: posts.metadata,
          readingTimeMinutes: posts.readingTimeMinutes,
          likesCount: posts.likesCount
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
        console.log('No theme category found, using keyword matching');
        
        // Extract keywords from title for matching
        const titleKeywords = sourcePost.title
          .toLowerCase()
          .split(' ')
          .filter((word: string) => word.length > 3)
          .slice(0, 3);
          
        if (titleKeywords.length > 0) {
          console.log(`Using keywords: ${titleKeywords.join(', ')}`);
          
          const conditions = titleKeywords.map((keyword: string) => 
            sql`${posts.title} ILIKE ${`%${keyword}%`} OR ${posts.excerpt} ILIKE ${`%${keyword}%`}`
          );
          
          recommendedPosts = await db.select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            createdAt: posts.createdAt,
            content: posts.content,
            metadata: posts.metadata,
            readingTimeMinutes: posts.readingTimeMinutes,
            likesCount: posts.likesCount
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
        console.log(`Only found ${recommendedPosts.length} related posts, supplementing with recent posts`);
        
        if (recommendedPosts.length === 0) {
          // If no related posts found, just get recent posts
          recommendedPosts = await fetchRecentPosts(limit, postId);
        } else {
          // Otherwise, add more posts to reach the limit
          const existingIds = recommendedPosts.map((p: { id: number }) => p.id);
          
          if (existingIds.length > 0) {
            try {
              const additionalPosts = await db.select({
                id: posts.id,
                title: posts.title,
                slug: posts.slug,
                excerpt: posts.excerpt,
                createdAt: posts.createdAt,
                content: posts.content,
                metadata: posts.metadata,
                readingTimeMinutes: posts.readingTimeMinutes,
                likesCount: posts.likesCount
              })
              .from(posts)
              .where(
                and(
                  ne(posts.id, postId),
                  not(inArray(posts.id, existingIds))
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
      
      console.log(`Found ${recommendedPosts.length} recommended posts`);
      
      // Add analytics and other metadata
      const enhancedPosts = await enhancePostsWithMetadata(recommendedPosts as any[]);
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
    let q: any = db.select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
      content: posts.content,
      metadata: posts.metadata,
      readingTimeMinutes: posts.readingTimeMinutes,
      likesCount: posts.likesCount
    })
    .from(posts);

    if (excludeId) {
      q = q.where(ne(posts.id, excludeId));
    }

    q = q.orderBy(desc(posts.createdAt)).limit(limit);

    return await q;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    return [];
  }
}

/**
 * Add metadata and analytics to posts for frontend display
 */
async function enhancePostsWithMetadata(rawPosts: any[]) {
  const results: any[] = [];
  for (const post of rawPosts) {
    let views = 0;
    try {
      const [row] = await db
        .select()
        .from(analytics)
        .where(eq(analytics.postId, Number(post.id)))
        .orderBy(desc(analytics.updatedAt))
        .limit(1);
      views = Number(row?.pageViews || 0);
    } catch {
      views = 0;
    }

    results.push({
      ...post,
      authorName: 'Anonymous',
      views,
      likesCount: Number(post.likesCount ?? 0),
      readingTimeMinutes: (post.readingTimeMinutes as number | null) ?? null
    });
  }
  return results;
}