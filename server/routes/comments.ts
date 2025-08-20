import { Request, Response, Router } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { validateBody, validateQuery, validateParams, commonSchemas } from '../middleware/input-validation';
import { asyncHandler, createError } from '../utils/error-handler';
import { storage } from "../storage";
import { z } from "zod";
import { insertCommentSchema, insertCommentReplySchema } from "@shared/schema";
import { apiRateLimiter } from '../middlewares/rate-limiter';
import { moderateComment } from "../utils/comment-moderation";

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
			const comments = await storage.getComments(Number(postId));
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

// POST /api/posts/:postId/comments - Create new comment (body need not include postId)
// Accept additional UX fields and transform them server-side
const createCommentBodySchema = z.object({
	content: z.string().min(1).max(2000).trim(),
	parentId: z.union([z.number().int().positive(), z.null()]).optional(),
	metadata: z.record(z.unknown()).optional(),
	author: z.string().min(1).max(50).optional(),
	needsModeration: z.boolean().optional(),
	moderationStatus: z.enum(["flagged", "under_review", "none"]).optional()
}).passthrough();

router.post('/posts/:postId/comments',
	apiRateLimiter,
	validateParams(postIdSchema),
	validateBody(createCommentBodySchema),
	asyncHandler(async (req: Request, res: Response) => {
		const { postId } = req.params;
		
		try {
			// Moderate comment content
			const moderationResult = moderateComment(req.body.content);
			if (moderationResult.isBlocked) {
				throw createError.badRequest('Comment contains inappropriate content');
			}
			
			// Build metadata, merging client-provided metadata safely
			const baseMetadata = (req.body.metadata && typeof req.body.metadata === 'object') ? req.body.metadata as Record<string, unknown> : {};
			const mergedMetadata = {
				moderated: moderationResult.moderatedText !== req.body.content,
				originalContent: req.body.content,
				isAnonymous: !(req as any).user,
				author: (req.body as any).author || (req as any).user?.username || 'Anonymous',
				upvotes: 0,
				downvotes: 0,
				replyCount: 0,
				...baseMetadata
			};
			
			const isApproved = (req.body as any).needsModeration === true || (req.body as any).moderationStatus === 'flagged' || (req.body as any).moderationStatus === 'under_review' 
				? false 
				: true;
			
			const commentData = {
				content: moderationResult.moderatedText || req.body.content,
				postId: Number(postId),
				parentId: (req.body as any).parentId ?? null,
				userId: (req.user as any)?.id || null,
				metadata: mergedMetadata,
				is_approved: isApproved
			} as any;
			
			const newComment = await storage.createComment(commentData);
			
			commentsLogger.info('Comment created successfully', { 
				commentId: newComment.id,
				postId,
				authorId: (req.user as any)?.id 
			});
			
			res.status(201).json(newComment);
		} catch (error) {
			if ((error as any).statusCode) throw error as any;
			commentsLogger.error('Error creating comment', { postId, error });
			throw createError.internal('Failed to create comment');
		}
	})
);

// POST /api/comments/:id/replies - Create reply to comment
// Accepts either nested metadata.author or top-level author and ensures postId is carried from parent
const createReplyBodySchema = z.object({
	content: z.string().min(1).max(2000).trim(),
	author: z.string().min(1).max(50).optional(),
	metadata: z.record(z.unknown()).optional()
}).passthrough();

router.post('/comments/:id/replies',
	apiRateLimiter,
	validateParams(commentIdSchema),
	validateBody(createReplyBodySchema),
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		
		try {
			// Ensure parent comment exists to inherit postId
			const parent = await storage.getComment(Number(id));
			if (!parent) {
				throw createError.notFound('Parent comment not found');
			}
			
			// Moderate reply content
			const moderationResult = moderateComment(req.body.content);
			if (moderationResult.isBlocked) {
				throw createError.badRequest('Reply contains inappropriate content');
			}
			
			const baseMetadata = (req.body.metadata && typeof req.body.metadata === 'object') ? req.body.metadata as Record<string, unknown> : {};
			const mergedMetadata = {
				moderated: moderationResult.moderatedText !== req.body.content,
				originalContent: req.body.content,
				isAnonymous: !(req as any).user,
				author: (req.body as any).author || (req as any).user?.username || 'Anonymous',
				upvotes: 0,
				downvotes: 0,
				replyCount: 0,
				...baseMetadata
			};
			
			const replyData = {
				content: moderationResult.moderatedText || req.body.content,
				postId: (parent as any).postId ?? null,
				parentId: Number(id),
				userId: (req.user as any)?.id || null,
				metadata: mergedMetadata,
				is_approved: true
			} as any;
			
			const newReply = await storage.createCommentReply(replyData);
			
			commentsLogger.info('Comment reply created successfully', { 
				replyId: newReply.id,
				parentId: id,
				authorId: (req.user as any)?.id 
			});
			
			res.status(201).json(newReply);
		} catch (error) {
			if ((error as any).statusCode) throw error as any;
			commentsLogger.error('Error creating comment reply', { parentId: id, error });
			throw createError.internal('Failed to create reply');
		}
	})
);

// POST /api/comments/:id/flag - Flag a comment for moderation
router.post('/comments/:id/flag',
  apiRateLimiter,
  validateParams(commentIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      // Minimal implementation: mark the comment as needing moderation in metadata
      const existing = await storage.getComment(Number(id));
      if (!existing) {
        throw createError.notFound('Comment not found');
      }
      const updated = await storage.updateComment(Number(id), {
        metadata: { ...(existing as any).metadata, flagged: true, flaggedAt: new Date().toISOString() }
      } as any);
      commentsLogger.warn('Comment flagged by user', { commentId: id, userId: (req as any).user?.id });
      res.status(204).send();
    } catch (error) {
      if ((error as any).statusCode) throw error as any;
      commentsLogger.error('Error flagging comment', { commentId: id, error });
      throw createError.internal('Failed to flag comment');
    }
  })
);

// DELETE /api/comments/:id - Delete comment (author or admin only)
router.delete('/comments/:id',
	apiRateLimiter,
	validateParams(commentIdSchema),
	asyncHandler(async (req: Request, res: Response) => {
		if (!(req as any).user) {
			throw createError.unauthorized('Authentication required');
		}
		
		const { id } = req.params;
		
		try {
			// Check if comment exists and user can delete it
			const existingComment = await storage.getComment(Number(id));
			if (!existingComment) {
				throw createError.notFound('Comment not found');
			}
			
			const canDelete = (existingComment as any).userId === (req as any).user.id || (req as any).user.isAdmin;
			if (!canDelete) {
				throw createError.forbidden('You can only delete your own comments');
			}
			
			await storage.deleteComment(Number(id));
			
			commentsLogger.info('Comment deleted successfully', { 
				commentId: id,
				authorId: (req as any).user.id 
			});
			
			res.status(204).send();
		} catch (error) {
			if ((error as any).statusCode) throw error as any;
			commentsLogger.error('Error deleting comment', { commentId: id, error });
			throw createError.internal('Failed to delete comment');
		}
	})
);

// POST /api/comments/:id/vote - Vote on comment (like/dislike/none) or accept {isUpvote}
const voteBodySchema = z.union([
	z.object({ vote: z.enum(['like', 'dislike', 'none']) }),
	z.object({ isUpvote: z.boolean() })
]);
router.post('/comments/:id/vote',
	apiRateLimiter,
	validateParams(commentIdSchema),
	validateBody(voteBodySchema),
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		const body = req.body as { vote?: 'like'|'dislike'|'none'; isUpvote?: boolean };
		const userKey = (req as any).user?.id?.toString() || (req.sessionID ?? 'anon');
		
		// Normalize payload
		const normalizedVote: 'like'|'dislike'|'none' =
			body.vote ?? (body.isUpvote === true ? 'like' : body.isUpvote === false ? 'dislike' : 'none');
		
		try {
			const existing = await (storage as any).getCommentVote(Number(id), userKey);
			if (existing) {
				if ((normalizedVote === 'like' && existing.isUpvote) || (normalizedVote === 'dislike' && !existing.isUpvote) || normalizedVote === 'none') {
					await (storage as any).removeCommentVote(Number(id), userKey);
				} else {
					await (storage as any).updateCommentVote(Number(id), userKey, normalizedVote === 'like');
				}
			} else {
				if (normalizedVote !== 'none') {
					await (storage as any).createCommentVote(Number(id), userKey, normalizedVote === 'like');
				}
			}

			const counts = await (storage as any).getCommentVoteCounts(Number(id));
			commentsLogger.debug('Comment vote recorded', { 
				commentId: id,
				normalizedVote,
				userKey,
				counts
			});
			
			res.json(counts);
		} catch (error) {
			commentsLogger.error('Error voting on comment', { commentId: id, error });
			throw createError.internal('Failed to record vote');
		}
	})
);

export { router as commentsRouter };