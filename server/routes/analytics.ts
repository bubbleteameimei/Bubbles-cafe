/**
 * Analytics Routes
 * 
 * These routes handle collection of analytics and performance metrics
 * from client devices.
 */

import { Request, Response, Router } from 'express';
import { storage } from '../storage';
import { createLogger } from '../utils/debug-logger';

// Create a logger for analytics
const analyticsLogger = createLogger('Analytics');

// Create a router
const router = Router();

/**
 * Core Web Vitals analytics endpoint
 * This endpoint is explicitly exempted from CSRF protection
 */
router.post('/vitals', async (req: Request, res: Response) => {
  try {
    const { 
      metricName,
      value, 
      identifier,
      navigationType,
      url,
      userAgent
    } = req.body;
    
    // Validate required fields
    if (!metricName || value === undefined || value === null) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['metricName', 'value']
      });
    }
    
    // Log the metric in development
    if (process.env.NODE_ENV !== 'production') {
      analyticsLogger.debug('Received performance metric', { 
        metricName, 
        value,
        identifier: identifier || 'unknown',
        url: url || 'unknown'
      });
    }
    
    // Store in database - don't await to avoid blocking response
    storage.storePerformanceMetric({
      metricName,
      value,
      // Provide all required fields for the performance metric
      userAgent: userAgent || req.headers['user-agent'] as string || 'unknown',
      url: url || (req.headers.referer as string) || 'unknown',
      identifier: identifier || `metric-${Date.now()}`,
      navigationType: navigationType || 'navigation'
    } as any).catch(error => {
      analyticsLogger.error('Failed to store performance metric', { error });
    });
    
    // Respond with success regardless of storage outcome
    res.status(200).json({ message: 'Metric recorded successfully' });
  } catch (error) {
    analyticsLogger.error('Error processing performance metric', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Device analytics endpoint
 */
router.get('/devices', async (req: Request, res: Response) => {
  try {
    // Only admin users can access this endpoint
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get device distribution from storage
    const deviceDistribution = await storage.getDeviceDistribution();
    
    // Return data
    res.json(deviceDistribution);
  } catch (error) {
    analyticsLogger.error('Error fetching device distribution', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * User engagement analytics endpoint
 */
router.get('/engagement', async (req: Request, res: Response) => {
  try {
    // Only admin users can access this endpoint
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Fetch real engagement metrics from the performance_metrics table
    const interactionMetrics = await storage.getPerformanceMetricsByType('interaction');
    const pageViewMetrics = await storage.getPerformanceMetricsByType('pageview');
    const timeOnPageMetrics = await storage.getPerformanceMetricsByType('timeOnPage');
    
    // Calculate real user engagement metrics from stored data
    const engagementMetrics = {
      totalReadingTime: timeOnPageMetrics.reduce((sum, metric) => sum + Number(metric.value), 0),
      averageSessionDuration: timeOnPageMetrics.length ? 
        timeOnPageMetrics.reduce((sum, metric) => sum + Number(metric.value), 0) / timeOnPageMetrics.length : 0,
      totalUsers: await storage.getUniqueUserCount(),
      activeUsers: await storage.getActiveUserCount(),
      interactions: interactionMetrics.length,
      pageViews: pageViewMetrics.length,
      returning: await storage.getReturningUserCount()
    };
    
    // Return data
    res.json(engagementMetrics);
  } catch (error) {
    analyticsLogger.error('Error fetching engagement metrics', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Page view analytics endpoint
 * Also exempted from CSRF protection
 */
router.post('/pageview', async (req: Request, res: Response) => {
  try {
    const { 
      path, 
      referrer, 
      timestamp, 
      userAgent, 
      screenWidth, 
      screenHeight 
    } = req.body;
    
    // Basic validation
    if (!path) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['path']
      });
    }
    
    // Log in development
    if (process.env.NODE_ENV !== 'production') {
      analyticsLogger.debug('Received page view', { path, referrer });
    }
    
    // Store in database asynchronously as a performance metric
    storage.storePerformanceMetric({
      metricName: 'pageview',
      value: 1,
      identifier: `pageview-${Date.now()}`,
      navigationType: 'navigation',
      url: path,
      userAgent: userAgent || req.headers['user-agent'] as string || 'unknown'
    }).catch(error => {
      analyticsLogger.error('Failed to store page view', { error: error instanceof Error ? error.message : String(error) });
    });
    
    res.status(200).json({ message: 'Page view recorded' });
  } catch (error) {
    analyticsLogger.error('Error processing page view', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * User interaction analytics endpoint
 * Also exempted from CSRF protection
 */
router.post('/interaction', async (req: Request, res: Response) => {
  try {
    const { interactionType, details, timestamp, path } = req.body;
    
    // Validate
    if (!interactionType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['interactionType']
      });
    }
    
    // Log in development
    if (process.env.NODE_ENV !== 'production') {
      analyticsLogger.debug('Received interaction', { interactionType, path });
    }
    
    // Store in database asynchronously as a performance metric
    storage.storePerformanceMetric({
      metricName: `interaction_${interactionType}`,
      value: 1,
      identifier: `interaction-${Date.now()}`,
      navigationType: 'interaction',
      url: path || req.headers.referer as string || 'unknown',
      userAgent: req.headers['user-agent'] as string || 'unknown'
    }).catch((error: Error) => {
      analyticsLogger.error('Failed to store interaction', { error: error instanceof Error ? error.message : String(error) });
    });
    
    res.status(200).json({ message: 'Interaction recorded' });
  } catch (error) {
    analyticsLogger.error('Error processing interaction', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Summary metrics endpoint for admin dashboard
 */
router.get('/site', async (req: Request, res: Response) => {
  try {
    // Only admin users can access this endpoint
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get site analytics data
    const siteAnalytics = await storage.getSiteAnalytics();
    
    res.json(siteAnalytics);
  } catch (error) {
    analyticsLogger.error('Error fetching site analytics', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Register analytics routes
 */
export function registerAnalyticsRoutes(app: any) {
  app.use('/api/analytics', router);
  analyticsLogger.debug('Analytics routes registered');
}

export default router;