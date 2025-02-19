import { useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils";

interface LiquidMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function LiquidMenuButton({ onClick, className }: LiquidMenuButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [droplets, setDroplets] = useState<{ id: number; delay: number }[]>([]);

  const createDroplet = useCallback(() => {
    const id = Date.now();
    const delay = Math.random() * 500;
    return { id, delay };
  }, []);

  const handleClick = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      // Create multiple droplets with different delays
      setDroplets([
        createDroplet(),
        createDroplet(),
        createDroplet()
      ]);

      // Reset animation after completion
      setTimeout(() => {
        setIsAnimating(false);
        setDroplets([]);
      }, 2000);
    }
    onClick();
  }, [isAnimating, onClick, createDroplet]);

  useEffect(() => {
    return () => {
      setIsAnimating(false);
      setDroplets([]);
    };
  }, []);

  return (
    <div className="menu-button-container">
      <button 
        onClick={handleClick}
        className={cn(
          "liquid-menu-button",
          "relative w-8 h-8 rounded-lg bg-[hsl(0,100%,15%)] text-primary-foreground",
          "hover:bg-[hsl(0,100%,12%)] transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
      >
        {/* Menu Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-0.5">
          <span className="w-3.5 h-0.5 bg-primary-foreground rounded-full transition-transform duration-200" />
          <span className="w-3.5 h-0.5 bg-primary-foreground rounded-full transition-transform duration-200" />
          <span className="w-3.5 h-0.5 bg-primary-foreground rounded-full transition-transform duration-200" />
        </div>
      </button>

      {/* Blood dripping effects */}
      <div className="blood-container">
        {isAnimating && droplets.map(({ id, delay }) => (
          <div key={id} style={{ animationDelay: `${delay}ms` }}>
            <div 
              className={cn("blood-drip", isAnimating && "animate")}
              style={{ left: `${Math.random() * 20 - 10}px` }}
            />
            <div 
              className={cn("blood-droplet", isAnimating && "animate")}
              style={{ left: `${Math.random() * 20 - 10}px` }}
            />
            <div 
              className={cn("blood-ripple", isAnimating && "animate")}
              style={{ left: `${Math.random() * 20 - 10}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}