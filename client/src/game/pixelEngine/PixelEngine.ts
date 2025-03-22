/**
 * PixelEngine - A lightweight 2D game engine built with Canvas
 * 
 * This engine is designed to create pixel art style games with a focus on
 * simplicity and performance. It handles the game loop, rendering, and
 * basic input management.
 */

export interface PixelEngineConfig {
  width: number;
  height: number;
  parent: HTMLElement;
  backgroundColor: string;
  fps?: number;
  pixelScale?: number;
  debug?: boolean;
}

export class PixelEngine {
  // Core properties
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: PixelEngineConfig;
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private frameInterval: number;
  private pixelScale: number;
  
  // Input state
  private keysPressed: { [key: string]: boolean } = {};
  
  // Debug information
  private debug: boolean;
  private fpsCounter: number = 0;
  private fpsTimer: number = 0;
  private currentFps: number = 0;
  
  // Game loop
  private rafId: number | null = null;
  
  // Event callbacks
  private updateCallback: ((deltaTime: number) => void) | null = null;
  private renderCallback: ((ctx: CanvasRenderingContext2D, deltaTime: number) => void) | null = null;
  
  constructor(config: PixelEngineConfig) {
    // Set default values
    this.config = {
      ...config,
      fps: config.fps || 60,
      pixelScale: config.pixelScale || 1,
      debug: config.debug || false
    };
    
    // Calculate frame interval based on FPS
    this.frameInterval = 1000 / this.config.fps!;
    this.pixelScale = this.config.pixelScale!;
    this.debug = this.config.debug!;
    
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.canvas.style.imageRendering = 'pixelated';
    
    // Get rendering context
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = context;
    
    // Apply pixel art settings
    this.ctx.imageSmoothingEnabled = false;
    
    // Add canvas to parent element
    this.config.parent.appendChild(this.canvas);
    
    // Set up input event listeners
    this.setupInputListeners();
  }
  
  /**
   * Start the game loop
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.gameLoop.bind(this));
    
    console.log('PixelEngine started');
  }
  
  /**
   * Stop the game loop
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    console.log('PixelEngine stopped');
  }
  
  /**
   * Set the update callback function
   */
  public onUpdate(callback: (deltaTime: number) => void): void {
    this.updateCallback = callback;
  }
  
  /**
   * Set the render callback function
   */
  public onRender(callback: (ctx: CanvasRenderingContext2D, deltaTime: number) => void): void {
    this.renderCallback = callback;
  }
  
  /**
   * Check if a key is currently pressed
   */
  public isKeyPressed(key: string): boolean {
    return this.keysPressed[key] || false;
  }
  
  /**
   * Get the rendering context
   */
  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
  
  /**
   * Get the canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  
  /**
   * Clear the canvas with the background color
   */
  public clear(): void {
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Get the current FPS
   */
  public getFPS(): number {
    return this.currentFps;
  }
  
  /**
   * Main game loop
   */
  private gameLoop(timestamp: number): void {
    if (!this.isRunning) return;
    
    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;
    
    // Only update and render if enough time has passed
    if (deltaTime >= this.frameInterval) {
      // Update frame time tracking
      this.lastFrameTime = timestamp - (deltaTime % this.frameInterval);
      
      // Clear the canvas
      this.clear();
      
      // Run update callback
      if (this.updateCallback) {
        this.updateCallback(deltaTime / 1000); // Convert to seconds
      }
      
      // Run render callback
      if (this.renderCallback) {
        this.renderCallback(this.ctx, deltaTime / 1000); // Convert to seconds
      }
      
      // Update FPS counter
      this.updateFPS(deltaTime);
      
      // Draw debug info if enabled
      if (this.debug) {
        this.drawDebugInfo();
      }
    }
    
    // Request next frame
    this.rafId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Set up keyboard input event listeners
   */
  private setupInputListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (event) => {
      this.keysPressed[event.key] = true;
    });
    
    window.addEventListener('keyup', (event) => {
      this.keysPressed[event.key] = false;
    });
    
    // Prevent default behavior for arrow keys
    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }
    }, false);
  }
  
  /**
   * Update FPS counter
   */
  private updateFPS(deltaTime: number): void {
    this.fpsCounter++;
    this.fpsTimer += deltaTime;
    
    if (this.fpsTimer >= 1000) {
      this.currentFps = this.fpsCounter;
      this.fpsCounter = 0;
      this.fpsTimer = 0;
    }
  }
  
  /**
   * Draw debug information on the canvas
   */
  private drawDebugInfo(): void {
    this.ctx.font = '12px monospace';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`FPS: ${this.currentFps}`, 10, 20);
    this.ctx.fillText(`Keys: ${Object.keys(this.keysPressed).filter(k => this.keysPressed[k]).join(', ')}`, 10, 40);
  }
}