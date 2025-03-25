// API functions to interact with analytics endpoints

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
 * Fetches site-wide analytics data
 */
export async function getSiteAnalytics(): Promise<SiteAnalytics> {
  try {
    const response = await fetch('/api/analytics/site');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      totalViews: data.totalViews || 0,
      uniqueVisitors: data.uniqueVisitors || 0,
      avgReadTime: data.avgReadTime || 0,
      bounceRate: data.bounceRate || 0
    };
  } catch (error) {
    console.error('Error fetching site analytics:', error);
    // Return default values if there's an error
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      avgReadTime: 0,
      bounceRate: 0
    };
  }
}

/**
 * Fetches device distribution analytics
 */
export async function getDeviceDistribution(): Promise<DeviceDistribution> {
  try {
    const response = await fetch('/api/analytics/devices');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch device distribution: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching device distribution:', error);
    // Return default values if there's an error
    return {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };
  }
}

/**
 * Submits client-side performance metrics to the server
 */
export async function submitPerformanceMetrics(metrics: Record<string, any>): Promise<void> {
  try {
    await fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics)
    });
  } catch (error) {
    console.error('Error submitting performance metrics:', error);
  }
}