import { useState, useEffect, useCallback } from 'react';

export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

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
    if (this.isInitialized) {
      console.log('[Audio] AudioManager already initialized');
      return;
    }

    if (this.initializationPromise) {
      console.log('[Audio] Initialization already in progress, waiting...');
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise<void>(async (resolve, reject) => {
      try {
        console.log('[Audio] Creating new AudioContext...');
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('[Audio] AudioContext created, state:', this.audioContext.state);

        // Attempt to resume context if it's suspended
        if (this.audioContext.state === 'suspended') {
          console.log('[Audio] AudioContext is suspended, attempting to resume...');
          await this.audioContext.resume();
          console.log('[Audio] AudioContext resumed successfully, new state:', this.audioContext.state);
        }

        this.isInitialized = true;
        console.log('[Audio] AudioManager initialized successfully');
        resolve();
      } catch (error) {
        console.error('[Audio] Failed to initialize AudioContext:', error);
        this.isInitialized = false;
        reject(error);
      } finally {
        this.initializationPromise = null;
      }
    });

    return this.initializationPromise;
  }

  async loadSound(id: string, url: string): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }

    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      console.log(`[Audio] Starting to load sound: ${id} from URL: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error loading sound: ${response.status} ${response.statusText}`);
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

  async playSound(id: string, options: { loop?: boolean; volume?: number } = {}): Promise<void> {
    if (!this.isInitialized || !this.audioContext) {
      await this.initialize();
    }

    if (!this.sounds.has(id)) {
      throw new Error(`Cannot play sound ${id}: Sound not loaded`);
    }

    try {
      // Resume context if it's suspended
      if (this.audioContext?.state === 'suspended') {
        console.log('[Audio] AudioContext is suspended, attempting to resume...');
        await this.audioContext.resume();
        console.log('[Audio] AudioContext resumed successfully, new state:', this.audioContext.state);
      }

      console.log(`[Audio] Starting playback of sound: ${id}`);
      this.stopSound(id); // Stop any existing playback

      if (!this.audioContext) throw new Error('AudioContext not available');

      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds.get(id)!;
      source.loop = options.loop ?? false;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume ?? 1;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      console.log(`[Audio] Starting playback for ${id} with options:`, {
        loop: source.loop,
        volume: gainNode.gain.value,
        duration: source.buffer?.duration,
        contextState: this.audioContext.state
      });

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

      console.log(`[Audio] Sound ${id} started playing successfully`);
    } catch (error) {
      console.error(`[Audio] Error playing sound ${id}:`, error);
      // Clean up failed playback
      this.sources.delete(id);
      this.gainNodes.delete(id);
      throw error;
    }
  }

  stopSound(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      try {
        console.log(`[Audio] Stopping sound: ${id}`);
        source.stop();
        console.log(`[Audio] Sound ${id} stopped successfully`);
      } catch (error) {
        console.error(`[Audio] Error stopping sound ${id}:`, error);
        throw error;
      } finally {
        this.sources.delete(id);
        this.gainNodes.delete(id);
      }
    } else {
      console.log(`[Audio] No active source found for sound: ${id}`);
    }
  }

  setVolume(id: string, volume: number): void {
    const gainNode = this.gainNodes.get(id);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
      console.log(`[Audio] Set volume for ${id} to ${gainNode.gain.value}`);
    } else {
      console.warn(`[Audio] Cannot set volume: no active gain node for ${id}`);
    }
  }

  dispose(): void {
    console.log('[Audio] Disposing AudioManager...');
    this.sources.forEach((source, id) => {
      try {
        source.stop();
        console.log(`[Audio] Stopped sound: ${id}`);
      } catch (error) {
        console.warn(`[Audio] Error stopping source during disposal: ${id}`, error);
      }
    });
    this.sources.clear();
    this.gainNodes.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
      console.log('[Audio] AudioContext closed and disposed');
    }
  }
}

export function useAudio() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioManager = AudioManager.getInstance();

  useEffect(() => {
    console.log('[Audio Hook] Initializing audio hook...');
    let mounted = true;

    const initializeAudio = async () => {
      try {
        console.log('[Audio Hook] Starting audio initialization...');
        await audioManager.initialize();

        if (!mounted) return;

        console.log('[Audio Hook] Starting to load ambient sound...');
        await audioManager.loadSound(
          'horror-ambient',
          '/audio/ambient.mp3'
        );

        if (!mounted) return;

        setIsReady(true);
        setError(null);
        console.log('[Audio Hook] Ambient sound loaded successfully');
      } catch (error) {
        console.error('[Audio Hook] Failed to initialize audio:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize audio');
          setIsReady(false);
        }
      }
    };

    // Initialize audio on first user interaction
    const handleInteraction = () => {
      console.log('[Audio Hook] User interaction detected, initializing audio...');
      initializeAudio();
      document.removeEventListener('click', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);

    return () => {
      console.log('[Audio Hook] Cleaning up audio hook...');
      mounted = false;
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  const playSound = useCallback(async (id: string, options?: { loop?: boolean; volume?: number }) => {
    console.log(`[Audio Hook] Attempting to play sound: ${id}`, options);
    try {
      await audioManager.playSound(id, options);
      console.log(`[Audio Hook] Successfully started playing sound: ${id}`);
    } catch (error) {
      console.error(`[Audio Hook] Error in playSound hook: ${id}`, error);
      throw error;
    }
  }, []);

  const stopSound = useCallback((id: string) => {
    console.log(`[Audio Hook] Attempting to stop sound: ${id}`);
    try {
      audioManager.stopSound(id);
      console.log(`[Audio Hook] Successfully stopped sound: ${id}`);
    } catch (error) {
      console.error(`[Audio Hook] Error stopping sound: ${id}`, error);
      throw error;
    }
  }, []);

  const setVolume = useCallback((id: string, volume: number) => {
    console.log(`[Audio Hook] Setting volume for ${id} to ${volume}`);
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