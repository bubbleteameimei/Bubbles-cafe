import { createContext, useContext, useState, useCallback } from 'react';
import YouTube from 'react-youtube';
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
  'Ethereal': 'hQZfGa5t4e8', // 13 Angels Standing Guard
  'Nocturnal': 'dQw4w9WgXcQ' // Replace with your YouTube video ID
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [audioReady, setAudioReady] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('Ethereal');
  const [player, setPlayer] = useState<any>(null);
  const { toast } = useToast();

  const onReady = (event: any) => {
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
  }, [audioReady, isPlaying, player, toast]);

  const onStateChange = (event: any) => {
    if (event.data === YouTube.PlayerState.ENDED) {
      event.target.playVideo(); // Loop the video
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
            },
          }}
          onReady={onReady}
          onStateChange={onStateChange}
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