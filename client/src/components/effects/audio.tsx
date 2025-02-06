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

  useEffect(() => {
    const audio = new Audio('/assets/whispering_wind.mp3');
    audio.loop = true;
    audio.volume = volume;

    // Set up event listeners for better state management
    audio.addEventListener('canplaythrough', () => setAudioReady(true));
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('error', () => {
      console.error("Audio loading error");
      setAudioReady(false);
      setIsPlaying(false);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', () => setAudioReady(true));
      audio.removeEventListener('ended', () => setIsPlaying(false));
      audio.removeEventListener('error', () => {
        setAudioReady(false);
        setIsPlaying(false);
      });
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = useCallback(() => {
    if (!audioReady || !audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Create a promise for play() to handle autoplay restrictions properly
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
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error("Toggle audio error:", err);
      setIsPlaying(false);
    }
  }, [isPlaying, audioReady]);

  const memoizedValue = {
    toggleAudio,
    isPlaying,
    volume,
    setVolume,
    audioReady
  };

  return (
    <AudioContext.Provider value={memoizedValue}>
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