import { Express } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { postsRouter } from './posts';
import { commentsRouter } from './comments';
import { authRouter } from './auth';
import adminRoutes from './admin';
import analyticsRoutes from './analytics';
import searchRoutes from './search';
import newsletterRoutes from './newsletter';
import bookmarksRoutes from './bookmarks';
import emailRoutes from './email';
import moderationRoutes from './moderation';
import privacySettingsRoutes from './privacy-settings';
import recommendationsRoutes from './recommendations';
import userFeedbackRegister from '../routes/user-feedback';

const routesLogger = createSecureLogger('RoutesIndex');

export function registerModularRoutes(app: Express) {
  try {
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

    // Privacy settings
    app.use('/api', privacySettingsRoutes as any);
    routesLogger.info('Privacy settings routes registered');

    // Recommendations
    app.use('/api', recommendationsRoutes as any);
    routesLogger.info('Recommendations routes registered');

    // Admin
    app.use('/api/admin', adminRoutes);
    routesLogger.info('Admin routes registered');

    // User feedback (function-based registration)
    // @ts-expect-error register function signature
    userFeedbackRegister.registerUserFeedbackRoutes(app, require('../storage').storage);
    routesLogger.info('User feedback routes registered');

    routesLogger.info('All modular routes registered successfully');
  } catch (error) {
    routesLogger.error('Error registering modular routes', { error });
    throw error;
  }
}