import { UserFeedback } from '@shared/schema';

/**
 * Metadata for feedback including browser details, device info, etc.
 */
export interface FeedbackMetadata {
  browser?: {
    name: string;
    version: string;
    userAgent: string;
  };
  device?: {
    type: string;
    model?: string;
  };
  os?: {
    name: string;
    version: string;
  };
  screen?: {
    width: number;
    height: number;
  };
  location?: {
    path: string;
    referrer?: string;
  };
  adminResponse?: {
    content: string;
    respondedAt: string;
    respondedBy: string;
  };
}

/**
 * Base feedback item from the API
 */
export interface FeedbackItem {
  id: number;
  userId: number | null;
  email: string | null;
  subject: string;
  content: string;
  type: string;
  status: string;
  priority: string;
  contactRequested: boolean;
  createdAt: string;
  metadata: FeedbackMetadata;
}

/**
 * Extended interface combining both database schema and UI properties
 */
export interface FeedbackItemExtended {
  // Base properties
  id: number;
  content: string;
  status: string;
  createdAt: string;
  
  // UI specific properties
  subject: string;
  priority: string;
  type: string; 
  email: string | null;
  userId: number | null;
  contactRequested: boolean;
  
  // Database schema properties
  category: string;
  metadata: FeedbackMetadata;
  page?: string;
  browser?: string;
  operatingSystem?: string;
  screenResolution?: string;
  userAgent?: string;
}

/**
 * Interface for components that expect UserFeedback with additional UI metadata
 */
export interface FeedbackWithMetadata extends UserFeedback {
  metadata: FeedbackMetadata;
  subject: string;
  email: string | null;
  contactRequested: boolean;
}

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