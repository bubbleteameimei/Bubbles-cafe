import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  timestamp: Date;
  path: string;
  method: string;
  statusCode: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000;
  private readonly slowQueryThreshold = 1000; // 1 second

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow queries
    if (metric.responseTime > this.slowQueryThreshold) {
      console.warn(`⚠️ Slow query detected: ${metric.method} ${metric.path} took ${metric.responseTime}ms`);
    }
  }

  getMetrics() {
    return {
      total: this.metrics.length,
      averageResponseTime: this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length,
      slowQueries: this.metrics.filter(m => m.responseTime > this.slowQueryThreshold),
      recentMetrics: this.metrics.slice(-10)
    };
  }

  clearMetrics() {
    this.metrics = [];
  }
}

const performanceMonitor = new PerformanceMonitor();

export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    
    const metric: PerformanceMetrics = {
      responseTime: endTime - startTime,
      memoryUsage: endMemory.heapUsed - startMemory.heapUsed,
      timestamp: new Date(),
      path: req.path,
      method: req.method,
      statusCode: res.statusCode
    };

    performanceMonitor.recordMetric(metric);
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

export function getPerformanceMetrics() {
  return performanceMonitor.getMetrics();
}

export function clearPerformanceMetrics() {
  performanceMonitor.clearMetrics();
}

// Export for use in other files
export { performanceMonitor };