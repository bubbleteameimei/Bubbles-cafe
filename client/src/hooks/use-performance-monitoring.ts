import { useEffect, useCallback } from 'react';
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  navigationType?: string;
}

const reportMetric = async (metric: PerformanceMetric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Performance]', metric);
  }

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
      await fetch('/api/analytics/vitals', {
        body,
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('[Performance] Failed to report metrics:', error);
  }
};

export const usePerformanceMonitoring = () => {
  const measureCoreWebVitals = useCallback(() => {
    try {
      onCLS(reportMetric);
      onFID(reportMetric);
      onLCP(reportMetric);
      onFCP(reportMetric);
      onTTFB(reportMetric);
    } catch (error) {
      console.error('[Performance] Failed to measure Core Web Vitals:', error);
    }
  }, []);

  const measureNavigationTiming = useCallback(() => {
    try {
      if (performance.getEntriesByType) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          reportMetric({
            name: 'TTFB',
            value: navigation.responseStart - navigation.requestStart,
            id: 'nav-timing',
            navigationType: navigation.type,
          });

          // Add DNS lookup time
          reportMetric({
            name: 'DNS',
            value: navigation.domainLookupEnd - navigation.domainLookupStart,
            id: 'dns-timing',
          });

          // Add connection time
          reportMetric({
            name: 'TCP',
            value: navigation.connectEnd - navigation.connectStart,
            id: 'tcp-timing',
          });
        }
      }
    } catch (error) {
      console.error('[Performance] Failed to measure Navigation Timing:', error);
    }
  }, []);

  const measureResourceTiming = useCallback(() => {
    try {
      if (performance.getEntriesByType) {
        const resources = performance.getEntriesByType('resource');
        resources.forEach(resource => {
          if (resource.name.includes(window.location.origin)) {
            reportMetric({
              name: 'ResourceTiming',
              value: resource.duration,
              id: resource.name,
            });
          }
        });
      }
    } catch (error) {
      console.error('[Performance] Failed to measure Resource Timing:', error);
    }
  }, []);

  useEffect(() => {
    // Start monitoring when component mounts
    measureCoreWebVitals();
    measureNavigationTiming();

    // Measure resource timing after load
    const handleLoad = () => {
      measureResourceTiming();
      // Clear resource timings to prevent memory buildup
      performance.clearResourceTimings();
    };

    window.addEventListener('load', handleLoad);

    // Cleanup
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [measureCoreWebVitals, measureNavigationTiming, measureResourceTiming]);
};