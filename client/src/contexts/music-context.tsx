import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback, useMemo } from 'react';

// Define types for music context
export type PlaybackContext = 'general' | 'story-reading' | 'gallery' | 'admin' | 'settings' | 'reader' | 'game' | 'homepage';

interface AudioTrack {
  name: string;
  src: string;
  volume?: number;
}

interface MusicContextState {
  isPlaying: boolean;
  volume: number;
  currentTrack: string | null;
  isLoading: boolean;
  currentContext: PlaybackContext;
  contextAudioMap: Record<PlaybackContext, AudioTrack | null>;
  play: (track?: string, context?: PlaybackContext) => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (vol: number) => void;
  setContext: (context: PlaybackContext) => void;
  togglePlayPause: () => void;
  toggleMusic: () => void;
  setPlaybackContext: (context: PlaybackContext) => void;
  storePlaybackPosition: () => void;
  isContextActive: (context: PlaybackContext) => boolean;
}

const MusicContext = createContext<MusicContextState | undefined>(undefined);

// Default tracks for different contexts
const DEFAULT_TRACKS: Record<PlaybackContext, AudioTrack> = {
  general: { 
    name: 'Ambient Rain', 
    src: '/sounds/ambient-rain.mp3',
    volume: 0.3
  },
  'story-reading': { 
    name: 'Reading Ambience', 
    src: '/sounds/reading-ambience.mp3',
    volume: 0.25
  },
  gallery: { 
    name: 'Gallery Atmosphere', 
    src: '/sounds/gallery-atmosphere.mp3',
    volume: 0.2
  },
  admin: { 
    name: 'Admin Background', 
    src: '/sounds/admin-background.mp3',
    volume: 0.15
  },
  settings: { 
    name: 'Settings Theme', 
    src: '/sounds/settings-theme.mp3',
    volume: 0.2
  },
  reader: { 
    name: 'Reading Ambience', 
    src: '/sounds/reading-ambience.mp3',
    volume: 0.25
  },
  game: { 
    name: 'Game Background', 
    src: '/sounds/game-background.mp3',
    volume: 0.3
  },
  homepage: { 
    name: 'Homepage Theme', 
    src: '/sounds/homepage-theme.mp3',
    volume: 0.3
  }
};

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [primaryAudio, setPrimaryAudio] = useState<HTMLAudioElement | null>(null);
  const [secondaryAudio, setSecondaryAudio] = useState<HTMLAudioElement | null>(null);
  const [activeAudio, setActiveAudio] = useState<'primary' | 'secondary'>('primary');

  const [currentContext, setCurrentContext] = useState<PlaybackContext>('general');
  const [contextAudioMap] = useState<Record<PlaybackContext, AudioTrack | null>>({
    general: DEFAULT_TRACKS.general,
    'story-reading': DEFAULT_TRACKS['story-reading'],
    gallery: DEFAULT_TRACKS.gallery,
    admin: DEFAULT_TRACKS.admin,
    settings: DEFAULT_TRACKS.settings,
    reader: DEFAULT_TRACKS.reader,
    game: DEFAULT_TRACKS.game,
    homepage: DEFAULT_TRACKS.homepage
  });

  // Refs for persistence and timers
  const savedPositions = useRef<Record<string, number>>({});
  const loopTimerId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  // Storage in localStorage to persist across sessions
  const STORAGE_KEY = 'music-player-state';
  
  // Memoized volume setter with localStorage persistence
  const setVolume = useCallback((vol: number) => {
    const clampedVolume = Math.max(0, Math.min(1, vol));
    setVolumeState(clampedVolume);
    
    // Update audio elements volume
    if (primaryAudio) primaryAudio.volume = clampedVolume;
    if (secondaryAudio) secondaryAudio.volume = clampedVolume;
    
    // Persist to localStorage
    try {
      const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      savedState.volume = clampedVolume;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    } catch (error) {
      console.error('[Music] Error saving volume:', error);
    }
  }, [primaryAudio, secondaryAudio]);

  // Load saved state from localStorage on init
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed?.positions) {
          savedPositions.current = parsed.positions;
          
          // Restore volume if available
          if (typeof parsed.volume === 'number') {
            setVolumeState(parsed.volume);
          }
          
          console.log('[Music] Loaded saved playback positions', savedPositions.current);
        }
      }
    } catch (error) {
      console.error('[Music] Error loading saved state:', error);
    }
  }, []);

  // Initialize audio elements with proper cleanup
  useEffect(() => {
    const primary = new Audio();
    const secondary = new Audio();
    
    // Configure audio elements
    [primary, secondary].forEach(audio => {
      audio.volume = volume;
      audio.preload = 'auto';
      audio.loop = true; // Enable looping for background music
    });
    
    setPrimaryAudio(primary);
    setSecondaryAudio(secondary);
    
    // Clean up on unmount
    return () => {
      primary.pause();
      secondary.pause();
      primary.src = '';
      secondary.src = '';
      if (loopTimerId.current) {
        window.clearTimeout(loopTimerId.current as any);
      }
      if (fadeIntervalId.current) {
        window.clearInterval(fadeIntervalId.current as any);
      }
    };
  }, []); // Empty dependency array - only run once

  // Update audio volume when volume state changes
  useEffect(() => {
    if (primaryAudio) primaryAudio.volume = volume;
    if (secondaryAudio) secondaryAudio.volume = volume;
  }, [volume, primaryAudio, secondaryAudio]);

  // Memoized play function
  const play = useCallback(async (track?: string, context?: PlaybackContext) => {
    if (!primaryAudio || !secondaryAudio) return;

    setIsLoading(true);
    
    try {
      const targetContext = context || currentContext;
      const targetTrack = track || contextAudioMap[targetContext]?.src || DEFAULT_TRACKS.general.src;
      
      // If same track is already playing, just ensure it's playing
      if (currentTrack === targetTrack && isPlaying) {
        setIsLoading(false);
        return;
      }

      const inactiveAudio = activeAudio === 'primary' ? secondaryAudio : primaryAudio;
      const currentActiveAudio = activeAudio === 'primary' ? primaryAudio : secondaryAudio;

      // Load new track in inactive audio element
      inactiveAudio.src = targetTrack;
      
      // Restore saved position if available
      if (savedPositions.current[targetTrack]) {
        inactiveAudio.currentTime = savedPositions.current[targetTrack];
      }

      await inactiveAudio.play();
      
      // Crossfade if currently playing
      if (isPlaying && currentActiveAudio.src) {
        await crossfade(currentActiveAudio, inactiveAudio);
      }

      // Switch active audio
      setActiveAudio(activeAudio === 'primary' ? 'secondary' : 'primary');
      setCurrentTrack(targetTrack);
      setIsPlaying(true);
      
      if (context) {
        setCurrentContext(context);
      }

    } catch (error) {
      console.error('[Music] Error playing track:', error);
    } finally {
      setIsLoading(false);
    }
  }, [primaryAudio, secondaryAudio, currentTrack, isPlaying, activeAudio, currentContext, contextAudioMap]);

  // Memoized pause function
  const pause = useCallback(() => {
    const currentActiveAudio = activeAudio === 'primary' ? primaryAudio : secondaryAudio;
    if (currentActiveAudio) {
      // Save current position
      if (currentTrack) {
        savedPositions.current[currentTrack] = currentActiveAudio.currentTime;
        persistState();
      }
      currentActiveAudio.pause();
      setIsPlaying(false);
    }
  }, [activeAudio, primaryAudio, secondaryAudio, currentTrack]);

  // Memoized stop function
  const stop = useCallback(() => {
    [primaryAudio, secondaryAudio].forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlaying(false);
    setCurrentTrack(null);
  }, [primaryAudio, secondaryAudio]);

  // Crossfade helper function
  const crossfade = useCallback(async (fromAudio: HTMLAudioElement, toAudio: HTMLAudioElement) => {
    return new Promise<void>((resolve) => {
      const duration = 1000; // 1 second crossfade
      const steps = 20;
      const stepDuration = duration / steps;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        
        fromAudio.volume = volume * (1 - progress);
        toAudio.volume = volume * progress;

        if (step >= steps) {
          clearInterval(interval);
          fromAudio.pause();
          fromAudio.volume = volume;
          resolve();
        }
      }, stepDuration);

      fadeIntervalId.current = interval;
    });
  }, [volume]);

  // Persist state to localStorage
  const persistState = useCallback(() => {
    try {
      const state = {
        positions: savedPositions.current,
        volume
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('[Music] Error persisting state:', error);
    }
  }, [volume]);

  // Memoized toggle function
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Memoized context checker
  const isContextActive = useCallback((context: PlaybackContext) => {
    return currentContext === context && isPlaying;
  }, [currentContext, isPlaying]);

  // Memoized context setter
  const setContext = useCallback((context: PlaybackContext) => {
    setCurrentContext(context);
    // Auto-play the track for the new context if currently playing
    if (isPlaying) {
      play(undefined, context);
    }
  }, [isPlaying, play]);

  // Alias functions to match MusicButton expectations
  const toggleMusic = togglePlayPause;
  const setPlaybackContext = setContext;
  const storePlaybackPosition = useCallback(() => {
    if (currentTrack) {
      const currentActiveAudio = activeAudio === 'primary' ? primaryAudio : secondaryAudio;
      if (currentActiveAudio) {
        savedPositions.current[currentTrack] = currentActiveAudio.currentTime;
        persistState();
      }
    }
  }, [currentTrack, activeAudio, primaryAudio, secondaryAudio, persistState]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isPlaying,
    volume,
    currentTrack,
    isLoading,
    currentContext,
    contextAudioMap,
    play,
    pause,
    stop,
    setVolume,
    setContext,
    togglePlayPause,
    toggleMusic,
    setPlaybackContext,
    storePlaybackPosition,
    isContextActive
  }), [
    isPlaying,
    volume,
    currentTrack,
    isLoading,
    currentContext,
    contextAudioMap,
    play,
    pause,
    stop,
    setVolume,
    setContext,
    togglePlayPause,
    toggleMusic,
    setPlaybackContext,
    storePlaybackPosition,
    isContextActive
  ]);

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}