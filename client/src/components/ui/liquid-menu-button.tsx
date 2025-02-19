import { useState } from 'react';
import { cn } from "@/lib/utils";

interface LiquidMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function LiquidMenuButton({ onClick, className }: LiquidMenuButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    // Reset animation after completion
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <button 
      onClick={handleClick}
      className={cn(
        "relative w-12 h-12 rounded-lg bg-primary/90 text-primary-foreground",
        "hover:bg-primary/80 transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isAnimating && "animate-liquid",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-[#6b3536] liquid-bg" />
        {isAnimating && (
          <div className="drops">
            <div className="drop1" />
            <div className="drop2" />
          </div>
        )}
      </div>
      
      {/* SVG Filter for liquid effect */}
      <svg width="0" height="0">
        <defs>
          <filter id="liquid">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="liquid" />
          </filter>
        </defs>
      </svg>

      {/* Menu Icon */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-1.5">
        <span className="w-5 h-0.5 bg-primary-foreground rounded-full" />
        <span className="w-5 h-0.5 bg-primary-foreground rounded-full" />
        <span className="w-5 h-0.5 bg-primary-foreground rounded-full" />
      </div>
    </button>
  );
}
