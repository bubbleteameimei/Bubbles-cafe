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

// Update the audio tracks mapping to use existing files
const TRACKS = {
  'Ethereal': '/static/13-angels.mp3',
  'Nocturnal': '/static/whispering_wind.mp3'
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
      try {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
        setIsPlaying(false);
        setAudioReady(false);
      } catch (error) {
        console.error('Error cleaning up audio:', error);
      }
    }
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

      const handleCanPlay = () => {
        setAudioReady(true);
        toast({
          title: "Audio Ready",
          description: `${selectedTrack} atmosphere is ready`,
          duration: 2000,
        });
      };

      const handleLoadError = (error: Event) => {
        console.error("Audio load error:", error);
        setAudioReady(false);
        setIsPlaying(false);
        toast({
          title: "Audio Error",
          description: `Could not load ${selectedTrack}. Please try another track.`,
          variant: "destructive",
          duration: 3000,
        });
      };

      const handlePlayError = () => {
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "There was an error playing the audio. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleLoadError);
      audio.addEventListener('playing', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('stalled', handlePlayError);
      audio.addEventListener('suspend', () => setAudioReady(false));

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleLoadError);
        audio.removeEventListener('playing', () => setIsPlaying(true));
        audio.removeEventListener('pause', () => setIsPlaying(false));
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.removeEventListener('stalled', handlePlayError);
        audio.removeEventListener('suspend', () => setAudioReady(false));
        cleanupAudio();
      };
    } catch (error) {
      console.error('Error initializing audio:', error);
      setAudioReady(false);
      toast({
        title: "Audio System Error",
        description: "Failed to initialize audio system. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [selectedTrack, cleanupAudio, toast, volume]);

  const toggleAudio = useCallback(async () => {
    if (!audioRef.current || !audioReady) {
      toast({
        title: "Audio Not Ready",
        description: "Please wait for the audio to load",
        duration: 2000,
      });
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        toast({
          title: "Paused",
          description: `${selectedTrack} atmosphere paused`,
          duration: 1000,
        });
      } else {
        if (audioRef.current.readyState < 3) {
          toast({
            title: "Loading",
            description: "Please wait while the audio loads...",
            duration: 2000,
          });
          return;
        }

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          toast({
            title: "Now Playing",
            description: `${selectedTrack} atmosphere`,
            duration: 1500,
          });
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Could not play audio. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [audioReady, isPlaying, selectedTrack, toast]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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