import React, { useState, useEffect } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

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
    storePlaybackPosition,
    resumeFromContext
  } = useMusic();
  
  const [open, setOpen] = useState(false);
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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  if (!open) {
                    toggleMusic();
                  }
                }}
                className={cn(
                  "h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-150 active:scale-95 mt-2 relative",
                  isPlaying && "text-primary border-primary/40",
                  className
                )}
                aria-label={isPlaying ? "Adjust music" : "Play music"}
              >
                <VolumeIcon />
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-medium leading-none mb-2">Music Controls</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Volume</span>
                <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0] / 100)}
                className="mt-2"
              />
              {/* Context-aware controls */}
              <div className="flex flex-col gap-2">
                <div className="text-xs text-muted-foreground">
                  <span>Current context: </span>
                  <span className="font-semibold text-primary capitalize">{location.startsWith('/') ? location.substring(1) || 'homepage' : location}</span>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (isPlaying) {
                      toggleMusic();
                    }
                    setOpen(false);
                  }}
                >
                  {isPlaying ? "Pause" : "Music Off"}
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    if (!isPlaying) {
                      // Context-aware resume
                      let context: PlaybackContext = 'general';
                      
                      if (location.startsWith('/reader') || location.includes('/post/')) {
                        context = 'reader';
                      } else if (location.startsWith('/game')) {
                        context = 'game';
                      } else if (location.startsWith('/settings')) {
                        context = 'settings';
                      } else if (location === '/') {
                        context = 'homepage';
                      }
                      
                      resumeFromContext(context);
                    }
                    setOpen(false);
                  }}
                >
                  {isPlaying ? "Keep Playing" : "Resume Music"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <TooltipContent>
          <p>{isPlaying ? "Whispers Wind Music: Playing" : "Ambient Background Music: Paused"}</p>
          <p className="text-xs text-muted-foreground mt-1">Click to toggle, or click and hold for volume controls</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}