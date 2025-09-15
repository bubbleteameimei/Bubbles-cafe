import { createSecureLogger } from './secure-logger';

const cacheLogger = createSecureLogger('CacheManager');

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 1000;
  private cleanupInterval: NodeJS.Timeout;
  private hitCount = 0;
  private missCount = 0;

  constructor(options: { defaultTTL?: number; maxSize?: number } = {}) {
    this.defaultTTL = options.defaultTTL || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;

    // Start cleanup timer
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  // Set cache entry
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.defaultTTL,
      tags: options.tags || []
    };

    this.cache.set(key, entry);
    cacheLogger.debug('Cache entry set', { key, ttl: entry.ttl, tags: entry.tags });
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      cacheLogger.debug('Cache entry expired', { key });
      return null;
    }

    this.hitCount++;
    cacheLogger.debug('Cache hit', { key });
    return entry.data;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Delete specific key
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      cacheLogger.debug('Cache entry deleted', { key });
    }
    return deleted;
  }

  // Clear all cache
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    cacheLogger.info('Cache cleared', { clearedEntries: size });
  }

  // Invalidate by tags
  invalidateByTags(tags: string[]): number {
    let deletedCount = 0;
    const tagSet = new Set(tags);

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tagSet.has(tag))) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    cacheLogger.info('Cache invalidated by tags', { tags, deletedCount });
    return deletedCount;
  }

  // Invalidate by pattern
  invalidateByPattern(pattern: RegExp): number {
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    cacheLogger.info('Cache invalidated by pattern', { pattern: pattern.toString(), deletedCount });
    return deletedCount;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
      // Rough estimate of memory usage
      totalSize += JSON.stringify(entry.data).length;
    }

    return {
      totalEntries: this.cache.size,
      maxSize: this.maxSize,
      expiredEntries: expiredCount,
      estimatedSizeBytes: totalSize,
      hitRate: this.calculateHitRate()
    };
  }

  // Cache wrapper for functions
  async cached<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      this.missCount++;
      const result = await fn();
      this.set(key, result, options);
      return result;
    } catch (error) {
      cacheLogger.error('Error in cached function', { key, error });
      throw error;
    }
  }

  // Memoization wrapper with automatic cache key generation
  memoize<Args extends any[], Return>(
    fn: (...args: Args) => Promise<Return>,
    options: {
      keyGenerator?: (...args: Args) => string;
      ttl?: number;
      tags?: string[];
    } = {}
  ) {
    const keyGenerator = options.keyGenerator || ((...args) => 
      `memoized:${fn.name}:${JSON.stringify(args)}`
    );

    return async (...args: Args): Promise<Return> => {
      const key = keyGenerator(...args);
      return this.cached(key, () => fn(...args), {
        ttl: options.ttl,
        tags: options.tags
      });
    };
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      cacheLogger.debug('Cache cleanup completed', { cleanedCount });
    }
  }

  // Evict oldest entries when cache is full
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      cacheLogger.debug('Evicted oldest cache entry', { key: oldestKey });
    }
  }

  // Simple hit rate calculation (would need more sophisticated tracking in production)
  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount;
    if (total === 0) return 0;
    return this.hitCount / total;
  }

  // Shutdown cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    cacheLogger.info('Cache manager destroyed');
  }
}

// Cache-specific implementations for different data types
export class QueryCache extends CacheManager {
  constructor() {
    super({ defaultTTL: 5 * 60 * 1000, maxSize: 500 }); // 5 minutes, max 500 queries
  }

  // Cache database query results
  async cacheQuery<T>(
    queryName: string,
    params: Record<string, any>,
    queryFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    const key = `query:${queryName}:${JSON.stringify(params)}`;
    return this.cached(key, queryFn, { ttl, tags: [queryName] });
  }

  // Invalidate all queries of a specific type
  invalidateQueries(queryName: string): number {
    return this.invalidateByTags([queryName]);
  }
}

export class APICache extends CacheManager {
  constructor() {
    super({ defaultTTL: 2 * 60 * 1000, maxSize: 200 }); // 2 minutes, max 200 API responses
  }

  // Cache API responses
  async cacheResponse<T>(
    endpoint: string,
    params: Record<string, any>,
    responseFn: () => Promise<T>,
    ttl: number = 2 * 60 * 1000
  ): Promise<T> {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return this.cached(key, responseFn, { ttl, tags: [endpoint] });
  }

  // Invalidate API cache for specific endpoint
  invalidateEndpoint(endpoint: string): number {
    return this.invalidateByTags([endpoint]);
  }
}

// Create singleton instances
export const queryCache = new QueryCache();
export const apiCache = new APICache();

// Utility functions for common caching patterns
export const cacheKey = {
  user: (id: number) => `user:${id}`,
  post: (id: number) => `post:${id}`,
  postBySlug: (slug: string) => `post:slug:${slug}`,
  posts: (page: number, limit: number, filters?: Record<string, any>) => 
    `posts:${page}:${limit}:${filters ? JSON.stringify(filters) : 'all'}`,
  comments: (postId: number, page: number = 1) => `comments:${postId}:${page}`,
  popularPosts: (limit: number = 10) => `popular:${limit}`,
  userPosts: (userId: number, page: number = 1) => `user:${userId}:posts:${page}`
};

// Export main cache instance for general use
export const cache = new CacheManager();

// Graceful shutdown
process.on('SIGTERM', () => {
  cache.destroy();
  queryCache.destroy();
  apiCache.destroy();
});