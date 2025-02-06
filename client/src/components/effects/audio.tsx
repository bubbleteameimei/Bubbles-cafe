import { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  audioReady: boolean;
  toggleAudio: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [audioReady, setAudioReady] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const readingStartTime = useRef<number | null>(null);
  const toast = useToast();

  // Initialize audio on mount
  useEffect(() => {
    console.log("Initializing audio...");
    const audio = new Audio('/ambient.mp3');
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = volume;

    const handleCanPlayThrough = () => {
      console.log("Audio is ready to play");
      setAudioReady(true);
    };

    const handleError = (e: any) => {
      console.error("Audio loading error:", e);
      toast.toast({
        title: "Audio Error",
        description: "Failed to load audio file. Please try again later.",
        variant: "destructive",
      });
      setAudioReady(false);
      setIsPlaying(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);

    audioRef.current = audio;
    readingStartTime.current = Date.now();

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Auto-play after 5 seconds of reading and show dialog after 15 seconds
  useEffect(() => {
    if (!readingStartTime.current || !audioRef.current || !audioReady) return;

    const checkTime = setInterval(() => {
      const elapsed = Date.now() - readingStartTime.current!;

      // Start playing after 5 seconds
      if (elapsed >= 5000 && !isPlaying && audioReady) {
        console.log("Attempting auto-play after 5 seconds...");
        const playPromise = audioRef.current?.play();
        if (playPromise) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              toast.toast({
                title: "Music started",
                description: "Background music has started playing",
              });
            })
            .catch(error => {
              console.error("Auto-play failed:", error);
              setIsPlaying(false);
            });
        }
      }

      // Show pause dialog after 15 seconds
      if (elapsed >= 15000 && isPlaying && !showPauseDialog) {
        setShowPauseDialog(true);
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [audioReady, isPlaying, showPauseDialog]);

  const toggleAudio = useCallback(() => {
    if (!audioReady || !audioRef.current) {
      console.log("Audio not ready or ref missing");
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Playback failed:", error);
              setIsPlaying(false);
              toast.toast({
                title: "Audio Error",
                description: "Failed to play audio. Please try again.",
                variant: "destructive",
              });
            });
        }
      }
    } catch (err) {
      console.error("Toggle audio error:", err);
      setIsPlaying(false);
      toast.toast({
        title: "Audio Error",
        description: "An error occurred with the audio playback.",
        variant: "destructive",
      });
    }
  }, [isPlaying, audioReady]);

  return (
    <AudioContext.Provider value={{
      toggleAudio,
      isPlaying,
      volume,
      setVolume,
      audioReady
    }}>
      {children}
      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Background Music</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to continue playing the background music?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
              }
              setShowPauseDialog(false);
            }}>
              No, pause it
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowPauseDialog(false)}>
              Yes, keep playing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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