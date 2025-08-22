import { Request, Response, Router } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { validateBody, validateQuery, validateParams, commonSchemas } from '../middleware/input-validation';
import { asyncHandler, createError } from '../utils/error-handler';
import { storage } from "../storage";
import { z } from "zod";
import { insertCommentSchema, updateCommentSchema } from "@shared/schema";
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

// Body schemas for routes
const createCommentBodySchema = z.object({
	content: z.string().min(1).max(2000).trim(),
	author: z.string().min(1).max(50).optional(),
	parentId: z.coerce.number().int().positive().optional(),
	needsModeration: z.boolean().optional(),
	moderationStatus: z.enum(['flagged', 'under_review', 'none']).optional()
});

const voteBodySchema = z.object({
	isUpvote: z.boolean()
});

const updateCommentBodySchema = updateCommentSchema; // { content: string }

const flagBodySchema = z.object({
	reason: z.string().min(3).max(500).optional()
});

function getUserKey(req: Request): string {
	const userId = (req as any).user?.id;
	if (userId !== undefined && userId !== null) return String(userId);
	return (req as any).sessionID ? `anon:${(req as any).sessionID}` : 'anon';
}

// GET /api/posts/:postId/comments - list comments for a post
router.get(
	'/posts/:postId/comments',
	apiRateLimiter,
	validateParams(postIdSchema),
	asyncHandler(async (req: Request, res: Response) => {
		const postId = Number((req.params as any).postId);
		const userKey = getUserKey(req);

		const comments = await storage.getComments(postId);

		const enhanced = comments.map((c: any) => ({
			...c,
			// Back-compat field for clients that read `approved`
			approved: (c as any).approved === undefined ? Boolean(c.is_approved) : Boolean((c as any).approved),
			isOwner: (c as any).metadata && (c as any).metadata.ownerKey
				? String((c as any).metadata.ownerKey) === userKey
				: false
		}));

		res.json(enhanced);
	})
);

// POST /api/posts/:postId/comments - create a new comment or reply (when parentId provided)
router.post(
	'/posts/:postId/comments',
	apiRateLimiter,
	validateParams(postIdSchema),
	validateBody(createCommentBodySchema),
	asyncHandler(async (req: Request, res: Response) => {
		const postId = Number((req.params as any).postId);
		const body = req.body as z.infer<typeof createCommentBodySchema>;
		const userKey = getUserKey(req);

		// Moderate content server-side defensively
		const { isBlocked, moderatedText } = moderateComment(body.content);
		const contentToSave = moderatedText;
		const shouldHoldForReview = Boolean(body.needsModeration) || body.moderationStatus === 'flagged' || isBlocked;

		// Determine author name
		const inferredAuthor = body.author && body.author.trim().length > 0
			? body.author.trim()
			: ((req as any).user?.username || ((req as any).user?.id ? 'User' : 'Guest'));

		const insert = {
			content: contentToSave,
			postId,
			parentId: body.parentId ?? undefined,
			userId: (req as any).user?.id ?? undefined,
			is_approved: shouldHoldForReview ? false : true,
			metadata: {
				author: inferredAuthor,
				ownerKey: userKey
			}
		} as z.infer<typeof insertCommentSchema>;

		const created = await storage.createComment(insert as any);
		// Add isOwner to response for immediate UI use
		(res as any).status(201).json({ ...created, approved: created.is_approved === true, isOwner: true });
	})
);

// POST /api/comments/:id/vote - upvote/downvote by user or anonymous session
router.post(
	'/comments/:id/vote',
	apiRateLimiter,
	validateParams(commentIdSchema),
	validateBody(voteBodySchema),
	asyncHandler(async (req: Request, res: Response) => {
		const commentId = Number((req.params as any).id);
		const { isUpvote } = req.body as z.infer<typeof voteBodySchema>;
		const userKey = getUserKey(req);

		const existing = await storage.getCommentVote(commentId, userKey);
		if (!existing) {
			await storage.createCommentVote(commentId, userKey, isUpvote);
		} else if (existing.isUpvote !== isUpvote) {
			await storage.updateCommentVote(commentId, userKey, isUpvote);
		} else {
			// Toggle off if same vote sent again
			await storage.removeCommentVote(commentId, userKey);
		}

		const counts = await storage.getCommentVoteCounts(commentId);
		res.json({ success: true, ...counts });
	})
);

// POST /api/comments/:id/flag - flag a comment for moderation
router.post(
	'/comments/:id/flag',
	apiRateLimiter,
	validateParams(commentIdSchema),
	validateBody(flagBodySchema),
	asyncHandler(async (req: Request, res: Response) => {
		const commentId = Number((req.params as any).id);
		const { reason } = req.body as z.infer<typeof flagBodySchema>;
		const userKey = getUserKey(req);

		const existing = await storage.getComment(commentId);
		if (!existing) {
			throw createError('Comment not found', 404);
		}

		const updatedMeta = {
			...(existing.metadata as any || {}),
			status: 'flagged',
			flaggedAt: new Date().toISOString(),
			flaggedBy: userKey,
			flagReason: reason || 'inappropriate content'
		};

		await storage.updateComment(commentId, { metadata: updatedMeta });
		res.json({ success: true });
	})
);

// PATCH /api/comments/:id - edit own comment
router.patch(
	'/comments/:id',
	apiRateLimiter,
	validateParams(commentIdSchema),
	validateBody(updateCommentBodySchema),
	asyncHandler(async (req: Request, res: Response) => {
		const commentId = Number((req.params as any).id);
		const { content } = req.body as z.infer<typeof updateCommentBodySchema>;
		const userKey = getUserKey(req);

		const existing = await storage.getComment(commentId);
		if (!existing) throw createError('Comment not found', 404);

		const isOwner = (existing.metadata as any)?.ownerKey && String((existing.metadata as any).ownerKey) === userKey;
		if (!isOwner) throw createError('Not allowed to edit this comment', 403);

		const { moderatedText } = moderateComment(content);
		const updated = await storage.updateComment(commentId, {
			content: moderatedText,
			edited: true,
			editedAt: new Date()
		});
		res.json({ ...updated, approved: updated.is_approved === true, isOwner: true });
	})
);

// DELETE /api/comments/:id - delete own comment
router.delete(
	'/comments/:id',
	apiRateLimiter,
	validateParams(commentIdSchema),
	asyncHandler(async (req: Request, res: Response) => {
		const commentId = Number((req.params as any).id);
		const userKey = getUserKey(req);

		const existing = await storage.getComment(commentId);
		if (!existing) throw createError('Comment not found', 404);

		const isOwner = (existing.metadata as any)?.ownerKey && String((existing.metadata as any).ownerKey) === userKey;
		if (!isOwner) throw createError('Not allowed to delete this comment', 403);

		await storage.deleteComment(commentId);
		res.json({ success: true });
	})
);

export const commentsRouter = router;