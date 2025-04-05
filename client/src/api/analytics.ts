/**
 * Analytics API Client
 * 
 * Functions for interacting with the analytics API endpoints.
 */

import { ReadingTimeAnalytics } from '@/types/analytics';

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
  const response = await fetch('/api/analytics/reading-time', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch('/api/analytics/devices', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch('/api/analytics/site', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch('/api/analytics/devices', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch('/api/analytics/vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metrics),
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
    await fetch('/api/analytics/pageview', {
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
    });
  } catch (error) {
    console.warn('Failed to record page view:', error);
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
    await fetch('/api/analytics/interaction', {
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
    });
  } catch (error) {
    console.warn(`Failed to record ${interactionType} interaction:`, error);
  }
}

/**
 * Fetches engagement metrics - uses public endpoint that doesn't require authentication
 */
export async function getEngagementMetrics(): Promise<any> {
  const response = await fetch('/api/analytics/engagement', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch engagement metrics');
  }
  
  return response.json();
}