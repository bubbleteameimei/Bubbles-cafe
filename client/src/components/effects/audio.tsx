import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  audioReady: boolean;
  toggleAudio: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audio] = useState(() => typeof window !== 'undefined' ? new Audio('/ambient.mp3') : null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const { toast } = useToast();

  // Initialize audio
  useEffect(() => {
    if (audio) {
      audio.loop = true;
      audio.volume = volume;

      const handleCanPlay = () => {
        setAudioReady(true);
      };

      const handleError = () => {
        setAudioReady(false);
        toast({
          title: "Audio Error",
          description: "Failed to load audio. Please try again.",
          variant: "destructive",
        });
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);

      // Update volume when it changes
      audio.volume = volume;

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.pause();
      };
    }
  }, [audio, volume, toast]);

  const toggleAudio = useCallback(() => {
    if (!audio || !audioReady) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(() => {
            setIsPlaying(false);
            toast({
              title: "Audio Error",
              description: "Failed to play audio. Please try again.",
              variant: "destructive",
            });
          });
        }
      }
    } catch (err) {
      console.error("Toggle audio error:", err);
      setIsPlaying(false);
    }
  }, [audio, isPlaying, audioReady, toast]);

  return (
    <AudioContext.Provider value={{
      toggleAudio,
      isPlaying,
      volume,
      setVolume,
      audioReady
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};