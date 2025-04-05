/**
 * Email Service Routes
 * 
 * API endpoints for email service configuration and testing.
 */

import { Express } from 'express';
import emailRoutes from './email';
import logger from '../utils/logger';

/**
 * Register all email service related routes
 * 
 * @param app Express application
 */
export function registerEmailServiceRoutes(app: Express): void {
  // Mount email routes
  app.use('/api/email', emailRoutes);
  
  // Log registration
  logger.info('Email service routes registered');
}