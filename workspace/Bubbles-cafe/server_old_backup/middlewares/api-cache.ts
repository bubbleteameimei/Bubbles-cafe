import { Request, Response, NextFunction } from 'express';

type CacheItem = {
  data: any;
  expiry: number;
};

// Simple in-memory cache
const cache: Record<string, CacheItem> = {};

// Cache expiration time in milliseconds
const DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * API response caching middleware
 * @param duration Cache duration in milliseconds
 */
export const apiCache = (duration: number = DEFAULT_EXPIRY) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated requests with dynamic content
    if (req.session?.userId) {
      return next();
    }

    // Create a cache key from the request URL
    const key = req.originalUrl || req.url;
    
    // Check if we have a valid cached response
    const cachedItem = cache[key];
    if (cachedItem && cachedItem.expiry > Date.now()) {
      console.log(`[Cache] Hit for ${key}`);
      return res.json(cachedItem.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(body) {
      // Store the response in cache
      cache[key] = {
        data: body,
        expiry: Date.now() + duration
      };
      console.log(`[Cache] Stored ${key}`);
      
      // Restore the original json method and call it
      res.json = originalJson;
      return res.json(body);
    };

    next();
  };
};

/**
 * Clear a specific item from the cache
 */
export const clearCacheItem = (key: string) => {
  if (cache[key]) {
    delete cache[key];
    console.log(`[Cache] Cleared ${key}`);
    return true;
  }
  return false;
};

/**
 * Clear all cache or a group of related items
 * @param prefix Optional prefix to clear only matching items
 */
export const clearCache = (prefix?: string) => {
  if (prefix) {
    // Clear items with matching prefix
    Object.keys(cache).forEach(key => {
      if (key.startsWith(prefix)) {
        delete cache[key];
      }
    });
    console.log(`[Cache] Cleared items with prefix: ${prefix}`);
  } else {
    // Clear all cache
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
    console.log('[Cache] Cleared all items');
  }
};