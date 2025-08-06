import { Request, Response, Router } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { validateBody, validateQuery, validateParams, commonSchemas } from '../middleware/input-validation';
import { asyncHandler, createError } from '../utils/error-handler';

import { z } from "zod";
import { insertCommentSchema, insertCommentReplySchema } from "@shared/schema";
import { apiRateLimiter } from '../middlewares/rate-limiter';
import { storage } from '../storage';

const commentsLogger = createSecureLogger('CommentsRoutes');
const router = Router();

// Validation schemas
const commentIdSchema = z.object({
  id: commonSchemas.id
});

const postIdSchema = z.object({
  postId: commonSchemas.id
});

const commentQuerySchema = z.object({
  page: commonSchemas.page,
  limit: commonSchemas.limit
});

// GET /api/posts/:postId/comments - Get comments for a post
router.get('/posts/:postId/comments',
  apiRateLimiter,
  validateParams(postIdSchema),
  validateQuery(commentQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { page, limit } = req.query as any;
    
    try {
      const comments = await storage.getCommentsByPost(Number(postId));
      
      commentsLogger.debug('Comments retrieved successfully', { 
        postId,
        count: comments.length,
        page,
        limit 
      });
      
      res.json(comments);
    } catch (error) {
      commentsLogger.error('Error retrieving comments', { postId, error });
      throw createError.internal('Failed to retrieve comments');
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
    } catch (error) {
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
      
      res.status(201).json(newReply);
    } catch (error) {
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
      
      const canDelete = existingComment.authorId === req.user.id || req.user.isAdmin;
      if (!canDelete) {
        throw createError.forbidden('You can only delete your own comments');
      }
      
      await storage.deleteComment(Number(id));
      
      commentsLogger.info('Comment deleted successfully', { 
        commentId: id,
        authorId: req.user.id 
      });
      
      res.status(204).send();
    } catch (error) {
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