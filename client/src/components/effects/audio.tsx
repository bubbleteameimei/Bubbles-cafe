import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  audioReady: boolean;
  toggleAudio: () => void;
  selectedTrack: string;
  setSelectedTrack: (track: string) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

// Default static audio files with meaningful names
const TRACKS = {
  'Ethereal': '/static/angels_standing_guard.mp3',
  'Nocturnal': '/static/whispering_wind.mp3'
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('Ethereal');
  const { toast } = useToast();

  useEffect(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio();
      audio.preload = "auto";
      audio.src = TRACKS[selectedTrack as keyof typeof TRACKS];
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;

      // Show loading toast
      toast({
        title: "Loading Audio",
        description: "Preparing your ambient experience...",
        duration: 2000,
      });

      const handleCanPlay = () => {
        setAudioReady(true);
        toast({
          title: "Audio Ready",
          description: `${selectedTrack} atmosphere is ready to play`,
          duration: 2000,
        });
      };

      const handleLoadError = (error: Event) => {
        console.error("Audio load error for track:", selectedTrack, error);
        setAudioReady(false);
        toast({
          title: "Audio Load Failed",
          description: "Could not load the ambient sound. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleLoadError);

      // Add stalled and waiting event handlers
      audio.addEventListener('stalled', () => {
        console.log('Audio playback stalled');
        setAudioReady(false);
      });

      audio.addEventListener('waiting', () => {
        console.log('Audio playback waiting');
        setAudioReady(false);
      });

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleLoadError);
        audio.pause();
      };
    } catch (error) {
      console.error('Error initializing audio:', error);
      setAudioReady(false);
    }
  }, [selectedTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = useCallback(async () => {
    if (!audioRef.current || !audioReady) {
      toast({
        title: "Audio Not Ready",
        description: "Please wait for the audio to load completely",
        duration: 2000,
      });
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        toast({
          title: "Audio Paused",
          duration: 1000,
        });
      } else {
        // Ensure the audio is properly loaded before playing
        if (audioRef.current.readyState < 3) {
          toast({
            title: "Loading",
            description: "Please wait while we prepare the audio...",
            duration: 2000,
          });
          return;
        }

        await audioRef.current.play();
        setIsPlaying(true);
        toast({
          title: "Now Playing",
          description: `${selectedTrack} atmosphere`,
          duration: 1500,
        });
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [audioReady, isPlaying, selectedTrack]);

  return (
    <AudioContext.Provider value={{
      isPlaying,
      volume,
      setVolume,
      audioReady,
      toggleAudio,
      selectedTrack,
      setSelectedTrack
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