/**
 * usePerformanceMonitoring Hook
 * 
 * This hook provides performance monitoring functionality for components.
 * It allows components to track and submit various metrics for analysis.
 */
import { useCallback, useEffect } from 'react';

type PerformanceMetricType = 'FCP' | 'LCP' | 'CLS' | 'TTFB' | 'TTI' | 'TBT' | 'FID' | 'LoadComplete' | 'LongTask' | 'Custom' | string;

interface PerformanceMetric {
  type: PerformanceMetricType;
  value: number;
  url: string;
  userAgent: string;
  timestamp: number;
  sessionId?: string;
  metadata?: Record<string, any>;
}

/**
 * Hook for performance monitoring functionality
 */
export function usePerformanceMonitoring() {
  // Track initial page load performance
  useEffect(() => {
    try {
      // Record basic page load timing on initial mount
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReadyTime = timing.domComplete - timing.domLoading;
        
        // Log performance metrics to console in development
        if (import.meta.env.DEV) {
          console.log('[Performance] Page load time:', loadTime, 'ms');
          console.log('[Performance] DOM ready time:', domReadyTime, 'ms');
        }
      }
    } catch (e) {
      console.warn('[Performance] Error measuring initial page load:', e);
    }
  }, []);
  
  /**
   * Record a performance metric
   */
  const recordMetric = useCallback((
    type: PerformanceMetricType,
    value: number,
    sessionId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const metric: PerformanceMetric = {
        type,
        value,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId,
        metadata
      };
      
      // Log metric to console in development
      if (import.meta.env.DEV) {
        console.log(`[Performance] Metric ${type}:`, value);
      }
      
      // Store metric in localStorage for later sending
      const storedMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      storedMetrics.push(metric);
      
      // Keep only the last 50 metrics to avoid storage issues
      if (storedMetrics.length > 50) {
        storedMetrics.shift();
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(storedMetrics));
      
      // If we have a server endpoint, send metrics to server
      sendMetricsToServer(storedMetrics);
    } catch (error) {
      console.warn('[Performance] Failed to record metric:', error);
    }
  }, []);
  
  /**
   * Collect navigation timing metrics
   */
  const recordNavigationTiming = useCallback((sessionId?: string) => {
    if (!window.performance || !window.performance.timing) {
      return;
    }
    
    // Wait for the page to fully load
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        // Give browser time to finalize timing measurements
        setTimeout(() => recordNavigationTiming(sessionId), 100);
      });
      return;
    }
    
    try {
      const timing = window.performance.timing;
      
      // Calculate key metrics
      const metrics = {
        // Time to First Byte (TTFB)
        ttfb: timing.responseStart - timing.navigationStart,
        
        // DOM Content Loaded
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        
        // Load event
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        
        // DNS lookup time
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        
        // Connection time
        connect: timing.connectEnd - timing.connectStart,
        
        // Request time
        request: timing.responseEnd - timing.requestStart,
        
        // Response time
        response: timing.responseEnd - timing.responseStart,
        
        // DOM processing time
        domProcessing: timing.domComplete - timing.domLoading,
      };
      
      // Record each metric individually
      Object.entries(metrics).forEach(([key, value]) => {
        // Only record valid metrics (greater than zero)
        if (value > 0) {
          recordMetric(key as PerformanceMetricType, value, sessionId);
        }
      });
      
      // Log overview in development
      if (import.meta.env.DEV) {
        console.table(metrics);
      }
    } catch (error) {
      console.warn('[Performance] Error recording navigation timing:', error);
    }
  }, [recordMetric]);
  
  /**
   * Send collected metrics to the server
   */
  const sendMetricsToServer = async (metrics: PerformanceMetric[]) => {
    // Skip if no metrics or in development
    if (!metrics.length) return;
    
    try {
      const response = await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
        // Don't block the UI for this non-critical operation
        keepalive: true,
      });
      
      if (response.ok) {
        // Clear successfully sent metrics
        localStorage.removeItem('performance_metrics');
      }
    } catch (error) {
      // Silent failure is acceptable for performance tracking
      console.debug('[Performance] Failed to send metrics to server:', error);
    }
  };
  
  return {
    recordMetric,
    recordNavigationTiming,
  };
}

export default usePerformanceMonitoring;