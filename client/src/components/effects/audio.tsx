import { createContext, useContext, useRef, useEffect, useState } from 'react';
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
    audioRef.current = new Audio('/assets/whispering_wind.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    setAudioReady(true);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = async () => {
    if (!audioReady || !audioRef.current) {
      console.log('Audio system not ready');
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error("Toggle audio error:", err);
      setIsPlaying(false);
    }
  };

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