import React, { useState, useEffect, useRef } from 'react';
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

export const SoundMixer = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([
    { name: "Whispering Wind", file: "/whispering_wind.mp3", volume: 0.5, isPlaying: false },
    { name: "Ethereal", file: "/ethereal.mp3", volume: 0.5, isPlaying: false },
    { name: "Nocturnal", file: "/nocturnal.mp3", volume: 0.5, isPlaying: false },
    { name: "Angels Standing Guard", file: "/angels_standing_guard.mp3", volume: 0.5, isPlaying: false },
  ]);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const { toast } = useToast();

  // Preload audio files
  useEffect(() => {
    tracks.forEach((track) => {
      if (!audioCache.has(track.file)) {
        const audio = new Audio(track.file);
        audio.preload = "auto";
        audioCache.set(track.file, audio);
      }
    });
  }, []);

  useEffect(() => {
    console.log('[SoundMixer] Initializing audio elements');
    audioRefs.current = tracks.map((track) => {
      const cachedAudio = audioCache.get(track.file);
      if (cachedAudio) {
        const audio = cachedAudio.cloneNode() as HTMLAudioElement;
        audio.loop = true;
        audio.volume = track.volume;
        audio.crossOrigin = "anonymous";
        return audio;
      }
      return null;
    });

    return () => {
      console.log('[SoundMixer] Cleaning up audio elements');
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
    };
  }, [tracks]);

  const toggleTrack = async (index: number) => {
    try {
      setTracks(prev => prev.map((track, i) => {
        if (i === index) {
          const audio = audioRefs.current[i];
          if (audio) {
            if (track.isPlaying) {
              // Implement smooth fade-out
              const fadeOut = setInterval(() => {
                if (audio.volume > 0.1) {
                  audio.volume = Math.max(0, audio.volume - 0.1);
                } else {
                  audio.pause();
                  clearInterval(fadeOut);
                }
              }, 50);
            } else {
              // Implement smooth fade-in
              audio.volume = 0;
              audio.play().catch(error => {
                console.error(`[SoundMixer] Playback error for ${track.name}:`, error);
                toast({
                  title: "Playback Error",
                  description: `Could not play audio`,
                  variant: "destructive",
                });
              });

              const fadeIn = setInterval(() => {
                if (audio.volume < track.volume) {
                  audio.volume = Math.min(audio.volume + 0.1, track.volume);
                } else {
                  clearInterval(fadeIn);
                }
              }, 50);
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
  };

  const updateVolume = (index: number, value: number) => {
    try {
      setTracks(prev => prev.map((track, i) => {
        if (i === index) {
          const audio = audioRefs.current[i];
          if (audio) {
            // Smoothly transition volume
            const currentVolume = audio.volume;
            const volumeDiff = value - currentVolume;
            const steps = 10;
            const stepSize = volumeDiff / steps;

            let step = 0;
            const smoothVolume = setInterval(() => {
              if (step < steps) {
                audio.volume = currentVolume + (stepSize * step);
                step++;
              } else {
                audio.volume = value;
                clearInterval(smoothVolume);
              }
            }, 20);
          }
          return { ...track, volume: value };
        }
        return track;
      }));
    } catch (error) {
      console.error('[SoundMixer] Volume update error:', error);
    }
  };

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