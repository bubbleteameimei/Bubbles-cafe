import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioTrack {
  name: string;
  file: string;
  isPlaying: boolean;
}

const DEFAULT_TRACKS: AudioTrack[] = [
  { 
    name: "Ethereal",
    file: "/ethereal.mp3",
    isPlaying: false
  },
  { 
    name: "Nocturnal",
    file: "/nocturnal.mp3",
    isPlaying: false
  }
];

export const SoundMixer = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>(DEFAULT_TRACKS);
  const audioElements = useRef<Array<HTMLAudioElement | null>>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize audio elements
    audioElements.current = tracks.map(() => null);

    return () => {
      // Cleanup audio elements on unmount
      audioElements.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const toggleTrack = (index: number) => {
    try {
      setTracks(prev => prev.map((track, i) => {
        if (i === index) {
          if (!audioElements.current[i]) {
            // Create new audio element if it doesn't exist
            const audio = new Audio(track.file);
            audio.loop = true;
            audioElements.current[i] = audio;
          }

          const audio = audioElements.current[i];
          if (audio) {
            if (!track.isPlaying) {
              audio.play().catch(error => {
                console.error('[SoundMixer] Play error:', error);
                toast({
                  title: "Playback Error",
                  description: "Failed to play audio track",
                  variant: "destructive",
                });
              });
            } else {
              audio.pause();
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
  };

  return (
    <Card className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h3 className="text-lg font-serif font-semibold mb-4">Atmosphere</h3>
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
              <p className="text-sm font-medium">{track.name}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};