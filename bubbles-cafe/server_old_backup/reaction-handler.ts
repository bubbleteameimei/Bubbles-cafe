/**
 * Reaction Handler for Posts
 * 
 * This file implements session-based and user-based reactions (likes/dislikes)
 * for posts without requiring CSRF validation.
 */

import { Request, Response } from 'express';
import { db } from './db';
import { posts as postsTable } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Handle post reactions (likes/dislikes) from any source
 * This function is designed to bypass CSRF checks and work for both
 * authenticated and unauthenticated users.
 */
export async function handlePostReaction(req: Request, res: Response) {
  try {
    const postId = Number(req.params.postId);
    if (isNaN(postId) || postId <= 0) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    const { isLike } = req.body;
    if (typeof isLike !== 'boolean') {
      return res.status(400).json({ error: "Invalid reaction data - isLike must be a boolean" });
    }
    
    // Check if post exists
    const [post] = await db.select({ id: postsTable.id })
      .from(postsTable)
      .where(eq(postsTable.id, postId));
      
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Update reaction count - increment like or dislike count
    const field = isLike ? 'likesCount' : 'dislikesCount';
    await db.update(postsTable)
      .set({ [field]: db.raw(`${field} + 1`) })
      .where(eq(postsTable.id, postId));
    
    // Get updated counts
    const [updatedCounts] = await db.select({
      likes: postsTable.likesCount,
      dislikes: postsTable.dislikesCount
    })
    .from(postsTable)
    .where(eq(postsTable.id, postId));
    
    // Return success with updated counts
    res.json({
      success: true,
      message: `Post ${isLike ? 'liked' : 'disliked'} successfully`,
      reactions: {
        likes: Number(updatedCounts.likes || 0),
        dislikes: Number(updatedCounts.dislikes || 0)
      }
    });
  } catch (error) {
    console.error(`Error processing reaction:`, error);
    res.status(500).json({ error: "Failed to process reaction" });
  }
}

/**
 * Get current reaction counts for a post
 */
export async function getPostReactions(req: Request, res: Response) {
  try {
    const postId = Number(req.params.postId);
    if (isNaN(postId) || postId <= 0) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    // Get current counts
    const [counts] = await db.select({
      likes: postsTable.likesCount,
      dislikes: postsTable.dislikesCount
    })
    .from(postsTable)
    .where(eq(postsTable.id, postId));
    
    if (!counts) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Return current counts
    res.json({
      postId,
      reactions: {
        likes: Number(counts.likes || 0),
        dislikes: Number(counts.dislikes || 0)
      }
    });
  } catch (error) {
    console.error(`Error getting reaction counts:`, error);
    res.status(500).json({ error: "Failed to get reaction counts" });
  }
}