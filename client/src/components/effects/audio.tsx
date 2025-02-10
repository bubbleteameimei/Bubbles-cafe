import { createContext, useContext, useState, useCallback } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
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
  'Ambient': 'YOHoOnaNivMHwcWW'
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [audioReady, setAudioReady] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('Ambient');
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const { toast } = useToast();

  const onReady = (event: YouTubeEvent) => {
    setPlayer(event.target);
    setAudioReady(true);
    event.target.setVolume(volume);
  };

  const toggleAudio = useCallback(() => {
    if (!player || !audioReady) return;

    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
        player.setVolume(volume);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('[Audio] Playback error:', error);
      toast({
        title: "Playback Error",
        description: "Failed to play audio track",
        variant: "destructive",
      });
    }
  }, [audioReady, isPlaying, player, volume, toast]);

  const onStateChange = (event: YouTubeEvent) => {
    switch (event.data) {
      case YouTube.PlayerState.ENDED:
        event.target.playVideo(); // Loop the video
        break;
      case YouTube.PlayerState.PLAYING:
        setIsPlaying(true);
        break;
      case YouTube.PlayerState.PAUSED:
        setIsPlaying(false);
        break;
      case YouTube.PlayerState.UNSTARTED:
      case YouTube.PlayerState.BUFFERING:
      case YouTube.PlayerState.CUED:
        // Handle other states if needed
        break;
      default:
        console.error('[Audio] YouTube player in unknown state:', event.data);
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "An error occurred with the audio track",
          variant: "destructive",
        });
    }
  };

  return (
    <AudioContext.Provider value={{
      isPlaying,
      volume,
      setVolume: (newVolume) => {
        setVolume(newVolume);
        if (player) player.setVolume(newVolume);
      },
      audioReady,
      toggleAudio,
      selectedTrack,
      setSelectedTrack
    }}>
      <div style={{ display: 'none' }}>
        <YouTube
          videoId={TRACKS[selectedTrack as keyof typeof TRACKS]}
          opts={{
            height: '0',
            width: '0',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              origin: window.location.origin
            },
          }}
          onReady={onReady}
          onStateChange={onStateChange}
          onError={(event: { data: number }) => {
            console.error('[Audio] YouTube error:', event);
            toast({
              title: "Audio Error",
              description: "Failed to load audio track",
              variant: "destructive",
            });
          }}
        />
      </div>
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