import { useEffect, useRef, useCallback } from 'react';
import logger from '@/utils/secure-client-logger';

interface PerformanceMetrics {
  componentName: string;
  mountTime: number;
  renderCount: number;
  lastRenderTime: number;
  totalRenderTime: number;
  averageRenderTime: number;
}

export function usePerformanceMonitor(componentName: string) {
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const lastRenderStartRef = useRef<number>(0);
  const totalRenderTimeRef = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics>();

  // Track component mount
  useEffect(() => {
    mountTimeRef.current = performance.now();
    logger.debug(`Component mounted: ${componentName}`);

    return () => {
      const unmountTime = performance.now();
      const lifetimeMs = unmountTime - mountTimeRef.current;
      
      logger.debug(`Component unmounted: ${componentName}`, {
        lifetimeMs: Math.round(lifetimeMs),
        totalRenders: renderCountRef.current,
        averageRenderTime: Math.round(totalRenderTimeRef.current / Math.max(renderCountRef.current, 1))
      });
    };
  }, [componentName]);

  // Track renders
  const trackRender = useCallback(() => {
    const renderStart = performance.now();
    
    // Track previous render completion
    if (lastRenderStartRef.current > 0) {
      const renderTime = renderStart - lastRenderStartRef.current;
      totalRenderTimeRef.current += renderTime;
      renderCountRef.current += 1;

      // Log slow renders
      if (renderTime > 16) { // 16ms = 60fps threshold
        logger.warn(`Slow render detected in ${componentName}`, {
          renderTime: Math.round(renderTime),
          renderNumber: renderCountRef.current
        });
      }
    }
    
    lastRenderStartRef.current = renderStart;
  }, [componentName]);

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    const now = performance.now();
    const currentMetrics: PerformanceMetrics = {
      componentName,
      mountTime: mountTimeRef.current,
      renderCount: renderCountRef.current,
      lastRenderTime: now - lastRenderStartRef.current,
      totalRenderTime: totalRenderTimeRef.current,
      averageRenderTime: totalRenderTimeRef.current / Math.max(renderCountRef.current, 1)
    };
    
    metricsRef.current = currentMetrics;
    return currentMetrics;
  }, [componentName]);

  // Mark performance points
  const mark = useCallback((markName: string) => {
    performance.mark(`${componentName}-${markName}`);
  }, [componentName]);

  // Measure between marks
  const measure = useCallback((measureName: string, startMark: string, endMark?: string) => {
    const fullStartMark = `${componentName}-${startMark}`;
    const fullEndMark = endMark ? `${componentName}-${endMark}` : undefined;
    
    try {
      performance.measure(`${componentName}-${measureName}`, fullStartMark, fullEndMark);
      const measurement = performance.getEntriesByName(`${componentName}-${measureName}`)[0];
      return measurement?.duration || 0;
    } catch (error) {
      logger.error(`Performance measurement failed: ${measureName}`, error);
      return 0;
    }
  }, [componentName]);

  // Auto-track renders on every call
  trackRender();

  return {
    mark,
    measure,
    getMetrics,
    trackRender
  };
}

// Hook for monitoring API calls
export function useApiPerformanceMonitor(apiName: string) {
  const startTime = useRef<number>(0);

  const startRequest = useCallback(() => {
    startTime.current = performance.now();
    performance.mark(`api-${apiName}-start`);
  }, [apiName]);

  const endRequest = useCallback((success: boolean = true, dataSize?: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performance.mark(`api-${apiName}-end`);
    performance.measure(`api-${apiName}-duration`, `api-${apiName}-start`, `api-${apiName}-end`);

    const logData: any = {
      duration: Math.round(duration),
      success
    };

    if (dataSize) {
      logData.dataSize = dataSize;
      logData.throughput = Math.round(dataSize / (duration / 1000)); // bytes per second
    }

    if (duration > 3000) { // 3 second threshold
      logger.warn(`Slow API call: ${apiName}`, logData);
    } else {
      logger.debug(`API call completed: ${apiName}`, logData);
    }

    return duration;
  }, [apiName]);

  return {
    startRequest,
    endRequest
  };
}

// Hook for memory usage monitoring
export function useMemoryMonitor(componentName: string) {
  const memoryCheckRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Only monitor memory in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !localStorage.getItem('memory-monitor')) {
      return;
    }

    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

        if (usedMB > limitMB * 0.8) { // 80% of limit
          logger.warn(`High memory usage in ${componentName}`, {
            usedMB,
            totalMB,
            limitMB,
            usagePercent: Math.round((usedMB / limitMB) * 100)
          });
        }
      }
    };

    // Check memory every 10 seconds
    memoryCheckRef.current = setInterval(checkMemory, 10000);

    return () => {
      if (memoryCheckRef.current) {
        clearInterval(memoryCheckRef.current);
      }
    };
  }, [componentName]);

  const forceMemoryCheck = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }, []);

  return { forceMemoryCheck };
}