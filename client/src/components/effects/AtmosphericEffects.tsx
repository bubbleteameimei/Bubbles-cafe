import { useState } from 'react';
import { useAudio } from '@/lib/audio-manager';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AtmosphericEffectsProps {
  className?: string;
}

// Define track timestamps
const tracks = [
  { title: "13 Angels Standing Guard 'Round The Side Of Your Bed", start: 0, end: 722 },
  { title: "The End Is The Beginning Is The End", start: 722, end: 1080 },
  { title: "Sleep Walk", start: 1080, end: 1260 },
  { title: "Whispers in the Dark", start: 1260, end: 1500 },
  { title: "Dark Night of the Soul", start: 1500, end: 1800 },
  { title: "Shadows and Mist", start: 1800, end: 2100 },
  { title: "Gothic Dreams", start: 2100, end: 2400 },
  { title: "Chamber of Secrets", start: 2400, end: 2700 },
  { title: "Twilight Hours", start: 2700, end: 3000 },
  { title: "Midnight's Call", start: 3000, end: 3375 }
];

export function AtmosphericEffects({ 
  className
}: AtmosphericEffectsProps) {
  const { isReady, error, playSound, stopSound, setVolume } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState(0);
  const { toast } = useToast();

  const handleTrackSelect = async (index: number) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log('[Audio UI] Track selected:', { index, track: tracks[index] });

      if (isPlaying) {
        stopSound();
      }

      await playSound({
        loop: false,
        volume,
        startTime: tracks[index].start,
        endTime: tracks[index].end
      });

      setCurrentTrack(index);
      setIsPlaying(true);
      toast({
        title: "Now Playing",
        description: tracks[index].title
      });
    } catch (error) {
      console.error('[Audio UI] Error:', error);
      toast({
        title: "Playback Error",
        description: error instanceof Error ? error.message : "Failed to play track",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log('[Audio UI] Toggle playback:', { isPlaying, currentTrack });

      if (isPlaying) {
        stopSound();
        setIsPlaying(false);
        toast({
          title: "Sound Stopped",
          description: "Background audio disabled"
        });
      } else {
        await playSound({
          loop: false,
          volume,
          startTime: tracks[currentTrack].start,
          endTime: tracks[currentTrack].end
        });
        setIsPlaying(true);
        toast({
          title: "Now Playing",
          description: tracks[currentTrack].title
        });
      }
    } catch (error) {
      console.error('[Audio UI] Error:', error);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: error instanceof Error ? error.message : "Failed to control audio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolumeState(newVolume);
    if (isPlaying) {
      setVolume(newVolume);
    }
  };

  if (error) {
    console.error('[Audio UI] Error state:', error);
    return null;
  }

  return (
    <div className={cn(
      "fixed top-4 right-4", // Moved to top-right
      "flex items-center gap-2",
      "z-[100]",
      "p-2 rounded-lg",
      "bg-background/20 backdrop-blur-sm shadow-lg",
      "transform-gpu hover:bg-background/30 transition-colors",
      className
    )}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 rounded-full",
              "transition-transform duration-200",
              "hover:scale-105 active:scale-95",
              "transform-gpu"
            )}
            disabled={!isReady || isLoading}
          >
            <Music className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {tracks.map((track, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleTrackSelect(index)}
              className={cn(
                "flex items-center justify-between",
                "cursor-pointer",
                currentTrack === index && "bg-primary/20"
              )}
            >
              <span className="truncate">{track.title}</span>
              {currentTrack === index && isPlaying && (
                <Volume2 className="h-4 w-4 ml-2 text-primary animate-pulse" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
        disabled={!isReady || isLoading}
        className={cn(
          "w-10 h-10 rounded-full",
          "transition-transform duration-200",
          "hover:scale-105 active:scale-95",
          "transform-gpu"
        )}
        title={!isReady ? "Initializing audio..." : isPlaying ? "Stop ambient sounds" : "Play ambient sounds"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>

      <div className={cn(
        "w-24",
        "transition-opacity duration-200",
        isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className={cn(
            "w-full h-2 rounded-full",
            "bg-background/40",
            "appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "transform-gpu"
          )}
          title="Adjust volume"
        />
      </div>
    </div>
  );
}