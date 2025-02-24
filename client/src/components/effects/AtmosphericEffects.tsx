import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/audio-manager';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface AtmosphericEffectsProps {
  className?: string;
  soundId?: string;
}

export function AtmosphericEffects({ 
  className,
  soundId = 'horror-ambient'
}: AtmosphericEffectsProps) {
  const { isReady, error, playSound, stopSound, setVolume } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const { toast } = useToast();

  // Show initialization message
  useEffect(() => {
    toast({
      title: "Audio Controls",
      description: "Click the volume button to start ambient sounds"
    });
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Audio Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleClick = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log('[Audio UI] Button clicked, current state:', { isPlaying, isReady, volume });

      if (isPlaying) {
        stopSound(soundId);
        setIsPlaying(false);
        toast({
          title: "Audio Stopped",
          description: "Background sound has been stopped"
        });
      } else {
        await playSound(soundId, { loop: true, volume });
        setIsPlaying(true);
        toast({
          title: "Audio Started",
          description: "Background sound is now playing"
        });
      }
    } catch (error) {
      console.error('[Audio UI] Operation failed:', error);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className={cn(
        "fixed bottom-4 right-4 flex items-center gap-2",
        "z-[100]", // Ensure controls stay above other content
        "bg-background/20 backdrop-blur-sm p-2 rounded-full shadow-lg",
        "transform-gpu will-change-transform select-none",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "w-10 h-10 rounded-full transition-all duration-200",
          "hover:bg-background/40 active:scale-95",
          "transform-gpu will-change-transform"
        )}
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

      <AnimatePresence mode="wait">
        {isPlaying && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: "6rem",
              opacity: 1,
            }}
            exit={{ 
              width: 0,
              opacity: 0
            }}
            transition={{ 
              duration: 0.2,
              ease: "easeInOut"
            }}
            className="overflow-hidden"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className={cn(
                "w-24 h-2 rounded-full appearance-none cursor-pointer",
                "bg-background/40 hover:bg-background/60",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "transition-all duration-200 transform-gpu will-change-transform"
              )}
              title="Adjust volume"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}