import { Request, Response, Router } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { validateBody, validateQuery, validateParams, commonSchemas } from '../middleware/input-validation';
import { asyncHandler, createError } from '../utils/error-handler';
import { storage } from "../storage";
import { z } from "zod";
import { insertCommentSchema, insertCommentReplySchema, updateCommentSchema } from "@shared/schema";
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