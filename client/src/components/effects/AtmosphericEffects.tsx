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

  useEffect(() => {
    if (isReady && autoPlay) {
      console.log('[AtmosphericEffects] Attempting autoplay...');
      handlePlaySound();
    }
  }, [isReady, autoPlay]);

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

  const handlePlaySound = useCallback(async () => {
    try {
      console.log('[AtmosphericEffects] Attempting to play sound...');
      setIsLoading(true);
      await playSound(soundId, { loop: true, volume });
      setIsPlaying(true);
      console.log('[AtmosphericEffects] Sound started successfully');
      toast({
        title: "Audio Started",
        description: "Background ambient sound is now playing.",
        variant: "default",
      });
    } catch (error) {
      console.error('[AtmosphericEffects] Failed to play sound:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Failed to start audio playback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [playSound, soundId, volume, toast]);

  const handleStopSound = useCallback(() => {
    try {
      console.log('[AtmosphericEffects] Attempting to stop sound...');
      stopSound(soundId);
      setIsPlaying(false);
      console.log('[AtmosphericEffects] Sound stopped successfully');
      toast({
        title: "Audio Stopped",
        description: "Background ambient sound has been stopped.",
        variant: "default",
      });
    } catch (error) {
      console.error('[AtmosphericEffects] Failed to stop sound:', error);
      toast({
        title: "Playback Error",
        description: "Failed to stop audio playback. Please try again.",
        variant: "destructive",
      });
    }
  }, [stopSound, soundId, toast]);

  const toggleSound = useCallback(async () => {
    if (isLoading) return;

    console.log('[AtmosphericEffects] Toggle sound clicked, current state:', {
      isPlaying,
      isReady,
      volume
    });

    if (!isReady) {
      toast({
        title: "Audio Not Ready",
        description: "Please click anywhere on the page to initialize the audio system.",
        variant: "default",
      });
      return;
    }

    if (isPlaying) {
      handleStopSound();
    } else {
      await handlePlaySound();
    }
  }, [isPlaying, isReady, isLoading, handlePlaySound, handleStopSound, toast]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    console.log('[AtmosphericEffects] Volume change:', newVolume);
    setVolumeState(newVolume);
    if (isPlaying) {
      setVolume(soundId, newVolume);
    }
  }, [isPlaying, setVolume, soundId]);

  if (!isReady) {
    console.log('[AtmosphericEffects] Audio system not ready yet');
    return (
      <div className={cn(
        "fixed bottom-4 right-4 flex items-center gap-2 z-50 bg-background/20 backdrop-blur-sm p-2 rounded-full shadow-lg",
        className
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full hover:bg-background/40 transition-all duration-200 cursor-not-allowed opacity-50"
          disabled
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
        onClick={toggleSound}
        disabled={isLoading}
        className="w-10 h-10 rounded-full hover:bg-background/40 transition-all duration-200"
        title={isPlaying ? "Disable ambient sounds" : "Enable ambient sounds"}
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