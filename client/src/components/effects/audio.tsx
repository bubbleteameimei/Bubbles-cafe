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
  'Ethereal': '/13-angels.mp3',
  'Nocturnal': '/whispering-wind.mp3'
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lastPlaybackTimeRef = useRef<number>(0);
  const lastPauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('Ethereal');
  const { toast } = useToast();

  // Cleanup function for animation frame
  const cleanupAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";

    // Add error event listener before setting the source
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Audio error details:', {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src
      });
      setAudioReady(false);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: "Failed to load atmosphere track. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    });

    // Set source after adding error listener
    try {
      audio.src = TRACKS[selectedTrack as keyof typeof TRACKS];
      console.log('Loading audio track:', {
        track: selectedTrack,
        src: audio.src
      });
    } catch (error) {
      console.error('Error setting audio source:', error);
    }

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
        title: "Atmosphere Ready",
        description: `"${selectedTrack}" loaded`,
        duration: 1500,
      });
    };

    const handleFirstInteraction = () => {
      audioContext.resume();
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);

    audio.addEventListener('canplaythrough', handleCanPlay);
    

    audio.load();

    return () => {
      cleanupAnimation();
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlay);
      document.removeEventListener('click', handleFirstInteraction);
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [selectedTrack]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
      localStorage.setItem('audioVolume', volume.toString());
    }
  }, [volume]);

  // Load saved preferences
  useEffect(() => {
    const savedVolume = localStorage.getItem('audioVolume');
    const savedTrack = localStorage.getItem('selectedTrack');
    if (savedVolume) setVolume(parseFloat(savedVolume));
    if (savedTrack && savedTrack in TRACKS) setSelectedTrack(savedTrack);
  }, []);

  // Save track preference
  useEffect(() => {
    localStorage.setItem('selectedTrack', selectedTrack);
  }, [selectedTrack]);

  function updatePlaybackRate(audio: HTMLAudioElement, startRate: number, endRate: number, duration: number) {
    cleanupAnimation();
    const startTime = performance.now();

    function animate() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out for smooth transition
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRate = startRate + (endRate - startRate) * easeOut;

      if (audio && !audio.paused) {
        audio.playbackRate = currentRate;
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      }
    }

    animate();
  }

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    const audioContext = audioContextRef.current;

    if (!audio || !audioReady || !audioContext) {
      toast({
        title: "Setting up Atmosphere",
        description: "One moment please...",
        duration: 1500,
      });
      return;
    }

    const currentTime = Date.now();

    if (isPlaying) {
      cleanupAnimation();
      audio.pause();
      lastPlaybackTimeRef.current = audio.currentTime;
      lastPauseTimeRef.current = currentTime;
      setIsPlaying(false);
      toast({
        title: "Atmosphere Paused",
        duration: 1000,
      });
    } else {
      const pauseDuration = currentTime - lastPauseTimeRef.current;

      // Reset to beginning if paused for more than 30 seconds
      if (pauseDuration > 30000) {
        audio.currentTime = 0;
      } else {
        audio.currentTime = lastPlaybackTimeRef.current;
      }

      audio.playbackRate = 1.5;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            updatePlaybackRate(audio, 1.5, 1.0, 2000);
            toast({
              title: "Atmosphere Active",
              description: `Playing "${selectedTrack}"`,
              duration: 1500,
            });
          })
          .catch((error) => {
            console.error('Audio play error:', error);
            setIsPlaying(false);
            toast({
              title: "Playback Failed",
              description: "Please try again or check browser settings",
              variant: "destructive",
              duration: 2000,
            });
          });
      }
    }
  }, [audioReady, isPlaying, cleanupAnimation, selectedTrack]);

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