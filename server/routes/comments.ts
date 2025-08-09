import express from "express";
import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { createError, asyncHandler } from "../utils/error-handler";
import { validateBody, validateParams } from "../middleware/input-validation";
import { apiRateLimiter } from "../middlewares/rate-limiter";
import { createLogger } from "../utils/debug-logger";
import { insertCommentSchema, insertCommentReplySchema } from "../../shared/schema";

const router = express.Router();
const commentsLogger = createLogger("comments");

// Define schemas locally since they're not in shared schema
const commentIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "Comment ID must be a number")
});

const postIdSchema = z.object({
  postId: z.string().regex(/^\d+$/, "Post ID must be a number")
});

// Missing moderation function that was causing TypeScript errors
async function moderateComment(content: string): Promise<{ approved: boolean; content?: string }> {
  try {
    // Basic content moderation - check for common inappropriate words
    const inappropriateWords = [
      'spam', 'scam', 'hack', 'crack', 'illegal', 'porn', 'sex', 'adult',
      'casino', 'gambling', 'drugs', 'weapons', 'violence'
    ];
    
    const lowerContent = content.toLowerCase();
    const hasInappropriateContent = inappropriateWords.some(word => 
      lowerContent.includes(word)
    );
    
    if (hasInappropriateContent) {
      return { approved: false };
    }
    
    // Basic spam detection - check for excessive links or repetitive content
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 3) {
      return { approved: false };
    }
    
    // Check for repetitive characters
    const repetitivePattern = /(.)\1{4,}/;
    if (repetitivePattern.test(content)) {
      return { approved: false };
    }
    
    return { approved: true, content };
  } catch (error) {
    console.error('Error in comment moderation:', error);
    // If moderation fails, approve the comment but log the error
    return { approved: true, content };
  }
}

// GET /api/posts/:postId/comments - Get comments for a post
router.get('/posts/:postId/comments',
  apiRateLimiter,
  validateParams(postIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    
    try {
      const comments = await storage.getCommentsByPost(Number(postId));
      return res.json(comments);
    } catch (error: any) {
      if (error.statusCode) throw error;
      commentsLogger.error('Error fetching comments', { postId, error });
      throw createError.internal('Failed to fetch comments');
    }
  })
);

// POST /api/posts/:postId/comments - Create new comment
router.post('/posts/:postId/comments',
  apiRateLimiter,
  validateParams(postIdSchema),
  validateBody(insertCommentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    
    try {
      // Moderate comment content
      const moderationResult = await moderateComment(req.body.content);
      if (!moderationResult.approved) {
        throw createError.badRequest('Comment contains inappropriate content');
      }
      
      const commentData = {
        ...req.body,
        postId: Number(postId),
        authorId: req.user?.id || null,
        content: moderationResult.content || req.body.content
      };
      
      const newComment = await storage.createComment(commentData);
      
      commentsLogger.info('Comment created successfully', { 
        commentId: newComment.id,
        postId,
        authorId: req.user?.id 
      });
      
      res.status(201).json(newComment);
    } catch (error: any) {
      if (error.statusCode) throw error;
      commentsLogger.error('Error creating comment', { postId, error });
      throw createError.internal('Failed to create comment');
    }
  })
);

// POST /api/comments/:id/replies - Create reply to comment
router.post('/comments/:id/replies',
  apiRateLimiter,
  validateParams(commentIdSchema),
  validateBody(insertCommentReplySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      // Moderate reply content
      const moderationResult = await moderateComment(req.body.content);
      if (!moderationResult.approved) {
        throw createError.badRequest('Reply contains inappropriate content');
      }
      
      const replyData = {
        ...req.body,
        parentId: Number(id),
        authorId: req.user?.id || null,
        content: moderationResult.content || req.body.content
      };
      
      const newReply = await storage.createCommentReply(replyData);
      
      commentsLogger.info('Comment reply created successfully', { 
        replyId: newReply.id,
        parentId: id,
        authorId: req.user?.id 
      });
      
      return res.status(201).json(newReply);
    } catch (error: any) {
      if (error.statusCode) throw error;
      commentsLogger.error('Error creating comment reply', { parentId: id, error });
      throw createError.internal('Failed to create reply');
    }
  })
);

// DELETE /api/comments/:id - Delete comment (author or admin only)
router.delete('/comments/:id',
  apiRateLimiter,
  validateParams(commentIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw createError.unauthorized('Authentication required');
    }
    
    const { id } = req.params;
    
    try {
      // Check if comment exists and user can delete it
      const existingComment = await storage.getComment(Number(id));
      if (!existingComment) {
        throw createError.notFound('Comment not found');
      }
      
      const canDelete = existingComment.userId === req.user.id || req.user.isAdmin;
      if (!canDelete) {
        throw createError.forbidden('You can only delete your own comments');
      }
      
      await storage.deleteComment(Number(id));
      
      commentsLogger.info('Comment deleted successfully', { 
        commentId: id,
        authorId: req.user.id 
      });
      
      return res.json({ success: true });
    } catch (error: any) {
      if (error.statusCode) throw error;
      commentsLogger.error('Error deleting comment', { commentId: id, error });
      throw createError.internal('Failed to delete comment');
    }
  })
);

// POST /api/comments/:id/vote - Vote on comment (like/dislike)
router.post('/comments/:id/vote',
  apiRateLimiter,
  validateParams(commentIdSchema),
  validateBody(z.object({
    vote: z.enum(['like', 'dislike', 'none'])
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { vote } = req.body;
    
    try {
      const result = await storage.voteOnComment(Number(id), vote, req.user?.id);
      
      commentsLogger.debug('Comment vote recorded', { 
        commentId: id,
        vote,
        userId: req.user?.id 
      });
      
      res.json(result);
    } catch (error) {
      commentsLogger.error('Error voting on comment', { commentId: id, error });
      throw createError.internal('Failed to record vote');
    }
  })
);

export { router as commentsRouter };