/**
 * useSoundEffects Hook
 * 
 * This hook manages sound effects and music for Eden's Hollow.
 * It supports:
 * - Playing one-off sound effects
 * - Managing background music/ambient sounds
 * - Adjusting volume based on game settings
 */

import { useRef, useCallback, useEffect } from 'react';
import { GameSettings } from '../types/game';
import { SOUND_PATHS as gameAssetSoundPaths } from '../utils/gameAssetLoader';

// Sound effect types
type SoundType = 
  | 'choice' 
  | 'confirm' 
  | 'cancel' 
  | 'sanityDrop' 
  | 'sanityGain' 
  | 'itemGet' 
  | 'ambientNormal' 
  | 'ambientLowSanity' 
  | 'jumpscare' 
  | 'revelation' 
  | 'ending'
  | 'creaking-gate';

// Use sound paths from gameAssetLoader to keep everything consistent
const SOUND_PATHS = gameAssetSoundPaths;

// Sound playback options
interface PlayOptions {
  loop?: boolean;
  volume?: number;
}

export default function useSoundEffects(settings: GameSettings) {
  // Keep track of currently playing sounds
  const audioElements = useRef<Record<string, HTMLAudioElement>>({});
  
  // Cleanup audio elements on unmount
  useEffect(() => {
    return () => {
      // Stop and remove all audio elements
      Object.values(audioElements.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      
      audioElements.current = {};
    };
  }, []);
  
  // Update all volumes when settings change
  useEffect(() => {
    // Skip if sound is disabled
    if (!settings.soundEnabled) {
      stopAllSounds();
      return;
    }
    
    // Update volume for all playing sounds
    Object.entries(audioElements.current).forEach(([key, audio]) => {
      if (key.includes('ambient') || key.includes('ending')) {
        audio.volume = settings.musicVolume;
      } else {
        audio.volume = settings.sfxVolume;
      }
    });
    
  }, [settings.soundEnabled, settings.musicVolume, settings.sfxVolume]);
  
  // Play a sound effect
  const playSound = useCallback((soundType: SoundType, options?: PlayOptions) => {
    // Skip if sound is disabled
    if (!settings.soundEnabled) return;
    
    const path = SOUND_PATHS[soundType];
    if (!path) {
      console.error(`Sound not found: ${soundType}`);
      return;
    }
    
    // Determine appropriate volume
    const isMusic = soundType === 'ambientNormal' || 
                    soundType === 'ambientLowSanity' || 
                    soundType === 'ending';
    const volume = isMusic 
      ? settings.musicVolume 
      : (options?.volume !== undefined ? options.volume : settings.sfxVolume);
    
    // Create and configure audio element
    const audio = new Audio(path);
    audio.volume = volume;
    
    if (options?.loop) {
      audio.loop = true;
    }
    
    // Handle missing audio files gracefully
    audio.onerror = () => {
      console.warn(`Audio file not found: ${path}`);
      // Clean up the reference so we don't keep trying to use this audio element
      delete audioElements.current[soundType];
    };
    
    // Store the audio element for later control
    audioElements.current[soundType] = audio;
    
    // Play the sound
    try {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error(`Error playing sound ${soundType}:`, error);
          // Clean up the reference if playback fails
          delete audioElements.current[soundType];
        });
      }
      
      return {
        stop: () => {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch (e) {
            console.warn('Could not stop audio properly:', e);
          }
          delete audioElements.current[soundType];
        }
      };
    } catch (error) {
      console.error(`Error playing sound ${soundType}:`, error);
      // Clean up references on error
      delete audioElements.current[soundType];
      return undefined;
    }
  }, [settings.soundEnabled, settings.musicVolume, settings.sfxVolume]);
  
  // Stop a specific sound
  const stopSound = useCallback((soundType: SoundType) => {
    const audio = audioElements.current[soundType];
    
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      delete audioElements.current[soundType];
    }
  }, []);
  
  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    Object.entries(audioElements.current).forEach(([key, audio]) => {
      audio.pause();
      audio.currentTime = 0;
      delete audioElements.current[key];
    });
  }, []);
  
  // Start ambient sounds based on sanity state
  const startAmbientSounds = useCallback((lowSanity: boolean) => {
    // Skip if sound is disabled
    if (!settings.soundEnabled) return;
    
    // Stop any currently playing ambient sounds
    stopSound('ambientNormal');
    stopSound('ambientLowSanity');
    
    // Play appropriate ambient sound
    if (lowSanity) {
      playSound('ambientLowSanity', { loop: true });
    } else {
      playSound('ambientNormal', { loop: true });
    }
  }, [settings.soundEnabled, playSound, stopSound]);
  
  // Toggle between normal and low sanity ambient sounds
  const toggleLowSanitySounds = useCallback((lowSanity: boolean) => {
    // Skip if sound is disabled
    if (!settings.soundEnabled) return;
    
    if (lowSanity && !audioElements.current['ambientLowSanity']) {
      stopSound('ambientNormal');
      playSound('ambientLowSanity', { loop: true });
    } else if (!lowSanity && !audioElements.current['ambientNormal']) {
      stopSound('ambientLowSanity');
      playSound('ambientNormal', { loop: true });
    }
  }, [settings.soundEnabled, playSound, stopSound]);
  
  // Update volumes for all currently playing sounds
  const updateVolumes = useCallback(() => {
    Object.entries(audioElements.current).forEach(([key, audio]) => {
      if (key.includes('ambient') || key.includes('ending')) {
        audio.volume = settings.musicVolume;
      } else {
        audio.volume = settings.sfxVolume;
      }
    });
  }, [settings.musicVolume, settings.sfxVolume]);
  
  return {
    playSound,
    stopSound,
    stopAllSounds,
    startAmbientSounds,
    toggleLowSanitySounds,
    updateVolumes
  };
}