import { useEffect, useState } from 'react';
import { useAudio } from '@/lib/audio-manager';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
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
  const [volume, setVolumeState] = useState(0.5);
  const { toast } = useToast();

  useEffect(() => {
    if (isReady && autoPlay) {
      console.log('[AtmosphericEffects] Attempting autoplay...');
      try {
        playSound(soundId, { loop: true, volume });
        setIsPlaying(true);
        console.log('[AtmosphericEffects] Autoplay started successfully');
      } catch (error) {
        console.error('[AtmosphericEffects] Autoplay failed:', error);
        toast({
          title: "Audio Error",
          description: "Failed to start audio playback automatically. Please try the play button.",
          variant: "destructive",
        });
      }
    }
    return () => {
      if (isPlaying) {
        console.log('[AtmosphericEffects] Cleaning up audio...');
        stopSound(soundId);
      }
    };
  }, [isReady, autoPlay, playSound, stopSound, volume, soundId]);

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

  const toggleSound = () => {
    console.log('[AtmosphericEffects] Toggle sound clicked, current state:', isPlaying);
    if (!isReady) {
      toast({
        title: "Audio Not Ready",
        description: "Please wait while the audio system initializes...",
        variant: "default",
      });
      return;
    }

    try {
      if (isPlaying) {
        stopSound(soundId);
        setIsPlaying(false);
        console.log('[AtmosphericEffects] Sound stopped');
      } else {
        playSound(soundId, { loop: true, volume });
        setIsPlaying(true);
        console.log('[AtmosphericEffects] Sound started');
      }
    } catch (error) {
      console.error('[AtmosphericEffects] Error toggling sound:', error);
      toast({
        title: "Playback Error",
        description: "Failed to toggle audio playback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    console.log('[AtmosphericEffects] Volume change:', newVolume);
    setVolumeState(newVolume);
    if (isPlaying) {
      setVolume(soundId, newVolume);
    }
  };

  if (!isReady) {
    console.log('[AtmosphericEffects] Audio system not ready yet');
    return null;
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
        className="w-10 h-10 rounded-full hover:bg-background/40 transition-all duration-200"
        title={isPlaying ? "Disable ambient sounds" : "Enable ambient sounds"}
      >
        {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
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