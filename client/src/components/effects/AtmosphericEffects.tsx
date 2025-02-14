import { useEffect, useState } from 'react';
import { useAudio } from '@/lib/audio-manager';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface AtmosphericEffectsProps {
  className?: string;
  autoPlay?: boolean;
}

export function AtmosphericEffects({ 
  className,
  autoPlay = false 
}: AtmosphericEffectsProps) {
  const { isReady, playSound, stopSound, setVolume } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);

  useEffect(() => {
    if (isReady && autoPlay) {
      playSound('ambient', { loop: true, volume });
      setIsPlaying(true);
    }
    return () => {
      stopSound('ambient');
    };
  }, [isReady, autoPlay, playSound, stopSound, volume]);

  const toggleSound = () => {
    if (isPlaying) {
      stopSound('ambient');
      setIsPlaying(false);
    } else {
      playSound('ambient', { loop: true, volume });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolumeState(newVolume);
    setVolume('ambient', newVolume);
  };

  if (!isReady) return null;

  return (
    <div className={cn("fixed bottom-4 right-4 flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSound}
        className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm"
        title={isPlaying ? "Disable atmospheric sounds" : "Enable atmospheric sounds"}
      >
        {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </Button>
      {isPlaying && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-24 h-2 bg-background/80 rounded-full appearance-none cursor-pointer"
          title="Adjust volume"
        />
      )}
    </div>
  );
}
