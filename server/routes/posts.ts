import { Request, Response, Router } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { validateBody, validateQuery, validateParams, commonSchemas } from '../middleware/input-validation';
import { asyncHandler, createError } from '../utils/error-handler';
import { storage } from "../storage";
import { z } from "zod";
import { insertPostSchema, updatePostSchema } from "@shared/schema";
import { apiRateLimiter } from '../middlewares/rate-limiter';
// DB helpers imported where needed
import { db } from '../db';
import { posts as postsTable } from '@shared/schema';

const postsLogger = createSecureLogger('PostsRoutes');
const router = Router();

// Validation schemas for posts
const postIdSchema = z.object({
	id: commonSchemas.id
});

const postQuerySchema = z.object({
	page: commonSchemas.page,
	limit: commonSchemas.limit,
	category: z.string().optional(),
	search: z.string().max(100).optional()
});

// GET /api/posts - Get all posts with pagination
router.get('/', 
	apiRateLimiter,
	validateQuery(postQuerySchema),
	asyncHandler(async (req: Request, res: Response) => {
		const { page, limit, category, search } = req.query as any;
		
		try {
			const result = await storage.getPosts(
				Number(page),
				Number(limit),
				{ category, search }
			);
			
			postsLogger.debug('Posts retrieved successfully', { 
				count: result.posts.length, 
				page, 
				limit 
			});
			
			res.json(result);
		} catch (error) {
			postsLogger.error('Error retrieving posts', { error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to retrieve posts');
		}
	})
);

// GET /api/posts/:id - Get specific post
router.get('/:id',
	apiRateLimiter,
	validateParams(postIdSchema),
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		
		try {
			const post = await (storage as any).getPostById
				? (storage as any).getPostById(Number(id))
				: storage.getPost(String(id));
			
			if (!post) {
				throw createError.notFound('Post not found');
			}
			
			postsLogger.debug('Post retrieved successfully', { postId: id });
			res.json(post);
		} catch (error) {
			const anyError = error as any;
			if (anyError?.statusCode) throw anyError;
			postsLogger.error('Error retrieving post', { postId: id, error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to retrieve post');
		}
	})
);

// GET /api/posts/slug/:slug - Get specific post by slug (for client slug-based routes)
router.get('/slug/:slug',
	apiRateLimiter,
	asyncHandler(async (req: Request, res: Response) => {
		const { slug } = req.params;
		try {
			const post = await storage.getPost(String(slug));
			if (!post) {
				throw createError.notFound('Post not found');
			}
			res.json(post);
		} catch (error) {
			const anyError = error as any;
			if (anyError?.statusCode) throw anyError;
			postsLogger.error('Error retrieving post by slug', { slug, error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to retrieve post');
		}
	})
);

// GET /api/posts/community - Get community posts (non-admin posts, optional filters)
router.get('/community',
	apiRateLimiter,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const page = Number(req.query.page ?? 1);
			const limit = Number(req.query.limit ?? 10);
			const category = typeof req.query.category === 'string' ? req.query.category : undefined;
			const search = typeof req.query.search === 'string' ? req.query.search : undefined;
			const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;
			const order = typeof req.query.order === 'string' ? req.query.order : undefined;

			const { posts, hasMore } = await storage.getPosts(page, limit, {
				isCommunityPost: true,
				category,
				search,
				sort,
				order
			});

			// Try to get an approximate total from storage helper when available
			let totalPosts = posts.length;
			try {
				const counts = await (storage as any).getPostsCount?.();
				if (counts && typeof counts.community === 'number') {
					totalPosts = counts.community;
				}
			} catch (_) {}

			res.json({ posts, hasMore, page, totalPosts });
		} catch (error) {
			postsLogger.error('Error retrieving community posts', { error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to retrieve community posts');
		}
	})
);

// GET /api/posts/admin/themes - Admin list of posts with theme info
router.get('/admin/themes',
  apiRateLimiter,
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      // Prefer DB when available for efficiency
      const rows = await db.select({
        id: postsTable.id,
        title: postsTable.title,
        slug: postsTable.slug,
        createdAt: postsTable.createdAt,
        themeCategory: postsTable.themeCategory,
        metadata: postsTable.metadata
      }).from(postsTable);

      const data = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        createdAt: r.createdAt,
        themeCategory: r.themeCategory,
        theme_category: r.themeCategory,
        themeIcon: (r.metadata as any)?.themeIcon,
        theme_icon: (r.metadata as any)?.themeIcon,
        metadata: r.metadata
      }));

      res.json(data);
    } catch (error) {
      postsLogger.error('Error retrieving admin theme list', { error: error instanceof Error ? error.message : String(error) });
      throw createError.internal('Failed to retrieve posts for themes');
    }
  })
);

// PATCH /api/posts/:id/theme - Update a post's theme category and optional icon
router.patch('/:id/theme',
  apiRateLimiter,
  validateParams(postIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.isAdmin) {
      throw createError.forbidden('Admin privileges required');
    }

    const { id } = req.params;
    const { themeCategory, theme_category, themeIcon, icon } = req.body || {};
    const newCategory: string | undefined = themeCategory || theme_category;
    const newIcon: string | undefined = themeIcon || icon;

    try {
      // Load existing post
      const existing = await (storage as any).getPostById
        ? (storage as any).getPostById(Number(id))
        : storage.getPost(String(id));
      if (!existing) throw createError.notFound('Post not found');

      // Merge metadata with new icon if provided
      const mergedMetadata = {
        ...(existing as any).metadata || {},
        ...(newIcon ? { themeIcon: String(newIcon) } : {})
      } as any;

      // Build update payload
      const updatePayload: any = { metadata: mergedMetadata };
      if (newCategory) updatePayload.themeCategory = String(newCategory);

      const updated = await storage.updatePost(Number(id), updatePayload);
      postsLogger.info('Theme updated', { postId: id, themeCategory: newCategory, themeIcon: newIcon });
      res.json(updated);
    } catch (error) {
      const anyError = error as any;
      if (anyError?.statusCode) throw anyError;
      postsLogger.error('Error updating theme', { postId: id, error: error instanceof Error ? error.message : String(error) });
      throw createError.internal('Failed to update theme');
    }
  })
);

// POST /api/posts - Create new post (authenticated)
router.post('/',
	apiRateLimiter,
	validateBody(insertPostSchema),
	asyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw createError.unauthorized('Authentication required');
		}
		
		try {
			const postData = {
				...req.body,
				authorId: req.user.id
			};
			
			const newPost = await storage.createPost(postData);
			
			postsLogger.info('Post created successfully', { 
				postId: newPost.id,
				authorId: req.user.id 
			});
			
			res.status(201).json(newPost);
		} catch (error) {
			postsLogger.error('Error creating post', { authorId: req.user.id, error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to create post');
		}
	})
);

// PUT /api/posts/:id - Update post (authenticated, author only)
router.put('/:id',
	apiRateLimiter,
	validateParams(postIdSchema),
	validateBody(updatePostSchema),
	asyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw createError.unauthorized('Authentication required');
		}
		
		const { id } = req.params;
		
		try {
			// Check if post exists and user is author
			const existingPost = await ((storage as any).getPostById
				? (storage as any).getPostById(Number(id))
				: storage.getPost(String(id)));
			if (!existingPost) {
				throw createError.notFound('Post not found');
			}
			
			if (existingPost.authorId !== req.user.id && !req.user.isAdmin) {
				throw createError.forbidden('You can only edit your own posts');
			}
			
			const updatedPost = await storage.updatePost(Number(id), req.body);
			
			postsLogger.info('Post updated successfully', { 
				postId: id,
				authorId: req.user.id 
			});
			
			res.json(updatedPost);
		} catch (error) {
			const anyError = error as any;
			if (anyError?.statusCode) throw anyError;
			postsLogger.error('Error updating post', { postId: id, error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to update post');
		}
	})
);

// PUT /api/posts/:id/hide - Hide post (authenticated, admin only)
router.put('/:id/hide',
	apiRateLimiter,
	validateParams(postIdSchema),
	asyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw createError.unauthorized('Authentication required');
		}

		const { id } = req.params;

		try {
			const existingPost = await ((storage as any).getPostById
				? (storage as any).getPostById(Number(id))
				: storage.getPost(String(id)));
			if (!existingPost) {
				throw createError.notFound('Post not found');
			}

			if (!req.user.isAdmin) {
				throw createError.forbidden('Only admins can hide posts');
			}

			const updated = await storage.updatePost(Number(id), { metadata: { ...(existingPost as any).metadata || {}, isHidden: true } as any });
			postsLogger.info('Post hidden successfully', { postId: id, adminId: req.user.id });
			res.json(updated);
		} catch (error) {
			const anyError = error as any;
			if (anyError?.statusCode) throw anyError;
			postsLogger.error('Error hiding post', { postId: id, error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to hide post');
		}
	})
);

// POST /api/posts/:id/like - Simple like endpoint (uses session-based reaction for anonymous users)
router.post('/:id/like',
	apiRateLimiter,
	validateParams(postIdSchema),
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		try {
			await (storage as any).updatePostReaction(Number(id), { isLike: true, sessionId: req.sessionID });
			const counts = await (storage as any).getPostLikeCounts(Number(id));
			res.json({ success: true, ...counts });
		} catch (error) {
			postsLogger.error('Error liking post', { postId: id, error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to like post');
		}
	})
);

// POST /api/posts/:id/flag - Report content
router.post('/:id/flag',
	apiRateLimiter,
	validateParams(postIdSchema),
	asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		const reason = typeof req.body?.reason === 'string' ? req.body.reason : 'unspecified';
		try {
			const reporterId = (req.user as any)?.id ?? 0;
			const report = await (storage as any).reportContent({
				contentType: 'post',
				contentId: Number(id),
				reporterId,
				reason
			});
			res.status(201).json(report);
		} catch (error) {
			postsLogger.error('Error reporting post', { postId: id, error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to report post');
		}
	})
);

// DELETE /api/posts/:id - Delete post (authenticated, author only)
router.delete('/:id',
	apiRateLimiter,
	validateParams(postIdSchema),
	asyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw createError.unauthorized('Authentication required');
		}
		
		const { id } = req.params;
		
		try {
			// Check if post exists and user is author
			const existingPost = await ((storage as any).getPostById
				? (storage as any).getPostById(Number(id))
				: storage.getPost(String(id)));
			if (!existingPost) {
				throw createError.notFound('Post not found');
			}
			
			if (existingPost.authorId !== req.user.id && !req.user.isAdmin) {
				throw createError.forbidden('You can only delete your own posts');
			}
			
			await storage.deletePost(Number(id));
			
			postsLogger.info('Post deleted successfully', { 
				postId: id,
				authorId: req.user.id 
			});
			
			res.status(204).send();
		} catch (error) {
			const anyError = error as any;
			if (anyError?.statusCode) throw anyError;
			postsLogger.error('Error deleting post', { postId: id, error: error instanceof Error ? error.message : String(error) });
			throw createError.internal('Failed to delete post');
		}
	})
);

export { router as postsRouter };