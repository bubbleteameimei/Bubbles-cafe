// Lightweight client-side metrics instrumentation
// - Core Web Vitals via dynamic import to avoid adding to main bundle
// - Page views and interactions via existing analytics API helpers
// - Respect user cookie consent for analytics and performance categories

import { recordPageView, recordInteraction } from '@/api/analytics';
import { getApiBaseUrl } from '@/lib/asset-path';
import { isCategoryAllowed } from '@/lib/cookie-manager';

type ReportHandler = (metric: any) => void;

function sendVitals(metric: any) {
  try {
    const API_BASE = getApiBaseUrl();
    const url = API_BASE ? `${API_BASE}/api/analytics/vitals` : '/api/analytics/vitals';
    fetch(url, {
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
    // Only run if performance cookies are allowed
    if (!isCategoryAllowed('performance')) return;

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
    // Only record page views if analytics cookies are allowed
    if (!isCategoryAllowed('analytics')) return;
    recordPageView(path || window.location.pathname).catch(() => {});
  } catch {}
}

export function trackInteraction(interactionType: string, details: Record<string, any> = {}) {
  try {
    // Consider interactions as analytics
    if (!isCategoryAllowed('analytics')) return;
    recordInteraction(interactionType, details).catch(() => {});
  } catch {}
}

export function sendPerformanceSummary() {
  try {
    if (!isCategoryAllowed('performance')) return;

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

    const API_BASE = getApiBaseUrl();
    const url = API_BASE ? `${API_BASE}/api/analytics/performance` : '/api/analytics/performance';
    fetch(url, {
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
    if (!isCategoryAllowed('performance')) return;

    const schedule = (cb: () => void) =>
      (window as any).requestIdleCallback ? (window as any).requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 1000);
    schedule(() => sendPerformanceSummary());
  } catch {}
}

/**
 * Log once-per-session helper to reduce repeated console/network noise.
 * Uses sessionStorage gate keyed by the provided id.
 */
export function logOnce(id: string, message: string, extra?: Record<string, any>) {
  try {
    const key = `log_once_${id}`;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) return;
    try { sessionStorage.setItem(key, '1'); } catch {}
    // Console for immediate visibility
    try { console.warn(`[once] ${message}`, extra || ''); } catch {}
    // Optional: send to server errors endpoint
    try {
      const API_BASE = getApiBaseUrl();
      const url = API_BASE ? `${API_BASE}/api/errors` : '/api/errors';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        keepalive: true,
        body: JSON.stringify({ id, message, extra }),
      }).catch(() => {});
    } catch {}
  } catch {}
}

