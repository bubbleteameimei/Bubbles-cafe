
import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Default to desktop in SSR
    const defaultInfo: DeviceInfo = {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: 'desktop',
      orientation: 'landscape',
      touchSupported: false,
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
      viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 1080
    };
    
    // Return default in SSR
    if (typeof window === 'undefined') {
      return defaultInfo;
    }
    
    return getDeviceInfo();
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    // Initial update
    handleResize();

    // Add listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}

// Helper for consistent device detection
function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Device type breakpoints
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  let deviceType: DeviceType = 'desktop';
  if (isMobile) deviceType = 'mobile';
  if (isTablet) deviceType = 'tablet';
  
  // Detect orientation
  const orientation = height > width ? 'portrait' : 'landscape';
  
  // Check for touch support
  const touchSupported = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    (navigator as any).msMaxTouchPoints > 0;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    orientation,
    touchSupported,
    viewportWidth: width,
    viewportHeight: height
  };
}

// Legacy hook for backward compatibility
export function useMobile(): boolean {
  const { isMobile } = useDeviceDetection();
  return isMobile;
}

export default useMobile;
