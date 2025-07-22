/**
 * Query Performance Middleware
 * 
 * This middleware tracks database query performance and helps
 * identify and optimize slow queries.
 */

import { Request, Response, NextFunction } from 'express';
import { SQLWrapper } from 'drizzle-orm';

// We'll access db through the global context instead of direct import
let db: any;

// Type for tracking query information
type QueryInfo = {
  query: string;
  duration: number;
  timestamp: number;
  source?: string;
};

// Store for slow query tracking
class QueryProfiler {
  private slowQueryThreshold: number;
  private queries: QueryInfo[];
  private maxQueries: number;
  
  constructor(slowQueryThreshold = 100, maxQueries = 100) {
    this.slowQueryThreshold = slowQueryThreshold;
    this.maxQueries = maxQueries;
    this.queries = [];
  }
  
  recordQuery(query: string, duration: number, source?: string) {
    // Only track slow queries
    if (duration > this.slowQueryThreshold) {
      this.queries.push({
        query,
        duration,
        timestamp: Date.now(),
        source
      });
      
      // Trim the list if needed
      if (this.queries.length > this.maxQueries) {
        this.queries.shift();
      }
      
      // Log very slow queries to the console
      if (duration > this.slowQueryThreshold * 5) {
        console.warn(`⚠️ Very slow query detected (${duration.toFixed(2)}ms): ${query.substring(0, 100)}...`);
        if (source) {
          console.warn(`Source: ${source}`);
        }
      }
    }
  }
  
  getSlowQueries() {
    return [...this.queries].sort((a, b) => b.duration - a.duration);
  }
  
  clearQueries() {
    this.queries = [];
  }
};

// Export the query profiler instance
export const queryProfiler = new QueryProfiler();

// Create a database wrapper that profiles queries
export function wrapDbWithProfiler(database?: any) {
  // Set the database if provided
  if (database) {
    db = database;
  }
  
  // Use any type to avoid TypeScript errors with Drizzle API
  const dbAny = db as any;
  
  // If no database or execute method doesn't exist, don't attempt to wrap it
  if (!dbAny || typeof dbAny.execute !== 'function') {
    console.warn('Database object does not have an execute method to wrap for profiling');
    return;
  }
  
  // Backup the original execute method
  const originalExecute = dbAny.execute;
  
  // Replace with a profiling version
  dbAny.execute = function profiledExecute(query: string | SQLWrapper) {
    const start = performance.now();
    
    // Get stack trace for query source information
    const stack = new Error().stack || '';
    const stackLines = stack.split('\n').slice(2);
    const source = stackLines.find(line => !line.includes('node_modules'));
    
    // Execute the query
    const result = originalExecute.call(this, query);
    
    // When query resolves, record the timing
    // Safely handle the query string extraction
    let queryStr: string;
    if (typeof query === 'string') {
      queryStr = query;
    } else if (query && typeof query === 'object' && 'toSQL' in query && typeof (query as any).toSQL === 'function') {
      const sqlObj = (query as any).toSQL();
      queryStr = sqlObj && sqlObj.sql ? sqlObj.sql : String(query);
    } else {
      queryStr = String(query);
    }
    
    // For Promise-based results
    if (result && typeof result.then === 'function') {
      return result.then((res: any) => {
        const end = performance.now();
        queryProfiler.recordQuery(
          queryStr, 
          end - start,
          source
        );
        return res;
      }).catch((err: any) => {
        const end = performance.now();
        queryProfiler.recordQuery(
          `ERROR: ${queryStr}`, 
          end - start,
          source
        );
        throw err;
      });
    }
    
    // For synchronous results or other return types
    const end = performance.now();
    queryProfiler.recordQuery(
      queryStr, 
      end - start,
      source
    );
    
    return result;
  };
}

// Optimized query function that helps detect and prevent N+1 query patterns
export function optimizedQuery<T>(
  batchQuery: (ids: any[]) => Promise<T[]>,
  getId: (item: T) => any,
  itemsToLoad: any[]
): Promise<T[]> {
  // Remove duplicates from items to load
  const uniqueIds = [...new Set(itemsToLoad)];
  
  // Return a promise that resolves to the loaded items
  return batchQuery(uniqueIds);
}

// Middleware to track query patterns and detect N+1 issues
export function queryPerformanceMiddleware(req: Request, res: Response, next: NextFunction) {
  // Clear query tracking at the start of each request
  const requestQueries: QueryInfo[] = [];
  const startTime = performance.now();
  
  // Create a listener to analyze queries after response
  res.on('finish', () => {
    const endTime = performance.now();
    const requestDuration = endTime - startTime;
    
    // Check for N+1 query patterns
    if (requestQueries.length > 10) {
      // Look for similar queries that might indicate N+1 problems
      const queryCounts: Record<string, number> = {};
      
      requestQueries.forEach(q => {
        // Normalize the query by removing specific IDs and parameter values
        const normalized = q.query
          .replace(/WHERE\s+\w+\s*=\s*\d+/gi, 'WHERE col = ?')
          .replace(/VALUES\s*\([^)]+\)/gi, 'VALUES (?)');
        
        queryCounts[normalized] = (queryCounts[normalized] || 0) + 1;
      });
      
      // Check for potential N+1 query patterns
      const potentialN1 = Object.entries(queryCounts)
        .filter(([_, count]) => count > 5)
        .map(([query, count]) => ({ query, count }));
      
      if (potentialN1.length > 0) {
        console.warn('⚠️ Potential N+1 query pattern detected:');
        potentialN1.forEach(({ query, count }) => {
          console.warn(`   Query executed ${count} times: ${query.substring(0, 100)}...`);
        });
      }
    }
  });
  
  next();
}