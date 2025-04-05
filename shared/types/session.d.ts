import 'express-session';

declare module 'express-session' {
  interface SessionData {
    likes: {
      [postId: string]: boolean;
    };
    user?: {
      id: number;
      email: string;
      username: string;
      isAdmin: boolean;
      avatar?: string;
      fullName?: string;
      bio?: string;
    };
    anonymousBookmarks?: {
      [postId: string]: {
        notes: string | null;
        tags: string[] | null;
        lastPosition: string;
        createdAt: string;
      }
    };
    csrfToken?: string;
  }
}
