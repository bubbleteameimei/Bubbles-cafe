import { useEffect, useState, useCallback } from 'react';
import { useAudio } from '@/lib/audio-manager';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AtmosphericEffectsProps {
  className?: string;
  autoPlay?: boolean;
  soundId?: string;
}

export function AtmosphericEffects({ 
  className,
  autoPlay = false,
  soundId = 'horror-ambient'
}: AtmosphericEffectsProps) {
  const { isReady, error, playSound, stopSound, setVolume } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const { toast } = useToast();

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('[AtmosphericEffects] Audio error:', error);
      toast({
        title: "Audio Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleClick = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      if (isPlaying) {
        console.log('[AtmosphericEffects] Stopping playback...');
        stopSound(soundId);
        setIsPlaying(false);
        toast({
          title: "Audio Stopped",
          description: "Background sound has been stopped."
        });
      } else {
        console.log('[AtmosphericEffects] Starting playback...');
        await playSound(soundId, { loop: true, volume });
        setIsPlaying(true);
        toast({
          title: "Audio Started",
          description: "Background sound is now playing."
        });
      }
    } catch (error) {
      console.error('[AtmosphericEffects] Audio operation failed:', error);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: error instanceof Error ? error.message : "Failed to control audio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, isLoading, soundId, volume, playSound, stopSound, toast]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    console.log('[AtmosphericEffects] Volume change:', newVolume);
    setVolumeState(newVolume);
    if (isPlaying) {
      setVolume(soundId, newVolume);
    }
  }, [isPlaying, setVolume, soundId]);

  // Show muted button while audio system initializes
  if (!isReady) {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 flex items-center gap-2 z-50 bg-background/20 backdrop-blur-sm p-2 rounded-full shadow-lg",
        className
      )}>
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="w-10 h-10 rounded-full hover:bg-background/40 transition-all duration-200 cursor-not-allowed opacity-50"
          title="Click anywhere on the page to initialize audio"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 flex items-center gap-2 z-50 bg-background/20 backdrop-blur-sm p-2 rounded-full shadow-lg",
      className
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isLoading}
        className="w-10 h-10 rounded-full hover:bg-background/40 transition-all duration-200"
        title={isPlaying ? "Stop ambient sounds" : "Play ambient sounds"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>
      <div className={cn(
        "overflow-hidden transition-all duration-200",
        isPlaying ? "w-24" : "w-0"
      )}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-24 h-2 bg-background/40 rounded-full appearance-none cursor-pointer"
          title="Adjust volume"
        />
      </div>
    </div>
  );
}