/**
 * Type declarations for the application
 */

import 'express';
import 'express-session';

declare global {
	namespace Express {
		// Extend the Request interface
		interface Request {
			// Flag to explicitly skip CSRF validation for specific routes
			skipCSRF?: boolean;
			// Unique request identifier set by requestIdMiddleware
			requestId?: string;
		}
	}
}

// Augment express-session to include our session fields
declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
    user?: {
      id: number;
      email: string;
      username: string;
      isAdmin?: boolean;
    } | null;
    anonymousBookmarks?: Record<string, {
      notes?: string | null;
      tags?: string[] | null;
      lastPosition?: string | number | null;
      createdAt?: string;
    }>;
    fingerprint?: string;
    createdAt?: number;
  }
}