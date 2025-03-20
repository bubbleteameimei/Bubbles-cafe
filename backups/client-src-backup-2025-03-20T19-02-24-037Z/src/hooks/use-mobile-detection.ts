
import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if the device is mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check if it's a touch device
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    // Initial checks
    checkMobile();
    checkTouchDevice();

    // Set up listener for window resize
    window.addEventListener('resize', checkMobile);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return { isMobile, isTouchDevice };
};

export default useMobileDetection;
