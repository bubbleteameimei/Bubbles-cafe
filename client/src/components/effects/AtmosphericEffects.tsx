import { useState } from 'react';
import { useAudio } from '@/lib/audio-manager';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AtmosphericEffectsProps {
  className?: string;
  soundId?: string;
}

export function AtmosphericEffects({ 
  className,
  soundId = 'horror-ambient'
}: AtmosphericEffectsProps) {
  const { isReady, playSound, stopSound, setVolume } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const { toast } = useToast();

  const handleClick = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log('[Audio UI] Button clicked, state:', { isPlaying, isReady, volume });

      if (isPlaying) {
        stopSound(soundId);
        setIsPlaying(false);
        toast({
          title: "Sound Stopped",
          description: "Background audio disabled"
        });
      } else {
        await playSound(soundId, {
          loop: true,
          volume,
          bufferSize: 64 * 1024  // Use smaller initial buffer
        });
        setIsPlaying(true);
        toast({
          title: "Sound Playing",
          description: "Background audio enabled"
        });
      }
    } catch (error) {
      console.error('[Audio UI] Error:', error);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: error instanceof Error ? error.message : "Failed to control audio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolumeState(newVolume);
    if (isPlaying) {
      setVolume(soundId, newVolume);
    }
  };

  return (
    <div className={cn(
      "fixed bottom-4 right-4",
      "flex items-center gap-2",
      "z-[100]",
      "p-2 rounded-full",
      "bg-background/20 backdrop-blur-sm shadow-lg",
      "transform-gpu",
      className
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={!isReady || isLoading}
        className={cn(
          "w-10 h-10 rounded-full",
          "transition-transform duration-200",
          "hover:bg-background/40 active:scale-95",
          "transform-gpu"
        )}
        title={!isReady ? "Initializing audio..." : isPlaying ? "Stop ambient sounds" : "Play ambient sounds"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>

      {/* Volume slider with simplified transitions */}
      <div className={cn(
        "w-24",
        "transition-opacity duration-200",
        isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className={cn(
            "w-full h-2 rounded-full",
            "bg-background/40",
            "appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "transform-gpu"
          )}
          title="Adjust volume"
        />
      </div>
    </div>
  );
}