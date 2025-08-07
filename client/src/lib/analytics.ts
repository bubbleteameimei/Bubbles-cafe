// Lightweight client helper wrappers for the /api/analytics endpoints.
// This placeholder returns mocked data so that Admin Analytics dashboard compiles.
// Replace with real fetch logic as soon as the backend is finalised.

export interface ReadingTimeAnalytics {
  totalReadTime: number
  averageReadTime: number
  totalPosts: number
  uniqueVisitors: number
  avgReadTime: number
  bounceRate: number
}

export interface EngagementMetrics {
  totalReadingTime: number
  averageSessionDuration: number
  totalUsers: number
  activeUsers: number
  interactions: number
  pageViews: number
  returning: number
}

const mockReading: ReadingTimeAnalytics = {
  totalReadTime: 0,
  averageReadTime: 0,
  totalPosts: 0,
  uniqueVisitors: 0,
  avgReadTime: 0,
  bounceRate: 0,
}

const mockEngagement: EngagementMetrics = {
  totalReadingTime: 0,
  averageSessionDuration: 0,
  totalUsers: 0,
  activeUsers: 0,
  interactions: 0,
  pageViews: 0,
  returning: 0,
}

export async function getReadingTimeAnalytics(): Promise<ReadingTimeAnalytics> {
  try {
    const res = await fetch('/api/analytics/reading-time')
    if (!res.ok) throw new Error('Network response was not ok')
    return (await res.json()) as ReadingTimeAnalytics
  } catch (_err) {
    // Fallback so dashboard can still render
    return mockReading
  }
}

export async function getEngagementMetrics(): Promise<EngagementMetrics> {
  try {
    const res = await fetch('/api/analytics/engagement')
    if (!res.ok) throw new Error('Network response was not ok')
    return (await res.json()) as EngagementMetrics
  } catch (_err) {
    return mockEngagement
  }
}