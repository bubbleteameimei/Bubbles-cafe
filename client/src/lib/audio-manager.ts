import { useState, useEffect, useCallback } from 'react';

export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private sources: Map<string, AudioBufferSourceNode> = new Map();

  private constructor() {
    const initializeAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('[Audio] AudioContext initialized');
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
      console.warn('[Audio] AudioContext not initialized');
      return;
    }

    try {
      console.log(`[Audio] Starting to load sound: ${id}`);

      if (url.includes('youtu')) {
        const encodedUrl = encodeURIComponent(url);
        url = `/api/audio/youtube?url=${encodedUrl}`;
        console.log(`[Audio] Using YouTube extraction endpoint: ${url}`);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('audio')) {
        console.warn('[Audio] Unexpected content type:', contentType);
      }

      console.log('[Audio] Fetched audio data, decoding...');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.sounds.set(id, audioBuffer);
      console.log(`[Audio] Successfully loaded and decoded sound: ${id}`);
    } catch (error) {
      console.error(`[Audio] Failed to load sound ${id}:`, error);
      throw error; // Propagate error to caller
    }
  }

  playSound(id: string, options: { loop?: boolean; volume?: number } = {}): void {
    if (!this.audioContext || !this.sounds.has(id)) {
      console.warn(`[Audio] Cannot play sound ${id}: context not ready or sound not loaded`);
      return;
    }

    try {
      console.log(`[Audio] Playing sound: ${id}`);
      this.stopSound(id);

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

      console.log(`[Audio] Sound ${id} started playing:`, {
        loop: source.loop,
        volume: gainNode.gain.value
      });
    } catch (error) {
      console.error(`[Audio] Error playing sound ${id}:`, error);
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
      console.log(`[Audio] Set volume for ${id}:`, gainNode.gain.value);
    }
  }

  dispose(): void {
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
          'https://youtu.be/26Ch2vKsgTg?si=oQ5W1rTnWlT38I0p'
        );
        setIsReady(true);
        setError(null);
        console.log('[Audio] Ambient sound loaded successfully');
      } catch (error) {
        console.error('[Audio] Failed to load sounds:', error);
        setError(error instanceof Error ? error.message : 'Failed to load audio');
      }
    };

    loadSounds();

    return () => {
      audioManager.dispose();
    };
  }, []);

  const playSound = useCallback((id: string, options?: { loop?: boolean; volume?: number }) => {
    audioManager.playSound(id, options);
  }, []);

  const stopSound = useCallback((id: string) => {
    audioManager.stopSound(id);
  }, []);

  const setVolume = useCallback((id: string, volume: number) => {
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