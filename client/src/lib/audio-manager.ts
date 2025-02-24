import { useState, useEffect, useCallback } from 'react';

export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private sources: Map<string, AudioBufferSourceNode> = new Map();

  private constructor() {
    console.log('[Audio] AudioManager constructor called');
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.audioContext) {
      // If context exists but is suspended, try to resume it
      if (this.audioContext.state === 'suspended') {
        console.log('[Audio] Resuming suspended AudioContext...');
        await this.audioContext.resume();
      }
      return;
    }

    console.log('[Audio] Creating new AudioContext...');
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('[Audio] AudioContext initialized:', this.audioContext.state);

    // Attempt to resume immediately if suspended
    if (this.audioContext.state === 'suspended') {
      console.log('[Audio] New AudioContext is suspended, attempting to resume...');
      await this.audioContext.resume();
      console.log('[Audio] AudioContext state after resume:', this.audioContext.state);
    }
  }

  async loadSound(id: string, url: string): Promise<void> {
    await this.initialize();

    if (!this.audioContext) {
      throw new Error('Failed to initialize audio system');
    }

    if (this.sounds.has(id)) {
      console.log(`[Audio] Sound ${id} already loaded`);
      return;
    }

    try {
      console.log(`[Audio] Loading sound: ${id}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(id, audioBuffer);
      console.log(`[Audio] Sound ${id} loaded successfully`);
    } catch (error) {
      console.error(`[Audio] Failed to load sound ${id}:`, error);
      throw new Error('Failed to load audio file');
    }
  }

  async playSound(id: string, options: { loop?: boolean; volume?: number } = {}): Promise<void> {
    await this.initialize();

    if (!this.audioContext) {
      throw new Error('Failed to initialize audio system');
    }

    if (!this.sounds.has(id)) {
      await this.loadSound(id, '/audio/ambient.mp3');
    }

    try {
      // Stop any existing playback
      this.stopSound(id);

      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds.get(id)!;
      source.loop = options.loop ?? false;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume ?? 1;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
      this.sources.set(id, source);
      this.gainNodes.set(id, gainNode);

      console.log(`[Audio] Started playing ${id}:`, {
        loop: source.loop,
        volume: gainNode.gain.value,
        contextState: this.audioContext.state
      });

      source.onended = () => {
        if (!source.loop) {
          this.sources.delete(id);
          this.gainNodes.delete(id);
        }
      };
    } catch (error) {
      console.error(`[Audio] Failed to play ${id}:`, error);
      this.sources.delete(id);
      this.gainNodes.delete(id);
      throw error;
    }
  }

  stopSound(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      try {
        source.stop();
        console.log(`[Audio] Stopped ${id}`);
      } catch (error) {
        console.error(`[Audio] Error stopping ${id}:`, error);
      } finally {
        this.sources.delete(id);
        this.gainNodes.delete(id);
      }
    }
  }

  setVolume(id: string, volume: number): void {
    const gainNode = this.gainNodes.get(id);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
      console.log(`[Audio] Volume set for ${id}:`, gainNode.gain.value);
    }
  }
}

export function useAudio() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioManager = AudioManager.getInstance();

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await audioManager.initialize();
        await audioManager.loadSound('horror-ambient', '/audio/ambient.mp3');
        setIsReady(true);
        setError(null);
      } catch (error) {
        console.error('[Audio] Setup failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize audio');
        setIsReady(false);
      }
    };

    // Try to initialize immediately
    initializeAudio();

    // Also initialize on first click if needed
    const handleFirstClick = () => {
      if (!isReady) {
        console.log('[Audio] User interaction detected, initializing...');
        initializeAudio();
      }
      document.removeEventListener('click', handleFirstClick);
    };

    document.addEventListener('click', handleFirstClick);

    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  const playSound = useCallback(async (id: string, options?: { loop?: boolean; volume?: number }) => {
    await audioManager.playSound(id, options);
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