import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Volume1, Volume, ChevronDown, ChevronUp } from 'lucide-react';
import { useMusic } from '@/contexts/music-context';
import type { PlaybackContext } from '@/contexts/music-context';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MusicButtonProps {
  className?: string;
}

export function MusicButton({ className }: MusicButtonProps) {
  const { 
    isPlaying, 
    toggleMusic, 
    volume, 
    setVolume,
    setPlaybackContext,
    storePlaybackPosition
  } = useMusic();
  
  const [showVolumeControls, setShowVolumeControls] = useState(false);
  const [location] = useLocation();
  // To detect if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile when component mounts
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Map current location to a playback context
  useEffect(() => {
    let context: PlaybackContext = 'general';
    
    // Determine context based on current location
    if (location.startsWith('/reader') || location.includes('/post/')) {
      context = 'reader';
    } else if (location.startsWith('/game')) {
      context = 'game';
    } else if (location.startsWith('/settings')) {
      context = 'settings';
    } else if (location === '/') {
      context = 'homepage';
    }
    
    // Update music context
    setPlaybackContext(context);
  }, [location, setPlaybackContext]);

  // Handle visibility changes to pause/resume music
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from the tab
        if (isPlaying) {
          storePlaybackPosition();  // Save position before pausing
        }
      } else {
        // User returned to the tab - we could auto-resume here if desired
        // For now, just leave it paused until user manually resumes
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, storePlaybackPosition]);
  
  // Handle volume adjustment with wheel events for desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (!isPlaying) return;
    
    e.preventDefault();
    const delta = e.deltaY;
    // Scroll up increases volume, scroll down decreases
    const volumeChange = delta > 0 ? -0.05 : 0.05;
    const newVolume = Math.max(0, Math.min(1, volume + volumeChange));
    setVolume(newVolume);
  };
  
  // Increase volume (for both desktop and mobile)
  const increaseVolume = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVolume = Math.min(1, volume + 0.1);
    setVolume(newVolume);
    setShowVolumeControls(true);
  };
  
  // Decrease volume (for both desktop and mobile)
  const decreaseVolume = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVolume = Math.max(0, volume - 0.1);
    setVolume(newVolume);
    setShowVolumeControls(true);
  };
  
  // Handle long press for mobile
  const handleLongPress = () => {
    if (isPlaying) {
      setShowVolumeControls(!showVolumeControls);
    }
  };

  // Get the appropriate volume icon based on the volume level
  const VolumeIcon = () => {
    if (!isPlaying) return <VolumeX className="h-4 w-4" />;
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.33) return <Volume className="h-4 w-4" />;
    if (volume < 0.66) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  // Auto-hide volume controls after 3 seconds
  useEffect(() => {
    if (showVolumeControls) {
      const timer = setTimeout(() => {
        setShowVolumeControls(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showVolumeControls]);

  return (
    <div className="relative">
      {/* Main music button with tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMusic}
              onWheel={handleWheel}
              onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress();
              }}
              onTouchStart={() => {
                if (isPlaying) {
                  const timer = setTimeout(() => handleLongPress(), 500);
                  // Clear the timer on touch end
                  const clearTimer = () => {
                    clearTimeout(timer);
                    document.removeEventListener('touchend', clearTimer);
                  };
                  document.addEventListener('touchend', clearTimer, { once: true });
                }
              }}
              className={cn(
                "h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-150 active:scale-95 mt-2",
                isPlaying && "text-primary border-primary/40",
                className
              )}
              aria-label={isPlaying ? "Toggle music" : "Play music"}
            >
              <VolumeIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying ? (
              <>
                <p>Ambient Music: {Math.round(volume * 100)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isMobile ? 'Long-press for volume controls' : 'Scroll or right-click for volume'}
                </p>
              </>
            ) : (
              <>
                <p>Ambient Music: Off</p>
                <p className="text-xs text-muted-foreground mt-1">Click to turn on</p>
              </>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Volume controls that show on long press/right click */}
      {isPlaying && showVolumeControls && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-card rounded-md shadow-md border border-border p-2 z-50 flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={increaseVolume}
            className="h-8 w-8 rounded-md hover:bg-accent/50"
            aria-label="Increase volume"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          
          <div className="text-xs font-medium my-1">{Math.round(volume * 100)}%</div>
          
          <Button
            variant="ghost" 
            size="icon"
            onClick={decreaseVolume}
            className="h-8 w-8 rounded-md hover:bg-accent/50"
            aria-label="Decrease volume"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}