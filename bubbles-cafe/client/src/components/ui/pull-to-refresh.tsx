import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullDistance?: number;
  loadingIndicator?: React.ReactNode;
}

/**
 * PullToRefresh component that allows users to pull down the page to refresh content
 * 
 * Usage:
 * <PullToRefresh onRefresh={async () => { await refetchData(); }}>
 *   <YourContent />
 * </PullToRefresh>
 */
export function PullToRefresh({
  onRefresh,
  children,
  pullDistance = 100,
  loadingIndicator
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullPosition, setPullPosition] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const thresholdReached = pullPosition >= pullDistance;
  
  // Touch tracking variables
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh at the top of the page
      if (window.scrollY > 0) return;
      
      // Record the starting Y position
      startYRef.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // If we're already refreshing or not at the top of the page, ignore
      if (isRefreshing || window.scrollY > 0 || startYRef.current === null) return;
      
      // Calculate how far we've pulled down
      const currentY = e.touches[0].clientY;
      const pullDistance = currentY - startYRef.current;
      
      // Only show pull effect when pulling down (positive pullDistance)
      if (pullDistance > 0) {
        // Add resistance to make the pull feel more natural
        const resistance = 0.4;
        const dampedDistance = Math.min(pullDistance * resistance, 150);
        
        setPullPosition(dampedDistance);
        
        // Prevent default scrolling behavior while pulling
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = () => {
      // If we've pulled far enough, trigger the refresh
      if (thresholdReached && !isRefreshing) {
        setIsRefreshing(true);
        onRefresh().finally(() => {
          // Reset after refresh is complete
          setTimeout(() => {
            setIsRefreshing(false);
            setPullPosition(0);
          }, 700); // Slightly longer delay for animation
        });
      } else {
        // Reset if we didn't pull far enough
        setPullPosition(0);
      }
      
      // Reset the starting position
      startYRef.current = null;
    };
    
    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    // Clean up event listeners
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, onRefresh, thresholdReached, pullDistance]);
  
  return (
    <div ref={containerRef} className="relative w-full min-h-full">
      {/* Pull indicator */}
      <AnimatePresence>
        {pullPosition > 0 && (
          <motion.div 
            className="absolute left-0 right-0 flex justify-center items-center z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: Math.min(pullPosition / 40, 1), 
              y: 0,
              scale: thresholdReached ? 1.1 : 1
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ top: `${pullPosition}px` }}
          >
            {isRefreshing ? (
              loadingIndicator || <RefreshIndicator />
            ) : (
              <PullDownIcon 
                progress={Math.min(pullPosition / pullDistance, 1)} 
                isTriggered={thresholdReached} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content container */}
      <motion.div
        style={{ y: pullPosition }}
        animate={{ y: pullPosition }}
        transition={{ 
          type: pullPosition > 0 ? "tween" : "spring", 
          stiffness: 300, 
          damping: 30,
          duration: pullPosition > 0 ? 0 : 0.4
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface PullDownIconProps {
  progress: number;
  isTriggered: boolean;
}

function PullDownIcon({ progress, isTriggered }: PullDownIconProps) {
  const fillColor = isTriggered ? "#22c55e" : "#800000"; // Green when triggered, dark red (primary) when not
  
  return (
    <div className="relative">
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "transition-transform duration-300 ease-out",
          isTriggered ? "rotate-180" : "rotate-0"
        )}
      >
        {/* Outer circle */}
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          className={cn(
            "text-muted-foreground transition-colors duration-200",
            isTriggered ? "text-green-500" : "text-primary"
          )}
          strokeOpacity="0.3"
        />
        
        {/* Progress arc */}
        <motion.path
          d={describeArc(12, 12, 10, 0, progress * 360)}
          stroke={fillColor}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Down arrow */}
        <motion.path
          d="M12 8v8M8 12l4 4 4-4"
          stroke={fillColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ y: -2, opacity: 0.5 }}
          animate={{ 
            y: isTriggered ? 2 : 0,
            opacity: isTriggered ? 1 : 0.7
          }}
          transition={{ duration: 0.2 }}
        />
      </svg>
      
      {/* Text hint */}
      <motion.div 
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: progress > 0.3 ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        <span className={cn(
          "transition-colors duration-200",
          isTriggered ? "text-green-500" : "text-primary"
        )}>
          {isTriggered ? "Release to refresh" : "Pull to refresh"}
        </span>
      </motion.div>
    </div>
  );
}

function RefreshIndicator() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-10 h-10">
        {/* Static circle */}
        <svg width="40" height="40" viewBox="0 0 24 24" className="absolute inset-0 text-primary/30">
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none"
          />
        </svg>
        
        {/* Animated spinner */}
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          className="absolute inset-0 text-primary animate-spin"
          style={{ animationDuration: '1.5s' }}
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
            fill="none"
            strokeDasharray="30 200"
          />
        </svg>
      </div>
      
      <motion.span
        className="text-xs font-medium mt-2 text-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Refreshing...
      </motion.span>
    </div>
  );
}

// Helper function to describe an arc path for SVG
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}