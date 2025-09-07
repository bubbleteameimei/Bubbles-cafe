
/**
 * Process Monitor - Monitors system resources and prevents memory leaks
 */

import { createLogger } from './debug-logger';

const logger = createLogger('ProcessMonitor');

export class ProcessMonitor {
  private monitorTimer: NodeJS.Timeout | null = null;
  private readonly maxMemoryMB: number;
  private readonly checkInterval: number;

  constructor(maxMemoryMB: number = 512, checkIntervalMs: number = 60000) {
    this.maxMemoryMB = maxMemoryMB;
    this.checkInterval = checkIntervalMs;
  }

  start(): void {
    logger.info('📊 Starting process monitor...');
    
    this.monitorTimer = setInterval(() => {
      this.checkSystemHealth();
    }, this.checkInterval);
  }

  stop(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
      logger.info('📊 Process monitor stopped');
    }
  }

  private checkSystemHealth(): void {
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const uptime = Math.round(process.uptime());

    // Log memory usage every 5 minutes in development
    if (process.env.NODE_ENV === 'development' && uptime % 300 === 0) {
      logger.info(`📊 System Health - Memory: ${memUsedMB}MB/${memTotalMB}MB, Uptime: ${uptime}s`);
    }

    // Check for memory leaks
    if (memUsedMB > this.maxMemoryMB) {
      logger.warn(`⚠️ High memory usage detected: ${memUsedMB}MB (limit: ${this.maxMemoryMB}MB)`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        logger.info('🧹 Forced garbage collection');
      }
    }

    // Check for event loop lag (simplified)
    const start = Date.now();
    setImmediate(() => {
      const lag = Date.now() - start;
      if (lag > 100) { // More than 100ms lag
        logger.warn(`⚠️ Event loop lag detected: ${lag}ms`);
      }
    });
  }

  getStats() {
    const memUsage = process.memoryUsage();
    return {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        limit: this.maxMemoryMB
      },
      uptime: Math.round(process.uptime()),
      pid: process.pid
    };
  }
}
