import type { UserFeedback } from '@shared/public';

/**
 * Rich client-side metadata shape aligned with component usage
 */
export interface FeedbackMetadata {
  browser?: {
    name?: string;
    version?: string;
    userAgent?: string;
  } | string;
  device?: {
    type?: string;
    model?: string;
  } | string;
  os?: {
    name?: string;
    version?: string;
  } | string;
  screen?: {
    width?: number;
    height?: number;
  } | string;
  location?: {
    path?: string;
    referrer?: string;
  };
  adminResponse?: {
    content: string;
    respondedAt: string;
    respondedBy?: string;
  };
  [key: string]: unknown;
}

/**
 * UI-extended feedback item used across components
 */
export interface FeedbackWithMetadata extends Omit<UserFeedback, 'metadata'> {
  metadata?: FeedbackMetadata;
  contactRequested?: boolean;
  subject: string;
  type?: string;
  status?: string;
}

export type FeedbackItem = FeedbackWithMetadata;

/**
 * Response suggestion from the AI system
 */
export interface ResponseSuggestion {
  suggestion: string;
  confidence: number;
  category: string;
  tags?: string[];
  template?: string;
  isAutomated: boolean;
}