import { User } from '../../shared/schema';

// Session type declarations for express-session
declare module 'express-session' {
  interface SessionData {
    likes: { [postId: string]: boolean };
    userReactions: { [postId: string]: 'like' | 'dislike' | null };
    anonymousBookmarks?: Record<string, {
      notes?: string;
      tags?: string[];
      lastPosition?: string;
      createdAt?: string;
    }>;
    csrfToken?: string;
    /**
     * Metadata for security tracking (IP, user agent, etc.)
     */
    __meta?: {
      ipAddress?: string;
      userAgent?: string;
      lastActivity?: string;
      csrfToken?: string;
    };
    user?: {
      id: number;
      email: string;
      username: string;
      fullName?: string;
      avatar?: string;
      isAdmin: boolean;
      isVerified?: boolean;
    };
  }
}

// Express Request type declaration
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}