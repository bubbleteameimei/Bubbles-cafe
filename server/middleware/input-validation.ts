import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Common validation schemas
export const postIdSchema = z.object({
  postId: z.string().regex(/^\d+$/, 'Post ID must be a positive integer').transform(Number)
});

export const userIdSchema = z.object({
  userId: z.string().regex(/^\d+$/, 'User ID must be a positive integer').transform(Number)
});

export const paginationSchema = z.object({
  page: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) || num < 1 ? 1 : Math.min(num, 1000);
  }),
  limit: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) || num < 1 ? 20 : Math.min(num, 100);
  })
});

export const reactionSchema = z.object({
  isLike: z.boolean(),
  sessionId: z.string().optional()
});

// Validation middleware factory
export function validateInput(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        ...req.params,
        ...req.query,
        ...req.body
      });
      
      // Attach validated data to request
      (req as any).validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

// Specific validation middlewares
export const validatePostId = validateInput(postIdSchema);
export const validateUserId = validateInput(userIdSchema);
export const validatePagination = validateInput(paginationSchema);
export const validateReaction = validateInput(reactionSchema);

// Sanitization helper
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeNumber(input: string | number): number {
  const num = Number(input);
  return isNaN(num) ? 0 : Math.max(0, num);
}