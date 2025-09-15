/**
 * PerformanceMonitor Component
 * 
 * This component measures and reports on various performance metrics
 * for the application. It can be used in development mode to track performance
 * or in production to collect metrics for analytics.
 */

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';

interface PerformanceMetricsData {
  ttfb: number;
  fcp: number;
  lcp: number | null;
  cls: number | null;
  fid: number | null; 
  domContentLoaded: number;
  loadComplete: number;
  longTasks: number;
  totalJsHeapSize: number | null;
  usedJsHeapSize: number | null;
  jsHeapSizeLimit: number | null;
}

interface PerformanceMonitorProps {
  visible?: boolean;
  onClose?: () => void;
  showControls?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  className?: string;
}

export function PerformanceMonitor({
  visible = import.meta.env.DEV,
  onClose,
  showControls = import.meta.env.DEV,
  position = 'bottom-right',
  className = '',
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetricsData>({
    ttfb: 0,
    fcp: 0,
    lcp: null,
    cls: null,
    fid: null,
    domContentLoaded: 0,
    loadComplete: 0,
    longTasks: 0,
    totalJsHeapSize: null,
    usedJsHeapSize: null,
    jsHeapSizeLimit: null,
  });
  
  const [isVisible, setIsVisible] = useState(visible);
  const [isExpanded, setIsExpanded] = useState(false);
  const updateInterval = useRef<number | null>(null);
  const { recordMetric, recordNavigationTiming } = usePerformanceMonitoring();
  
  // Position styles
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4',
  };
  
  // Collect performance metrics
  useEffect(() => {
    if (!isVisible) return;
    
    // Record initial navigation timing 
    recordNavigationTiming();
    
    // Measure Core Web Vitals
    measureCoreWebVitals();
    
    // Track long tasks
    observeLongTasks();
    
    // Set up periodic updates
    updateInterval.current = window.setInterval(() => {
      updatePerformanceMetrics();
    }, 2000);
    
    return () => {
      if (updateInterval.current) {
        window.clearInterval(updateInterval.current);
      }
    };
  }, [isVisible, recordNavigationTiming]);
  
  // Measure Core Web Vitals using Web Vitals API or approximations
  const measureCoreWebVitals = () => {
    // First Contentful Paint (FCP)
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    if (fcpEntry) {
      setMetrics(prev => ({ ...prev, fcp: Math.round(fcpEntry.startTime) }));
      recordMetric('FCP', fcpEntry.startTime);
    }
    
    // Largest Contentful Paint (LCP) - needs PerformanceObserver
    if (window.PerformanceObserver) {
      try {
        const lcpObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            const lcp = Math.round(lastEntry.startTime);
            setMetrics(prev => ({ ...prev, lcp }));
            recordMetric('LCP', lcp);
          }
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('[PerformanceMonitor] LCP measurement not supported');
      }
    }
    
    // Cumulative Layout Shift (CLS)
    if (window.PerformanceObserver) {
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver(entryList => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              setMetrics(prev => ({ ...prev, cls: parseFloat(clsValue.toFixed(3)) }));
              recordMetric('CLS', clsValue);
            }
          }
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('[PerformanceMonitor] CLS measurement not supported');
      }
    }
    
    // First Input Delay (FID)
    if (window.PerformanceObserver) {
      try {
        const fidObserver = new PerformanceObserver(entryList => {
          for (const entry of entryList.getEntries()) {
            const fid = Math.round((entry as PerformanceEventTiming).processingStart - entry.startTime);
            setMetrics(prev => ({ ...prev, fid }));
            recordMetric('FID', fid);
          }
        });
        
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.warn('[PerformanceMonitor] FID measurement not supported');
      }
    }
  };
  
  // Track long tasks (tasks taking more than 50ms)
  const observeLongTasks = () => {
    if (window.PerformanceObserver) {
      try {
        const longTaskObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          
          if (entries.length > 0) {
            setMetrics(prev => ({ 
              ...prev,
              longTasks: prev.longTasks + entries.length
            }));
            
            // Record each long task
            entries.forEach(entry => {
              recordMetric('LongTask', entry.duration);
            });
          }
        });
        
        longTaskObserver.observe({ type: 'longtask', buffered: true });
      } catch (e) {
        console.warn('[PerformanceMonitor] Long task observation not supported');
      }
    }
  };
  
  // Update metrics that can change over time
  const updatePerformanceMetrics = () => {
    // Basic timing metrics from Navigation Timing API
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const ttfb = timing.responseStart - timing.navigationStart;
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      const loadComplete = timing.loadEventEnd - timing.navigationStart;
      
      setMetrics(prev => ({
        ...prev,
        ttfb,
        domContentLoaded,
        loadComplete
      }));
    }
    
    // Memory usage if available
    if (window.performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      
      setMetrics(prev => ({
        ...prev,
        totalJsHeapSize: memory.totalJSHeapSize,
        usedJsHeapSize: memory.usedJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }));
    }
  };
  
  // Format bytes to human-readable format
  const formatBytes = (bytes: number | null): string => {
    if (bytes === null) return 'N/A';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  // Rating system for metrics
  const getRating = (metric: string, value: number | null): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
    if (value === null) return 'unknown';
    
    switch (metric) {
      case 'ttfb':
        return value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';
      case 'fcp':
        return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
      case 'lcp':
        return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
      default:
        return 'unknown';
    }
  };
  
  // Badge colors for ratings
  const ratingColors = {
    'good': 'bg-green-500',
    'needs-improvement': 'bg-yellow-400',
    'poor': 'bg-red-500',
    'unknown': 'bg-gray-300',
  };
  
  // If not visible, don't render anything
  if (!isVisible) return null;
  
  return (
    <div className={`fixed z-50 ${positionStyles[position]} ${className}`}>
      <Card className="w-[300px] shadow-xl bg-background/90 backdrop-blur-md border-primary/20">
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex justify-between items-center">
            <span>Performance Monitor</span>
            {showControls && (
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? '🔼' : '🔽'}
                </Button>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setIsVisible(false);
                    if (onClose) onClose();
                  }}
                >
                  ✖️
                </Button>
              </div>
            )}
          </CardTitle>
          {isExpanded && (
            <CardDescription className="text-xs">
              Core Web Vitals and performance metrics
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="p-3 pt-0">
          <div className="space-y-1">
            {/* Core Web Vitals */}
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">FCP:</span>
                <Badge variant="outline" className={`text-xs ${ratingColors[getRating('fcp', metrics.fcp)]}`}>
                  {metrics.fcp ? `${metrics.fcp}ms` : 'N/A'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">LCP:</span>
                <Badge variant="outline" className={`text-xs ${ratingColors[getRating('lcp', metrics.lcp)]}`}>
                  {metrics.lcp ? `${metrics.lcp}ms` : 'N/A'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">CLS:</span>
                <Badge variant="outline" className={`text-xs ${ratingColors[getRating('cls', metrics.cls)]}`}>
                  {metrics.cls !== null ? metrics.cls.toFixed(3) : 'N/A'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">FID:</span>
                <Badge variant="outline" className={`text-xs ${ratingColors[getRating('fid', metrics.fid)]}`}>
                  {metrics.fid ? `${metrics.fid}ms` : 'N/A'}
                </Badge>
              </div>
            </div>
            
            {isExpanded && (
              <>
                {/* Additional Metrics */}
                <div className="border-t border-border pt-1">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">TTFB:</span>
                      <span className="text-xs">
                        {metrics.ttfb ? `${metrics.ttfb}ms` : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Long Tasks:</span>
                      <span className="text-xs">{metrics.longTasks}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">DOM Ready:</span>
                      <span className="text-xs">
                        {metrics.domContentLoaded ? `${metrics.domContentLoaded}ms` : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Load Time:</span>
                      <span className="text-xs">
                        {metrics.loadComplete ? `${metrics.loadComplete}ms` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Memory Usage */}
                {metrics.usedJsHeapSize !== null && (
                  <div className="border-t border-border pt-1">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">Memory Used:</span>
                        <span className="text-xs">
                          {formatBytes(metrics.usedJsHeapSize)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">Memory Limit:</span>
                        <span className="text-xs">
                          {formatBytes(metrics.jsHeapSizeLimit)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
        
        {isExpanded && showControls && (
          <CardFooter className="p-3 pt-0 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => updatePerformanceMetrics()}
            >
              Refresh
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default PerformanceMonitor;