import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { db } from '../db-connect';
import { comments, commentReactions, commentVotes, commentReplies } from '@shared/schema';
import { and, eq, inArray } from 'drizzle-orm';

const router = Router();

// Get comments for a post with sorting and replies
router.get('/:postId', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const sort = (req.query.sort as string) || 'newest';

    // Get all comments and their replies
    const allComments = await storage.getComments(postId);
    const commentIds = allComments.map(comment => comment.id);

    // Get replies for all comments using IN clause
    const replies = commentIds.length > 0 ? 
      await db.select().from(commentReplies)
        .where(
          inArray(commentReplies.commentId, commentIds)
        ) : [];

    // Attach replies to their parent comments
    const commentsWithReplies = allComments.map(comment => ({
      ...comment,
      replies: replies.filter(reply => reply.commentId === comment.id)
    }));

    // Apply sorting
    let sortedComments = [...commentsWithReplies];
    switch (sort) {
      case 'oldest':
        sortedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most_voted':
        sortedComments.sort((a, b) => {
          const aVotes = (a.metadata?.upvotes || 0) - (a.metadata?.downvotes || 0);
          const bVotes = (b.metadata?.upvotes || 0) - (b.metadata?.downvotes || 0);
          return bVotes - aVotes;
        });
        break;
      case 'most_discussed':
        sortedComments.sort((a, b) =>
          (b.replies?.length || 0) - (a.replies?.length || 0)
        );
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
      content: z.string().min(3, "Comment must be at least 3 characters").max(2000, "Comment cannot exceed 2000 characters"),
      author: z.string().optional()
    });

    const { content, author } = schema.parse(req.body);
    const postId = parseInt(req.params.postId);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const newComment = await storage.createComment({
      postId,
      content,
      userId: req.user?.id || null,
      approved: true,
      metadata: {
        author: author || 'Anonymous',
        isAnonymous: !req.user?.id,
        moderated: false,
        upvotes: 0,
        downvotes: 0,
        replyCount: 0
      }
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid comment data",
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Edit a comment
router.patch('/:commentId', async (req, res) => {
  try {
    const schema = z.object({
      content: z.string().min(3, "Comment must be at least 3 characters").max(2000, "Comment cannot exceed 2000 characters")
    });

    const { content } = schema.parse(req.body);
    const commentId = parseInt(req.params.commentId);

    const comment = await storage.getComment(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const updatedComment = await storage.updateComment(commentId, {
      content,
      edited: true,
      editedAt: new Date(),
      metadata: {
        ...comment.metadata,
        moderated: false
      }
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid comment data",
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
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
      content: z.string().min(3, "Reply must be at least 3 characters").max(2000, "Reply cannot exceed 2000 characters"),
      author: z.string().optional()
    });

    const { content, author } = schema.parse(req.body);
    const commentId = parseInt(req.params.commentId);

    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    // Check if parent comment exists
    const parentComment = await storage.getComment(commentId);
    if (!parentComment) {
      return res.status(404).json({ error: 'Parent comment not found' });
    }

    // Create reply with proper metadata
    const newReply = await db.insert(commentReplies).values({
      commentId,
      content,
      userId: req.user?.id || null,
      approved: true,
      metadata: {
        author: author || req.user?.username || 'Anonymous',
        isAnonymous: !req.user?.id,
        moderated: false,
        originalContent: content,
        upvotes: 0,
        downvotes: 0
      }
    }).returning();

    // Update parent comment's reply count
    await db.update(comments)
      .set({
        metadata: {
          ...parentComment.metadata,
          replyCount: (parentComment.metadata?.replyCount || 0) + 1
        }
      })
      .where(eq(comments.id, commentId));

    res.status(201).json(newReply[0]);
  } catch (error) {
    console.error('Error creating reply:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid reply data",
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

export default router;