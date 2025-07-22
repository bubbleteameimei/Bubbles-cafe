import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

// Define the type of context the player is being used in
export type PlaybackContext = 'homepage' | 'reader' | 'game' | 'settings' | 'general';

// Structure to store playback position information
interface PlaybackPosition {
  position: number;
  timestamp: number;
  context: PlaybackContext;
  trackUrl: string;
}

interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  currentTrack: string | null;
  playMusic: (trackUrl?: string) => void;
  pauseMusic: () => void;
  toggleMusic: () => void;
  setVolume: (volume: number) => void;
  setPlaybackContext: (context: PlaybackContext) => void;
  resumeFromContext: (context: PlaybackContext) => void;
  storePlaybackPosition: () => void;
  getCurrentPosition: () => number;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Available audio tracks
const TRACKS = [
  '/audio/whispers wind.m4a'
];

// Default track if none specified
const DEFAULT_TRACK = TRACKS[0];

// Constants for seamless looping
const CROSSFADE_DURATION = 2000; // 2 seconds crossfade
const LOOP_ANTICIPATION_TIME = 2500; // Start next loop 2.5 seconds before end

interface MusicProviderProps {
  children: ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  
  // Use two audio elements for crossfading
  const [primaryAudio, setPrimaryAudio] = useState<HTMLAudioElement | null>(null);
  const [secondaryAudio, setSecondaryAudio] = useState<HTMLAudioElement | null>(null);
  const [activeAudio, setActiveAudio] = useState<'primary' | 'secondary'>('primary');
  
  // Current playback context
  const [currentContext, setCurrentContext] = useState<PlaybackContext>('general');
  
  // Refs for tracking audio state
  const audioLoaded = useRef<boolean>(false);
  const crossfadeInProgress = useRef<boolean>(false);
  const loopTimerId = useRef<number | null>(null);
  
  // Saved positions for different contexts
  const savedPositions = useRef<Record<PlaybackContext, PlaybackPosition | null>>({
    homepage: null,
    reader: null,
    game: null,
    settings: null,
    general: null
  });
  
  // Storage in localStorage to persist across sessions
  const STORAGE_KEY = 'music-player-state';
  
  // Load saved state from localStorage on init
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed && parsed.positions) {
          savedPositions.current = parsed.positions;
          
          // Also restore volume if available
          if (parsed.volume !== undefined) {
            setVolume(parsed.volume);
          }
          
          console.log('[Music] Loaded saved playback positions', savedPositions.current);
        }
      }
    } catch (error) {
      console.error('[Music] Error loading saved state:', error);
    }
  }, []);

  // Initialize audio elements
  useEffect(() => {
    const primary = new Audio();
    const secondary = new Audio();
    
    // Configure audio elements
    [primary, secondary].forEach(audio => {
      audio.volume = volume;
      audio.preload = 'auto';
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
        window.clearTimeout(loopTimerId.current);
      }
    };
  }, []);

  // Handle audio loading and initial setup
  useEffect(() => {
    const loadAudio = async () => {
      if (primaryAudio && !audioLoaded.current && currentTrack) {
        try {
          primaryAudio.src = currentTrack;
          secondaryAudio!.src = currentTrack;
          
          // Wait for metadata to load for primary audio
          await new Promise(resolve => {
            primaryAudio.addEventListener('loadedmetadata', resolve, { once: true });
          });
          
          // Wait for metadata to load for secondary audio  
          await new Promise(resolve => {
            secondaryAudio!.addEventListener('loadedmetadata', resolve, { once: true });
          });
          
          audioLoaded.current = true;
          console.log('[Music] Audio loaded successfully');
          
          // Set up timeupdate event for loop handling
          primaryAudio.addEventListener('timeupdate', handleTimeUpdate);
          secondaryAudio!.addEventListener('timeupdate', handleTimeUpdate);
          
          if (isPlaying) {
            playCurrentAudio();
          }
        } catch (error) {
          console.error('[Music] Error loading audio:', error);
        }
      }
    };
    
    loadAudio();
    
    return () => {
      if (primaryAudio) {
        primaryAudio.removeEventListener('timeupdate', handleTimeUpdate);
      }
      if (secondaryAudio) {
        secondaryAudio.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [primaryAudio, secondaryAudio, currentTrack]);

  // Update volume when it changes
  useEffect(() => {
    if (primaryAudio) {
      primaryAudio.volume = volume;
    }
    if (secondaryAudio) {
      secondaryAudio.volume = volume;
    }
  }, [volume, primaryAudio, secondaryAudio]);

  // Handle play/pause state changes
  useEffect(() => {
    if (primaryAudio && secondaryAudio) {
      if (isPlaying) {
        playCurrentAudio();
      } else {
        pauseAllAudio();
      }
    }
  }, [isPlaying, primaryAudio, secondaryAudio]);

  // Function to handle timeupdate event for loop anticipation
  const handleTimeUpdate = (event: Event) => {
    const audio = event.target as HTMLAudioElement;
    
    // Only process for the currently active audio element
    if ((activeAudio === 'primary' && audio !== primaryAudio) || 
        (activeAudio === 'secondary' && audio !== secondaryAudio)) {
      return;
    }
    
    if (!crossfadeInProgress.current && audio.duration > 0) {
      const timeRemaining = audio.duration - audio.currentTime;
      
      // Start crossfade when approaching the end of the track
      if (timeRemaining <= LOOP_ANTICIPATION_TIME / 1000 && isPlaying) {
        startCrossfade();
      }
    }
  };
  
  // Handle seamless crossfade between audio elements
  const startCrossfade = () => {
    if (crossfadeInProgress.current || !isPlaying) return;
    
    crossfadeInProgress.current = true;
    console.log('[Music] Starting seamless crossfade');
    
    const currentAudio = activeAudio === 'primary' ? primaryAudio : secondaryAudio;
    const nextAudio = activeAudio === 'primary' ? secondaryAudio : primaryAudio;
    
    if (!currentAudio || !nextAudio) return;
    
    // Reset the next audio to the beginning and start playing
    nextAudio.currentTime = 0;
    nextAudio.play().catch(error => {
      console.error('[Music] Error during crossfade:', error);
      crossfadeInProgress.current = false;
    });
    
    // Perform volume crossfade
    const startTime = performance.now();
    const initialVolume = volume;
    
    const fadeStep = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / CROSSFADE_DURATION, 1);
      
      // Adjust volumes for crossfade
      if (currentAudio && nextAudio) {
        currentAudio.volume = initialVolume * (1 - progress);
        nextAudio.volume = initialVolume * progress;
      }
      
      if (progress < 1) {
        // Continue crossfade
        window.requestAnimationFrame(fadeStep);
      } else {
        // Crossfade complete
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio.volume = initialVolume;
        }
        
        // Switch active audio
        setActiveAudio(activeAudio === 'primary' ? 'secondary' : 'primary');
        crossfadeInProgress.current = false;
        console.log('[Music] Crossfade complete');
      }
    };
    
    // Start the crossfade animation
    window.requestAnimationFrame(fadeStep);
  };

  // Play the currently active audio
  const playCurrentAudio = () => {
    const audio = activeAudio === 'primary' ? primaryAudio : secondaryAudio;
    if (audio) {
      audio.play().catch(error => {
        console.error('[Music] Error playing audio:', error);
        setIsPlaying(false);
      });
    }
  };
  
  // Pause all audio elements
  const pauseAllAudio = () => {
    if (primaryAudio) primaryAudio.pause();
    if (secondaryAudio) secondaryAudio.pause();
    if (loopTimerId.current) {
      window.clearTimeout(loopTimerId.current);
      loopTimerId.current = null;
    }
    crossfadeInProgress.current = false;
  };

  // Function to play music
  const playMusic = (trackUrl?: string) => {
    if (!primaryAudio || !secondaryAudio) return;
    
    const trackToPlay = trackUrl || currentTrack || DEFAULT_TRACK;
    
    // Only update src if it's a different track
    if (trackToPlay !== currentTrack) {
      pauseAllAudio();
      primaryAudio.src = trackToPlay;
      secondaryAudio.src = trackToPlay;
      setCurrentTrack(trackToPlay);
      audioLoaded.current = false;
      setActiveAudio('primary');
    }
    
    setIsPlaying(true);
  };

  // Function to pause music
  const pauseMusic = () => {
    setIsPlaying(false);
  };

  // Function to toggle music
  const toggleMusic = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  // Periodically save state to localStorage
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (isPlaying) {
        storePlaybackPosition();
      }
    }, 5000); // Save every 5 seconds while playing
    
    return () => clearInterval(saveInterval);
  }, [isPlaying]);
  
  // Save state to localStorage when volume changes
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      const state = savedState ? JSON.parse(savedState) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        volume
      }));
    } catch (error) {
      console.error('[Music] Error saving volume state:', error);
    }
  }, [volume]);
  
  // Function to get current playback position
  const getCurrentPosition = (): number => {
    const currentAudio = activeAudio === 'primary' ? primaryAudio : secondaryAudio;
    return currentAudio?.currentTime || 0;
  };
  
  // Function to store current playback position for the current context
  const storePlaybackPosition = () => {
    if (!currentTrack) return;
    
    const position = getCurrentPosition();
    
    // Only store if we have a valid position and are actually playing something
    if (position > 0) {
      const positionInfo: PlaybackPosition = {
        position,
        timestamp: Date.now(),
        context: currentContext,
        trackUrl: currentTrack
      };
      
      // Update in memory
      savedPositions.current[currentContext] = positionInfo;
      
      // Update in localStorage
      try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        const state = savedState ? JSON.parse(savedState) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...state,
          positions: savedPositions.current
        }));
        
        console.log(`[Music] Saved position for context '${currentContext}':`, position.toFixed(2));
      } catch (error) {
        console.error('[Music] Error saving position:', error);
      }
    }
  };
  
  // Function to set current playback context
  const setPlaybackContext = (context: PlaybackContext) => {
    // If changing context while playing, save position from old context
    if (isPlaying && currentContext !== context) {
      storePlaybackPosition();
    }
    
    setCurrentContext(context);
    console.log(`[Music] Context changed to: ${context}`);
  };
  
  // Function to resume playback from stored position for a specific context
  const resumeFromContext = (context: PlaybackContext) => {
    const savedPosition = savedPositions.current[context];
    
    if (!savedPosition || !primaryAudio || !secondaryAudio) {
      // No saved position, just play from beginning
      playMusic();
      return;
    }
    
    const { position, trackUrl, timestamp } = savedPosition;
    const currentTime = Date.now();
    const timeElapsed = (currentTime - timestamp) / 1000; // In seconds
    
    // If saved position is too old (more than 1 hour), start from beginning
    if (timeElapsed > 3600) {
      console.log(`[Music] Saved position for '${context}' is too old (${(timeElapsed/60).toFixed(0)} minutes), starting from beginning`);
      playMusic();
      return;
    }
    
    // Check if we have the same track
    if (trackUrl !== currentTrack) {
      // Different track, load it first
      pauseAllAudio();
      primaryAudio.src = trackUrl;
      secondaryAudio.src = trackUrl;
      setCurrentTrack(trackUrl);
      audioLoaded.current = false;
    }
    
    // Set position and play
    if (primaryAudio) {
      primaryAudio.currentTime = position;
      secondaryAudio.currentTime = position;
      
      console.log(`[Music] Resuming from position ${position.toFixed(2)} in context '${context}'`);
      setIsPlaying(true);
    }
  };
  
  // Enhanced pause function that stores position
  const pauseMusicWithStore = () => {
    if (isPlaying) {
      storePlaybackPosition();
    }
    setIsPlaying(false);
  };
  
  // Function to update volume
  const handleVolumeChange = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  const value = {
    isPlaying,
    volume,
    currentTrack,
    playMusic,
    pauseMusic: pauseMusicWithStore, // Use the enhanced version
    toggleMusic,
    setVolume: handleVolumeChange,
    setPlaybackContext,
    resumeFromContext,
    storePlaybackPosition,
    getCurrentPosition
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextType {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}