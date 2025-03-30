import React from 'react';
import { cn } from "@/lib/utils";
import FullscreenButton from "@/components/FullscreenButton";
import FixedScrollToTopButton from "@/components/FixedScrollToTopButton";

interface FloatingControlsProps {
  position?: "right" | "left";
  className?: string;
  showLabels?: boolean;
  showFullscreenButton?: boolean;
  showScrollToTopButton?: boolean;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({
  position = "right",
  className = "",
  showLabels = false,
  showFullscreenButton = true,
  showScrollToTopButton = true
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
      
      {showScrollToTopButton && (
        <div className="mt-4">
          <FixedScrollToTopButton 
            showLabel={showLabels} 
          />
        </div>
      )}
    </div>
  );
};

export default FloatingControls;