import { useEffect, useCallback } from 'react';
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  navigationType?: string;
}

const reportMetric = (metric: PerformanceMetric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Performance]', metric);
  }
  
  // In production, we could send this to an analytics endpoint
  if (import.meta.env.PROD) {
    try {
      const body = JSON.stringify({
        ...metric,
        timestamp: Date.now(),
        url: window.location.href,
      });
      
      // Use sendBeacon for better reliability during page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/vitals', body);
      } else {
        fetch('/api/analytics/vitals', {
          body,
          method: 'POST',
          keepalive: true,
        });
      }
    } catch (error) {
      console.error('[Performance] Failed to report metrics:', error);
    }
  }
};

export const usePerformanceMonitoring = () => {
  const measureCoreWebVitals = useCallback(() => {
    onCLS(reportMetric);
    onFID(reportMetric);
    onLCP(reportMetric);
    onFCP(reportMetric);
    onTTFB(reportMetric);
  }, []);

  const measureNavigationTiming = useCallback(() => {
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        reportMetric({
          name: 'TTFB',
          value: navigation.responseStart - navigation.requestStart,
          id: 'nav-timing',
          navigationType: navigation.type,
        });
      }
    }
  }, []);

  const measureResourceTiming = useCallback(() => {
    if (performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      resources.forEach(resource => {
        reportMetric({
          name: 'ResourceTiming',
          value: resource.duration,
          id: resource.name,
        });
      });
    }
  }, []);

  useEffect(() => {
    // Start monitoring when component mounts
    measureCoreWebVitals();
    measureNavigationTiming();
    
    // Measure resource timing after load
    window.addEventListener('load', measureResourceTiming);
    
    // Cleanup
    return () => {
      window.removeEventListener('load', measureResourceTiming);
      performance.clearResourceTimings();
    };
  }, [measureCoreWebVitals, measureNavigationTiming, measureResourceTiming]);
};
