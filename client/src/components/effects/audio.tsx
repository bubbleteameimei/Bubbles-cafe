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

// Create an AudioCache to store preloaded audio files
const audioCache = new Map<string, HTMLAudioElement>();

// Preload all audio files and store them in the cache
Object.entries(TRACKS).forEach(([name, path]) => {
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = path;
  audioCache.set(name, audio);

  // Add preload link to document head
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'audio';
  link.href = path;
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
        audioRef.current = null;
      }

      // Get cached audio instance
      const cachedAudio = audioCache.get(selectedTrack);
      if (!cachedAudio) {
        throw new Error(`Audio track ${selectedTrack} not found in cache`);
      }

      const audio = cachedAudio.cloneNode() as HTMLAudioElement;
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

      // Enable crossfade
      audio.crossOrigin = "anonymous";

      audioRef.current = audio;

      return () => {
        if (audio) {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleLoadError);
          audio.removeEventListener('playing', handlePlay);
          audio.removeEventListener('pause', handlePause);
          audio.pause();
        }
      };
    } catch (error) {
      console.error('[Audio] Initialization error:', error);
      setAudioReady(false);
    }
  }, [selectedTrack, volume]);

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
        }
      }
    } catch (error) {
      console.error('[Audio] Playback error:', error);
      setIsPlaying(false);
    }
  }, [audioReady, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      // Implement smooth volume transition
      const currentVolume = audioRef.current.volume;
      const volumeDiff = volume - currentVolume;
      const steps = 10;
      const stepSize = volumeDiff / steps;

      let step = 0;
      const fadeInterval = setInterval(() => {
        if (step < steps) {
          audioRef.current!.volume = currentVolume + (stepSize * step);
          step++;
        } else {
          audioRef.current!.volume = volume;
          clearInterval(fadeInterval);
        }
      }, 50);

      return () => clearInterval(fadeInterval);
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