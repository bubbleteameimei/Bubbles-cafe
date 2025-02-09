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
  'Ethereal': '/ethereal.mp3',
  'Nocturnal': '/nocturnal.mp3'
} as const;

// Preload all audio files
Object.values(TRACKS).forEach(track => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'audio';
  link.href = track;
  document.head.appendChild(link);
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('Ethereal');
  const { toast } = useToast();

  const initAudio = useCallback(() => {
    try {
      if (audioRef.current) {
        console.log('[Audio] Cleaning up previous audio instance');
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      const audio = new Audio();
      const trackPath = TRACKS[selectedTrack as keyof typeof TRACKS];
      console.log('[Audio] Initializing track:', selectedTrack, 'Path:', trackPath);

      audio.preload = "auto";
      audio.volume = volume;
      audio.loop = true;
      audio.src = trackPath;

      const handleCanPlay = () => {
        console.log('[Audio] Track ready to play:', selectedTrack);
        setAudioReady(true);
        // Removed toast notification for audio ready
      };

      const handleLoadError = (error: Event) => {
        const errorDetails = error instanceof ErrorEvent ? error.message : 'Unknown error';
        console.error("[Audio] Load error:", errorDetails);
        console.error("[Audio] Failed track path:", trackPath);
        setAudioReady(false);
        setIsPlaying(false);
        toast({
          title: "Audio Error",
          description: `Failed to load audio. Please try again.`,
          variant: "destructive",
        });
      };

      const handlePlay = () => {
        console.log('[Audio] Playback started:', selectedTrack);
        setIsPlaying(true);
      };

      const handlePause = () => {
        console.log('[Audio] Playback paused:', selectedTrack);
        setIsPlaying(false);
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleLoadError);
      audio.addEventListener('playing', handlePlay);
      audio.addEventListener('pause', handlePause);

      // Crossfade setup
      audio.crossOrigin = "anonymous";
      audio.load();

      audioRef.current = audio;

      return () => {
        console.log('[Audio] Cleaning up resources');
        if (audio) {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleLoadError);
          audio.removeEventListener('playing', handlePlay);
          audio.removeEventListener('pause', handlePause);
          audio.pause();
          audio.src = '';
        }
      };
    } catch (error) {
      console.error('[Audio] Initialization error:', error);
      setAudioReady(false);
      toast({
        title: "Audio System Error",
        description: "Failed to initialize audio. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [selectedTrack, toast, volume]);

  useEffect(() => {
    console.log('[Audio] Setting up audio provider');
    const cleanup = initAudio();
    return () => {
      cleanup?.();
    };
  }, [initAudio]);

  const toggleAudio = useCallback(async () => {
    if (!audioRef.current || !audioReady) {
      console.log('[Audio] Cannot toggle - not ready:', { current: !!audioRef.current, ready: audioReady });
      return;
    }

    try {
      if (isPlaying) {
        console.log('[Audio] Pausing playback');
        audioRef.current.pause();
      } else {
        console.log('[Audio] Starting playback');
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          // Removed success toast for playback
        }
      }
    } catch (error) {
      console.error('[Audio] Playback error:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Could not play audio. Please try again.",
        variant: "destructive",
      });
    }
  }, [audioReady, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      console.log('[Audio] Volume updated:', volume);
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