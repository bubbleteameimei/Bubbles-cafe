import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { db } from '../db';
import { comments, commentReactions, commentVotes } from '@shared/schema';
import { and, eq, desc, asc } from 'drizzle-orm';

const router = Router();

// Get comments for a post with sorting
router.get('/:postId', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const sort = (req.query.sort as string) || 'newest';
    const allComments = await storage.getComments(postId);

    // Apply sorting in memory since we already have the data
    let sortedComments = [...allComments];
    switch (sort) {
      case 'oldest':
        sortedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most_voted':
        sortedComments.sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)));
        break;
      case 'most_discussed':
        sortedComments.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
        break;
      default: // newest
        sortedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(sortedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a new comment
router.post('/:postId', async (req, res) => {
  try {
    const schema = z.object({
      content: z.string().min(3).max(2000),
      author: z.string().min(2).max(50)
    });

    const { content, author } = schema.parse(req.body);
    const postId = parseInt(req.params.postId);
    const userId = req.user?.id || 0; // Default to 0 for anonymous users

    const newComment = await storage.createComment({
      postId,
      content,
      author,
      userId,
      approved: true // Auto-approve comments for now
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Edit a comment
router.patch('/:commentId', async (req, res) => {
  try {
    const schema = z.object({
      content: z.string().min(3).max(2000)
    });

    const { content } = schema.parse(req.body);
    const commentId = parseInt(req.params.commentId);

    const comment = await storage.getComments(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const updatedComment = await storage.updateComment({
      id: commentId,
      content,
      edited: true,
      editedAt: new Date()
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Vote on a comment
router.post('/:commentId/vote', async (req, res) => {
  try {
    const schema = z.object({
      isUpvote: z.boolean()
    });

    const { isUpvote } = schema.parse(req.body);
    const commentId = parseInt(req.params.commentId);
    const userId = req.user?.id || 'anonymous';

    const existingVote = await db.select()
      .from(commentVotes)
      .where(
        and(
          eq(commentVotes.commentId, commentId),
          eq(commentVotes.userId, userId.toString())
        )
      );

    if (existingVote.length > 0) {
      await db.update(commentVotes)
        .set({ isUpvote })
        .where(eq(commentVotes.id, existingVote[0].id));
    } else {
      await db.insert(commentVotes).values({
        commentId,
        userId: userId.toString(),
        isUpvote
      });
    }

    // Get updated comment with vote counts
    const updatedComment = await storage.getComments(commentId);
    res.json(updatedComment);
  } catch (error) {
    console.error('Error voting on comment:', error);
    res.status(500).json({ error: 'Failed to vote on comment' });
  }
});

// Add reaction to a comment
router.post('/:commentId/react', async (req, res) => {
  try {
    const schema = z.object({
      emoji: z.string()
    });

    const { emoji } = schema.parse(req.body);
    const commentId = parseInt(req.params.commentId);
    const userId = req.user?.id || 'anonymous';

    const existingReaction = await db.select()
      .from(commentReactions)
      .where(
        and(
          eq(commentReactions.commentId, commentId),
          eq(commentReactions.userId, userId.toString()),
          eq(commentReactions.emoji, emoji)
        )
      );

    if (existingReaction.length === 0) {
      await db.insert(commentReactions).values({
        commentId,
        userId: userId.toString(),
        emoji
      });
    }

    // Get updated comment with reactions
    const updatedComment = await storage.getComments(commentId);
    res.json(updatedComment);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Reply to a comment
router.post('/:commentId/replies', async (req, res) => {
  try {
    const schema = z.object({
      content: z.string().min(3).max(2000),
      author: z.string().min(2).max(50)
    });

    const { content, author } = schema.parse(req.body);
    const commentId = parseInt(req.params.commentId);
    const userId = req.user?.id || 0; // Default to 0 for anonymous users

    const newReply = await storage.createCommentReply({
      commentId,
      content,
      author,
      userId,
      approved: true // Auto-approve replies for now
    });

    res.status(201).json(newReply);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

export default router;