import { useEffect, useCallback } from 'react';
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  navigationType?: string;
}

const reportMetric = async (metric: PerformanceMetric) => {
  // Validate metric data before sending
  if (!metric.name || typeof metric.value !== 'number' || isNaN(metric.value)) {
    console.warn('[Performance] Invalid metric data:', metric);
    return;
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Performance]', {
      name: metric.name,
      value: Math.round(metric.value * 100) / 100,
      id: metric.id
    });
  }

  try {
    const body = JSON.stringify({
      metricName: metric.name,
      value: Math.round(metric.value * 100) / 100,
      identifier: metric.id,
      navigationType: metric.navigationType,
      url: window.location.href,
      userAgent: navigator.userAgent
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
      onCLS((metric) => {
        if (metric.value) {
          reportMetric({
            name: 'CLS',
            value: metric.value,
            id: metric.id
          });
        }
      });

      onFID((metric) => {
        if (metric.value) {
          reportMetric({
            name: 'FID',
            value: metric.value,
            id: metric.id
          });
        }
      });

      onLCP((metric) => {
        if (metric.value) {
          reportMetric({
            name: 'LCP',
            value: metric.value,
            id: metric.id
          });
        }
      });

      onFCP((metric) => {
        if (metric.value) {
          reportMetric({
            name: 'FCP',
            value: metric.value,
            id: metric.id
          });
        }
      });

      onTTFB((metric) => {
        if (metric.value) {
          reportMetric({
            name: 'TTFB',
            value: metric.value,
            id: metric.id
          });
        }
      });
    } catch (error) {
      console.error('[Performance] Failed to measure Core Web Vitals:', error);
    }
  }, []);

  const measureNavigationTiming = useCallback(() => {
    try {
      if (performance.getEntriesByType) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          if (navigation.responseStart && navigation.requestStart) {
            reportMetric({
              name: 'TTFB',
              value: navigation.responseStart - navigation.requestStart,
              id: 'nav-timing',
              navigationType: navigation.type,
            });
          }

          // Add DNS lookup time
          if (navigation.domainLookupEnd && navigation.domainLookupStart) {
            reportMetric({
              name: 'DNS',
              value: navigation.domainLookupEnd - navigation.domainLookupStart,
              id: 'dns-timing',
            });
          }

          // Add connection time
          if (navigation.connectEnd && navigation.connectStart) {
            reportMetric({
              name: 'TCP',
              value: navigation.connectEnd - navigation.connectStart,
              id: 'tcp-timing',
            });
          }
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