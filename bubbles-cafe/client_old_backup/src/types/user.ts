/**
 * User-related type definitions
 */

/**
 * User interface representing the application user
 */
export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
  metadata?: UserMetadata;
}

/**
 * User metadata interface for additional user-related information
 */
export interface UserMetadata {
  preferences?: UserPreferences;
  oauth?: OAuthData;
  settings?: {
    theme?: string;
    fontSize?: string;
    notifications?: NotificationPreferences;
  };
  stats?: {
    storiesRead: number;
    commentsPosted: number;
    totalLikes: number;
  };
  [key: string]: any;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
}

/**
 * OAuth provider data
 */
export interface OAuthData {
  [provider: string]: {
    providerId: string;
    lastLogin: string;
  };
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;
}