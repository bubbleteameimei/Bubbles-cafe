import React, { useState, useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, VolumeX } from "lucide-react";

interface AudioTrack {
  name: string;
  file: string;
  volume: number;
  isPlaying: boolean;
}

export const SoundMixer = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([
    { name: "Whispering Wind", file: "/static/whispering_wind.mp3", volume: 0.5, isPlaying: false },
    { name: "Ethereal", file: "/static/ethereal.mp3", volume: 0.5, isPlaying: false },
    { name: "Nocturnal", file: "/static/nocturnal.mp3", volume: 0.5, isPlaying: false },
    { name: "Angels Standing Guard", file: "/static/angels_standing_guard.mp3", volume: 0.5, isPlaying: false },
  ]);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  useEffect(() => {
    // Initialize audio elements
    audioRefs.current = tracks.map((_, i) => audioRefs.current[i] || new Audio());
    
    // Set up audio elements
    tracks.forEach((track, i) => {
      if (audioRefs.current[i]) {
        audioRefs.current[i]!.src = track.file;
        audioRefs.current[i]!.loop = true;
        audioRefs.current[i]!.volume = track.volume;
      }
    });

    // Cleanup
    return () => {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const toggleTrack = (index: number) => {
    setTracks(prev => prev.map((track, i) => {
      if (i === index) {
        const audio = audioRefs.current[i];
        if (audio) {
          track.isPlaying ? audio.pause() : audio.play();
        }
        return { ...track, isPlaying: !track.isPlaying };
      }
      return track;
    }));
  };

  const updateVolume = (index: number, value: number) => {
    setTracks(prev => prev.map((track, i) => {
      if (i === index) {
        const audio = audioRefs.current[i];
        if (audio) {
          audio.volume = value;
        }
        return { ...track, volume: value };
      }
      return track;
    }));
  };

  const savePreferences = () => {
    const preferences = tracks.map(track => ({
      name: track.name,
      volume: track.volume,
      isPlaying: track.isPlaying
    }));
    localStorage.setItem('audioPreferences', JSON.stringify(preferences));
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
