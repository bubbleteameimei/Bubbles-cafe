import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.src = '/ambient.mp3';
    audio.loop = true;
    audioRef.current = audio;

    // Initialize Web Audio API context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sourceNode = audioContext.createMediaElementSource(audio);
    const gainNode = audioContext.createGain();

    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    sourceNodeRef.current = sourceNode;
    gainNodeRef.current = gainNode;

    const handleCanPlay = () => {
      setAudioReady(true);
      toast({
        title: "Audio Ready",
        duration: 500,
      });
    };

    const handleFirstInteraction = () => {
      audio.preload = "auto";
      audioContext.resume();
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setAudioReady(false);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: "Failed to load audio",
        variant: "destructive",
        duration: 500,
      });
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError as EventListener);
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError as EventListener);
      audioRef.current = null;
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      const constrainedVolume = Math.max(0, Math.min(1, volume));
      gainNodeRef.current.gain.value = constrainedVolume;
      localStorage.setItem('audioVolume', constrainedVolume.toString());
    }
  }, [volume]);

  useEffect(() => {
    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  function updateRate(audio: HTMLAudioElement, start: number, startTime: number) {
    const duration = 1000; // 1 second transition
    const end = 1.0;
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic function for smooth transition
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const newRate = start + (end - start) * easeOut;

    if (audio) {
      audio.playbackRate = newRate;
    }

    if (progress < 1 && audio) {
      requestAnimationFrame(() => updateRate(audio, start, startTime));
    }
  }

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    const audioContext = audioContextRef.current;

    if (!audio || !audioReady || !audioContext) {
      toast({
        title: "Audio Not Ready",
        variant: "destructive",
        duration: 500,
      });
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      toast({
        title: "Audio Paused",
        duration: 500,
      });
    } else {
      // Set initial faster playback rate
      audio.playbackRate = 1.5; // 50% faster

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            // Schedule return to normal speed after 8 seconds
            setTimeout(() => {
              if (audio) {
                // Start the transition
                const startTime = performance.now();
                updateRate(audio, audio.playbackRate, startTime);
              }
            }, 8000);

            toast({
              title: "Audio Playing",
              duration: 500,
            });
          })
          .catch((error) => {
            console.error('Audio play error:', error);
            setIsPlaying(false);
            toast({
              title: "Audio Error",
              description: "Failed to play",
              variant: "destructive",
              duration: 500,
            });
          });
      }
    }
  }, [audioReady, isPlaying, toast]);

  const setVolumeWithConstraints = useCallback((newVolume: number) => {
    const constrainedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(constrainedVolume);
  }, []);

  return (
    <AudioContext.Provider value={{
      isPlaying,
      volume,
      setVolume: setVolumeWithConstraints,
      audioReady,
      toggleAudio
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