/**
 * Type declaration file for the WordPress sync module
 */

interface WordPressPost {
  id: number;
  slug: string;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  status: string;
  type: string;
  modified: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  author: number;
}

interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  postsImported: number;
  totalPosts?: number;
  error?: string;
  title?: string;
  created?: number;
  updated?: number;
  action?: string;
}

interface SyncStatus {
  syncInProgress: boolean;
  lastSyncTime: string | null;
  lastSyncStatus: 'success' | 'failed' | 'partial' | null;
  lastError?: string;
  postsImported?: number;
  totalPosts?: number;
  wpApiEndpoint?: string;
}

/**
 * Fetch posts from WordPress API
 */
export function fetchWordPressPosts(page?: number, perPage?: number): Promise<WordPressPost[]>;

/**
 * Fetch category information from WordPress API
 */
export function fetchCategories(): Promise<WordPressCategory[]>;

/**
 * Main function to sync WordPress posts
 */
export function syncWordPressPosts(): Promise<SyncResult>;

/**
 * Set up WordPress sync schedule with a specified interval
 */
export function setupWordPressSyncSchedule(intervalMs?: number): void;

/**
 * Handle single WordPress post sync by ID
 */
export function syncSingleWordPressPost(wpPostId: number): Promise<SyncResult>;

/**
 * Get current sync status
 */
export function getSyncStatus(): SyncStatus;

/**
 * Clean HTML content from WordPress to simpler format
 */
export function cleanContent(content: string): string;