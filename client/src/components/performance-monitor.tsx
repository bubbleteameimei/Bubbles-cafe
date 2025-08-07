/**
 * Performance Monitoring Component
 * 
 * This component monitors and reports Web Vitals and other performance metrics.
 * It uses client-side measurements and submits them to our analytics API.
 */
import { useEffect, useRef } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';

interface PerformanceMonitorProps {
  pageId?: string;
  userId?: string;
  isEnabled?: boolean;
}

export function PerformanceMonitor({ 
  pageId, 
  userId, 
  isEnabled = true 
}: PerformanceMonitorProps) {
  const monitoringHook = usePerformanceMonitoring();
  const { 
    recordMetric, 
    recordNavigationTiming,
  } = monitoringHook;
  
  const isLoadEventSent = useRef(false);
  
  useEffect(() => {
    if (!isEnabled) return;
    
    const identifier = `${pageId || window.location.pathname}-${Date.now()}`;
    
    // Record Core Web Vitals
    onCLS(({ value }) => recordMetric('CLS', value * 1000));
    onFID(({ value }) => recordMetric('FID', value));
    onLCP(({ value }) => recordMetric('LCP', value));
    onFCP(({ value }) => recordMetric('FCP', value));
    onTTFB(({ value }) => recordMetric('TTFB', value));
    
    // Record Navigation Timing
    recordNavigationTiming();
    
    // Record page load event once
    const handleLoad = () => {
      if (isLoadEventSent.current) return;
      
      recordMetric('PageLoad', performance.now());
      isLoadEventSent.current = true;
    };
    
    window.addEventListener('load', handleLoad);
    
    // Cleanup
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [pageId, userId, isEnabled, recordMetric, recordNavigationTiming]);
  
  // This is a monitoring component that doesn't render anything
  return null;
}

// Default export for easier imports
export default PerformanceMonitor;