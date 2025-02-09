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

export const SoundMixer = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([
    { name: "Whispering Wind", file: "/whispering_wind.mp3", volume: 0.5, isPlaying: false },
    { name: "Ethereal", file: "/ethereal.mp3", volume: 0.5, isPlaying: false },
    { name: "Nocturnal", file: "/nocturnal.mp3", volume: 0.5, isPlaying: false },
    { name: "Angels Standing Guard", file: "/angels_standing_guard.mp3", volume: 0.5, isPlaying: false },
  ]);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[SoundMixer] Initializing audio elements');
    // Initialize audio elements
    audioRefs.current = tracks.map((_, i) => audioRefs.current[i] || new Audio());

    // Set up audio elements
    tracks.forEach((track, i) => {
      if (audioRefs.current[i]) {
        try {
          audioRefs.current[i]!.src = track.file;
          audioRefs.current[i]!.loop = true;
          audioRefs.current[i]!.volume = track.volume;

          // Add error handling
          audioRefs.current[i]!.onerror = () => {
            console.error(`[SoundMixer] Error loading track: ${track.name}`);
            toast({
              title: "Audio Error",
              description: `Failed to load ${track.name}`,
              variant: "destructive",
            });
          };
        } catch (error) {
          console.error(`[SoundMixer] Error setting up track ${track.name}:`, error);
        }
      }
    });

    // Cleanup
    return () => {
      console.log('[SoundMixer] Cleaning up audio elements');
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, [toast]);

  const toggleTrack = (index: number) => {
    try {
      setTracks(prev => prev.map((track, i) => {
        if (i === index) {
          const audio = audioRefs.current[i];
          if (audio) {
            if (track.isPlaying) {
              audio.pause();
              console.log(`[SoundMixer] Paused track: ${track.name}`);
            } else {
              audio.play().catch(error => {
                console.error(`[SoundMixer] Playback error for ${track.name}:`, error);
                toast({
                  title: "Playback Error",
                  description: `Could not play ${track.name}`,
                  variant: "destructive",
                });
              });
              console.log(`[SoundMixer] Playing track: ${track.name}`);
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
        description: "Failed to toggle audio track",
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
            audio.volume = value;
            console.log(`[SoundMixer] Updated volume for ${track.name}: ${value}`);
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
      toast({
        title: "Success",
        description: "Audio preferences saved",
      });
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