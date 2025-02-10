import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioTrack {
  name: string;
  file: string;
  volume: number;
  isPlaying: boolean;
  category: 'ambient' | 'effect' | 'atmosphere';
}

const DEFAULT_TRACKS: AudioTrack[] = [
  { 
    name: "Dark Ambience",
    file: "/dark_ambience.mp3",
    volume: 0.5,
    isPlaying: false,
    category: 'ambient'
  },
  { 
    name: "Heartbeat",
    file: "/heartbeat.mp3",
    volume: 0.3,
    isPlaying: false,
    category: 'effect'
  },
  { 
    name: "Whispers",
    file: "/whispers.mp3",
    volume: 0.4,
    isPlaying: false,
    category: 'atmosphere'
  },
  { 
    name: "Storm",
    file: "/storm.mp3",
    volume: 0.5,
    isPlaying: false,
    category: 'ambient'
  }
];

export const SoundMixer = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>(DEFAULT_TRACKS);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const audioElements = useRef<Array<HTMLAudioElement | null>>([]);
  const gainNodes = useRef<Array<GainNode | null>>([]);
  const { toast } = useToast();

  // Initialize audio context on first user interaction
  const initializeAudioContext = useCallback(() => {
    if (!audioContextInitialized && typeof window !== 'undefined') {
      try {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContextInitialized(true);
        console.log('[SoundMixer] AudioContext initialized successfully');
      } catch (error) {
        console.error('[SoundMixer] Failed to initialize AudioContext:', error);
        toast({
          title: "Audio System Error",
          description: "Failed to initialize audio system. Some features may be unavailable.",
          variant: "destructive",
        });
      }
    }
  }, [audioContextInitialized, toast]);

  // Set up audio nodes for each track
  useEffect(() => {
    if (!audioContextInitialized || !audioContext.current) return;

    try {
      audioElements.current = tracks.map(() => null);
      gainNodes.current = tracks.map(() => {
        if (audioContext.current) {
          const gainNode = audioContext.current.createGain();
          gainNode.connect(audioContext.current.destination);
          return gainNode;
        }
        return null;
      });

      return () => {
        gainNodes.current.forEach(node => node?.disconnect());
        audioElements.current.forEach(audio => {
          if (audio) {
            audio.pause();
            audio.src = '';
          }
        });
      };
    } catch (error) {
      console.error('[SoundMixer] Error setting up audio nodes:', error);
    }
  }, [audioContextInitialized]);

  const fadeAudio = useCallback((index: number, targetVolume: number, duration: number = 500) => {
    if (!audioContext.current || !gainNodes.current[index]) return;

    const gainNode = gainNodes.current[index];
    if (!gainNode) return;

    const startTime = audioContext.current.currentTime;
    const startVolume = gainNode.gain.value;

    gainNode.gain.cancelScheduledValues(startTime);
    gainNode.gain.setValueAtTime(startVolume, startTime);
    gainNode.gain.linearRampToValueAtTime(targetVolume, startTime + duration / 1000);
  }, []);

  const toggleTrack = useCallback((index: number) => {
    if (!audioContextInitialized) {
      initializeAudioContext();
      return;
    }

    try {
      setTracks(prev => prev.map((track, i) => {
        if (i === index) {
          if (!audioElements.current[i]) {
            // Create new audio element if it doesn't exist
            const audio = new Audio(track.file);
            audio.loop = true;
            audioElements.current[i] = audio;

            if (audioContext.current && gainNodes.current[i]) {
              const source = audioContext.current.createMediaElementSource(audio);
              source.connect(gainNodes.current[i]!);
            }
          }

          const audio = audioElements.current[i];
          if (audio) {
            if (!track.isPlaying) {
              audio.play().catch(console.error);
              fadeAudio(index, track.volume);
            } else {
              fadeAudio(index, 0);
              setTimeout(() => audio.pause(), 500);
            }
          }

          return { ...track, isPlaying: !track.isPlaying };
        }
        return track;
      }));
    } catch (error) {
      console.error('[SoundMixer] Toggle error:', error);
      toast({
        title: "Playback Error",
        description: "Failed to toggle audio track",
        variant: "destructive",
      });
    }
  }, [audioContextInitialized, initializeAudioContext, fadeAudio, toast]);

  const updateVolume = useCallback((index: number, value: number) => {
    try {
      setTracks(prev => prev.map((track, i) => {
        if (i === index) {
          fadeAudio(index, value, 200);
          return { ...track, volume: value };
        }
        return track;
      }));
    } catch (error) {
      console.error('[SoundMixer] Volume update error:', error);
      toast({
        title: "Volume Control Error",
        description: "Failed to update volume",
        variant: "destructive",
      });
    }
  }, [fadeAudio, toast]);

  return (
    <Card className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h3 className="text-lg font-serif font-semibold mb-4">Atmospheric Sound Mixer</h3>
      <div className="space-y-4">
        {tracks.map((track, index) => (
          <div key={track.name} className="flex items-center gap-4">
            <Button
              variant={track.isPlaying ? "default" : "secondary"}
              size="icon"
              onClick={() => toggleTrack(index)}
              className="relative hover:scale-105 transition-transform"
            >
              {track.isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {track.isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{track.name}</p>
                <span className="text-xs text-muted-foreground font-mono">
                  {Math.round(track.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[track.volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([value]) => updateVolume(index, value)}
                className="cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};