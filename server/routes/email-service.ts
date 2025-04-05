/**
 * Email Service Routes Registration
 * 
 * This file registers routes for email service functionality.
 */

import { Application } from 'express';
import emailRoutes from '../routes/email';

/**
 * Register email service routes
 * 
 * @param app Express application
 */
export function registerEmailServiceRoutes(app: Application): void {
  // Mount email routes under /api/email prefix
  app.use('/api/email', emailRoutes);
}