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
      console.log('[Audio] Creating new AudioManager instance');
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      if (!this.audioContext) {
        console.log('[Audio] Creating new AudioContext...');
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (this.audioContext.state === 'suspended') {
        console.log('[Audio] Resuming suspended AudioContext...');
        await this.audioContext.resume();
      }

      console.log('[Audio] AudioContext ready, state:', this.audioContext.state);
    } catch (error) {
      console.error('[Audio] AudioContext initialization failed:', error);
      throw new Error('Failed to initialize audio system');
    }
  }

  async loadSound(id: string, url: string): Promise<void> {
    try {
      if (!this.audioContext) {
        await this.initialize();
      }

      console.log(`[Audio] Loading sound: ${id} from ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load audio file (${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.sounds.set(id, audioBuffer);
      console.log(`[Audio] Sound loaded successfully: ${id}`);
    } catch (error) {
      console.error(`[Audio] Failed to load sound ${id}:`, error);
      throw new Error('Failed to load audio file');
    }
  }

  async playSound(id: string, options: { loop?: boolean; volume?: number } = {}): Promise<void> {
    try {
      if (!this.audioContext) {
        throw new Error('Audio system not initialized');
      }

      if (!this.sounds.has(id)) {
        throw new Error('Sound not loaded');
      }

      // Resume the context if it's suspended
      if (this.audioContext.state === 'suspended') {
        console.log('[Audio] Resuming AudioContext before playback...');
        await this.audioContext.resume();
      }

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

      console.log(`[Audio] Started playing: ${id}`, {
        loop: source.loop,
        volume: gainNode.gain.value,
        duration: source.buffer.duration
      });
    } catch (error) {
      console.error(`[Audio] Playback failed for ${id}:`, error);
      throw error;
    }
  }

  stopSound(id: string): void {
    try {
      const source = this.sources.get(id);
      if (source) {
        source.stop();
        console.log(`[Audio] Stopped: ${id}`);
      }
    } catch (error) {
      console.error(`[Audio] Error stopping ${id}:`, error);
    } finally {
      this.sources.delete(id);
      this.gainNodes.delete(id);
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
    let mounted = true;
    console.log('[Audio Hook] Setting up audio system...');

    const handleInteraction = async () => {
      try {
        await audioManager.initialize();

        if (!mounted) return;

        // Load the ambient sound
        await audioManager.loadSound('horror-ambient', '/audio/ambient.mp3');

        if (!mounted) return;

        setIsReady(true);
        setError(null);
        console.log('[Audio Hook] Audio system ready');
      } catch (error) {
        console.error('[Audio Hook] Setup failed:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize audio');
          setIsReady(false);
        }
      }
    };

    // Add click listener for first interaction
    document.addEventListener('click', handleInteraction, { once: true });

    return () => {
      mounted = false;
      document.removeEventListener('click', handleInteraction);
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