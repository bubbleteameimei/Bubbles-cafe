import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Volume1, Volume } from 'lucide-react';
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
  
  // Handle volume adjustment with wheel events
  const handleWheel = (e: React.WheelEvent) => {
    if (!isPlaying) return;
    
    e.preventDefault();
    const delta = e.deltaY;
    // Scroll up increases volume, scroll down decreases
    const volumeChange = delta > 0 ? -0.05 : 0.05;
    const newVolume = Math.max(0, Math.min(1, volume + volumeChange));
    setVolume(newVolume);
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMusic}
            onWheel={handleWheel}
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
              <p className="text-xs text-muted-foreground mt-1">Scroll to adjust volume</p>
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
  );
}