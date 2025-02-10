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

const TRACKS = {
  'Ethereal': '/13-angels.m4a',
  'Nocturnal': '/whispers-wind.m4a'
} as const;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('Ethereal');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const initAudio = useCallback(() => {
    try {
      if (audioRef.current) {
        console.log('[Audio] Cleaning up previous audio instance');
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio();
      audio.src = TRACKS[selectedTrack as keyof typeof TRACKS];
      audio.volume = volume;
      audio.loop = true;

      const handleCanPlay = () => {
        console.log('[Audio] Track ready to play:', selectedTrack);
        setAudioReady(true);
      };

      const handleLoadError = (error: Event) => {
        console.error("[Audio] Load error:", error);
        setAudioReady(false);
        setIsPlaying(false);
        toast({
          title: "Audio Error",
          description: `Failed to load audio track: ${selectedTrack}`,
          variant: "destructive",
        });
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleLoadError);
      audioRef.current = audio;

      return () => {
        if (audio) {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleLoadError);
          audio.pause();
        }
      };
    } catch (error) {
      console.error('[Audio] Initialization error:', error);
      setAudioReady(false);
      toast({
        title: "Audio Error",
        description: "Failed to initialize audio system",
        variant: "destructive",
      });
    }
  }, [selectedTrack, volume, toast]);

  useEffect(() => {
    const cleanup = initAudio();
    return () => {
      cleanup?.();
    };
  }, [initAudio]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = useCallback(async () => {
    if (!audioRef.current || !audioReady) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('[Audio] Playback error:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Failed to play audio track",
        variant: "destructive",
      });
    }
  }, [audioReady, isPlaying, toast]);

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