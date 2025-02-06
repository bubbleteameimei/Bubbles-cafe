import { createContext, useContext, useRef, useEffect, useState } from 'react';

interface AudioContextType {
  toggleAudio: () => void;
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  audioReady: boolean;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    try {
      // Initialize Web Audio API
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      oscillatorRef.current = audioContextRef.current.createOscillator();

      // Connect nodes
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Set initial volume with smooth transition
      gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(
        volume,
        audioContextRef.current.currentTime + 0.1
      );

      // Set up oscillator for ambient sound
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(100, audioContextRef.current.currentTime);
      oscillatorRef.current.detune.setValueAtTime(-10, audioContextRef.current.currentTime);

      setAudioReady(true);

      return () => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    } catch (err) {
      console.error("Error initializing audio:", err);
      setAudioReady(false);
    }
  }, []);

  // Update volume with smooth transition
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.cancelScheduledValues(audioContextRef.current.currentTime);
      gainNodeRef.current.gain.setValueAtTime(
        gainNodeRef.current.gain.value,
        audioContextRef.current.currentTime
      );
      gainNodeRef.current.gain.linearRampToValueAtTime(
        volume,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, [volume]);

  const toggleAudio = async () => {
    if (!audioReady || !audioContextRef.current || !oscillatorRef.current) {
      console.log('Audio system not ready');
      return;
    }

    try {
      if (isPlaying) {
        // Fade out before stopping
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.linearRampToValueAtTime(
            0,
            audioContextRef.current.currentTime + 0.1
          );
        }
        setTimeout(() => {
          if (oscillatorRef.current) {
            oscillatorRef.current.stop();
          }
        }, 100);
        setIsPlaying(false);
      } else {
        // Create and start a new oscillator with fade in
        oscillatorRef.current = audioContextRef.current.createOscillator();
        oscillatorRef.current.connect(gainNodeRef.current!);

        oscillatorRef.current.type = 'sine';
        oscillatorRef.current.frequency.setValueAtTime(100, audioContextRef.current.currentTime);
        oscillatorRef.current.detune.setValueAtTime(-10, audioContextRef.current.currentTime);

        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
          gainNodeRef.current.gain.linearRampToValueAtTime(
            volume,
            audioContextRef.current.currentTime + 0.1
          );
        }

        oscillatorRef.current.start();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Toggle audio error:", err);
      setIsPlaying(false);
    }
  };

  return (
    <AudioContext.Provider value={{ 
      toggleAudio, 
      isPlaying, 
      volume, 
      setVolume, 
      audioReady 
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

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

export default function AmbientAudio() {
  const [audio] = useState(new Audio('/assets/whispering_wind.mp3'));
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.2;
    return () => {
      audio.pause();
    };
  }, [audio]);

  const toggleAudio = () => {
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleAudio}
      className="fixed bottom-4 right-4 z-50"
      title={playing ? 'Mute' : 'Play ambient sound'}
    >
      {playing ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
}