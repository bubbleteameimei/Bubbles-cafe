/**
 * Reaction Handler for Posts
 *
 * This file implements session-based and user-based reactions (likes/dislikes)
 * for posts without requiring CSRF validation.
 */
import { db } from './db';
import { posts as postsTable } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
export async function handlePostReaction(req, res) {
    try {
        const postId = Number(req.params.postId);
        if (isNaN(postId) || postId <= 0) {
            res.status(400).json({ error: "Invalid post ID" });
            return;
        }
        const { isLike } = req.body;
        if (typeof isLike !== 'boolean') {
            res.status(400).json({ error: "Invalid reaction data - isLike must be a boolean" });
            return;
        }
        const [post] = await db.select({ id: postsTable.id })
            .from(postsTable)
            .where(eq(postsTable.id, postId));
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        if (isLike) {
            await db.update(postsTable)
                .set({ likesCount: sql `${postsTable.likesCount} + 1` })
                .where(eq(postsTable.id, postId));
        }
        else {
            await db.update(postsTable)
                .set({ dislikesCount: sql `${postsTable.dislikesCount} + 1` })
                .where(eq(postsTable.id, postId));
        }
        const [updatedCounts] = await db.select({
            likes: postsTable.likesCount,
            dislikes: postsTable.dislikesCount
        })
            .from(postsTable)
            .where(eq(postsTable.id, postId));
        res.json({
            success: true,
            message: `Post ${isLike ? 'liked' : 'disliked'} successfully`,
            reactions: {
                likes: Number(updatedCounts.likes || 0),
                dislikes: Number(updatedCounts.dislikes || 0)
            }
        });
        return;
    }
    catch (error) {
        console.error(`Error processing reaction:`, error);
        res.status(500).json({ error: "Failed to process reaction" });
        return;
    }
}
export async function getPostReactions(req, res) {
    try {
        const postId = Number(req.params.postId);
        if (isNaN(postId) || postId <= 0) {
            res.status(400).json({ error: "Invalid post ID" });
            return;
        }
        const [counts] = await db.select({
            likes: postsTable.likesCount,
            dislikes: postsTable.dislikesCount
        })
            .from(postsTable)
            .where(eq(postsTable.id, postId));
        if (!counts) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        res.json({
            postId,
            reactions: {
                likes: Number(counts.likes || 0),
                dislikes: Number(counts.dislikes || 0)
            }
        });
        return;
    }
    catch (error) {
        console.error(`Error getting reaction counts:`, error);
        res.status(500).json({ error: "Failed to get reaction counts" });
        return;
    }
}
