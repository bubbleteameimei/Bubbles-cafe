// Lightweight client-side metrics instrumentation
// - Core Web Vitals via dynamic import to avoid adding to main bundle
// - Page views and interactions via existing analytics API helpers

import { recordPageView, recordInteraction } from '@/api/analytics';

type ReportHandler = (metric: any) => void;

function sendVitals(metric: any) {
  try {
    fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metricName: metric.name,
        value: metric.value,
        identifier: metric.id || `vital-${Date.now()}`,
        navigationType: (metric as any).navigationType || 'navigation',
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
      credentials: 'include',
    }).catch(() => {});
  } catch {}
}

export async function startWebVitals() {
  try {
    // web-vitals v4 uses on* APIs instead of get*
    const { onCLS, onFID, onLCP, onFCP, onTTFB } = await import('web-vitals');
    const report: ReportHandler = sendVitals;
    onCLS(report);
    onFID(report);
    onLCP(report);
    onFCP(report);
    onTTFB(report);
  } catch (e) {
    // Silently ignore if web-vitals cannot be loaded
  }
}

export function trackPageView(path?: string) {
  try {
    recordPageView(path || window.location.pathname).catch(() => {});
  } catch {}
}

export function trackInteraction(interactionType: string, details: Record<string, any> = {}) {
  try {
    recordInteraction(interactionType, details).catch(() => {});
  } catch {}
}

export function sendPerformanceSummary() {
  try {
    // Use Navigation Timing if available
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const summary = nav
      ? {
          domContentLoaded: Math.max(0, nav.domContentLoadedEventEnd - nav.startTime),
          firstByte: Math.max(0, nav.responseStart - nav.requestStart),
          loadEvent: Math.max(0, nav.loadEventEnd - nav.startTime),
          transferSize: (nav as any).transferSize ?? undefined,
          encodedBodySize: (nav as any).encodedBodySize ?? undefined,
          decodedBodySize: (nav as any).decodedBodySize ?? undefined,
        }
      : undefined;

    const payload = {
      metrics: summary,
      coreVitals: null,
      performanceScore: undefined,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
    };

    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'include',
    }).catch(() => {});
  } catch {}
}

export function schedulePerformanceSummary() {
  try {
    const schedule = (cb: () => void) =>
      (window as any).requestIdleCallback ? (window as any).requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 1000);
    schedule(() => sendPerformanceSummary());
  } catch {}
}

