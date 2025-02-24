import { useState, useEffect } from 'react';

const YOUTUBE_VIDEO_ID = '26Ch2vKsgTg';

export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private mediaElement: HTMLAudioElement | null = null;
  private gainNode: GainNode | null = null;

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

    // Initialize audio element if needed
    if (!this.mediaElement) {
      this.mediaElement = new Audio();
      this.mediaElement.crossOrigin = "anonymous";

      // Connect audio element to gain node for volume control
      const source = this.audioContext.createMediaElementSource(this.mediaElement);
      this.gainNode = this.audioContext.createGain();
      source.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  async loadSound(): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }

    try {
      // Fetch audio info from our backend
      const response = await fetch(`/api/videos/${YOUTUBE_VIDEO_ID}/info`);
      if (!response.ok) {
        throw new Error(`Failed to get video info (${response.status})`);
      }

      const info = await response.json();
      if (!this.mediaElement) {
        throw new Error('Audio element not initialized');
      }

      // Set up audio element
      this.mediaElement.src = `/api/videos/${YOUTUBE_VIDEO_ID}/audio`;
      this.mediaElement.load();

      console.log('[Audio] Audio source configured');
    } catch (error) {
      console.error('[Audio] Failed to load audio:', error);
      throw new Error('Failed to load audio source');
    }
  }

  async playSound(options: { 
    loop?: boolean; 
    volume?: number;
    startTime?: number;
    endTime?: number;
  } = {}): Promise<void> {
    try {
      if (!this.audioContext || !this.mediaElement) {
        await this.initialize();
        await this.loadSound();
      }

      // Set options
      if (this.mediaElement) {
        this.mediaElement.loop = options.loop ?? false;
        if (this.gainNode) {
          this.gainNode.gain.value = options.volume ?? 1;
        }

        // Set start time if provided
        if (typeof options.startTime === 'number') {
          this.mediaElement.currentTime = options.startTime;
        }

        // Add end time handler if provided
        if (typeof options.endTime === 'number') {
          const handleTimeUpdate = () => {
            if (this.mediaElement && this.mediaElement.currentTime >= options.endTime!) {
              this.stopSound();
              this.mediaElement.removeEventListener('timeupdate', handleTimeUpdate);
            }
          };
          this.mediaElement.addEventListener('timeupdate', handleTimeUpdate);
        }

        // Play audio
        await this.mediaElement.play();
        console.log('[Audio] Started playback:', {
          loop: this.mediaElement.loop,
          volume: this.gainNode?.gain.value,
          startTime: options.startTime,
          endTime: options.endTime,
          contextState: this.audioContext?.state
        });
      }
    } catch (error) {
      console.error('[Audio] Playback failed:', error);
      throw error;
    }
  }

  stopSound(): void {
    if (this.mediaElement) {
      try {
        this.mediaElement.pause();
        this.mediaElement.currentTime = 0;
        // Remove any timeupdate listeners
        this.mediaElement.removeEventListener('timeupdate', () => {});
        console.log('[Audio] Stopped playback');
      } catch (error) {
        console.error('[Audio] Failed to stop playback:', error);
      }
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
      console.log('[Audio] Volume set to:', this.gainNode.gain.value);
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
        await audioManager.loadSound();

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