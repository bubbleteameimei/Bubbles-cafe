import { Request, Response, Router } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { validateBody, validateQuery, validateParams, commonSchemas } from '../middleware/input-validation';
import { asyncHandler, createError } from '../utils/error-handler';
import { storage } from "../storage";
import { z } from "zod";
import { insertPostSchema, updatePostSchema, insertCommentSchema, posts as postsTable } from "@shared/schema";
import { apiRateLimiter } from '../middlewares/rate-limiter';
// DB helpers imported where needed
import { db } from '../db';
import { eq, sql, inArray } from "drizzle-orm";
import { moderateComment } from "../utils/comment-moderation";
import { clearCacheItem } from "../middlewares/api-cache";

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

// Alias for legacy clients: /api/posts/by-slug/:slug
router.get('/by-slug/:slug',
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
			postsLogger.error('Error retrieving post by legacy slug route', { slug, error: error instanceof Error ? error.message : String(error) });
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
    } catch (_error) {
      postsLogger.error('Error retrieving admin theme list', { error: (_error as Error)?.message ?? String(_error) });
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

// GET /api/posts/:id/reactions - Return baseline + live counts with totals
router.get('/:id/reactions',
  apiRateLimiter,
  validateParams(postIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      let effectiveId = Number(id);
      let post = await (storage as any).getPostById(effectiveId);

      // Try metadata.wordpressId mapping to locate the local post id when not found
      if (!post) {
        try {
          const mapped = await db
            .select({ id: postsTable.id })
            .from(postsTable)
            .where(sql`(metadata->>'wordpressId')::int = ${effectiveId}`)
            .limit(1);
          if (mapped[0]?.id) {
            effectiveId = Number(mapped[0].id);
            post = await (storage as any).getPostById(effectiveId);
          }
        } catch (_) { /* no-op */ }
      }

      // Ensure placeholder exists if still missing (for external ids)
      if (!post && (storage as any).ensurePostExists) {
        await (storage as any).ensurePostExists(effectiveId);
        post = await (storage as any).getPostById(effectiveId);
      }

      if (!post) throw createError.notFound('Post not found');

      const counts = await (storage as any).getPostLikeCounts(effectiveId);
      let baselineLikes = Number((post as any).baselineLikes ?? 0);
      let baselineDislikes = Number((post as any).baselineDislikes ?? 0);

      // Fallback seeding: if baselines are zero, compute deterministic values and persist
      if (baselineLikes === 0 || baselineDislikes === 0) {
        const slug = String((post as any).slug || '');
        const seedNumber = slug
          ? (() => { let h = 0; for (let i = 0; i < slug.length; i++) { h = (h << 5) - h + slug.charCodeAt(i); h |= 0; } return Math.abs(h); })()
          : effectiveId;
        const seed = seedNumber * 12345;
        const seededRandom = (n: number) => { const x = Math.sin(n) * 10000; return x - Math.floor(x); };
        const likesBase = Math.floor(seededRandom(seed) * (200 - 80 + 1)) + 80; // 80–200
        const dislikesBase = Math.floor(seededRandom(seed + 999) * (13 - 2 + 1)) + 2; // 2–13

        try {
          await db.update(postsTable)
            .set({ baselineLikes: likesBase, baselineDislikes: dislikesBase })
            .where(eq(postsTable.id, effectiveId));
          baselineLikes = likesBase;
          baselineDislikes = dislikesBase;
        } catch (_) {
          baselineLikes = baselineLikes || likesBase;
          baselineDislikes = baselineDislikes || dislikesBase;
        }
      }

      return res.json({
        postId: effectiveId,
        baselineLikes,
        baselineDislikes,
        likesCount: Number(counts.likesCount ?? 0),
        dislikesCount: Number(counts.dislikesCount ?? 0),
        totals: {
          likes: baselineLikes + Number(counts.likesCount ?? 0),
          dislikes: baselineDislikes + Number(counts.dislikesCount ?? 0)
        }
      });
    } catch (error) {
      postsLogger.error('Error getting reactions', { postId: id, error: error instanceof Error ? error.message : String(error) });
      throw createError.internal('Failed to fetch reactions');
    }
  })
);

// GET /api/posts/reactions-batch?ids=1,2,3 - Optimized batch baseline + live totals
router.get('/reactions-batch',
  apiRateLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const raw = (req.query.ids || req.query.id || '') as string | string[];
      const list = Array.isArray(raw)
        ? raw.join(',').split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n))
        : String(raw || '').split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n));

      const ids = Array.from(new Set(list)).slice(0, 200); // cap to 200 ids per call
      if (!ids.length) {
        return res.json({ results: [] });
      }

      // Fetch rows for direct local post IDs
      const directRows = await db.select({
        id: postsTable.id,
        slug: postsTable.slug,
        baselineLikes: (postsTable as any).baselineLikes,
        baselineDislikes: (postsTable as any).baselineDislikes,
        likesCount: postsTable.likesCount,
        dislikesCount: postsTable.dislikesCount,
      }).from(postsTable).where(inArray(postsTable.id, ids));

      // Fetch rows mapped by WordPress external IDs in one query
      const mappedRowsRes = await db.execute(sql`
        SELECT id, slug,
               baseline_likes AS "baselineLikes",
               baseline_dislikes AS "baselineDislikes",
               likes_count AS "likesCount",
               dislikes_count AS "dislikesCount",
               (metadata->>'wordpressId')::int AS "wordpressId"
        FROM posts
        WHERE (metadata->>'wordpressId')::int IN (${ids.join(',')})
      `);
      const mappedRows = (mappedRowsRes as any).rows || [];

      const directMap = new Map<number, any>();
      for (const r of directRows) directMap.set(Number(r.id), r);

      const wpMap = new Map<number, any>();
      for (const r of mappedRows) {
        const wpId = Number((r as any).wordpressId);
        if (Number.isFinite(wpId)) wpMap.set(wpId, r);
      }

      // Deterministic baseline helpers
      const hashSlug = (s: string): number => {
        let h = 0;
        for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
        return Math.abs(h);
      };
      const seededRandom = (n: number) => { const x = Math.sin(n) * 10000; return x - Math.floor(x); };

      const results: any[] = [];

      const baselineUpdates: Array<{ id: number; likesBase: number; dislikesBase: number }> = [];

      for (const rawId of ids) {
        const row = directMap.get(rawId) || wpMap.get(rawId);
        if (row) {
          let bl = Number((row as any).baselineLikes ?? 0);
          let bd = Number((row as any).baselineDislikes ?? 0);

          if (bl === 0 || bd === 0) {
            const slug = String((row as any).slug || `wordpress-post-${rawId}`);
            const seedNumber = slug ? hashSlug(slug) : rawId;
            const seed = seedNumber * 12345;
            const likesBase = Math.floor(seededRandom(seed) * (200 - 80 + 1)) + 80;
            const dislikesBase = Math.floor(seededRandom(seed + 999) * (13 - 2 + 1)) + 2;
            bl = bl || likesBase;
            bd = bd || dislikesBase;
            baselineUpdates.push({ id: Number((row as any).id), likesBase: bl, dislikesBase: bd });
          }

          const likesCount = Number((row as any).likesCount ?? 0);
          const dislikesCount = Number((row as any).dislikesCount ?? 0);

          results.push({
            postId: Number((row as any).id),
            baselineLikes: bl,
            baselineDislikes: bd,
            likesCount,
            dislikesCount,
            totals: {
              likes: bl + likesCount,
              dislikes: bd + dislikesCount,
            },
          });
        } else {
          // For missing posts, attempt to create a placeholder (best-effort)
          try {
            if ((storage as any).ensurePostExists) {
              await (storage as any).ensurePostExists(rawId);
              // Try to fetch the newly ensured placeholder quickly
              const [fetched] = await db.select({
                id: postsTable.id,
                slug: postsTable.slug,
                baselineLikes: (postsTable as any).baselineLikes,
                baselineDislikes: (postsTable as any).baselineDislikes,
                likesCount: postsTable.likesCount,
                dislikesCount: postsTable.dislikesCount,
              }).from(postsTable).where(sql`(metadata->>'wordpressId')::int = ${rawId}`).limit(1);

              if (fetched) {
                const bl = Number((fetched as any).baselineLikes ?? 0);
                const bd = Number((fetched as any).baselineDislikes ?? 0);
                const likesCount = Number((fetched as any).likesCount ?? 0);
                const dislikesCount = Number((fetched as any).dislikesCount ?? 0);
                results.push({
                  postId: Number((fetched as any).id),
                  baselineLikes: bl,
                  baselineDislikes: bd,
                  likesCount,
                  dislikesCount,
                  totals: { likes: bl + likesCount, dislikes: bd + dislikesCount },
                });
                continue;
              }
            }
          } catch (_) { /* non-fatal */ }

          // Fallback result when still missing
          const slug = `wordpress-post-${rawId}`;
          const seedNumber = hashSlug(slug);
          const seed = seedNumber * 12345;
          const likesBase = Math.floor(seededRandom(seed) * (200 - 80 + 1)) + 80;
          const dislikesBase = Math.floor(seededRandom(seed + 999) * (13 - 2 + 1)) + 2;

          results.push({
            postId: Number(rawId),
            baselineLikes: likesBase,
            baselineDislikes: dislikesBase,
            likesCount: 0,
            dislikesCount: 0,
            totals: { likes: likesBase, dislikes: dislikesBase },
          });
        }
      }

      // Persist baseline updates with minimal queries
      try {
        for (const b of baselineUpdates) {
          await db.update(postsTable)
            .set({ baselineLikes: b.likesBase, baselineDislikes: b.dislikesBase })
            .where(eq(postsTable.id, b.id));
        }
      } catch (_) { /* non-fatal */ }

      return res.json({ results });
    } catch (error) {
      postsLogger.error('Error getting reactions batch (optimized)', { error: error instanceof Error ? error.message : String(error) });
      throw createError.internal('Failed to fetch reactions batch');
    }
  })
);

// POST /api/posts/:id/reaction - Toggle like/dislike with session tracking
const reactionBodySchema = z.object({
  isLike: z.boolean()
});
router.post('/:id/reaction',
  apiRateLimiter,
  validateParams(postIdSchema),
  validateBody(reactionBodySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isLike } = req.body as any;
    try {
      let effectiveId = Number(id);
      // Ensure the post exists (create placeholder if needed), with metadata mapping support
      let post = await (storage as any).getPostById(effectiveId);
      if (!post) {
        try {
          const mapped = await db
            .select({ id: postsTable.id })
            .from(postsTable)
            .where(sql`(metadata->>'wordpressId')::int = ${effectiveId}`)
            .limit(1);
          if (mapped[0]?.id) {
            effectiveId = Number(mapped[0].id);
            post = await (storage as any).getPostById(effectiveId);
          }
        } catch (_) { /* no-op */ }
      }
      if (!post && (storage as any).ensurePostExists) {
        await (storage as any).ensurePostExists(effectiveId);
        post = await (storage as any).getPostById(effectiveId);
      }
      if (!post) throw createError.notFound('Post not found');

      // Attempt DB-backed reaction update; tolerate failures in preview environments
      try {
        await (storage as any).updatePostReaction(effectiveId, { isLike: !!isLike, sessionId: req.sessionID });
      } catch (e) {
        postsLogger.warn('Non-fatal: updatePostReaction failed, continuing with baseline totals', {
          postId: id,
          error: e instanceof Error ? e.message : String(e)
        });
      }

      const counts = await (storage as any).getPostLikeCounts(effectiveId);
      let baselineLikes = Number((post as any).baselineLikes ?? 0);
      let baselineDislikes = Number((post as any).baselineDislikes ?? 0);

      // Fallback seeding: if baselines are zero, compute deterministic values and persist
      if (baselineLikes === 0 || baselineDislikes === 0) {
        const slug = String((post as any).slug || '');
        const seedNumber = slug
          ? (() => { let h = 0; for (let i = 0; i < slug.length; i++) { h = (h << 5) - h + slug.charCodeAt(i); h |= 0; } return Math.abs(h); })()
          : effectiveId;
        const seed = seedNumber * 12345;
        const seededRandom = (n: number) => { const x = Math.sin(n) * 10000; return x - Math.floor(x); };
        const likesBase = Math.floor(seededRandom(seed) * (200 - 80 + 1)) + 80; // 80–200
        const dislikesBase = Math.floor(seededRandom(seed + 999) * (13 - 2 + 1)) + 2; // 2–13

        try {
          await db.update(postsTable)
            .set({ baselineLikes: likesBase, baselineDislikes: dislikesBase })
            .where(eq(postsTable.id, effectiveId));
          baselineLikes = likesBase;
          baselineDislikes = dislikesBase;
        } catch (_) {
          baselineLikes = baselineLikes || likesBase;
          baselineDislikes = baselineDislikes || dislikesBase;
        }
      }

      return res.json({
        success: true,
        postId: effectiveId,
        baselineLikes,
        baselineDislikes,
        likesCount: Number(counts.likesCount ?? 0),
        dislikesCount: Number(counts.dislikesCount ?? 0),
        totals: {
          likes: baselineLikes + Number(counts.likesCount ?? 0),
          dislikes: baselineDislikes + Number(counts.dislikesCount ?? 0)
        }
      });
    } catch (error) {
      postsLogger.error('Error updating reaction', { postId: id, error: error instanceof Error ? error.message : String(error) });
      throw createError.internal('Failed to update reaction');
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

/**
 * Comments endpoints mounted under posts router to avoid 404s in some environments
 * These mirror the handlers in commentsRouter and delegate to storage.
 */

// Utility to derive session/user ownership key
function getUserKey(req: Request): string {
  const userId = (req as any).user?.id;
  if (userId !== undefined && userId !== null) return String(userId);
  return (req as any).sessionID ? `anon:${(req as any).sessionID}` : "anon";
}

// Body schema for creating comments
const createCommentBodySchema = z.object({
  content: z.string().min(1).max(2000).trim(),
  author: z.string().min(1).max(50).optional(),
  parentId: z.coerce.number().int().positive().optional(),
  needsModeration: z.boolean().optional(),
  moderationStatus: z.enum(["flagged", "under_review", "none"]).optional(),
  // Optional selection anchors
  selectionStart: z.coerce.number().int().min(0).optional(),
  selectionEnd: z.coerce.number().int().min(0).optional(),
  anchorParagraphIndex: z.coerce.number().int().min(0).optional(),
  selectionText: z.string().min(1).max(1000).optional()
});

// GET /api/posts/:id/comments - list comments for a post (supports WordPress ID mapping)
router.get(
  "/:id/comments",
  apiRateLimiter,
  validateParams(postIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number((req.params as any).id);
    const comments = await storage.getComments(id);

    // Mark owner for UX visibility (same logic as commentsRouter)
    const userKey = getUserKey(req);
    const enhanced = comments.map((c: any) => {
      const baseApproved =
        (c as any).approved === undefined ? Boolean(c.is_approved) : Boolean((c as any).approved);
      const isOwner =
        (c as any).metadata && (c as any).metadata.ownerKey
          ? String((c as any).metadata.ownerKey) === userKey
          : false;
      const uxApproved = baseApproved || isOwner;
      return { ...c, approved: uxApproved, isOwner };
    });

    res.json(enhanced);
  })
);

// POST /api/posts/:id/comments - create a new comment or reply
router.post(
  "/:id/comments",
  apiRateLimiter,
  validateParams(postIdSchema),
  validateBody(createCommentBodySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const postId = Number((req.params as any).id);
    const body = req.body as z.infer<typeof createCommentBodySchema>;
    const userKey = getUserKey(req);

    // Moderate defensively on server
    const { isBlocked, moderatedText } = moderateComment(body.content);
    const contentToSave = moderatedText;
    const shouldHoldForReview =
      Boolean(body.needsModeration) || body.moderationStatus === "flagged" || isBlocked;

    // Determine author name
    const inferredAuthor =
      body.author && body.author.trim().length > 0
        ? body.author.trim()
        : ((req as any).user?.username || ((req as any).user?.id ? "User" : "Guest"));

    // Optional selection anchor metadata
    const selectionAnchor =
      body.selectionStart !== undefined && body.selectionEnd !== undefined
        ? {
            startOffset: Number(body.selectionStart),
            endOffset: Number(body.selectionEnd),
            paragraphIndex:
              body.anchorParagraphIndex !== undefined ? Number(body.anchorParagraphIndex) : undefined,
            text: body.selectionText || undefined
          }
        : undefined;

    const baseMeta: any = {};
    if (selectionAnchor) (baseMeta as any).selectionAnchor = selectionAnchor;

    const insert = {
      content: contentToSave,
      postId,
      parentId: body.parentId ?? undefined,
      userId: (req as any).user?.id ?? undefined,
      is_approved: shouldHoldForReview ? false : true,
      metadata: {
        author: inferredAuthor,
        ownerKey: userKey,
        ...baseMeta
      }
    } as z.infer<typeof insertCommentSchema>;

    const created = await storage.createComment(insert as any);
    try {
      clearCacheItem(`/api/posts/${postId}/comments`);
    } catch {}
    (res as any).status(201).json({ ...created, approved: created.is_approved === true, isOwner: true });
  })
);

export { router as postsRouter };