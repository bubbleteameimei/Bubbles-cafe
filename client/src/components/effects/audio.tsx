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

// Updated tracks with absolute paths and base URL
const TRACKS = {
  'Ethereal': `${window.location.origin}/ethereal.mp3`,
  'Nocturnal': `${window.location.origin}/nocturnal.mp3`
} as const;

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
        console.log('Cleaning up previous audio instance');
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      setAudioReady(false); // Reset ready state while loading new track

      const audio = new Audio();

      // Get the correct file path with absolute URL
      const trackPath = TRACKS[selectedTrack as keyof typeof TRACKS];
      console.log('Initializing audio track:', selectedTrack, 'URL:', trackPath);

      // Configure audio settings
      audio.preload = "auto";
      audio.volume = volume;
      audio.loop = true;
      audio.src = trackPath;

      // Set up event handlers
      const handleCanPlay = () => {
        console.log('Audio is ready to play:', selectedTrack);
        setAudioReady(true);
        toast({
          title: "Audio Ready",
          description: `${selectedTrack} atmosphere ready`,
          duration: 2000,
        });
      };

      const handleLoadError = (error: Event) => {
        console.error("Audio load error:", error);
        console.error("Failed track path:", trackPath);
        setAudioReady(false);
        setIsPlaying(false);
        toast({
          title: "Audio Error",
          description: `Could not load ${selectedTrack} track. Please try again.`,
          variant: "destructive",
          duration: 3000,
        });
      };

      // Add event listeners
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleLoadError);
      audio.addEventListener('playing', () => {
        console.log('Audio started playing:', selectedTrack);
        setIsPlaying(true);
      });
      audio.addEventListener('pause', () => {
        console.log('Audio paused:', selectedTrack);
        setIsPlaying(false);
      });
      audio.addEventListener('ended', () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
      });

      audioRef.current = audio;

      // Force load the audio
      audio.load();

      // Cleanup function
      return () => {
        console.log('Cleaning up audio resources');
        if (audio) {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleLoadError);
          audio.removeEventListener('playing', () => setIsPlaying(true));
          audio.removeEventListener('pause', () => setIsPlaying(false));
          audio.removeEventListener('ended', () => setIsPlaying(false));
          audio.pause();
          audio.src = '';
        }
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
  }, [selectedTrack, toast, volume]);

  // Initialize audio when component mounts or track changes
  useEffect(() => {
    console.log('Setting up audio provider');
    const cleanup = initAudio();
    return () => {
      cleanup?.();
    };
  }, [initAudio]);

  const toggleAudio = useCallback(async () => {
    if (!audioRef.current || !audioReady) {
      console.log('Cannot toggle audio - not ready:', { current: !!audioRef.current, ready: audioReady });
      toast({
        title: "Audio Not Ready",
        description: "Please wait for the audio to load",
        duration: 2000,
      });
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing audio');
        audioRef.current.pause();
        toast({
          title: "Paused",
          description: `${selectedTrack} atmosphere paused`,
          duration: 1000,
        });
      } else {
        console.log('Starting audio playback');
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

  // Update volume in real-time
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