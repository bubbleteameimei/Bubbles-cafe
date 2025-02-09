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

// Updated tracks with absolute paths
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
      // Cleanup previous audio instance if it exists
      if (audioRef.current) {
        console.log('[Audio] Cleaning up previous audio instance');
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      const audio = new Audio();

      // Get the track path
      const trackPath = TRACKS[selectedTrack as keyof typeof TRACKS];
      console.log('[Audio] Initializing track:', selectedTrack, 'Path:', trackPath);

      // Configure audio settings
      audio.preload = "auto";
      audio.volume = volume;
      audio.loop = true;
      audio.src = trackPath;

      // Set up event handlers with improved error logging
      const handleCanPlay = () => {
        console.log('[Audio] Track ready to play:', selectedTrack);
        setAudioReady(true);
        toast({
          title: "Audio Ready",
          description: `${selectedTrack} atmosphere loaded`,
          duration: 2000,
        });
      };

      const handleLoadError = (error: Event) => {
        const errorDetails = error instanceof ErrorEvent ? error.message : 'Unknown error';
        console.error("[Audio] Load error:", errorDetails);
        console.error("[Audio] Failed track path:", trackPath);
        setAudioReady(false);
        setIsPlaying(false);
        toast({
          title: "Audio Error",
          description: `Failed to load ${selectedTrack}. Please try again.`,
          variant: "destructive",
          duration: 3000,
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

      // Add event listeners
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleLoadError);
      audio.addEventListener('playing', handlePlay);
      audio.addEventListener('pause', handlePause);

      audioRef.current = audio;

      // Force load the audio
      audio.load();

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
      toast({
        title: "Audio Not Ready",
        description: "Please wait for the audio to load",
        duration: 2000,
      });
      return;
    }

    try {
      if (isPlaying) {
        console.log('[Audio] Pausing playback');
        audioRef.current.pause();
      } else {
        console.log('[Audio] Starting playback');
        audioRef.current.currentTime = 0;
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
      console.error('[Audio] Playback error:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Could not play audio. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [audioReady, isPlaying, selectedTrack, toast]);

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