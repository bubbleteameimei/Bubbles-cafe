import { Request, Response, Router } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { validateBody, validateQuery, validateParams, commonSchemas } from '../middleware/input-validation';
import { asyncHandler, createError } from '../utils/error-handler';
import { storage } from "../storage";
import { z } from "zod";
import { insertPostSchema, updatePostSchema } from "@shared/schema";
import { apiRateLimiter } from '../middlewares/rate-limiter';

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
      if (error.statusCode) throw error;
      postsLogger.error('Error retrieving post', { postId: id, error: error instanceof Error ? error.message : String(error) });
      throw createError.internal('Failed to retrieve post');
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
      if (error.statusCode) throw error;
      postsLogger.error('Error updating post', { postId: id, error: error instanceof Error ? error.message : String(error) });
      throw createError.internal('Failed to update post');
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
      if (error.statusCode) throw error;
      postsLogger.error('Error deleting post', { postId: id, error: error instanceof Error ? error.message : String(error) });
      throw createError.internal('Failed to delete post');
    }
  })
);

export { router as postsRouter };