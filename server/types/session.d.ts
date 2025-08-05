declare module 'express-session' {
  interface SessionData {
    likes: { [postId: string]: boolean };
    userReactions: { [postId: string]: 'like' | 'dislike' | null };
    user?: {
      id: number;
      email: string;
      username: string;
      fullName?: string;
      avatar?: string;
      isAdmin: boolean;
      isVerified?: boolean;
    };
    // Session types for bookmarks defined in shared/types/session.d.ts
  }
}