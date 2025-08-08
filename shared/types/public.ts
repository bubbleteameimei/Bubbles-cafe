// Client-safe shared types for UI consumption

export interface AuthorSummary {
  id?: number;
  username?: string;
  fullName?: string;
  avatar?: string;
}

export interface PostMetadata {
  [key: string]: unknown;
}

export interface ExtendedPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  createdAt?: string;
  readingTimeMinutes?: number;
  author?: AuthorSummary;
  metadata?: PostMetadata;
  likesCount?: number;
  dislikesCount?: number;
}

export interface ExtendedUser {
  id: number;
  username?: string;
  email?: string;
  isAdmin?: boolean;
}

export interface FeedbackMetadata {
  [key: string]: unknown;
  page?: string;
  browser?: string;
  operatingSystem?: string;
  screenResolution?: string;
  userAgent?: string;
}

export interface UserFeedback {
  id: number;
  userId: number | null;
  email: string | null;
  subject: string;
  content: string;
  type?: string;
  status?: string;
  priority?: string;
  createdAt: string;
  metadata?: FeedbackMetadata;
}