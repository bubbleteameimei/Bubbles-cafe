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
    };
  }
}
