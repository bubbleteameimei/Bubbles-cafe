// Performance optimization types
export interface LazyComponentProps {
  fallback?: React.ComponentType;
  timeout?: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  loadTime: number;
  interactionTime: number;
}

// Optimize bundle splitting with specific component types
export interface AsyncComponentLoader<T = any> {
  component: () => Promise<{ default: React.ComponentType<T> }>;
  loading?: React.ComponentType;
  error?: React.ComponentType<{ error: Error; retry: () => void }>;
}

// Memory optimization for large lists
export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactElement;
  overscan?: number;
}

// Performance monitoring interface
export interface PerformanceTracker {
  mark: (name: string) => void;
  measure: (name: string, startMark: string, endMark?: string) => number;
  getMetrics: () => PerformanceMetrics;
}