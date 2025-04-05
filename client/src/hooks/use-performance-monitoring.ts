/**
 * Performance Monitoring Hook
 * 
 * Custom hook to manage performance monitoring and reporting metrics
 * to the analytics endpoints.
 */
import { useCallback } from 'react';
import { submitPerformanceMetrics } from '@/api/analytics';

export function usePerformanceMonitoring() {
  /**
   * Record and send a performance metric to the server
   */
  const recordMetric = useCallback((
    metricName: string,
    value: number,
    identifier: string
  ) => {
    try {
      // Get navigation type if available
      const navigationEntry = performance?.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming;
      const navigationType = navigationEntry?.type || 'unknown';
      
      // Capture user agent
      const userAgent = window.navigator.userAgent;
      
      // Get current URL
      const url = window.location.pathname + window.location.search;
      
      // Submit metric to server
      submitPerformanceMetrics({
        metricName,
        value,
        identifier,
        url,
        userAgent,
        navigationType
      }).catch(error => {
        console.warn(`Failed to submit ${metricName} metric:`, error);
      });
    } catch (error) {
      console.warn(`Error recording metric ${metricName}:`, error);
    }
  }, []);
  
  /**
   * Record Navigation Timing API metrics
   */
  const recordNavigationTiming = useCallback((identifier: string) => {
    try {
      // Ensure Navigation Timing API is supported
      if (!performance || !performance.getEntriesByType) {
        return;
      }
      
      // Get navigation timing data
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!navEntry) {
        return;
      }
      
      // Record key navigation metrics
      if (navEntry.domContentLoadedEventEnd) {
        recordMetric('DOMContentLoaded', navEntry.domContentLoadedEventEnd, identifier);
      }
      
      if (navEntry.loadEventEnd) {
        recordMetric('LoadComplete', navEntry.loadEventEnd, identifier);
      }
      
      if (navEntry.connectEnd && navEntry.connectStart) {
        recordMetric('ConnectionTime', navEntry.connectEnd - navEntry.connectStart, identifier);
      }
      
      if (navEntry.responseEnd && navEntry.responseStart) {
        recordMetric('ResponseTime', navEntry.responseEnd - navEntry.responseStart, identifier);
      }
      
      if (navEntry.domComplete && navEntry.domInteractive) {
        recordMetric('DOMProcessingTime', navEntry.domComplete - navEntry.domInteractive, identifier);
      }
    } catch (error) {
      console.warn('Error recording navigation timing:', error);
    }
  }, [recordMetric]);
  
  /**
   * Record a custom user interaction metric
   */
  const recordInteractionMetric = useCallback((
    interactionType: string,
    duration: number,
    identifier: string = window.location.pathname + '-' + Date.now()
  ) => {
    recordMetric(`Interaction-${interactionType}`, duration, identifier);
  }, [recordMetric]);
  
  return {
    recordMetric,
    recordNavigationTiming,
    recordInteractionMetric
  };
}

export default usePerformanceMonitoring;