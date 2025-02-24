import { useState, useEffect } from 'react';

export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private sources: Map<string, AudioBufferSourceNode> = new Map();

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize(): Promise<void> {
    if (!this.audioContext) {
      console.log('[Audio] Creating new AudioContext...');
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (this.audioContext.state === 'suspended') {
      console.log('[Audio] Resuming suspended AudioContext...');
      await this.audioContext.resume();
    }
    console.log('[Audio] AudioContext ready:', this.audioContext.state);
  }

  async loadSound(id: string, url: string, bufferSize: number = 65536): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }

    if (this.sounds.has(id)) {
      console.log(`[Audio] Sound ${id} already loaded`);
      return;
    }

    try {
      console.log(`[Audio] Loading initial ${bufferSize}B buffer...`);
      const initialResponse = await fetch(url, {
        headers: {
          'Range': `bytes=0-${bufferSize - 1}`
        }
      });

      if (!initialResponse.ok) {
        throw new Error(`Failed to load audio file (${initialResponse.status})`);
      }

      const initialBuffer = await initialResponse.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(initialBuffer);
      this.sounds.set(id, audioBuffer);
      console.log('[Audio] Initial buffer loaded and decoded');

      // Load the rest in background
      this.loadFullAudio(id, url, bufferSize);
    } catch (error) {
      console.error('[Audio] Failed to load initial buffer:', error);
      throw new Error('Failed to load audio file');
    }
  }

  private async loadFullAudio(id: string, url: string, skipBytes: number): Promise<void> {
    try {
      console.log('[Audio] Loading full audio in background...');
      const response = await fetch(url, {
        headers: {
          'Range': `bytes=${skipBytes}-`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load full audio (${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.sounds.set(id, audioBuffer);
      console.log('[Audio] Full audio loaded and decoded successfully');
    } catch (error) {
      console.error('[Audio] Failed to load full audio:', error);
    }
  }

  async playSound(id: string, options: { loop?: boolean; volume?: number; bufferSize?: number } = {}): Promise<void> {
    try {
      if (!this.audioContext) {
        await this.initialize();
      }

      if (!this.sounds.has(id)) {
        await this.loadSound(id, '/audio/ambient.mp3', options.bufferSize);
      }

      // Stop any existing playback
      this.stopSound(id);

      // Resume context if needed
      if (this.audioContext!.state === 'suspended') {
        await this.audioContext!.resume();
      }

      const source = this.audioContext!.createBufferSource();
      source.buffer = this.sounds.get(id)!;
      source.loop = options.loop ?? false;

      const gainNode = this.audioContext!.createGain();
      gainNode.gain.value = options.volume ?? 1;

      source.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      source.start();
      this.sources.set(id, source);
      this.gainNodes.set(id, gainNode);

      console.log('[Audio] Started playback:', {
        loop: source.loop,
        volume: gainNode.gain.value,
        contextState: this.audioContext!.state
      });

      source.onended = () => {
        if (!source.loop) {
          this.cleanup(id);
        }
      };
    } catch (error) {
      console.error('[Audio] Playback failed:', error);
      this.cleanup(id);
      throw error;
    }
  }

  private cleanup(id: string): void {
    this.sources.delete(id);
    this.gainNodes.delete(id);
  }

  stopSound(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      try {
        source.stop();
        console.log('[Audio] Stopped playback');
      } catch (error) {
        console.error('[Audio] Failed to stop playback:', error);
      } finally {
        this.cleanup(id);
      }
    }
  }

  setVolume(id: string, volume: number): void {
    const gainNode = this.gainNodes.get(id);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
      console.log('[Audio] Volume set to:', gainNode.gain.value);
    }
  }
}

export function useAudio() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioManager = AudioManager.getInstance();

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        await audioManager.initialize();
        await audioManager.loadSound('horror-ambient', '/audio/ambient.mp3', 64 * 1024);

        if (mounted) {
          setIsReady(true);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          console.error('[Audio] Setup failed:', error);
          setError(error instanceof Error ? error.message : 'Failed to initialize audio');
          setIsReady(false);
        }
      }
    };

    setup();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isReady,
    error,
    playSound: audioManager.playSound.bind(audioManager),
    stopSound: audioManager.stopSound.bind(audioManager),
    setVolume: audioManager.setVolume.bind(audioManager)
  };
}