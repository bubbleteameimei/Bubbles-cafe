/**
 * Response Time Middleware
 * 
 * This middleware tracks response times for API endpoints and pages,
 * providing insights into server performance.
 */

import { Request, Response, NextFunction } from 'express';

// Store response time data for analytics
type RouteStats = {
  count: number;
  totalTime: number;
  maxTime: number;
  url: string;
};

// Queue to keep recent response times (last 1000)
const MAX_RECENT_RESPONSES = 1000;
const recentResponses: { url: string; time: number; timestamp: number }[] = [];

// Map to store response time stats by route
const routeStats: Map<string, RouteStats> = new Map();

// Function to get a normalized route path from a URL
function getNormalizedRoutePath(url: string): string {
  // Remove query parameters
  const baseUrl = url.split('?')[0];
  
  // Replace IDs with placeholders for better aggregation
  return baseUrl.replace(/\/\d+/g, '/:id');
}

// Export the middleware function
export function responseTimeMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip for static assets to reduce overhead
  if (req.path.match(/\.(js|css|jpe?g|png|gif|svg|ico|woff2?)$/i)) {
    return next();
  }
  
  // Record start time
  const start = performance.now();
  
  // Track the response time when finalized
  res.on('finish', () => {
    const responseTime = performance.now() - start;
    
    // Store metrics for this request
    const routePath = getNormalizedRoutePath(req.originalUrl || req.url);
    
    // Get existing stats or create new entry
    const stats = routeStats.get(routePath) || {
      count: 0,
      totalTime: 0,
      maxTime: 0,
      url: routePath
    };
    
    // Update stats
    stats.count++;
    stats.totalTime += responseTime;
    stats.maxTime = Math.max(stats.maxTime, responseTime);
    routeStats.set(routePath, stats);
    
    // Add to recent responses queue
    recentResponses.push({
      url: routePath,
      time: responseTime,
      timestamp: Date.now()
    });
    
    // Trim queue if needed
    if (recentResponses.length > MAX_RECENT_RESPONSES) {
      recentResponses.shift();
    }
  });
  
  // Add response time header for debugging
  if (!res.headersSent) {
    res.setHeader('X-Response-Time', 'Calculating...');
  }
  
  next();
}

// Analytics object to provide response time insights
export const responseTimeData = {
  // Get all route statistics
  getAllRouteStats(): RouteStats[] {
    return Array.from(routeStats.values());
  },
  
  // Get stats for a specific route
  getRouteStats(route: string): RouteStats | undefined {
    return routeStats.get(route);
  },
  
  // Get the top N slowest routes
  getSlowestRoutes(limit = 10): RouteStats[] {
    return Array.from(routeStats.values())
      .filter(route => route.count >= 5) // Only include routes with sufficient data
      .sort((a, b) => (b.totalTime / b.count) - (a.totalTime / a.count))
      .slice(0, limit);
  },
  
  // Get the most frequently accessed routes
  getMostAccessedRoutes(limit = 10): RouteStats[] {
    return Array.from(routeStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
  
  // Get recent slow responses (> 500ms)
  getRecentSlowResponses(): { url: string; time: number; timestamp: number }[] {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    return recentResponses
      .filter(res => res.time > 500 && res.timestamp > fiveMinutesAgo)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
  
  // Generate a comprehensive performance report
  generateReport() {
    const allRoutes = this.getAllRouteStats();
    const totalRequests = allRoutes.reduce((sum, route) => sum + route.count, 0);
    const totalResponseTime = allRoutes.reduce((sum, route) => sum + route.totalTime, 0);
    const overallAverage = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    
    return {
      totalRequests,
      overallAverage,
      slowestRoutes: this.getSlowestRoutes(5).map(route => ({
        route: route.url,
        requestCount: route.count,
        averageResponseTime: route.totalTime / route.count,
        maxResponseTime: route.maxTime
      })),
      mostAccessed: this.getMostAccessedRoutes(5).map(route => ({
        route: route.url,
        requestCount: route.count,
        averageResponseTime: route.totalTime / route.count
      })),
      recentSlowResponses: this.getRecentSlowResponses()
        .map(res => ({
          url: res.url,
          responseTime: res.time,
          timeAgo: Math.round((Date.now() - res.timestamp) / 1000) + 's ago'
        }))
    };
  },
  
  // Reset all stats (for testing)
  resetStats() {
    routeStats.clear();
    recentResponses.length = 0;
  }
};