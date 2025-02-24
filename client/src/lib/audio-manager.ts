import { useState, useEffect, useCallback } from 'react';

export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private sources: Map<string, AudioBufferSourceNode> = new Map();

  private constructor() {
    // Initialize on first interaction
    const initializeAudio = () => {
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          console.log('[Audio] AudioContext initialized successfully');
        } catch (error) {
          console.error('[Audio] Failed to initialize AudioContext:', error);
        }
      }
      document.removeEventListener('click', initializeAudio);
    };
    document.addEventListener('click', initializeAudio);
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async loadSound(id: string, url: string): Promise<void> {
    if (!this.audioContext) {
      console.warn('[Audio] AudioContext not initialized, cannot load sound');
      return;
    }

    try {
      console.log(`[Audio] Starting to load sound: ${id} from URL: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[Audio] HTTP error loading sound: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to load audio: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(`[Audio] Successfully fetched audio data for ${id}, size: ${arrayBuffer.byteLength} bytes`);

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log(`[Audio] Successfully decoded audio data for ${id}, duration: ${audioBuffer.duration}s`);

      this.sounds.set(id, audioBuffer);
      console.log(`[Audio] Sound ${id} loaded and ready for playback`);
    } catch (error) {
      console.error(`[Audio] Failed to load sound ${id}:`, error);
      throw error;
    }
  }

  playSound(id: string, options: { loop?: boolean; volume?: number } = {}): void {
    if (!this.audioContext) {
      console.error(`[Audio] Cannot play sound ${id}: AudioContext not initialized`);
      return;
    }

    if (!this.sounds.has(id)) {
      console.error(`[Audio] Cannot play sound ${id}: Sound not loaded`);
      return;
    }

    try {
      console.log(`[Audio] Starting playback of sound: ${id}`);
      this.stopSound(id); // Stop any existing playback

      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds.get(id)!;
      source.loop = options.loop ?? false;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume ?? 1;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
      this.sources.set(id, source);
      this.gainNodes.set(id, gainNode);

      source.onended = () => {
        console.log(`[Audio] Sound ${id} finished playing`);
        if (!source.loop) {
          this.sources.delete(id);
          this.gainNodes.delete(id);
        }
      };

      console.log(`[Audio] Sound ${id} started playing:`, {
        loop: source.loop,
        volume: gainNode.gain.value,
        duration: source.buffer?.duration
      });
    } catch (error) {
      console.error(`[Audio] Error playing sound ${id}:`, error);
      // Clean up failed playback
      this.sources.delete(id);
      this.gainNodes.delete(id);
    }
  }

  stopSound(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      try {
        source.stop();
        console.log(`[Audio] Stopped sound: ${id}`);
      } catch (error) {
        console.warn(`[Audio] Error stopping sound ${id}:`, error);
      }
      this.sources.delete(id);
      this.gainNodes.delete(id);
    }
  }

  setVolume(id: string, volume: number): void {
    const gainNode = this.gainNodes.get(id);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
      console.log(`[Audio] Set volume for ${id}: ${gainNode.gain.value}`);
    } else {
      console.warn(`[Audio] Cannot set volume: no active gain node for ${id}`);
    }
  }

  dispose(): void {
    console.log('[Audio] Disposing AudioManager...');
    this.sources.forEach((source, id) => {
      try {
        source.stop();
        console.log(`[Audio] Stopped sound during disposal: ${id}`);
      } catch (error) {
        console.warn(`[Audio] Error stopping source during disposal: ${id}`, error);
      }
    });
    this.sources.clear();
    this.gainNodes.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      console.log('[Audio] AudioContext closed and disposed');
    }
  }
}

export function useAudio() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioManager = AudioManager.getInstance();

  useEffect(() => {
    const loadSounds = async () => {
      try {
        console.log('[Audio] Starting to load ambient sound...');
        await audioManager.loadSound(
          'horror-ambient',
          '/audio/ambient.mp3'
        );
        setIsReady(true);
        setError(null);
        console.log('[Audio] Ambient sound loaded successfully');
      } catch (error) {
        console.error('[Audio] Failed to load sounds:', error);
        setError(error instanceof Error ? error.message : 'Failed to load audio');
        setIsReady(false);
      }
    };

    loadSounds();

    return () => {
      audioManager.dispose();
    };
  }, []);

  const playSound = useCallback((id: string, options?: { loop?: boolean; volume?: number }) => {
    console.log(`[Audio] Attempting to play sound: ${id}`, options);
    audioManager.playSound(id, options);
  }, []);

  const stopSound = useCallback((id: string) => {
    console.log(`[Audio] Attempting to stop sound: ${id}`);
    audioManager.stopSound(id);
  }, []);

  const setVolume = useCallback((id: string, volume: number) => {
    console.log(`[Audio] Setting volume for ${id} to ${volume}`);
    audioManager.setVolume(id, volume);
  }, []);

  return {
    isReady,
    error,
    playSound,
    stopSound,
    setVolume
  };
}