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
      // Create a short silent audio for testing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.value = volume;
      oscillator.frequency.value = 0; // Silent

      // Create an audio element
      audioRef.current = new Audio();
      audioRef.current.loop = true;

      // Add event listeners
      const audio = audioRef.current;

      const handleCanPlay = () => {
        console.log('Audio system initialized');
        setAudioReady(true);
      };

      const handleError = (e: any) => {
        console.error('Audio initialization error:', e);
        setIsPlaying(false);
        setAudioReady(false);
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);

      setAudioReady(true);

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audioContext.close();
        setIsPlaying(false);
        audioRef.current = null;
      };
    } catch (err) {
      console.error("Error initializing audio:", err);
      setAudioReady(false);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = async () => {
    if (!audioReady) {
      console.log('Audio system not ready');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Stopping audio');
        setIsPlaying(false);
      } else {
        console.log('Starting audio');
        setIsPlaying(true);
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