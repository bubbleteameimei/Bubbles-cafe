/**
 * Eden's Hollow Sound Effects Hook
 * 
 * This hook manages the game's audio, including sound effects,
 * ambient sounds, and music based on the game state.
 */

import { useEffect, useRef, useCallback } from 'react';

type SoundType = 'choice' | 'confirm' | 'sanityDrop' | 'sanityGain' | 'ambient' | 'lowSanity';

export function useSoundEffects(enabled: boolean = true) {
  // Audio references for various sounds
  const soundRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    choice: null,
    confirm: null,
    sanityDrop: null,
    sanityGain: null,
    ambient: null,
    lowSanity: null
  });

  // Volume settings
  const volumes = useRef({
    effects: 0.7,
    ambient: 0.3
  });
  
  // Initialize sounds on component mount
  useEffect(() => {
    // Helper to create and configure audio elements
    const createAudio = (src: string, loop: boolean = false, volume: number): HTMLAudioElement => {
      const audio = new Audio(src);
      audio.loop = loop;
      audio.volume = volume;
      return audio;
    };

    // Setup audio elements - using simple sound paths that would normally be actual assets
    soundRefs.current = {
      choice: createAudio('/games/edens-hollow/sounds/choice.mp3', false, volumes.current.effects),
      confirm: createAudio('/games/edens-hollow/sounds/confirm.mp3', false, volumes.current.effects),
      sanityDrop: createAudio('/games/edens-hollow/sounds/sanity-drop.mp3', false, volumes.current.effects),
      sanityGain: createAudio('/games/edens-hollow/sounds/sanity-gain.mp3', false, volumes.current.effects),
      ambient: createAudio('/games/edens-hollow/sounds/ambient.mp3', true, volumes.current.ambient),
      lowSanity: createAudio('/games/edens-hollow/sounds/low-sanity.mp3', true, volumes.current.ambient)
    };

    // Cleanup function to stop all audio on unmount
    return () => {
      Object.values(soundRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  // Play a specific sound effect
  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return;
    
    const sound = soundRefs.current[type];
    if (sound) {
      // Reset to beginning if already playing
      sound.currentTime = 0;
      sound.play().catch(err => {
        console.warn(`Could not play sound (${type}):`, err);
      });
    }
  }, [enabled]);

  // Start ambient sounds
  const startAmbientSounds = useCallback((lowSanity: boolean = false) => {
    if (!enabled) return;
    
    // Standard ambient sound
    const ambientSound = soundRefs.current.ambient;
    if (ambientSound) {
      ambientSound.play().catch(err => {
        console.warn('Could not play ambient sound:', err);
      });
    }
    
    // Add low sanity ambient if needed
    if (lowSanity) {
      const lowSanitySound = soundRefs.current.lowSanity;
      if (lowSanitySound) {
        lowSanitySound.play().catch(err => {
          console.warn('Could not play low sanity sound:', err);
        });
      }
    }
  }, [enabled]);

  // Toggle low sanity sound effects based on player's sanity level
  const toggleLowSanitySounds = useCallback((lowSanity: boolean) => {
    if (!enabled) return;
    
    const lowSanitySound = soundRefs.current.lowSanity;
    if (lowSanitySound) {
      if (lowSanity) {
        lowSanitySound.play().catch(err => {
          console.warn('Could not play low sanity sound:', err);
        });
      } else {
        lowSanitySound.pause();
        lowSanitySound.currentTime = 0;
      }
    }
  }, [enabled]);

  // Update volume levels for all sounds
  const updateVolumes = useCallback((effectsVolume: number, ambientVolume: number) => {
    volumes.current = {
      effects: effectsVolume,
      ambient: ambientVolume
    };
    
    // Update volumes of existing audio elements
    if (soundRefs.current.choice) {
      soundRefs.current.choice.volume = effectsVolume;
    }
    if (soundRefs.current.confirm) {
      soundRefs.current.confirm.volume = effectsVolume;
    }
    if (soundRefs.current.sanityDrop) {
      soundRefs.current.sanityDrop.volume = effectsVolume;
    }
    if (soundRefs.current.sanityGain) {
      soundRefs.current.sanityGain.volume = effectsVolume;
    }
    if (soundRefs.current.ambient) {
      soundRefs.current.ambient.volume = ambientVolume;
    }
    if (soundRefs.current.lowSanity) {
      soundRefs.current.lowSanity.volume = ambientVolume;
    }
  }, []);

  return {
    playSound,
    startAmbientSounds,
    toggleLowSanitySounds,
    updateVolumes
  };
}