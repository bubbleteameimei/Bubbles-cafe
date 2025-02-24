import { useEffect, useState } from 'react';
import { useAudio } from '@/lib/audio-manager';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface AtmosphericEffectsProps {
  className?: string;
  autoPlay?: boolean;
  soundId?: string;
}

export function AtmosphericEffects({ 
  className,
  autoPlay = false,
  soundId = 'horror-ambient' // Default sound ID
}: AtmosphericEffectsProps) {
  const { isReady, playSound, stopSound, setVolume } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);

  useEffect(() => {
    if (isReady && autoPlay) {
      playSound(soundId, { loop: true, volume });
      setIsPlaying(true);
    }
    return () => {
      stopSound(soundId);
    };
  }, [isReady, autoPlay, playSound, stopSound, volume, soundId]);

  const toggleSound = () => {
    if (isPlaying) {
      stopSound(soundId);
      setIsPlaying(false);
    } else {
      playSound(soundId, { loop: true, volume });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolumeState(newVolume);
    setVolume(soundId, newVolume);
  };

  if (!isReady) return null;

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