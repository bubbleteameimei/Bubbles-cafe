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

  const cleanupAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }

        const audio = new Audio();
        audio.preload = "auto";
        audio.src = TRACKS[selectedTrack as keyof typeof TRACKS];
        audio.loop = true;
        audioRef.current = audio;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const gainNode = audioContext.createGain();
        const sourceNode = audioContext.createMediaElementSource(audio);

        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        gainNodeRef.current = gainNode;
        sourceNodeRef.current = sourceNode;

        gainNode.gain.value = volume;

        await new Promise<void>((resolve) => {
          const handleCanPlay = () => {
            resolve();
            audio.removeEventListener('canplaythrough', handleCanPlay);
          };
          audio.addEventListener('canplaythrough', handleCanPlay);
          audio.load();
        });

        setAudioReady(true);
        toast({
          title: "Atmosphere Ready",
          description: "Click the sound icon to begin",
          duration: 1500,
        });
      } catch (error) {
        console.error('Error initializing audio:', error);
        setAudioReady(false);
        setIsPlaying(false);
        toast({
          title: "Audio Setup Failed",
          description: "Please refresh the page or check browser settings",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    initializeAudio();

    const handleFirstInteraction = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    document.addEventListener('click', handleFirstInteraction);

    return () => {
      cleanupAnimation();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      document.removeEventListener('click', handleFirstInteraction);
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, [selectedTrack]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
      localStorage.setItem('audioVolume', volume.toString());
    }
  }, [volume]);

  useEffect(() => {
    const savedVolume = localStorage.getItem('audioVolume');
    const savedTrack = localStorage.getItem('selectedTrack');
    if (savedVolume) setVolume(parseFloat(savedVolume));
    if (savedTrack && savedTrack in TRACKS) setSelectedTrack(savedTrack);
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedTrack', selectedTrack);
  }, [selectedTrack]);

  const toggleAudio = useCallback(async () => {
    if (!audioRef.current || !audioReady || !audioContextRef.current) {
      toast({
        title: "Setting up Atmosphere",
        description: "One moment please...",
        duration: 1500,
      });
      return;
    }

    try {
      const audio = audioRef.current;
      const audioContext = audioContextRef.current;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      if (isPlaying) {
        cleanupAnimation();
        audio.pause();
        lastPlaybackTimeRef.current = audio.currentTime;
        lastPauseTimeRef.current = Date.now();
        setIsPlaying(false);
        toast({
          title: "Atmosphere Paused",
          duration: 1000,
        });
      } else {
        const pauseDuration = Date.now() - lastPauseTimeRef.current;
        if (pauseDuration > 30000) {
          audio.currentTime = 0;
        } else {
          audio.currentTime = lastPlaybackTimeRef.current;
        }

        await audio.play();
        setIsPlaying(true);
        toast({
          title: "Atmosphere Active",
          description: `Playing "${selectedTrack}"`,
          duration: 1500,
        });
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Failed",
        description: "Please try again or check browser settings",
        variant: "destructive",
        duration: 2000,
      });
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