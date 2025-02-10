import React, { useRef, useEffect } from 'react';
import YouTube, { YouTubeEvent, YouTubeProps } from 'react-youtube';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  videoId: string;
  className?: string;
}

const AudioPlayer = ({ videoId, className }: AudioPlayerProps) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(0.5);
  const { toast } = useToast();

  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      fs: 0,
      rel: 0,
      origin: window.location.origin
    },
  };

  const handlePlayAudio = () => {
    if (playerRef.current?.internalPlayer) {
      try {
        playerRef.current.internalPlayer.playVideo();
        setIsPlaying(true);
      } catch (error) {
        console.error('[AudioPlayer] Play error:', error);
        toast({
          title: "Playback Error",
          description: "Failed to play audio",
          variant: "destructive",
        });
      }
    }
  };

  const handlePauseAudio = () => {
    if (playerRef.current?.internalPlayer) {
      try {
        playerRef.current.internalPlayer.pauseVideo();
        setIsPlaying(false);
      } catch (error) {
        console.error('[AudioPlayer] Pause error:', error);
        toast({
          title: "Playback Error",
          description: "Failed to pause audio",
          variant: "destructive",
        });
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (playerRef.current?.internalPlayer) {
      try {
        const newVolume = value[0];
        setVolume(newVolume);
        playerRef.current.internalPlayer.setVolume(newVolume * 100);
      } catch (error) {
        console.error('[AudioPlayer] Volume change error:', error);
        toast({
          title: "Volume Error",
          description: "Failed to adjust volume",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (playerRef.current?.internalPlayer) {
        try {
          playerRef.current.internalPlayer.pauseVideo();
        } catch (error) {
          console.error('[AudioPlayer] Cleanup error:', error);
        }
      }
    };
  }, []);

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={(event: YouTubeEvent) => {
          playerRef.current = event.target;
          event.target.setVolume(volume * 100);
        }}
        onError={(event: { data: number }) => {
          console.error('[AudioPlayer] YouTube error:', event);
          toast({
            title: "Audio Error",
            description: "Failed to load audio track",
            variant: "destructive",
          });
        }}
        className="hidden"
      />
      <div className="flex items-center space-x-2">
        <Button 
          onClick={isPlaying ? handlePauseAudio : handlePlayAudio}
          variant="outline"
          size="icon"
          className="hover:bg-primary/10"
        >
          <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
          {isPlaying ? '⏸️' : '▶️'}
        </Button>
        <Slider
          defaultValue={[volume]}
          max={1}
          step={0.01}
          value={[volume]}
          onValueChange={handleVolumeChange}
          className="w-[120px]"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;