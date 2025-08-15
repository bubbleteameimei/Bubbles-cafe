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

const routesLogger = createSecureLogger('RoutesIndex');

export function registerModularRoutes(app: Express) {
  try {
    // Health check routes (should be first for load balancers)
    app.use('/health', healthRoutes);
    app.use('/api/health', healthRoutes);
    routesLogger.info('Health check routes registered');

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