import { useState, useEffect, useCallback } from 'react';

class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private sources: Map<string, AudioBufferSourceNode> = new Map();

  private constructor() {
    // Initialize on first user interaction
    const initializeAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(id, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound ${id}:`, error);
    }
  }

  playSound(id: string, options: { loop?: boolean; volume?: number } = {}): void {
    if (!this.audioContext || !this.sounds.has(id)) return;

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
  }

  stopSound(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      source.stop();
      this.sources.delete(id);
      this.gainNodes.delete(id);
    }
  }

  setVolume(id: string, volume: number): void {
    const gainNode = this.gainNodes.get(id);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Cleanup method
  dispose(): void {
    this.sources.forEach(source => source.stop());
    this.sources.clear();
    this.gainNodes.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// React hook for using AudioManager
export function useAudio() {
  const [isReady, setIsReady] = useState(false);
  const audioManager = AudioManager.getInstance();

  useEffect(() => {
    const loadSounds = async () => {
      // Preload common horror sounds
      await Promise.all([
        audioManager.loadSound('ambient', '/sounds/ambient.mp3'),
        audioManager.loadSound('heartbeat', '/sounds/heartbeat.mp3'),
        audioManager.loadSound('creaky', '/sounds/creaky.mp3'),
        audioManager.loadSound('whisper', '/sounds/whisper.mp3')
      ]);
      setIsReady(true);
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
    playSound,
    stopSound,
    setVolume
  };
}
