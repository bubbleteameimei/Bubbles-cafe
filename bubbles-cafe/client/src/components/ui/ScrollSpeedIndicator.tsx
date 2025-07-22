import React from 'react';

interface ScrollSpeedIndicatorProps {
  scrollType: 'normal' | 'fast' | 'slow';
  visible: boolean;
}

/**
 * This component has been disabled to remove visual indicators
 * It now returns null while maintaining the same interface for backward compatibility
 */
const ScrollSpeedIndicator: React.FC<ScrollSpeedIndicatorProps> = () => {
  // Always return null - no visual indicator will be shown
  return null;
};

export default ScrollSpeedIndicator;