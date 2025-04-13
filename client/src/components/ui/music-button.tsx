import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Volume1, Volume, Minus, Plus } from 'lucide-react';
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

  // Handle key events for volume controls
  useEffect(() => {
    // Hide volume controls after 3 seconds of inactivity
    if (showVolumeControls) {
      const timer = setTimeout(() => {
        setShowVolumeControls(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showVolumeControls, volume]);

  // Increase volume by 10%
  const increaseVolume = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVolume(Math.min(1, volume + 0.1));
    setShowVolumeControls(true);
  };

  // Decrease volume by 10%
  const decreaseVolume = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVolume(Math.max(0, volume - 0.1));
    setShowVolumeControls(true);
  };

  // Get the appropriate volume icon based on the volume level
  const VolumeIcon = () => {
    if (!isPlaying) return <VolumeX className="h-4 w-4" />;
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.33) return <Volume className="h-4 w-4" />;
    if (volume < 0.66) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <div className="relative flex items-center gap-1">
      {/* Volume controls */}
      {isPlaying && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={decreaseVolume}
            className="h-6 w-6 rounded-md hover:bg-accent/50 transition-all duration-150 active:scale-95"
            aria-label="Decrease volume"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMusic}
                  className={cn(
                    "h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-150 active:scale-95",
                    isPlaying && "text-primary border-primary/40",
                    className
                  )}
                  aria-label={isPlaying ? "Toggle music" : "Play music"}
                >
                  <VolumeIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPlaying ? `Ambient Music: ${Math.round(volume * 100)}%` : "Ambient Music: Off"}</p>
                <p className="text-xs text-muted-foreground mt-1">Click +/- buttons to adjust volume</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={increaseVolume}
            className="h-6 w-6 rounded-md hover:bg-accent/50 transition-all duration-150 active:scale-95"
            aria-label="Increase volume"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </>
      )}
      
      {/* Just the toggle button when music is off */}
      {!isPlaying && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMusic}
                className={cn(
                  "h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-150 active:scale-95",
                  className
                )}
                aria-label="Play music"
              >
                <VolumeIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ambient Music: Off</p>
              <p className="text-xs text-muted-foreground mt-1">Click to turn on</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}