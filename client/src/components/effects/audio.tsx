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
    try {
      audioRef.current = new Audio('/assets/whispering_wind.mp3');

      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.volume = volume;

        // Add event listeners
        const audio = audioRef.current;

        const handleCanPlay = () => setAudioReady(true);
        const handleError = (e: ErrorEvent) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
          setAudioReady(false);
        };
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnded);

        return () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('ended', handleEnded);
          audio.pause();
          setIsPlaying(false);
          audioRef.current = null;
        };
      }
    } catch (err) {
      console.error("Error initializing audio:", err);
      setAudioReady(false);
    }
  }, []);

  // Update volume whenever it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = async () => {
    if (!audioRef.current || !audioReady) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(err => {
              console.error("Audio playback failed:", err);
              setIsPlaying(false);
            });
        }
      }
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