import { useEffect, useRef, useState, useCallback } from 'react';
import { Howl } from 'howler';

type SoundType = 'typewriter' | 'choice' | 'confirm' | 'ambient' | 'heartbeat' | 'sanityDrop' | 'sanityGain';
type SoundMap = Record<SoundType, Howl | null>;

export function useSoundEffects(enabled: boolean = true) {
  const [isLoaded, setIsLoaded] = useState(false);
  const soundsRef = useRef<SoundMap>({
    typewriter: null,
    choice: null,
    confirm: null,
    ambient: null,
    heartbeat: null,
    sanityDrop: null,
    sanityGain: null
  });

  // Initialize sounds
  useEffect(() => {
    if (!enabled) return;

    // Load all sound effects
    soundsRef.current = {
      typewriter: new Howl({
        src: ['https://assets.codepen.io/1609106/typewriter-key-1.mp3'],
        volume: 0.4,
        rate: 1.2,
        pool: 5 // Allow multiple instances of this sound to play simultaneously
      }),
      choice: new Howl({
        src: ['https://assets.codepen.io/1609106/click-button-menu.mp3'],
        volume: 0.5
      }),
      confirm: new Howl({
        src: ['https://assets.codepen.io/1609106/confirm-selection.mp3'],
        volume: 0.6
      }),
      ambient: new Howl({
        src: ['https://assets.codepen.io/1609106/dark-ambient.mp3'],
        volume: 0.2,
        loop: true,
        fade: [0, 0.2, 1000]
      }),
      heartbeat: new Howl({
        src: ['https://assets.codepen.io/1609106/heartbeat-horror.mp3'],
        volume: 0.3,
        loop: true
      }),
      sanityDrop: new Howl({
        src: ['https://assets.codepen.io/1609106/sanity-drop.mp3'],
        volume: 0.5
      }),
      sanityGain: new Howl({
        src: ['https://assets.codepen.io/1609106/sanity-gain.mp3'],
        volume: 0.4
      })
    };

    setIsLoaded(true);

    // Cleanup function
    return () => {
      Object.values(soundsRef.current).forEach(sound => sound?.stop());
    };
  }, [enabled]);

  // Play a sound effect
  const playSound = useCallback((type: SoundType): number | null => {
    if (!enabled || !isLoaded) return null;
    
    const sound = soundsRef.current[type];
    if (sound) {
      return sound.play();
    }
    return null;
  }, [enabled, isLoaded]);

  // Stop a specific sound or sound type
  const stopSound = useCallback((type: SoundType, id?: number): void => {
    if (!isLoaded) return;
    
    const sound = soundsRef.current[type];
    if (sound) {
      if (id !== undefined) {
        sound.stop(id);
      } else {
        sound.stop();
      }
    }
  }, [isLoaded]);

  // Play typewriter click for text effect
  const playTypewriterSound = useCallback(() => {
    if (!enabled || !isLoaded) return;
    
    const typewriter = soundsRef.current.typewriter;
    if (typewriter) {
      typewriter.play();
      typewriter.rate(0.8 + Math.random() * 0.4); // Slight variation in sound
    }
  }, [enabled, isLoaded]);

  // Start ambient sound loops
  const startAmbientSounds = useCallback((includeLowSanityEffects: boolean = false) => {
    if (!enabled || !isLoaded) return;
    
    const ambient = soundsRef.current.ambient;
    if (ambient) {
      ambient.play();
    }
    
    if (includeLowSanityEffects) {
      const heartbeat = soundsRef.current.heartbeat;
      if (heartbeat) {
        heartbeat.play();
      }
    }
  }, [enabled, isLoaded]);

  // Stop ambient sound loops
  const stopAmbientSounds = useCallback(() => {
    if (!isLoaded) return;
    
    const ambient = soundsRef.current.ambient;
    if (ambient) {
      ambient.fade(0.2, 0, 1000);
      setTimeout(() => ambient.stop(), 1000);
    }
    
    const heartbeat = soundsRef.current.heartbeat;
    if (heartbeat) {
      heartbeat.stop();
    }
  }, [isLoaded]);

  // Toggle low sanity sound effects
  const toggleLowSanitySounds = useCallback((active: boolean) => {
    if (!enabled || !isLoaded) return;
    
    const heartbeat = soundsRef.current.heartbeat;
    if (heartbeat) {
      if (active) {
        if (!heartbeat.playing()) {
          heartbeat.play();
        }
      } else {
        heartbeat.stop();
      }
    }
  }, [enabled, isLoaded]);

  return {
    playSound,
    stopSound,
    playTypewriterSound,
    startAmbientSounds,
    stopAmbientSounds,
    toggleLowSanitySounds,
    isLoaded
  };
}
