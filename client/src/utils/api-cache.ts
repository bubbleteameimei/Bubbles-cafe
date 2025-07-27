import React from 'react';
import logger from './secure-client-logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  stale: boolean;
}

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(config: CacheConfig = {}) {
    this.defaultTTL = config.ttl || this.defaultTTL;
    this.maxSize = config.maxSize || this.maxSize;
  }

  // Generate cache key from URL and parameters
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${url}:${paramStr}`;
  }

  // Check if cache entry is expired
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Check if cache entry is stale
  private isStale(entry: CacheEntry<any>): boolean {
    return entry.stale || this.isExpired(entry);
  }

  // Evict oldest entries when cache is full
  private evictOldest(): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        logger.debug('Cache entry evicted', { key: oldestKey });
      }
    }
  }

  // Get data from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      logger.debug('Cache entry expired and removed', { key });
      return null;
    }

    // Mark as stale if approaching expiration (last 20% of TTL)
    const timeLeft = entry.ttl - (Date.now() - entry.timestamp);
    if (timeLeft < entry.ttl * 0.2) {
      entry.stale = true;
    }

    logger.debug('Cache hit', { key, stale: entry.stale });
    return entry.data;
  }

  // Set data in cache
  set<T>(key: string, data: T, ttl?: number): void {
    this.evictOldest();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      stale: false
    };

    this.cache.set(key, entry);
    logger.debug('Cache entry set', { key, ttl: entry.ttl });
  }

  // Remove specific entry
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Cache entry deleted', { key });
    }
    return deleted;
  }

  // Clear all cache
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.pendingRequests.clear();
    logger.debug('Cache cleared', { clearedEntries: size });
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let staleCount = 0;

    for (const [, entry] of this.cache) {
      if (this.isExpired(entry)) expiredCount++;
      else if (this.isStale(entry)) staleCount++;
    }

    return {
      totalEntries: this.cache.size,
      maxSize: this.maxSize,
      expiredEntries: expiredCount,
      staleEntries: staleCount,
      pendingRequests: this.pendingRequests.size
    };
  }

  // Cached fetch with stale-while-revalidate pattern
  async cachedFetch<T>(
    url: string,
    options: RequestInit & { params?: Record<string, any>; ttl?: number } = {}
  ): Promise<T> {
    const { params, ttl, ...fetchOptions } = options;
    const key = this.generateKey(url, params);

    // Check for existing pending request
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      logger.debug('Returning pending request', { key });
      return pendingRequest;
    }

    // Get cached data
    const cachedData = this.get<T>(key);
    const cachedEntry = this.cache.get(key);

    // If we have fresh data, return it
    if (cachedData && !this.isStale(cachedEntry!)) {
      return cachedData;
    }

    // Create fetch promise
    const fetchPromise = this.performFetch<T>(url, fetchOptions, params)
      .then(data => {
        this.set(key, data, ttl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        
        // If we have stale data, return it on error
        if (cachedData) {
          logger.warn('Fetch failed, returning stale data', { key, error });
          return cachedData;
        }
        
        throw error;
      });

    this.pendingRequests.set(key, fetchPromise);

    // If we have stale data, return it immediately and update in background
    if (cachedData && this.isStale(cachedEntry!)) {
      logger.debug('Returning stale data, updating in background', { key });
      fetchPromise.catch(() => {}); // Prevent unhandled rejection
      return cachedData;
    }

    // Otherwise wait for fresh data
    return fetchPromise;
  }

  private async performFetch<T>(
    url: string,
    options: RequestInit,
    params?: Record<string, any>
  ): Promise<T> {
    let fullUrl = url;
    
    // Add query parameters
    if (params) {
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlParams.append(key, String(value));
        }
      });
      const paramString = urlParams.toString();
      if (paramString) {
        fullUrl += (url.includes('?') ? '&' : '?') + paramString;
      }
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Prefetch data (cache without returning)
  async prefetch<T>(
    url: string,
    options: RequestInit & { params?: Record<string, any>; ttl?: number } = {}
  ): Promise<void> {
    try {
      await this.cachedFetch<T>(url, options);
      logger.debug('Prefetch completed', { url });
    } catch (error) {
      logger.warn('Prefetch failed', { url, error });
    }
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: string | RegExp): number {
    let deletedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    logger.debug('Cache invalidated by pattern', { pattern: pattern.toString(), deletedCount });
    return deletedCount;
  }
}

// Create singleton instance
export const apiCache = new APICache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 150,
  staleWhileRevalidate: true
});

// Convenience functions
export const cachedFetch = <T>(
  url: string,
  options?: RequestInit & { params?: Record<string, any>; ttl?: number }
): Promise<T> => apiCache.cachedFetch<T>(url, options);

export const prefetchData = <T>(
  url: string,
  options?: RequestInit & { params?: Record<string, any>; ttl?: number }
): Promise<void> => apiCache.prefetch<T>(url, options);

export const invalidateCache = (pattern: string | RegExp): number => 
  apiCache.invalidatePattern(pattern);

export const clearCache = (): void => apiCache.clear();

export const getCacheStats = () => apiCache.getStats();

// React hook for cached API calls
export function useCachedFetch<T>(
  url: string | null,
  options?: RequestInit & { params?: Record<string, any>; ttl?: number }
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!url) return;

    setLoading(true);
    setError(null);

    cachedFetch<T>(url, options)
      .then(result => {
        setData(result);
        setError(null);
      })
      .catch(err => {
        setError(err);
        logger.error('Cached fetch error', { url, error: err.message });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
}