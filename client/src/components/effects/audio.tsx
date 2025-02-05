import { createContext, useContext, useRef, useEffect, useState } from 'react';

interface AudioContextType {
  toggleAudio: () => void;
  isPlaying: boolean;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    try {
      audioRef.current = new Audio('/assets/whispering_wind.mp3');
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.volume = 0.2;

        // Add error event listener
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio playback error:', (e.target as HTMLAudioElement).error);
          setIsPlaying(false);
        });
      }
    } catch (err) {
      console.error("Error initializing audio:", err);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
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
    }
  };

  return (
    <AudioContext.Provider value={{ toggleAudio, isPlaying }}>
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