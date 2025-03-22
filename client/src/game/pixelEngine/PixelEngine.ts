/**
 * PixelEngine - Custom Canvas-based Game Engine
 * 
 * A lightweight 2D game engine built specifically for pixel art games.
 * Designed as a replacement for Phaser.js to resolve TypeScript compatibility issues.
 */

export interface PixelEngineOptions {
  width: number;
  height: number;
  parent: HTMLElement | string;
  backgroundColor?: string;
  fps?: number;
  pixelScale?: number;
  debug?: boolean;
}

export interface Sprite {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;
  frameWidth?: number;
  frameHeight?: number;
  currentFrame?: number;
  totalFrames?: number;
  animationSpeed?: number;
  visible?: boolean;
  spriteSheet?: boolean;
  animationTimer?: number;
  flipX?: boolean;
  scale?: number;
  collisionBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  velocity?: {
    x: number;
    y: number;
  };
  acceleration?: {
    x: number;
    y: number;
  };
  friction?: number;
  gravity?: number;
  onGround?: boolean;
}

export type CollisionCallback = (sprite1: Sprite, sprite2: Sprite) => void;

export class PixelEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private sprites: Map<string, Sprite> = new Map();
  private bgImage: HTMLImageElement | null = null;
  private frameCount: number = 0;
  private frameRate: number;
  private running: boolean = false;
  private lastTimestamp: number = 0;
  private pixelScale: number;
  private debugMode: boolean;
  private keysPressed: Set<string> = new Set();
  private mousePosition: { x: number, y: number } = { x: 0, y: 0 };
  private mouseDown: boolean = false;
  private collisionPairs: Array<{
    sprite1Id: string;
    sprite2Id: string;
    callback: CollisionCallback;
  }> = [];
  
  // Camera properties
  private cameraX: number = 0;
  private cameraY: number = 0;
  
  // Event handlers
  private updateHandler: ((deltaTime: number) => void) | null = null;
  
  constructor(options: PixelEngineOptions) {
    // Create the canvas element
    this.canvas = document.createElement('canvas');
    this.canvasWidth = options.width;
    this.canvasHeight = options.height;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.frameRate = options.fps || 60;
    this.pixelScale = options.pixelScale || 1;
    this.debugMode = options.debug || false;
    
    // Get parent element
    const parent = typeof options.parent === 'string' 
      ? document.getElementById(options.parent) 
      : options.parent;
      
    if (!parent) {
      throw new Error('Parent element not found');
    }
    
    // Append canvas to parent
    parent.appendChild(this.canvas);
    
    // Get rendering context
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas 2D context');
    }
    this.ctx = context;
    
    // Set background color
    if (options.backgroundColor) {
      this.canvas.style.backgroundColor = options.backgroundColor;
    }
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    // Keyboard event listeners
    window.addEventListener('keydown', (e) => {
      this.keysPressed.add(e.key.toLowerCase());
    });
    
    window.addEventListener('keyup', (e) => {
      this.keysPressed.delete(e.key.toLowerCase());
    });
    
    // Mouse event listeners
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition = {
        x: (e.clientX - rect.left) / (rect.width / this.canvasWidth),
        y: (e.clientY - rect.top) / (rect.height / this.canvasHeight)
      };
    });
    
    this.canvas.addEventListener('mousedown', () => {
      this.mouseDown = true;
    });
    
    this.canvas.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.mouseDown = false;
    });
  }
  
  public start() {
    this.running = true;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  public stop() {
    this.running = false;
  }
  
  private gameLoop(timestamp: number) {
    if (!this.running) return;
    
    // Calculate delta time
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Scale pixels if needed
    this.ctx.imageSmoothingEnabled = false;
    
    // Draw background if exists
    if (this.bgImage) {
      this.ctx.drawImage(
        this.bgImage, 
        -this.cameraX, 
        -this.cameraY, 
        this.canvasWidth, 
        this.canvasHeight
      );
    }
    
    // Update game logic
    if (this.updateHandler) {
      this.updateHandler(deltaTime);
    }
    
    // Update sprite animations
    this.updateSpriteAnimations(deltaTime);
    
    // Apply physics
    this.updatePhysics(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Render sprites
    this.renderSprites();
    
    // Render debug info if enabled
    if (this.debugMode) {
      this.renderDebugInfo();
    }
    
    // Increment frame counter
    this.frameCount++;
    
    // Continue the game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  private updateSpriteAnimations(deltaTime: number) {
    this.sprites.forEach(sprite => {
      if (sprite.spriteSheet && sprite.totalFrames && sprite.totalFrames > 1 && sprite.animationSpeed) {
        sprite.animationTimer = (sprite.animationTimer || 0) + deltaTime;
        
        if (sprite.animationTimer >= 1 / sprite.animationSpeed) {
          sprite.currentFrame = ((sprite.currentFrame || 0) + 1) % sprite.totalFrames;
          sprite.animationTimer = 0;
        }
      }
    });
  }
  
  private updatePhysics(deltaTime: number) {
    this.sprites.forEach(sprite => {
      if (sprite.velocity) {
        // Apply acceleration if it exists
        if (sprite.acceleration) {
          sprite.velocity.x += sprite.acceleration.x * deltaTime;
          sprite.velocity.y += sprite.acceleration.y * deltaTime;
        }
        
        // Apply gravity if it exists
        if (sprite.gravity) {
          sprite.velocity.y += sprite.gravity * deltaTime;
        }
        
        // Apply friction if it exists and sprite is on ground
        if (sprite.friction && sprite.onGround) {
          if (sprite.velocity.x > 0) {
            sprite.velocity.x = Math.max(0, sprite.velocity.x - sprite.friction * deltaTime);
          } else if (sprite.velocity.x < 0) {
            sprite.velocity.x = Math.min(0, sprite.velocity.x + sprite.friction * deltaTime);
          }
        }
        
        // Update position based on velocity
        sprite.x += sprite.velocity.x * deltaTime;
        sprite.y += sprite.velocity.y * deltaTime;
      }
    });
  }
  
  private checkCollisions() {
    for (const pair of this.collisionPairs) {
      const sprite1 = this.sprites.get(pair.sprite1Id);
      const sprite2 = this.sprites.get(pair.sprite2Id);
      
      if (sprite1 && sprite2 && this.isColliding(sprite1, sprite2)) {
        pair.callback(sprite1, sprite2);
      }
    }
  }
  
  private isColliding(sprite1: Sprite, sprite2: Sprite): boolean {
    // Get collision boxes
    const box1 = sprite1.collisionBox || {
      x: sprite1.x,
      y: sprite1.y,
      width: sprite1.width,
      height: sprite1.height
    };
    
    const box2 = sprite2.collisionBox || {
      x: sprite2.x,
      y: sprite2.y,
      width: sprite2.width,
      height: sprite2.height
    };
    
    // Adjust for sprite position
    const rect1 = {
      x: sprite1.x + box1.x,
      y: sprite1.y + box1.y,
      width: box1.width,
      height: box1.height
    };
    
    const rect2 = {
      x: sprite2.x + box2.x,
      y: sprite2.y + box2.y,
      width: box2.width,
      height: box2.height
    };
    
    // Check for collision (AABB)
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
  
  private renderSprites() {
    // Sort sprites by y position for proper layering
    const sortedSprites = Array.from(this.sprites.values())
      .filter(sprite => sprite.visible !== false)
      .sort((a, b) => a.y - b.y);
    
    for (const sprite of sortedSprites) {
      this.renderSprite(sprite);
    }
  }
  
  private renderSprite(sprite: Sprite) {
    // Skip if sprite is not visible
    if (sprite.visible === false) return;
    
    // Calculate screen position (with camera offset)
    const screenX = sprite.x - this.cameraX;
    const screenY = sprite.y - this.cameraY;
    
    // Skip rendering if sprite is outside the visible area
    if (
      screenX + sprite.width < 0 ||
      screenY + sprite.height < 0 ||
      screenX > this.canvasWidth ||
      screenY > this.canvasHeight
    ) {
      return;
    }
    
    const scale = sprite.scale || 1;
    
    // If this is a sprite sheet, render the current frame
    if (sprite.spriteSheet && sprite.frameWidth && sprite.frameHeight) {
      const frameX = sprite.currentFrame ? (sprite.currentFrame % (sprite.image.width / sprite.frameWidth)) * sprite.frameWidth : 0;
      const frameY = sprite.currentFrame ? Math.floor(sprite.currentFrame / (sprite.image.width / sprite.frameWidth)) * sprite.frameHeight : 0;
      
      this.ctx.save();
      
      if (sprite.flipX) {
        this.ctx.translate(screenX + sprite.width * scale, screenY);
        this.ctx.scale(-1, 1);
      } else {
        this.ctx.translate(screenX, screenY);
      }
      
      this.ctx.scale(scale, scale);
      
      this.ctx.drawImage(
        sprite.image,
        frameX,
        frameY,
        sprite.frameWidth,
        sprite.frameHeight,
        0,
        0,
        sprite.width,
        sprite.height
      );
      
      this.ctx.restore();
    } else {
      // Regular sprite rendering
      this.ctx.save();
      
      if (sprite.flipX) {
        this.ctx.translate(screenX + sprite.width * scale, screenY);
        this.ctx.scale(-1, 1);
      } else {
        this.ctx.translate(screenX, screenY);
      }
      
      this.ctx.scale(scale, scale);
      
      this.ctx.drawImage(
        sprite.image,
        0,
        0,
        sprite.width,
        sprite.height
      );
      
      this.ctx.restore();
    }
  }
  
  private renderDebugInfo() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(10, 10, 200, 60);
    
    this.ctx.font = '12px monospace';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(`FPS: ${Math.round(1 / (performance.now() - this.lastTimestamp) * 1000)}`, 20, 30);
    this.ctx.fillText(`Sprites: ${this.sprites.size}`, 20, 50);
    
    // Render collision boxes
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 1;
    
    this.sprites.forEach(sprite => {
      const box = sprite.collisionBox || {
        x: 0,
        y: 0,
        width: sprite.width,
        height: sprite.height
      };
      
      const screenX = sprite.x + box.x - this.cameraX;
      const screenY = sprite.y + box.y - this.cameraY;
      
      this.ctx.strokeRect(
        screenX,
        screenY,
        box.width,
        box.height
      );
    });
  }
  
  // Public API methods
  
  public setBackground(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        this.bgImage = image;
        resolve();
      };
      image.onerror = () => {
        reject(new Error(`Failed to load background image: ${imageUrl}`));
      };
    });
  }
  
  public addSprite(spriteData: Omit<Sprite, 'image'> & { imageUrl: string }): Promise<Sprite> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = spriteData.imageUrl;
      
      image.onload = () => {
        const sprite: Sprite = {
          ...spriteData,
          image,
          visible: spriteData.visible !== false,
          currentFrame: spriteData.currentFrame || 0,
          animationTimer: 0
        };
        
        this.sprites.set(sprite.id, sprite);
        resolve(sprite);
      };
      
      image.onerror = () => {
        reject(new Error(`Failed to load sprite image: ${spriteData.imageUrl}`));
      };
    });
  }
  
  public removeSprite(id: string) {
    this.sprites.delete(id);
  }
  
  public getSprite(id: string): Sprite | undefined {
    return this.sprites.get(id);
  }
  
  public setSpritePosition(id: string, x: number, y: number) {
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.x = x;
      sprite.y = y;
    }
  }
  
  public setSpriteVisible(id: string, visible: boolean) {
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.visible = visible;
    }
  }
  
  public setSpriteFrame(id: string, frame: number) {
    const sprite = this.sprites.get(id);
    if (sprite && sprite.spriteSheet) {
      sprite.currentFrame = frame;
    }
  }
  
  public setSpriteFlip(id: string, flipX: boolean) {
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.flipX = flipX;
    }
  }
  
  public setSpriteVelocity(id: string, x: number, y: number) {
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.velocity = sprite.velocity || { x: 0, y: 0 };
      sprite.velocity.x = x;
      sprite.velocity.y = y;
    }
  }
  
  public setSpriteAcceleration(id: string, x: number, y: number) {
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.acceleration = sprite.acceleration || { x: 0, y: 0 };
      sprite.acceleration.x = x;
      sprite.acceleration.y = y;
    }
  }
  
  public setCamera(x: number, y: number) {
    this.cameraX = x;
    this.cameraY = y;
  }
  
  public isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key.toLowerCase());
  }
  
  public getMousePosition(): { x: number, y: number } {
    return { ...this.mousePosition };
  }
  
  public isMouseDown(): boolean {
    return this.mouseDown;
  }
  
  public onUpdate(callback: (deltaTime: number) => void) {
    this.updateHandler = callback;
  }
  
  public addCollision(sprite1Id: string, sprite2Id: string, callback: CollisionCallback) {
    this.collisionPairs.push({
      sprite1Id,
      sprite2Id,
      callback
    });
  }
  
  public removeCollision(sprite1Id: string, sprite2Id: string) {
    this.collisionPairs = this.collisionPairs.filter(
      pair => !(pair.sprite1Id === sprite1Id && pair.sprite2Id === sprite2Id)
    );
  }
  
  public resize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
}