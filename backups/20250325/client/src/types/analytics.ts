// Interfaces for analytics data

// Reading Analytics Data
export interface TopStory {
  id: number;
  title: string;
  slug: string;
  avgReadingTime: number;
  views: number;
}

export interface ReadingTimeDataPoint {
  date: string;
  avgTime: number;
  scrollDepth: number;
  storyViews: number;
}

export interface ReadingTimeChangeRate {
  value: number;
  trend: 'up' | 'down';
}

export interface ReadingTimeOverallStats {
  avgReadingTime: number;
  totalViews: number;
  bounceRate: number;
  averageScrollDepth: number;
  changeFromLastPeriod: {
    readingTime: ReadingTimeChangeRate;
    views: ReadingTimeChangeRate;
  };
}

export interface ReadingTimeAnalytics {
  dailyData: ReadingTimeDataPoint[];
  weeklyData: ReadingTimeDataPoint[];
  monthlyData: ReadingTimeDataPoint[];
  topStories: TopStory[];
  overallStats: ReadingTimeOverallStats;
}

// Device Analytics Data
export interface DeviceDataPoint {
  date: string;
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface DeviceTotals {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface DevicePercentageChange {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface DeviceAnalytics {
  dailyData: DeviceDataPoint[];
  weeklyData: DeviceDataPoint[];
  monthlyData: DeviceDataPoint[];
  totals: DeviceTotals;
  percentageChange: DevicePercentageChange;
}

// Dashboard Analytics Data
export interface DashboardAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  avgReadTime: number;
  bounceRate: number;
  viewsChangePercent: number;
  visitorsChangePercent: number;
  readTimeChangePercent: number;
  bounceRateChangePercent: number;
}

// General Analytics Types
export type PeriodType = 'day' | 'week' | 'month';
export type ChartType = 'line' | 'bar' | 'area' | 'pie';