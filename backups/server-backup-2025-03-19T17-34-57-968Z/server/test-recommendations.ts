import { Request, Response } from 'express';
import { db } from './db';
import { posts } from '@shared/schema';
import { desc, sql } from 'drizzle-orm';

/**
 * Get posts recommendations
 * Simple and reliable implementation for the posts recommendations endpoint
 */
export async function getPostsRecommendations(req: Request, res: Response) {
  try {
    console.log("Test Posts recommendations endpoint called:", req.url);
    console.log("Request query params:", req.query);
    
    // Parse request parameters
    const postId = req.query.postId ? Number(req.query.postId) : null;
    const limit = Number(req.query.limit) || 3;
    
    console.log(`Fetching recommendations for postId: ${postId}, limit: ${limit}`);
    
    // If no postId provided or it's invalid, return recent posts
    if (!postId) {
      console.log('No postId provided, returning recent posts');
      const recentPosts = await db.select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        slug: posts.slug
      })
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit);
      
      console.log(`Found ${recentPosts.length} recent posts`);
      
      // Return simplified metadata for display
      const result = recentPosts.map(post => ({
        ...post,
        readingTime: 5, // Default time
        authorName: 'Anonymous',
        views: 50,
        likes: 10
      }));
      
      return res.json(result);
    }
    
    // Log the query for troubleshooting
    console.log(`Building query to fetch posts where id != ${postId}`);
    
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
    
    console.log(`Found ${recommendedPosts.length} posts to recommend`);
    
    // Return simplified metadata for display
    const result = recommendedPosts.map(post => ({
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