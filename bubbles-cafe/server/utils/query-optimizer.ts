/**
 * Query Optimizer Module
 * 
 * This module provides utilities for optimizing database queries,
 * including caching, batching, and performance measurement.
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

// Simple in-memory cache implementation using Map
class SimpleCache {
  private cache: Map<string, { value: any; expires: number }> = new Map();
  private defaultTTL: number;
  
  constructor(defaultTTL: number = 300) { // 5 minutes default
    this.defaultTTL = defaultTTL;
    
    // Periodically clean expired entries
    setInterval(() => this.cleanExpired(), 60000); // Clean every minute
  }
  
  set(key: string, value: any, ttl: number = this.defaultTTL): void {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expires });
  }
  
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }
  
  del(key: string): void {
    this.cache.delete(key);
  }
  
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[SimpleCache] Cleaned ${cleaned} expired entries`);
    }
  }
}

// Create cache instance
const queryCache = new SimpleCache(300); // 5 minutes default TTL

// Query performance tracking for optimization insights
const queryStats: Record<string, {
  count: number;
  totalTime: number;
  avgTime: number;
  lastExecuted: Date;
}> = {};

/**
 * Executes a cached database query
 * 
 * @param queryKey Unique key for the query
 * @param queryFn Function that executes the actual database query
 * @param ttl Time to live in seconds for cache
 */
export async function cachedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  // Check if result is in cache
  const cached = queryCache.get<T>(queryKey);
  if (cached !== undefined) {
    console.log(`[QueryOptimizer] Cache hit: ${queryKey}`);
    return cached;
  }
  
  // Execute and time the query
  console.log(`[QueryOptimizer] Cache miss: ${queryKey}`);
  const startTime = Date.now();
  
  try {
    const result = await queryFn();
    const executionTime = Date.now() - startTime;
    
    // Update query statistics
    updateQueryStats(queryKey, executionTime);
    
    // Cache the result if query took significant time
    if (executionTime > 50 && result !== null && result !== undefined) {
      queryCache.set(queryKey, result, ttl);
    }
    
    return result;
  } catch (error) {
    console.error(`[QueryOptimizer] Query failed (${queryKey}):`, error);
    throw error;
  }
}

/**
 * Invalidates a specific query cache
 */
export function invalidateCache(keyPattern: string | RegExp): void {
  const keys = queryCache.keys();
  
  if (typeof keyPattern === 'string') {
    const exactKey = keys.find(k => k === keyPattern);
    if (exactKey) {
      queryCache.del(exactKey);
      console.log(`[QueryOptimizer] Invalidated cache: ${exactKey}`);
    }
    return;
  }
  
  // Use regex pattern to match multiple keys
  const matchingKeys = keys.filter(k => keyPattern.test(k));
  if (matchingKeys.length > 0) {
    matchingKeys.forEach(k => queryCache.del(k));
    console.log(`[QueryOptimizer] Invalidated ${matchingKeys.length} cache entries`);
  }
}

/**
 * Get query execution statistics for performance monitoring
 */
export function getQueryStats(): typeof queryStats {
  return queryStats;
}

/**
 * Update query execution statistics
 */
function updateQueryStats(queryKey: string, executionTime: number): void {
  if (!queryStats[queryKey]) {
    queryStats[queryKey] = { count: 0, totalTime: 0, avgTime: 0, lastExecuted: new Date() };
  }
  
  const stats = queryStats[queryKey];
  stats.count++;
  stats.totalTime += executionTime;
  stats.avgTime = stats.totalTime / stats.count;
  stats.lastExecuted = new Date();
}

/**
 * Optimized bulk insert that batches records for better performance
 */
export async function optimizedBulkInsert<T extends Record<string, any>>(
  table: string, 
  records: T[], 
  batchSize: number = 100
): Promise<number> {
  if (!records.length) return 0;
  
  let inserted = 0;
  const totalRecords = records.length;
  
  // Process in batches
  for (let i = 0; i < totalRecords; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const columns = Object.keys(batch[0] as object);
    
    try {
      // Create batch insert query
      const placeholders = batch.map((_, index) => 
        `(${columns.map((_, colIndex) => `$${index * columns.length + colIndex + 1}`).join(',')})`
      ).join(',');
      
      const values = batch.flatMap(record => 
        columns.map(col => (record as any)[col])
      );
      
      // Execute batch insert with raw SQL for optimal performance
      await db.execute(sql`
        INSERT INTO ${sql.identifier(table)} (${columns.map(c => sql.identifier(c))})
        VALUES ${sql.raw(placeholders)}
      `, values);
      
      inserted += batch.length;
      console.log(`[QueryOptimizer] Batch inserted ${batch.length} records into ${table}`);
    } catch (error) {
      console.error(`[QueryOptimizer] Batch insert failed for ${table}:`, error);
      throw error;
    }
  }
  
  console.log(`[QueryOptimizer] Completed bulk insert: ${inserted}/${totalRecords} records into ${table}`);
  return inserted;
}

/**
 * Execute query with automatic retry for resilience
 */
export async function resilientQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let attempt = 0;
  let lastError: Error | null = null;
  
  while (attempt < maxRetries) {
    try {
      return await queryFn();
    } catch (error: any) {
      attempt++;
      lastError = error;
      
      // Only retry on connection/timeout errors
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
      console.warn(`[QueryOptimizer] Retrying query (attempt ${attempt}/${maxRetries}) after ${delay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Query failed after multiple retries');
}

/**
 * Check if error is suitable for retry
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  // Parse error message
  const message = error.message || '';
  
  return (
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('temporarily unavailable') ||
    message.includes('too many connections') ||
    message.includes('Connection terminated')
  );
}

/**
 * Clean query statistics to prevent memory leaks
 */
export function cleanQueryStats(maxEntries: number = 100): void {
  const keys = Object.keys(queryStats);
  if (keys.length <= maxEntries) return;
  
  // Sort by last executed time and keep only the most recent ones
  const sortedKeys = keys.sort((a, b) => 
    queryStats[b].lastExecuted.getTime() - queryStats[a].lastExecuted.getTime()
  );
  
  // Remove oldest entries
  sortedKeys.slice(maxEntries).forEach(key => {
    delete queryStats[key];
  });
  
  console.log(`[QueryOptimizer] Cleaned up query stats (kept ${maxEntries} entries)`);
}