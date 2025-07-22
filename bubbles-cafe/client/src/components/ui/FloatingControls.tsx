import React from 'react';
import { cn } from "@/lib/utils";
import FullscreenButton from "@/components/FullscreenButton";
// ScrollToTopButton import removed as the feature has been completely removed

interface FloatingControlsProps {
  position?: "right" | "left";
  className?: string;
  showLabels?: boolean;
  showFullscreenButton?: boolean;
  // showScrollToTopButton property removed as the feature has been completely removed
}

const FloatingControls: React.FC<FloatingControlsProps> = ({
  position = "right",
  className = "",
  showLabels = false,
  showFullscreenButton = true
}) => {
  // Position classes
  const positionClasses = {
    "right": "right-6",
    "left": "left-6"
  };

  return (
    <div className={cn(
      "fixed z-50 flex flex-col gap-4",
      positionClasses[position],
      className
    )}>
      {showFullscreenButton && (
        <div className="top-6">
          <FullscreenButton 
            position={position === "right" ? "top-right" : "top-left"} 
            showLabel={showLabels} 
            className="!static"
          />
        </div>
      )}
      
      {/* ScrollToTopButton section removed as the feature has been completely removed */}
    </div>
  );
};

export default FloatingControls;