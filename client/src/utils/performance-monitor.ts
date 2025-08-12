// Performance monitoring utility for Core Web Vitals and optimization insights

interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  timestamp: number;
  navigationType: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface WebVitalsThresholds {
  CLS: { good: number; poor: number };
  FID: { good: number; poor: number };
  FCP: { good: number; poor: number };
  LCP: { good: number; poor: number };
  TTFB: { good: number; poor: number };
  INP: { good: number; poor: number };
}

// Web Vitals thresholds (in milliseconds, except CLS which is unitless)
const WEB_VITALS_THRESHOLDS: WebVitalsThresholds = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
};

// Rating based on thresholds
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name as keyof WebVitalsThresholds];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

// Performance observer for measuring various metrics
class PerformanceMonitor {
  private observers: PerformanceObserver[] = [];
  private metrics: Map<string, PerformanceMetric> = new Map();
  private onMetric: (metric: PerformanceMetric) => void;

  constructor(onMetric: (metric: PerformanceMetric) => void = () => {}) {
    this.onMetric = onMetric;
    this.initializeObservers();
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number };
      const value = lastEntry.renderTime || lastEntry.loadTime;
      this.recordMetric('LCP', value);
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const firstEntry = entries[0] as PerformanceEntry & { processingStart: number };
      const value = firstEntry.processingStart - firstEntry.startTime;
      this.recordMetric('FID', value);
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.recordMetric('CLS', clsValue);
    });

    // First Contentful Paint (FCP)
    this.observeMetric('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.recordMetric('FCP', fcpEntry.startTime);
      }
    });

    // Navigation timing for TTFB
    this.observeMetric('navigation', (entries) => {
      const navEntry = entries[0] as PerformanceNavigationTiming;
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      this.recordMetric('TTFB', ttfb);
    });

    // Long tasks for performance issues
    this.observeMetric('longtask', (entries) => {
      for (const entry of entries) {
        const duration = entry.duration;
        if (duration > 50) { // Tasks longer than 50ms
          this.recordMetric('LONG_TASK', duration);
        }
      }
    });

    // Memory usage monitoring
    this.monitorMemoryUsage();

    // Resource timing for optimization insights
    this.monitorResourceTiming();
  }

  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  public recordMetric(name: string, value: number, delta: number = 0) {
    const metric: PerformanceMetric = {
      name,
      id: `${name}-${Math.round(performance.now())}`,
      value,
      delta,
      rating: this.getRating(name, value),
      navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || null,
      timestamp: Date.now(),
    };
    
    this.metrics.set(name, metric);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNavigationType(): string {
    if ('connection' in navigator) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return nav?.type || 'unknown';
    }
    return 'unknown';
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setInterval(() => {
        const usedJSHeapSize = memoryInfo.usedJSHeapSize;
        const totalJSHeapSize = memoryInfo.totalJSHeapSize;
        const usagePercentage = (usedJSHeapSize / totalJSHeapSize) * 100;
        
        this.recordMetric('MEMORY_USAGE', usagePercentage);
        
        if (usagePercentage > 80) {
          console.warn('High memory usage detected:', usagePercentage + '%');
        }
      }, 10000); // Check every 10 seconds
    }
  }

  private monitorResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        // Monitor slow resources
        const duration = entry.responseEnd - entry.requestStart;
        if (duration > 1000) { // Resources taking longer than 1 second
          console.warn('Slow resource detected:', {
            name: entry.name,
            duration,
            size: entry.transferSize,
            type: this.getResourceType(entry.name)
          });
        }

        // Monitor large resources
        if (entry.transferSize > 500000) { // Resources larger than 500KB
          console.warn('Large resource detected:', {
            name: entry.name,
            size: entry.transferSize,
            duration
          });
        }
      }
    });

    observer.observe({ type: 'resource', buffered: true });
    this.observers.push(observer);
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js)$/)) return 'javascript';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  // Public methods
  public getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  public getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  public getCoreWebVitals(): Partial<Record<string, PerformanceMetric>> {
    const coreVitals = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'];
    const result: Partial<Record<string, PerformanceMetric>> = {};
    
    for (const vital of coreVitals) {
      const metric = this.metrics.get(vital);
      if (metric) {
        result[vital] = metric;
      }
    }
    
    return result;
  }

  public getPerformanceScore(): number {
    const coreVitals = this.getCoreWebVitals();
    const scores = Object.values(coreVitals)
      .filter((m): m is PerformanceMetric => !!m)
      .map(metric => {
      switch (metric.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 50;
        case 'poor': return 0;
        default: return 50;
      }
    });
    
    return scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
  }

  public getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const coreVitals = this.getCoreWebVitals();

    if (coreVitals.LCP && coreVitals.LCP.rating !== 'good') {
      suggestions.push('Optimize Largest Contentful Paint by compressing images, using a CDN, or implementing lazy loading');
    }

    if (coreVitals.FID && coreVitals.FID.rating !== 'good') {
      suggestions.push('Reduce First Input Delay by minimizing JavaScript execution time and using web workers');
    }

    if (coreVitals.CLS && coreVitals.CLS.rating !== 'good') {
      suggestions.push('Fix Cumulative Layout Shift by specifying image dimensions and avoiding inserting content above existing content');
    }

    if (coreVitals.FCP && coreVitals.FCP.rating !== 'good') {
      suggestions.push('Improve First Contentful Paint by optimizing critical rendering path and reducing server response time');
    }

    if (coreVitals.TTFB && coreVitals.TTFB.rating !== 'good') {
      suggestions.push('Reduce Time to First Byte by optimizing server performance and using a CDN');
    }

    const memoryMetric = this.metrics.get('MEMORY_USAGE');
    if (memoryMetric && memoryMetric.value > 70) {
      suggestions.push('High memory usage detected. Consider implementing virtual scrolling or reducing JavaScript bundle size');
    }

    return suggestions;
  }

  public sendMetricsToAnalytics() {
    const metrics = this.getMetrics();
    const coreVitals = this.getCoreWebVitals();
    
    // Send to your analytics service
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      for (const [name, metric] of Object.entries(coreVitals)) {
        window.gtag!('event', name, {
          value: Math.round(metric.value),
          metric_id: metric.id,
          metric_rating: metric.rating,
          custom_parameter: true
        });
      }
    }

    // Send to your custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: metrics,
        coreVitals: coreVitals,
        performanceScore: this.getPerformanceScore(),
        suggestions: this.getOptimizationSuggestions(),
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.warn('Failed to send performance metrics:', error);
    });
  }

  public dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function initializePerformanceMonitoring(onMetric?: (metric: PerformanceMetric) => void) {
  if (typeof window === 'undefined') return null;
  
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor(onMetric);
    
    // Send metrics when the page is about to unload
    window.addEventListener('beforeunload', () => {
      performanceMonitor?.sendMetricsToAnalytics();
    });

    // Send metrics after 10 seconds to capture initial metrics
    setTimeout(() => {
      performanceMonitor?.sendMetricsToAnalytics();
    }, 10000);
  }
  
  return performanceMonitor;
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return performanceMonitor;
}

// Utility functions for manual performance tracking
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;
  
  performanceMonitor?.recordMetric(`CUSTOM_${name.toUpperCase()}`, duration);
  
  if (duration > 16) { // Longer than one frame (60fps)
    console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;
  
  performanceMonitor?.recordMetric(`ASYNC_${name.toUpperCase()}`, duration);
  
  return result;
}

// Image loading performance tracking
export function trackImagePerformance(src: string, onLoad?: () => void, onError?: () => void) {
  const start = performance.now();
  const img = new Image();
  
  img.onload = () => {
    const duration = performance.now() - start;
    performanceMonitor?.recordMetric('IMAGE_LOAD_TIME', duration);
    onLoad?.();
  };
  
  img.onerror = () => {
    const duration = performance.now() - start;
    performanceMonitor?.recordMetric('IMAGE_LOAD_ERROR', duration);
    onError?.();
  };
  
  img.src = src;
  return img;
}

export type { PerformanceMetric, WebVitalsThresholds };

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}