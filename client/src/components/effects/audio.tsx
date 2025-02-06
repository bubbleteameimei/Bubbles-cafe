import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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

  // Initialize audio
  useEffect(() => {
    const audio = new Audio('/ambient.mp3');
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const handleCanPlay = () => {
      setAudioReady(true);
      toast({
        title: "Audio Ready",
        description: "Background music is now available.",
      });
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setAudioReady(false);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: "Failed to load audio. Please try again.",
        variant: "destructive",
      });
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError as EventListener);
    audio.load(); // Explicitly load the audio

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError as EventListener);
      audioRef.current = null;
    };
  }, []); // Only run once on mount

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      const constrainedVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = constrainedVolume;

      // Save volume preference
      localStorage.setItem('audioVolume', constrainedVolume.toString());
    }
  }, [volume]);

  // Load saved volume preference
  useEffect(() => {
    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioReady) {
      toast({
        title: "Audio Not Ready",
        description: "Please wait for audio to load.",
        variant: "destructive",
      });
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      toast({
        title: "Audio Paused",
        description: "Background music has been paused.",
      });
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            toast({
              title: "Audio Playing",
              description: "Background music has started.",
            });
          })
          .catch((error) => {
            console.error('Audio play error:', error);
            setIsPlaying(false);
            toast({
              title: "Audio Error",
              description: "Failed to play audio. Please try again.",
              variant: "destructive",
            });
          });
      }
    }
  }, [audioReady, isPlaying, toast]);

  const setVolumeWithConstraints = useCallback((newVolume: number) => {
    // Ensure volume stays within 0-1 range
    const constrainedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(constrainedVolume);
  }, []);

  return (
    <AudioContext.Provider value={{
      isPlaying,
      volume,
      setVolume: setVolumeWithConstraints,
      audioReady,
      toggleAudio
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