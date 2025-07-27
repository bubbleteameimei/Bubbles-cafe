import { Express } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { postsRouter } from './posts';
import { commentsRouter } from './comments';
import { authRouter } from './auth';

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

    routesLogger.info('All modular routes registered successfully');
  } catch (error) {
    routesLogger.error('Error registering modular routes', { error });
    throw error;
  }
}