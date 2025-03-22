/**
 * Pixel Art Asset Loader Utility
 * 
 * This utility handles loading and management of all game assets,
 * optimized for pixel art style rendering. It loads SVG and other
 * image formats while preserving pixel-perfect rendering.
 */

// Asset type definitions
export interface AssetConfig {
  key: string;
  type: 'image' | 'spritesheet' | 'tilemap' | 'audio';
  url: string;
  frameConfig?: {
    frameWidth: number;
    frameHeight: number;
    startFrame?: number;
    endFrame?: number;
    margin?: number;
    spacing?: number;
  };
}

interface LoadedImage {
  key: string;
  element: HTMLImageElement;
  width: number;
  height: number;
  frameConfig?: AssetConfig['frameConfig'];
}

interface LoadedSpritesheet extends LoadedImage {
  frames: HTMLCanvasElement[];
}

interface LoadedTilemap {
  key: string;
  data: any; // JSON data of the tilemap
}

interface LoadedAudio {
  key: string;
  element: HTMLAudioElement;
}

interface AnimationConfig {
  key: string;
  frames: number[];
  frameRate: number;
  repeat: boolean;
}

export class PixelArtAnimation {
  private canvasElement: HTMLCanvasElement;
  private frames: HTMLCanvasElement[];
  private frameRate: number;
  private repeat: boolean;
  private currentFrame: number = 0;
  private animationId: number | null = null;
  private lastFrameTime: number = 0;
  private frameDuration: number;
  
  constructor(frames: HTMLCanvasElement[], frameRate: number, repeat: boolean = true) {
    this.frames = frames;
    this.frameRate = frameRate;
    this.repeat = repeat;
    this.frameDuration = 1000 / frameRate;
    
    // Create canvas element for animation
    this.canvasElement = document.createElement('canvas');
    if (frames.length > 0) {
      const firstFrame = frames[0];
      this.canvasElement.width = firstFrame.width;
      this.canvasElement.height = firstFrame.height;
      
      // Draw first frame
      const ctx = this.canvasElement.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(firstFrame, 0, 0);
      }
    }
  }
  
  play() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.lastFrameTime = performance.now();
    this.animate();
  }
  
  pause() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  stop() {
    this.pause();
    this.currentFrame = 0;
    this.renderFrame();
  }
  
  private animate = () => {
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    
    if (elapsed >= this.frameDuration) {
      // Advance the frame
      this.lastFrameTime = now - (elapsed % this.frameDuration);
      this.currentFrame++;
      
      // Handle frame looping
      if (this.currentFrame >= this.frames.length) {
        if (this.repeat) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.pause();
          return;
        }
      }
      
      this.renderFrame();
    }
    
    this.animationId = requestAnimationFrame(this.animate);
  }
  
  private renderFrame() {
    const ctx = this.canvasElement.getContext('2d');
    if (ctx && this.frames[this.currentFrame]) {
      ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      ctx.drawImage(this.frames[this.currentFrame], 0, 0);
    }
  }
  
  // Expose the element to be added to the DOM
  get domElement() {
    return this.canvasElement;
  }
}

/**
 * Asset Loader for Pixel Art Game
 * Handles loading and managing game assets with proper pixel art rendering
 */
export class PixelArtAssetLoader {
  private static imageCache: Map<string, LoadedImage> = new Map();
  private static spritesheetCache: Map<string, LoadedSpritesheet> = new Map();
  private static tilemapCache: Map<string, LoadedTilemap> = new Map();
  private static audioCache: Map<string, LoadedAudio> = new Map();
  private static assetQueue: AssetConfig[] = [];
  
  /**
   * Add assets to the loading queue
   */
  static addToQueue(assets: AssetConfig | AssetConfig[]) {
    if (Array.isArray(assets)) {
      this.assetQueue.push(...assets);
    } else {
      this.assetQueue.push(assets);
    }
  }
  
  /**
   * Load all assets in the queue
   */
  static async loadAll(progressCallback?: (progress: number) => void): Promise<void> {
    if (this.assetQueue.length === 0) {
      if (progressCallback) progressCallback(1);
      return Promise.resolve();
    }
    
    let loaded = 0;
    const total = this.assetQueue.length;
    
    // Start loading all assets in parallel
    const promises = this.assetQueue.map(async (asset) => {
      try {
        await this.loadAsset(asset);
        loaded++;
        if (progressCallback) {
          progressCallback(loaded / total);
        }
      } catch (error) {
        console.error(`Error loading asset ${asset.key}:`, error);
        throw error;
      }
    });
    
    // Wait for all assets to load
    await Promise.all(promises);
    
    // Clear the queue
    this.assetQueue = [];
  }
  
  /**
   * Load a single asset based on its type
   */
  private static async loadAsset(asset: AssetConfig): Promise<void> {
    switch (asset.type) {
      case 'image':
        await this.loadImage(asset);
        break;
      case 'spritesheet':
        await this.loadSpritesheet(asset);
        break;
      case 'tilemap':
        await this.loadTilemap(asset);
        break;
      case 'audio':
        await this.loadAudio(asset);
        break;
      default:
        throw new Error(`Unsupported asset type: ${asset.type}`);
    }
  }
  
  /**
   * Load an image asset
   */
  private static loadImage(asset: AssetConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(asset.key, {
          key: asset.key,
          element: img,
          width: img.width,
          height: img.height
        });
        resolve();
      };
      img.onerror = (error) => {
        reject(new Error(`Failed to load image: ${asset.url} - ${error}`));
      };
      
      // Set proper rendering attributes for pixel art
      img.style.imageRendering = 'pixelated';
      img.src = asset.url;
    });
  }
  
  /**
   * Load a spritesheet asset and split it into frames
   */
  private static async loadSpritesheet(asset: AssetConfig): Promise<void> {
    if (!asset.frameConfig) {
      throw new Error(`Spritesheet ${asset.key} requires frameConfig`);
    }
    
    // First load the image
    await this.loadImage(asset);
    
    const image = this.imageCache.get(asset.key);
    if (!image) {
      throw new Error(`Failed to load spritesheet image: ${asset.key}`);
    }
    
    // Extract frame configuration
    const { 
      frameWidth, 
      frameHeight, 
      startFrame = 0, 
      endFrame,
      margin = 0, 
      spacing = 0 
    } = asset.frameConfig;
    
    // Calculate frames
    const framesPerRow = Math.floor((image.width - margin) / (frameWidth + spacing));
    const rows = Math.floor((image.height - margin) / (frameHeight + spacing));
    const totalFrames = framesPerRow * rows;
    const maxFrames = endFrame !== undefined ? Math.min(endFrame + 1, totalFrames) : totalFrames;
    const frames: HTMLCanvasElement[] = [];
    
    // Create frames
    for (let i = startFrame; i < maxFrames; i++) {
      const row = Math.floor(i / framesPerRow);
      const col = i % framesPerRow;
      
      const x = margin + col * (frameWidth + spacing);
      const y = margin + row * (frameHeight + spacing);
      
      // Create a canvas for this frame
      const canvas = document.createElement('canvas');
      canvas.width = frameWidth;
      canvas.height = frameHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false; // Disable anti-aliasing for pixel art
        ctx.drawImage(
          image.element,
          x, y, frameWidth, frameHeight,
          0, 0, frameWidth, frameHeight
        );
      }
      
      frames.push(canvas);
    }
    
    // Store in spritesheet cache
    this.spritesheetCache.set(asset.key, {
      ...image,
      frames,
      frameConfig: asset.frameConfig
    });
    
    // Remove from image cache to avoid duplication
    this.imageCache.delete(asset.key);
  }
  
  /**
   * Load a tilemap asset (JSON format)
   */
  private static loadTilemap(asset: AssetConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(asset.url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.tilemapCache.set(asset.key, {
            key: asset.key,
            data
          });
          resolve();
        })
        .catch(error => {
          reject(new Error(`Failed to load tilemap: ${asset.url} - ${error}`));
        });
    });
  }
  
  /**
   * Load an audio asset
   */
  private static loadAudio(asset: AssetConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.audioCache.set(asset.key, {
          key: asset.key,
          element: audio
        });
        resolve();
      };
      audio.onerror = (error) => {
        reject(new Error(`Failed to load audio: ${asset.url} - ${error}`));
      };
      audio.src = asset.url;
      audio.load();
    });
  }
  
  /**
   * Get an image asset by key
   */
  static getImage(key: string): HTMLImageElement | null {
    const image = this.imageCache.get(key);
    return image ? image.element : null;
  }
  
  /**
   * Get a spritesheet asset by key
   */
  static getSpritesheet(key: string): LoadedSpritesheet | null {
    return this.spritesheetCache.get(key) || null;
  }
  
  /**
   * Get a tilemap asset by key
   */
  static getTilemap(key: string): any | null {
    const tilemap = this.tilemapCache.get(key);
    return tilemap ? tilemap.data : null;
  }
  
  /**
   * Get an audio asset by key
   */
  static getAudio(key: string): HTMLAudioElement | null {
    const audio = this.audioCache.get(key);
    return audio ? audio.element : null;
  }
  
  /**
   * Play audio with optional settings
   */
  static playAudio(key: string, loop = false, volume = 1.0): void {
    const audio = this.getAudio(key);
    if (!audio) return;
    
    audio.loop = loop;
    audio.volume = volume;
    audio.play().catch(err => console.error(`Error playing audio ${key}:`, err));
  }
  
  /**
   * Create an animation from a spritesheet
   */
  static createAnimation(
    spritesheetKey: string,
    startFrame: number = 0,
    endFrame: number | null = null,
    frameRate: number = 10,
    repeat: boolean = true
  ): PixelArtAnimation | null {
    const spritesheet = this.getSpritesheet(spritesheetKey);
    if (!spritesheet) return null;
    
    const frames = spritesheet.frames;
    const validEndFrame = endFrame !== null ? 
      Math.min(endFrame, frames.length - 1) : 
      frames.length - 1;
    
    if (startFrame > validEndFrame || startFrame >= frames.length) {
      console.error(`Invalid frame range for animation: ${startFrame} to ${validEndFrame}`);
      return null;
    }
    
    const animationFrames = frames.slice(startFrame, validEndFrame + 1);
    return new PixelArtAnimation(animationFrames, frameRate, repeat);
  }
  
  /**
   * Clear all asset caches
   */
  static clearCache(): void {
    this.imageCache.clear();
    this.spritesheetCache.clear();
    this.tilemapCache.clear();
    this.audioCache.clear();
  }
}