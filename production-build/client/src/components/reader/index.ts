// This is a placeholder file with minimal implementations to maintain compatibility
// with responsive-demo.tsx while removing the enhanced reader components

// Define DeviceType type
export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';

// Simple function to detect device type based on window width
export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1280) return 'laptop';
  return 'desktop';
}

// Simple placeholder for ResponsiveStoryPage component
export const ResponsiveStoryPage = (props: any) => {
  // Component removed in favor of standard reader page
  console.warn('ResponsiveStoryPage is deprecated. Use standard reader page instead.');
  return props.children || null;
};