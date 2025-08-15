import { Express } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { postsRouter } from './posts';
import { commentsRouter } from './comments';
import { authRouter } from './auth';
import { adminRoutes } from './admin';
import searchRoutes from './search';
import newsletterRoutes from './newsletter';
import bookmarksRoutes from './bookmarks';
import emailRoutes from './email';
import moderationRoutes from './moderation';
import analyticsRoutes from './analytics';
import { registerPrivacySettingsRoutes } from './privacy-settings';
import { registerRecommendationsRoutes } from './recommendations';
import { registerUserFeedbackRoutes } from '../routes/user-feedback';
import { storage } from '../storage';
import { handleError } from '../utils/error-handler';
import healthRoutes from './health';
import { getCsrfToken } from '../middleware/csrf-protection';
import { z } from 'zod';

const routesLogger = createSecureLogger('RoutesIndex');

export function registerModularRoutes(app: Express) {
  try {
    // Health check routes (should be first for load balancers)
    app.use('/health', healthRoutes);
    app.use('/api/health', healthRoutes);
    routesLogger.info('Health check routes registered');

    // SECURITY FIX: Secure CSRF token endpoint
    app.get('/api/csrf-token', getCsrfToken);
    routesLogger.info('Secure CSRF token endpoint registered');

    // Authentication routes
    app.use('/api/auth', authRouter);
    routesLogger.info('Auth routes registered');

    // Posts routes
    app.use('/api/posts', postsRouter);
    routesLogger.info('Posts routes registered');

    // Comments routes  
    app.use('/api', commentsRouter);
    routesLogger.info('Comments routes registered');

    // Search routes
    app.use('/api/search', searchRoutes);
    routesLogger.info('Search routes registered');

    // Newsletter routes
    app.use('/api/newsletter', newsletterRoutes);
    routesLogger.info('Newsletter routes registered');

    // Bookmarks routes
    app.use('/api', bookmarksRoutes);
    routesLogger.info('Bookmarks routes registered');

    // Email routes
    app.use('/api/email', emailRoutes);
    routesLogger.info('Email routes registered');

    // Moderation routes
    app.use('/api', moderationRoutes);
    routesLogger.info('Moderation routes registered');

    // Analytics routes
    app.use('/api/analytics', analyticsRoutes);
    routesLogger.info('Analytics routes registered');

    // Privacy settings (function-based registration)
    registerPrivacySettingsRoutes(app, storage);
    routesLogger.info('Privacy settings routes registered');

    // Recommendations (function-based registration)
    registerRecommendationsRoutes(app, storage);
    routesLogger.info('Recommendations routes registered');

    // Admin
    app.use('/api/admin', adminRoutes);
    routesLogger.info('Admin routes registered');

    // User feedback (function-based registration)
    registerUserFeedbackRoutes(app, storage);
    routesLogger.info('User feedback routes registered');

    // Feedback submission endpoint used by client
    const feedbackSchema = z.object({
      type: z.enum(['general', 'bug', 'feature', 'content']).default('general'),
      content: z.string().min(5),
      page: z.string().optional(),
      category: z.string().optional(),
      browser: z.string().optional(),
      operatingSystem: z.string().optional(),
      screenResolution: z.string().optional(),
      userAgent: z.string().optional()
    });
    app.post('/api/feedback', async (req, res) => {
      try {
        const body = feedbackSchema.parse(req.body);
        const feedback = await (storage as any).submitFeedback({
          type: body.type,
          content: body.content,
          page: body.page ?? 'unknown',
          status: 'pending',
          userId: (req as any).user?.id ?? null,
          browser: body.browser ?? 'unknown',
          operatingSystem: body.operatingSystem ?? 'unknown',
          screenResolution: body.screenResolution ?? 'unknown',
          userAgent: body.userAgent ?? req.get('User-Agent') ?? 'unknown',
          category: body.category ?? 'general',
          metadata: {}
        });
        res.status(201).json({ success: true, feedback });
      } catch (error: any) {
        routesLogger.error('Feedback submission failed', { error: error?.message });
        res.status(400).json({ error: 'Invalid feedback payload' });
      }
    });

    // Error reporting endpoint used by client error logger
    app.post('/api/errors', (req, res) => {
      try {
        routesLogger.warn('Client error report received', { id: req.body?.id, message: req.body?.message });
        res.status(204).end();
      } catch (_e) {
        res.status(204).end();
      }
    });

    // Global error handler - must be last
    app.use(handleError);
    routesLogger.info('Global error handler registered');

    routesLogger.info('All modular routes registered successfully');
  } catch (error) {
    routesLogger.error('Error registering modular routes', { error });
    throw error;
  }
}