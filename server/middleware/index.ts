/**
 * Performance Middleware Index
 * 
 * This file exports all performance-related middleware
 * for easy integration into the Express application.
 */

// Import all middleware
import { cacheControlMiddleware } from './cache-control';
import { imageOptimizationMiddleware } from './image-optimization';
import { responseTimeMiddleware, responseTimeData } from './response-time';
import { 
  queryPerformanceMiddleware, 
  wrapDbWithProfiler, 
  optimizedQuery,
  queryProfiler
} from './query-performance';

// Re-export all middleware
export { 
  cacheControlMiddleware,
  imageOptimizationMiddleware,
  responseTimeMiddleware, 
  responseTimeData,
  queryPerformanceMiddleware,
  wrapDbWithProfiler,
  optimizedQuery,
  queryProfiler
};

// Other imports
import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';

// Define type for session with admin
interface AdminSession extends Session {
  isAdmin?: boolean;
}

/**
 * Apply all performance middleware in the recommended order
 */
export function applyPerformanceMiddleware(app: any, dbInstance?: any) {
  // Initialize profiling first (if database is available)
  if (dbInstance) {
    wrapDbWithProfiler(dbInstance);
  }
  
  // Add response time tracking
  app.use(responseTimeMiddleware);
  
  // Add query performance tracking
  app.use(queryPerformanceMiddleware);
  
  // Add cache control headers
  app.use(cacheControlMiddleware);
  
  // Add image optimization (for static image routes)
  app.use(imageOptimizationMiddleware);
  
  // Add dashboard route for monitoring
  app.get('/admin/performance', performanceDashboardHandler);
  
  console.log('🚀 Performance middleware applied successfully');
}

/**
 * Performance dashboard for monitoring application performance
 */
function performanceDashboardHandler(req: Request, res: Response) {
  // Check for admin access
  const session = req.session as AdminSession;
  if (!session?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // Generate performance reports
  const responseTimeReport = responseTimeData.generateReport();
  const slowQueries = queryProfiler.getSlowQueries();
  
  // Format dashboard HTML
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Dashboard</title>
    <style>
      body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 1200px; margin: 0 auto; padding: 20px; }
      h1, h2 { color: #333; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f2f2f2; }
      tr:hover { background-color: #f5f5f5; }
      .card { background: white; border-radius: 8px; padding: 16px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .warning { color: #e65100; }
      .error { color: #d32f2f; }
      .good { color: #2e7d32; }
    </style>
  </head>
  <body>
    <h1>Performance Dashboard</h1>
    <p>Generated at: ${new Date().toLocaleString()}</p>
    
    <div class="card">
      <h2>Response Time Overview</h2>
      <p>Total Requests: <strong>${responseTimeReport.totalRequests}</strong></p>
      <p>Overall Average: <strong>${responseTimeReport.overallAverage.toFixed(2)}ms</strong></p>
      
      <h3>Slowest Routes</h3>
      <table>
        <thead>
          <tr>
            <th>Route</th>
            <th>Request Count</th>
            <th>Avg Response Time</th>
            <th>Max Response Time</th>
          </tr>
        </thead>
        <tbody>
          ${responseTimeReport.slowestRoutes.map((route: any) => `
            <tr>
              <td>${route.route}</td>
              <td>${route.requestCount}</td>
              <td class="${route.averageResponseTime > 1000 ? 'warning' : route.averageResponseTime > 500 ? 'error' : 'good'}">${route.averageResponseTime.toFixed(2)}ms</td>
              <td class="${route.maxResponseTime > 3000 ? 'error' : route.maxResponseTime > 1000 ? 'warning' : 'good'}">${route.maxResponseTime.toFixed(2)}ms</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="card">
      <h2>Slow Database Queries</h2>
      <table>
        <thead>
          <tr>
            <th>Query</th>
            <th>Duration</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${slowQueries.map((query: any) => `
            <tr>
              <td>${query.query.substring(0, 100)}${query.query.length > 100 ? '...' : ''}</td>
              <td class="${query.duration > 1000 ? 'error' : 'warning'}">${query.duration.toFixed(2)}ms</td>
              <td>${new Date(query.timestamp).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${slowQueries.length === 0 ? '<p>No slow queries detected recently.</p>' : ''}
    </div>
    
    <div class="card">
      <h2>Recommendations</h2>
      <ul>
        ${responseTimeReport.overallAverage > 500 ? '<li class="warning">Overall response time is high. Consider implementing caching strategies.</li>' : ''}
        ${slowQueries.length > 0 ? '<li class="warning">Database queries are slow. Consider optimizing or adding indexes.</li>' : ''}
        ${responseTimeReport.slowestRoutes.some((r: any) => r.averageResponseTime > 1000) ? '<li class="error">Some routes have very high response times. Review implementation.</li>' : ''}
      </ul>
    </div>
    
    <script>
      // Auto-refresh every 30 seconds
      setTimeout(() => location.reload(), 30000);
    </script>
  </body>
  </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}