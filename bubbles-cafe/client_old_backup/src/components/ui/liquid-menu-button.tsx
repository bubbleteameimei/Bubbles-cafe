import { useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils";

interface LiquidMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function LiquidMenuButton({ onClick, className }: LiquidMenuButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [droplets, setDroplets] = useState<{ id: number; delay: number; left: number }[]>([]);

  const createDroplet = useCallback(() => {
    const id = Date.now();
    const delay = Math.random() * 300; // Reduced delay for faster animation
    const left = Math.random() * 20 - 10; // Random position between -10px and 10px
    return { id, delay, left };
  }, []);

  const handleClick = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      // Create multiple droplets with different delays and positions
      setDroplets([
        createDroplet(),
        createDroplet(),
        createDroplet(),
        createDroplet(),
        createDroplet() // Added more droplets for better effect
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
          "relative w-6 h-6 rounded-lg bg-[hsl(0,100%,15%)] text-primary-foreground", // Reduced size
          "hover:bg-[hsl(0,100%,12%)] transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
      >
        {/* Menu Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-0.5">
          <span className="w-2.5 h-0.5 bg-primary-foreground rounded-full transition-transform duration-200" /> {/* Reduced size */}
          <span className="w-2.5 h-0.5 bg-primary-foreground rounded-full transition-transform duration-200" />
          <span className="w-2.5 h-0.5 bg-primary-foreground rounded-full transition-transform duration-200" />
        </div>

        {/* Blood dripping effects */}
        <div className="blood-container">
          {isAnimating && droplets.map(({ id, delay, left }) => (
            <div key={id} style={{ position: 'absolute', left: `${left}px`, animationDelay: `${delay}ms` }}>
              <div 
                className={cn("blood-drip", isAnimating && "animate")}
              />
              <div 
                className={cn("blood-droplet", isAnimating && "animate")}
              />
              <div 
                className={cn("blood-ripple", isAnimating && "animate")}
              />
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}