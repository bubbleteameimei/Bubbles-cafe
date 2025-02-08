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
  '13 Angels': '/13-angels.mp3',
  'Whispering Wind': '/whispering-wind.mp3'
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lastPlaybackTimeRef = useRef<number>(0);
  const lastPauseTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioReady, setAudioReady] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('13 Angels');
  const { toast } = useToast();

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.src = TRACKS[selectedTrack as keyof typeof TRACKS];
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

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setAudioReady(false);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: "Failed to load audio",
        variant: "destructive",
        duration: 500,
      });
    });

    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlay);
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

  function updatePlaybackRate(audio: HTMLAudioElement, start: number, duration: number) {
    const startTime = performance.now();

    function animate() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out for smooth transition
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRate = start + (1 - start) * easeOut;

      if (audio && !audio.paused) {
        audio.playbackRate = currentRate;
        if (progress < 1) {
          requestAnimationFrame(animate);
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
        title: "Audio Not Ready",
        variant: "destructive",
        duration: 500,
      });
      return;
    }

    const currentTime = Date.now();

    if (isPlaying) {
      audio.pause();
      lastPlaybackTimeRef.current = audio.currentTime;
      lastPauseTimeRef.current = currentTime;
      setIsPlaying(false);
      toast({
        title: "Audio Paused",
        duration: 500,
      });
    } else {
      const pauseDuration = currentTime - lastPauseTimeRef.current;

      // Reset to beginning if paused for more than 30 seconds
      if (pauseDuration > 30000) {
        audio.currentTime = 0;
      } else {
        audio.currentTime = lastPlaybackTimeRef.current;
      }

      // Set initial faster playback rate
      audio.playbackRate = 1.5;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            // Start smooth transition to normal speed after 8 seconds
            setTimeout(() => {
              if (audio && !audio.paused) {
                updatePlaybackRate(audio, 1.5, 2000); // 2-second transition
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