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
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('Ethereal');
  const { toast } = useToast();

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

        // Only create AudioContext after user interaction
        const handleFirstInteraction = () => {
          if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const context = new AudioCtx();
            const gainNode = context.createGain();
            const source = context.createMediaElementSource(audio);

            source.connect(gainNode);
            gainNode.connect(context.destination);

            audioContextRef.current = context;
            gainNodeRef.current = gainNode;
            gainNode.gain.value = volume;

            document.removeEventListener('click', handleFirstInteraction);
            setAudioReady(true);
            toast({
              title: "Atmosphere Ready",
              description: "Click the sound icon to begin",
              duration: 1500,
            });
          }
        };

        document.addEventListener('click', handleFirstInteraction);

        // Set up audio loading
        audio.addEventListener('canplaythrough', () => {
          if (!audioReady) {
            setAudioReady(true);
          }
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio loading error:', e);
          setAudioReady(false);
          toast({
            title: "Audio Load Failed",
            description: "Could not load audio file",
            variant: "destructive",
          });
        });

        // Load the audio file
        audio.load();
      } catch (error) {
        console.error('Error initializing audio:', error);
        setAudioReady(false);
        toast({
          title: "Audio Setup Failed",
          description: "Please refresh the page",
          variant: "destructive",
        });
      }
    };

    initializeAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
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

  const toggleAudio = useCallback(async () => {
    if (!audioRef.current || !audioReady) {
      toast({
        title: "Audio Not Ready",
        description: "Please wait...",
        duration: 1500,
      });
      return;
    }

    try {
      const audio = audioRef.current;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        toast({
          title: "Atmosphere Paused",
          duration: 1000,
        });
      } else {
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
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
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [audioReady, isPlaying, selectedTrack]);

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