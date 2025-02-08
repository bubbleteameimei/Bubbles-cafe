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

// Audio tracks mapping with correct paths for the new audio files
const TRACKS = {
  'Ethereal': '/static/ASMZ - 13 Angels Standing Guard \'Round the Side of Your Bed [hQZfGa5t4e8].mp3',  // 13 Angels Standing Guard
  'Nocturnal': '/static/whispering_wind.mp3'      // Whispering Wind
} as const;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('Ethereal');
  const { toast } = useToast();

  // Clean up function to handle audio cleanup
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setAudioReady(false);
  }, []);

  useEffect(() => {
    try {
      cleanupAudio();

      const audio = new Audio();
      audio.preload = "auto";
      audio.src = TRACKS[selectedTrack as keyof typeof TRACKS];
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;

      // Show loading toast
      toast({
        title: "Loading Audio",
        description: `Loading ${selectedTrack} atmosphere...`,
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
        console.error("Audio load error:", error);
        setAudioReady(false);
        toast({
          title: "Audio Load Failed",
          description: `Could not load ${selectedTrack} atmosphere. Please try again.`,
          variant: "destructive",
          duration: 3000,
        });
      };

      const handleEnded = () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleLoadError);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleLoadError);
        audio.removeEventListener('ended', handleEnded);
        cleanupAudio();
      };
    } catch (error) {
      console.error('Error initializing audio:', error);
      setAudioReady(false);
      toast({
        title: "Audio Error",
        description: "Failed to initialize audio system",
        variant: "destructive",
      });
    }
  }, [selectedTrack, cleanupAudio, toast, volume]);

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
          description: `${selectedTrack} atmosphere paused`,
          duration: 1000,
        });
      } else {
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
  }, [audioReady, isPlaying, selectedTrack, toast]);

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