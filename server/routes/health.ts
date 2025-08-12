import { Router, Request, Response } from 'express';
import { db } from '../db';
import { createLogger } from '../utils/debug-logger';

const logger = createLogger('Health');

const router = Router();

// Basic health check
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    };

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({ 
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check with database connectivity
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    let dbStatus = 'unknown';
    let dbResponseTime = 0;
    
    try {
      const dbStartTime = Date.now();
      await db.execute('SELECT 1 as test');
      dbResponseTime = Date.now() - dbStartTime;
      dbStatus = 'connected';
    } catch (dbError) {
      dbStatus = 'error';
      logger.error('Database health check failed', { error: dbError });
    }

    const totalResponseTime = Date.now() - startTime;

    const health = {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      responseTime: totalResponseTime,
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime
        }
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };

    res.json(health);
  } catch (error) {
    logger.error('Detailed health check failed', { error });
    res.status(500).json({ 
      status: 'error',
      message: 'Detailed health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Readiness check for load balancers
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await db.execute('SELECT 1 as test');
    
    res.json({ 
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({ 
      status: 'not ready',
      message: 'Service not ready',
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness check for Kubernetes
router.get('/live', (req: Request, res: Response) => {
  res.json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;