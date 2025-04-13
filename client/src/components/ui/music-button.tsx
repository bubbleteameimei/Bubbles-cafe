import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Volume1, Volume, Settings, Music } from 'lucide-react';
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
    <div className="relative">
      {/* Main toggle music button with tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMusic}
              className={cn(
                "h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-150 active:scale-95 mt-2 relative",
                isPlaying && "text-primary border-primary/40",
                className
              )}
              aria-label={isPlaying ? "Toggle music" : "Play music"}
            >
              <VolumeIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPlaying ? "Ambient Music: Playing" : "Ambient Music: Paused"}</p>
            <p className="text-xs text-muted-foreground mt-1">Click to toggle music, long-press for controls</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Sheet dialog with proper trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onPointerDown={() => {
              const timer = setTimeout(() => setOpen(true), 500);
              
              const clearTimer = () => {
                clearTimeout(timer);
                window.removeEventListener('pointerup', clearTimer);
              };
              
              window.addEventListener('pointerup', clearTimer, { once: true });
            }}
            className="absolute inset-0 w-full h-full opacity-0"
            aria-label="Open music controls"
          />
        </SheetTrigger>
        
        <SheetContent className="w-80 sm:max-w-md" side="right">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" /> 
              Ambient Audio Controls
            </SheetTitle>
            <SheetDescription>
              Adjust your sound preferences and manage playback settings
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Volume</h4>
                <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0] / 100)}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Playback Status</h4>
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isPlaying ? "bg-green-500" : "bg-gray-400"
                )} />
                <p className="text-sm">
                  {isPlaying ? "Currently playing" : "Paused"}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Context</h4>
              <div className="rounded-md border p-2">
                <p className="text-sm font-medium capitalize text-primary">
                  {location.startsWith('/') ? location.substring(1) || 'homepage' : location}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your position is saved separately for each section
                </p>
              </div>
            </div>
          </div>
          
          <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                if (isPlaying) {
                  toggleMusic();
                }
                setOpen(false);
              }}
            >
              {isPlaying ? "Pause Music" : "Music Off"}
            </Button>
            <Button 
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
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}