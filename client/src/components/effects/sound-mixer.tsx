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
}

// Create an AudioCache to store preloaded audio files
const audioCache = new Map<string, HTMLAudioElement>();

// Initialize audio context
let audioContext: AudioContext | null = null;

export const SoundMixer = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([
    { name: "Whispering Wind", file: "/whispering_wind.mp3", volume: 0.5, isPlaying: false },
    { name: "Ethereal", file: "/ethereal.mp3", volume: 0.5, isPlaying: false },
    { name: "Nocturnal", file: "/nocturnal.mp3", volume: 0.5, isPlaying: false },
    { name: "Angels Standing Guard", file: "/angels_standing_guard.mp3", volume: 0.5, isPlaying: false },
  ]);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const gainNodes = useRef<(GainNode | null)[]>([]);
  const { toast } = useToast();

  // Initialize Web Audio API context and gain nodes
  useEffect(() => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Create gain nodes for each track
    gainNodes.current = tracks.map(() => {
      if (audioContext) {
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        return gainNode;
      }
      return null;
    });

    return () => {
      gainNodes.current.forEach(node => node?.disconnect());
    };
  }, []);

  // Preload audio files with improved error handling
  useEffect(() => {
    const preloadAudio = async () => {
      const preloadPromises = tracks.map(async (track) => {
        if (!audioCache.has(track.file)) {
          try {
            const audio = new Audio();
            audio.preload = "auto";
            audio.src = track.file;

            // Return a promise that resolves when the audio is loaded
            return new Promise((resolve, reject) => {
              audio.addEventListener('canplaythrough', () => {
                audioCache.set(track.file, audio);
                resolve(true);
              }, { once: true });

              audio.addEventListener('error', () => {
                reject(new Error(`Failed to load audio: ${track.file}`));
              }, { once: true });

              // Start loading
              audio.load();
            });
          } catch (error) {
            console.error(`Error preloading ${track.file}:`, error);
          }
        }
      });

      try {
        await Promise.all(preloadPromises);
        console.log('All audio files preloaded successfully');
      } catch (error) {
        console.error('Error during audio preloading:', error);
      }
    };

    preloadAudio();
  }, []);

  // Initialize audio elements with Web Audio API integration
  useEffect(() => {
    audioRefs.current = tracks.map((track, index) => {
      const cachedAudio = audioCache.get(track.file);
      if (cachedAudio && audioContext) {
        const audio = cachedAudio.cloneNode() as HTMLAudioElement;
        audio.loop = true;
        audio.volume = 0; // Initial volume set to 0 for smooth fade-in

        // Connect audio element to gain node
        const source = audioContext.createMediaElementSource(audio);
        const gainNode = gainNodes.current[index];
        if (gainNode) {
          source.connect(gainNode);
          gainNode.gain.value = track.volume;
        }

        return audio;
      }
      return null;
    });

    return () => {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, [tracks]);

  const fadeAudio = useCallback((audio: HTMLAudioElement | null, gainNode: GainNode | null, targetVolume: number, duration: number = 500) => {
    if (!audio || !gainNode || !audioContext) return;

    const startVolume = gainNode.gain.value;
    const volumeChange = targetVolume - startVolume;
    const startTime = audioContext.currentTime;

    gainNode.gain.cancelScheduledValues(startTime);
    gainNode.gain.setValueAtTime(startVolume, startTime);
    gainNode.gain.linearRampToValueAtTime(targetVolume, startTime + duration / 1000);
  }, []);

  const toggleTrack = useCallback(async (index: number) => {
    try {
      setTracks(prev => prev.map((track, i) => {
        if (i === index) {
          const audio = audioRefs.current[i];
          const gainNode = gainNodes.current[i];

          if (audio) {
            if (track.isPlaying) {
              fadeAudio(audio, gainNode, 0);
              setTimeout(() => audio.pause(), 500);
            } else {
              audio.play().catch(console.error);
              fadeAudio(audio, gainNode, track.volume);
            }
          }
          return { ...track, isPlaying: !track.isPlaying };
        }
        return track;
      }));
    } catch (error) {
      console.error('[SoundMixer] Toggle error:', error);
      toast({
        title: "Error",
        description: "Failed to toggle audio",
        variant: "destructive",
      });
    }
  }, [fadeAudio, toast]);

  const updateVolume = useCallback((index: number, value: number) => {
    try {
      setTracks(prev => prev.map((track, i) => {
        if (i === index) {
          const gainNode = gainNodes.current[i];
          if (gainNode) {
            fadeAudio(audioRefs.current[i], gainNode, value, 200);
          }
          return { ...track, volume: value };
        }
        return track;
      }));
    } catch (error) {
      console.error('[SoundMixer] Volume update error:', error);
      toast({
        title: "Error",
        description: "Failed to update volume",
        variant: "destructive",
      });
    }
  }, [fadeAudio, toast]);

  const savePreferences = () => {
    try {
      const preferences = tracks.map(track => ({
        name: track.name,
        volume: track.volume,
        isPlaying: track.isPlaying
      }));
      localStorage.setItem('audioPreferences', JSON.stringify(preferences));
      console.log('[SoundMixer] Preferences saved successfully');
    } catch (error) {
      console.error('[SoundMixer] Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h3 className="text-lg font-semibold mb-4">Ambient Sound Mixer</h3>
      <div className="space-y-4">
        {tracks.map((track, index) => (
          <div key={track.name} className="flex items-center gap-4">
            <Button
              variant={track.isPlaying ? "default" : "secondary"}
              size="icon"
              onClick={() => toggleTrack(index)}
            >
              {track.isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{track.name}</p>
              <Slider
                value={[track.volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([value]) => updateVolume(index, value)}
              />
            </div>
          </div>
        ))}
      </div>
      <Button onClick={savePreferences} className="mt-4">
        Save Preferences
      </Button>
    </Card>
  );
};