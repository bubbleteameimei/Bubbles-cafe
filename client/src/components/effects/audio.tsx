import { createContext, useContext, useRef, useState, useCallback } from 'react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const { toast } = useToast();

  // Initialize audio on first interaction
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio('/ambient.mp3');
      audio.loop = true;
      audio.volume = volume;

      audio.addEventListener('canplaythrough', () => {
        setAudioReady(true);
      });

      audio.addEventListener('error', () => {
        toast({
          title: "Audio Error",
          description: "Failed to load audio. Please try again.",
          variant: "destructive",
        });
        setAudioReady(false);
        setIsPlaying(false);
      });

      audioRef.current = audio;
    }
  }, [volume, toast]);

  const toggleAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        initializeAudio();
      }

      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
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
  }, [isPlaying, initializeAudio, toast]);

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