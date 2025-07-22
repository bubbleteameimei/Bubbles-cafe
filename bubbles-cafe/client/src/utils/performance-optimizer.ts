/**
 * Performance Optimizer Utilities
 * 
 * Provides utilities for measuring, tracking and optimizing client-side performance
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';

// Track components that have been measured to avoid duplicates
const measuredComponents = new Set<string>();

/**
 * Hook to measure component render performance
 * 
 * @param componentName Name of the component to track
 * @param options Configuration options
 */
export function useComponentRenderTracker(
  componentName: string,
  options: {
    trackMounts?: boolean;
    trackRenders?: boolean;
    trackUnmounts?: boolean;
    trackOnly?: 'debug' | 'production' | 'all';
  } = {}
) {
  const {
    trackMounts = true,
    trackRenders = true,
    trackUnmounts = false,
    trackOnly = 'debug'
  } = options;
  
  const { recordMetric } = usePerformanceMonitoring();
  const startTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  
  // Skip in production if configured to track only in debug
  if (trackOnly === 'debug' && import.meta.env.PROD) {
    // Return empty functions to avoid conditional hook calls
    return {
      trackMount: () => {},
      trackRender: () => {},
      trackUnmount: () => {}
    };
  }
  
  // Skip in debug if configured to track only in production
  if (trackOnly === 'production' && import.meta.env.DEV) {
    return {
      trackMount: () => {},
      trackRender: () => {},
      trackUnmount: () => {}
    };
  }
  
  // Track initial mount
  useEffect(() => {
    if (trackMounts) {
      const mountTime = performance.now();
      
      // Record initial mount performance
      if (!measuredComponents.has(componentName)) {
        measuredComponents.add(componentName);
        if (import.meta.env.DEV) {
          console.log(`[Performance] Component mounted: ${componentName}`);
        }
      }
      
      return () => {
        if (trackUnmounts) {
          const unmountTime = performance.now();
          const duration = unmountTime - mountTime;
          
          // Record time from mount to unmount
          recordMetric('Custom', duration, `ComponentLifetime-${componentName}`);
          
          if (import.meta.env.DEV) {
            console.log(`[Performance] Component unmounted: ${componentName}, total lifetime: ${Math.round(duration)}ms`);
          }
        }
      };
    }
  }, [componentName, trackMounts, trackUnmounts, recordMetric]);
  
  // Function to track render start
  const trackMount = useCallback(() => {
    startTime.current = performance.now();
    renderCount.current = 1;
  }, []);
  
  // Function to track render completion
  const trackRender = useCallback(() => {
    if (!trackRenders) return;
    
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    // Only track non-initial renders to separate mount from updates
    if (renderCount.current > 1) {
      recordMetric('Custom', duration, `ComponentRender-${componentName}`);
      
      if (import.meta.env.DEV && duration > 8) {
        console.log(`[Performance] Component render #${renderCount.current}: ${componentName}, duration: ${Math.round(duration)}ms`);
      }
    }
    
    renderCount.current++;
    startTime.current = performance.now(); // Reset for next render
  }, [trackRenders, componentName, recordMetric]);
  
  // Function to manually track unmount if needed
  const trackUnmount = useCallback(() => {
    if (!trackUnmounts) return;
    
    const unmountTime = performance.now();
    const duration = unmountTime - startTime.current;
    
    recordMetric('Custom', duration, `ComponentUnmount-${componentName}`);
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] Component manual unmount: ${componentName}, duration: ${Math.round(duration)}ms`);
    }
  }, [trackUnmounts, componentName, recordMetric]);
  
  return {
    trackMount,
    trackRender,
    trackUnmount
  };
}

/**
 * Hook to track resource loading performance
 * 
 * @param resourceType Type of resource to track
 */
export function useResourceLoadTracker(
  resourceType: 'image' | 'script' | 'font' | 'stylesheet' | 'api' | 'custom'
) {
  const { recordMetric } = usePerformanceMonitoring();
  const loadStartTimes = useRef<Record<string, number>>({});
  
  // Track start of resource load
  const trackLoadStart = useCallback((resourceId: string) => {
    loadStartTimes.current[resourceId] = performance.now();
  }, []);
  
  // Track completion of resource load
  const trackLoadComplete = useCallback((resourceId: string, success: boolean = true) => {
    const startTime = loadStartTimes.current[resourceId];
    if (!startTime) return;
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric('Custom', duration, `ResourceLoad-${resourceType}-${success ? 'success' : 'error'}`);
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] Resource ${resourceType} load ${success ? 'succeeded' : 'failed'}: ${resourceId}, duration: ${Math.round(duration)}ms`);
    }
    
    // Clear tracking for this resource
    delete loadStartTimes.current[resourceId];
  }, [resourceType, recordMetric]);
  
  return {
    trackLoadStart,
    trackLoadComplete
  };
}

/**
 * Track user interaction metrics like click-to-response time
 */
export function useInteractionTracker() {
  const { recordMetric } = usePerformanceMonitoring();
  const interactionStartTimes = useRef<Record<string, number>>({});
  
  // Track the start of a user interaction
  const trackInteractionStart = useCallback((interactionId: string) => {
    interactionStartTimes.current[interactionId] = performance.now();
  }, []);
  
  // Track the completion of a user interaction
  const trackInteractionComplete = useCallback((interactionId: string) => {
    const startTime = interactionStartTimes.current[interactionId];
    if (!startTime) return;
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric('Custom', duration, `Interaction-${interactionId}`);
    
    if (import.meta.env.DEV && duration > 100) {
      console.warn(`[Performance] Slow interaction: ${interactionId}, duration: ${Math.round(duration)}ms`);
    } else if (import.meta.env.DEV) {
      console.log(`[Performance] Interaction completed: ${interactionId}, duration: ${Math.round(duration)}ms`);
    }
    
    // Clear tracking for this interaction
    delete interactionStartTimes.current[interactionId];
  }, [recordMetric]);
  
  return {
    trackInteractionStart,
    trackInteractionComplete
  };
}

export default {
  useComponentRenderTracker,
  useResourceLoadTracker,
  useInteractionTracker
};