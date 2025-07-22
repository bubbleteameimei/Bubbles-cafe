/**
 * Simple Reaction Handler - CSRF-free endpoint for likes/dislikes
 */

import { Request, Response } from 'express';
import { db } from '../db';
import { posts } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function handleReaction(req: Request, res: Response) {
  try {
    const postIdParam = req.params.postId;
    const { isLike } = req.body;
    
    if (!postIdParam || isNaN(Number(postIdParam))) {
      return res.status(400).json({ 
        error: "Invalid post ID",
        likesCount: 0,
        dislikesCount: 0 
      });
    }
    
    const postId = Number(postIdParam);
    console.log(`[Reaction] Processing for post ${postId}, isLike: ${isLike}`);
    
    // Verify post exists
    const existingPost = await db.select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
      
    if (!existingPost.length) {
      return res.status(404).json({ 
        error: "Post not found",
        likesCount: 0,
        dislikesCount: 0 
      });
    }
    
    // Update counts based on reaction
    if (isLike === true) {
      await db.update(posts)
        .set({ 
          likesCount: sql`COALESCE("likesCount", 0) + 1` 
        })
        .where(eq(posts.id, postId));
      console.log(`[Reaction] Incremented likes for post ${postId}`);
    } else if (isLike === false) {
      await db.update(posts)
        .set({ 
          dislikesCount: sql`COALESCE("dislikesCount", 0) + 1` 
        })
        .where(eq(posts.id, postId));
      console.log(`[Reaction] Incremented dislikes for post ${postId}`);
    }
    
    // Get updated counts
    const [updatedCounts] = await db.select({
      likesCount: posts.likesCount,
      dislikesCount: posts.dislikesCount
    })
    .from(posts)
    .where(eq(posts.id, postId));
    
    const response = {
      success: true,
      likesCount: Number(updatedCounts.likesCount || 0),
      dislikesCount: Number(updatedCounts.dislikesCount || 0),
      message: isLike === true ? 'Post liked!' : isLike === false ? 'Post disliked!' : 'Reaction removed'
    };
    
    console.log(`[Reaction] Response for post ${postId}:`, response);
    res.json(response);
    
  } catch (error) {
    console.error('[Reaction] Error:', error);
    res.status(500).json({ 
      error: "Failed to process reaction",
      likesCount: 0,
      dislikesCount: 0 
    });
  }
}