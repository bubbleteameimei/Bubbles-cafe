/**
 * Analytics API Client
 * 
 * Functions for interacting with the analytics API endpoints.
 */

import { ReadingTimeAnalytics } from '@/types/analytics';
import { getApiBaseUrl } from '@/lib/asset-path';

export interface SiteAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  avgReadTime: number;
  bounceRate: number;
}

export interface DeviceDistribution {
  desktop: number;
  mobile: number;
  tablet: number;
}

/**
 * Fetches reading time analytics data - uses public endpoint that doesn't require authentication
 */
export async function getReadingTimeAnalytics(): Promise<ReadingTimeAnalytics> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/analytics/reading-time-test` : '/api/analytics/reading-time-test';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch reading time analytics');
  }
  
  return response.json();
}

/**
 * Fetches device analytics data - uses public endpoint that doesn't require authentication
 */
export async function getDeviceAnalytics(): Promise<any> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/analytics/devices-test` : '/api/analytics/devices-test';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch device analytics');
  }
  
  return response.json();
}

/**
 * Fetches site-wide analytics data
 */
export async function getSiteAnalytics(): Promise<SiteAnalytics> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/analytics/site-test` : '/api/analytics/site-test';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch site analytics');
  }
  
  return response.json();
}

/**
 * Fetches device distribution analytics
 */
export async function getDeviceDistribution(): Promise<DeviceDistribution> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/analytics/device-distribution-test` : '/api/analytics/device-distribution-test';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch device distribution');
  }
  
  return response.json();
}

/**
 * Submits client-side performance metrics to the server
 */
export async function submitPerformanceMetrics(metrics: Record<string, any>): Promise<void> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/analytics/vitals` : '/api/analytics/vitals';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metrics),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit performance metrics');
  }
  
  return response.json();
}

/**
 * Records a page view event
 */
export async function recordPageView(
  path: string,
  referrer: string = document.referrer
): Promise<void> {
  try {
    const API_BASE = getApiBaseUrl();
    const url = API_BASE ? `${API_BASE}/api/analytics/pageview` : '/api/analytics/pageview';
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        referrer,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      }),
      signal: controller.signal,
      credentials: 'include',
      keepalive: true,
    });
    clearTimeout(t);
  } catch (error) {
    // Swallow to avoid noisy console in Replit envs
  }
}

/**
 * Records a user interaction event
 */
export async function recordInteraction(
  interactionType: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    const API_BASE = getApiBaseUrl();
    const url = API_BASE ? `${API_BASE}/api/analytics/interaction` : '/api/analytics/interaction';
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interactionType,
        details,
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
      }),
      credentials: 'include',
      keepalive: true,
    });
  } catch (error) {
    console.warn(`Failed to record ${interactionType} interaction:`, error);
  }
}

/**
 * Fetches engagement metrics - uses public endpoint that doesn't require authentication
 */
export async function getEngagementMetrics(): Promise<any> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/analytics/engagement-test` : '/api/analytics/engagement-test';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch engagement metrics');
  }
  
  return response.json();
}

/**
 * Track user engagement metrics (views, time spent, interactions)
 */
export async function trackUserEngagement(
  postId: number,
  engagementData: {
    timeSpentSeconds: number;
    scrollPercentage: number;
    interactionCount: number;
    deviceType?: string;
    isCompleted?: boolean;
  }
): Promise<any> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/analytics/engagement/track` : '/api/analytics/engagement/track';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      postId,
      ...engagementData,
      timestamp: new Date().toISOString(),
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to track engagement');
  }
  
  return response.json();
}

/**
 * Sync user engagement data with WordPress
 */
export async function syncEngagementWithWordPress(
  postId: number,
  wordpressPostId: number,
  engagementStats: {
    totalViews: number;
    avgTimeSpent: number;
    engagementRate: number;
  }
): Promise<any> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/analytics/sync-wordpress` : '/api/analytics/sync-wordpress';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      postId,
      wordpressPostId,
      ...engagementStats,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to sync engagement with WordPress');
  }

  return response.json();
}

/**
 * Trigger server-side sync of all engagement metrics to WordPress
 */
export async function triggerWordPressEngagementSync(): Promise<any> {
  const API_BASE = getApiBaseUrl();
  const url = API_BASE ? `${API_BASE}/api/wordpress/sync-engagement` : '/api/wordpress/sync-engagement';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to sync engagement with WordPress');
  }

  return response.json();
}
