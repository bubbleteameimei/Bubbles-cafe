/**
 * Performance monitoring hook
 * Provides basic performance monitoring capabilities
 */

import { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  ttfb: number;
  fcp: number;
  lcp: number | null;
  cls: number | null;
  fid: number | null;
  domContentLoaded: number;
  loadComplete: number;
  longTasks: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    ttfb: 0,
    fcp: 0,
    lcp: null,
    cls: null,
    fid: null,
    domContentLoaded: 0,
    loadComplete: 0,
    longTasks: 0
  });

  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // Basic performance metrics collection
    const collectMetrics = () => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          setMetrics(prev => ({
            ...prev,
            ttfb: navigation.responseStart - navigation.requestStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart
          }));
        }

        // Memory usage if available
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          setMetrics(prev => ({
            ...prev,
            memoryUsage: {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit
            }
          }));
        }
      } catch (error) {
        console.warn('Performance monitoring error:', error);
      }
    };

    // Collect initial metrics
    collectMetrics();

    // Set up periodic collection
    const interval = setInterval(collectMetrics, 5000);

    return () => {
      clearInterval(interval);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const recordMetric = (name: string, value: number) => {
    console.debug(`Performance metric: ${name} = ${value}ms`);
  };

  const recordNavigationTiming = () => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.timing;
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      recordMetric('page-load-time', loadTime);
    }
  };

  return {
    metrics,
    isSupported: 'performance' in window,
    recordMetric,
    recordNavigationTiming
  };
}