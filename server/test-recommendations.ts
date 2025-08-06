import { Request, Response } from 'express';
import { db } from './db-connect';
import { posts } from '@shared/schema';
import { desc, sql } from 'drizzle-orm';

/**
 * Get posts recommendations
 * Simple and reliable implementation for the posts recommendations endpoint
 */
export async function getPostsRecommendations(req: Request, res: Response) {
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
      
      
      
      // Return simplified metadata for display
      const result = recentPosts.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        reason: 'Recent content'
      }));

      console.log('Recent posts recommendations:', result);
      return result;
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
    .where(sql`id != ${postId}`)
    .orderBy(desc(posts.createdAt))
    .limit(limit);
    
    
    
    // Return simplified metadata for display
    const result = recommendedPosts.map((post: any) => ({
      ...post,
      readingTime: 5, // Default time
      authorName: 'Anonymous',
      views: 50,
      likes: 10
    }));
    
    return res.json(result);
  } catch (error) {
    console.error("Error getting post recommendations:", error);
    return res.status(500).json({ 
      message: "An error occurred while fetching recommendations",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}