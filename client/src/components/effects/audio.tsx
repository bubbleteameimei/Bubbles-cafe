import { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';

interface AudioContextType {
  toggleAudio: () => void;
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  audioReady: boolean;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [audioReady, setAudioReady] = useState(false);

  // Initialize audio on mount
  useEffect(() => {
    const audio = new Audio('/assets/whispering_wind.mp3');
    audio.preload = 'auto'; // Ensure audio is preloaded
    audio.loop = true;
    audio.volume = volume;

    // Set up event listeners for better state management
    const handleCanPlayThrough = () => setAudioReady(true);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      console.error("Audio loading error");
      setAudioReady(false);
      setIsPlaying(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Handle volume changes efficiently
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Optimized toggle function with proper state management
  const toggleAudio = useCallback(() => {
    if (!audioReady || !audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Playback failed:", error);
              setIsPlaying(false);
            });
        }
      }
    } catch (err) {
      console.error("Toggle audio error:", err);
      setIsPlaying(false);
    }
  }, [isPlaying, audioReady]);

  const value = {
    toggleAudio,
    isPlaying,
    volume,
    setVolume,
    audioReady
  };

  return (
    <AudioContext.Provider value={value}>
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