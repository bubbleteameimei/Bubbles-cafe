/**
 * GameWorld - A pixel art platformer level for Eden's Hollow
 * 
 * This scene manages the game's state, player movement, physics, collectibles,
 * and game progression.
 */

import { PixelEngine } from '../PixelEngine';

export enum GameState {
  LOADING,
  READY,
  PLAYING,
  PAUSED,
  WIN,
  GAME_OVER
}

export interface GameWorldConfig {
  gravity: number;
  playerSpeed: number;
  jumpForce: number;
  collectibles: number;
  debug?: boolean;
}

interface Vector2 {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GameObject {
  position: Vector2;
  size: Vector2;
  velocity: Vector2;
  sprite?: HTMLImageElement | HTMLCanvasElement;
  type: string;
  isActive: boolean;
  data?: any;
}

interface Animation {
  frames: (HTMLImageElement | HTMLCanvasElement)[];
  frameRate: number;
  loop: boolean;
  currentFrame: number;
  frameTimer: number;
  name: string;
  paused: boolean;
}

export class GameWorld {
  // Core references
  private engine: PixelEngine;
  private ctx: CanvasRenderingContext2D;
  private config: GameWorldConfig;
  
  // Game state
  private state: GameState = GameState.LOADING;
  private score: number = 0;
  private lives: number = 3;
  private timeElapsed: number = 0;
  
  // Assets
  private assets: { [key: string]: HTMLImageElement } = {};
  private animations: { [key: string]: Animation } = {};
  
  // Game objects
  private player: GameObject;
  private ground: GameObject[];
  private platforms: GameObject[];
  private collectibles: GameObject[];
  private enemies: GameObject[];
  private obstacles: GameObject[];
  private exit: GameObject;
  
  // Camera
  private cameraOffset: Vector2 = { x: 0, y: 0 };
  
  // Debug
  private debug: boolean;
  
  constructor(engine: PixelEngine, config: GameWorldConfig) {
    // Store references
    this.engine = engine;
    this.ctx = engine.getContext();
    this.config = {
      ...config,
      debug: config.debug || false
    };
    this.debug = this.config.debug!;
    
    // Initialize empty game objects
    this.player = this.createPlayer();
    this.ground = [];
    this.platforms = [];
    this.collectibles = [];
    this.enemies = [];
    this.obstacles = [];
    this.exit = this.createExit();
    
    // Set up game event handlers
    this.setupEventHandlers();
    
    // Load game assets
    this.loadAssets()
      .then(() => {
        // Create animations
        this.createAnimations();
        
        // Initialize level
        this.initializeLevel();
        
        // Set game state to ready
        this.state = GameState.READY;
        console.log('Game world is ready');
      })
      .catch(error => {
        console.error('Failed to load game assets:', error);
      });
  }
  
  /**
   * Start the game
   */
  public startGame(): void {
    if (this.state === GameState.READY) {
      this.state = GameState.PLAYING;
      console.log('Game started');
    }
  }
  
  /**
   * Pause the game
   */
  public pauseGame(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      console.log('Game paused');
    }
  }
  
  /**
   * Resume the game
   */
  public resumeGame(): void {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      console.log('Game resumed');
    }
  }
  
  /**
   * Get the current game state
   */
  public getGameState(): GameState {
    return this.state;
  }
  
  /**
   * Get the current score
   */
  public getScore(): number {
    return this.score;
  }
  
  /**
   * Get the current number of lives
   */
  public getLives(): number {
    return this.lives;
  }
  
  /**
   * Get the time elapsed in seconds
   */
  public getTimeElapsed(): number {
    return Math.floor(this.timeElapsed);
  }
  
  /**
   * Set up game event handlers
   */
  private setupEventHandlers(): void {
    // Set up update callback
    this.engine.onUpdate((deltaTime: number) => {
      this.update(deltaTime);
    });
    
    // Set up render callback
    this.engine.onRender((ctx: CanvasRenderingContext2D, deltaTime: number) => {
      this.render(ctx, deltaTime);
    });
  }
  
  /**
   * Update game logic
   */
  private update(deltaTime: number): void {
    // Only update if the game is playing
    if (this.state !== GameState.PLAYING) return;
    
    // Update time elapsed
    this.timeElapsed += deltaTime;
    
    // Handle player input
    this.handleInput(deltaTime);
    
    // Update physics
    this.updatePhysics(deltaTime);
    
    // Update animations
    this.updateAnimations(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Update camera
    this.updateCamera();
    
    // Check game over conditions
    this.checkGameState();
  }
  
  /**
   * Render the game
   */
  private render(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    // Render background
    this.renderBackground(ctx);
    
    // Apply camera transformation
    ctx.save();
    ctx.translate(-this.cameraOffset.x, -this.cameraOffset.y);
    
    // Render game objects
    this.renderGameObjects(ctx);
    
    // Render player
    this.renderPlayer(ctx, deltaTime);
    
    // Restore transformation
    ctx.restore();
    
    // Render UI
    this.renderUI(ctx);
    
    // Render debug info if enabled
    if (this.debug) {
      this.renderDebugInfo(ctx);
    }
  }
  
  /**
   * Handle player input
   */
  private handleInput(deltaTime: number): void {
    // Reset player horizontal velocity
    this.player.velocity.x = 0;
    
    // Move left
    if (this.engine.isKeyPressed('ArrowLeft') || this.engine.isKeyPressed('a')) {
      this.player.velocity.x = -this.config.playerSpeed;
      this.player.data.facingRight = false;
    }
    
    // Move right
    if (this.engine.isKeyPressed('ArrowRight') || this.engine.isKeyPressed('d')) {
      this.player.velocity.x = this.config.playerSpeed;
      this.player.data.facingRight = true;
    }
    
    // Jump (only if on ground)
    if ((this.engine.isKeyPressed('ArrowUp') || this.engine.isKeyPressed('w') || this.engine.isKeyPressed(' ')) && this.player.data.onGround) {
      this.player.velocity.y = -this.config.jumpForce;
      this.player.data.onGround = false;
      this.player.data.jumping = true;
    }
  }
  
  /**
   * Update physics for all game objects
   */
  private updatePhysics(deltaTime: number): void {
    // Apply gravity to player
    this.player.velocity.y += this.config.gravity * deltaTime;
    
    // Update player position
    this.player.position.x += this.player.velocity.x * deltaTime;
    this.player.position.y += this.player.velocity.y * deltaTime;
    
    // Track if player is on ground
    this.player.data.wasOnGround = this.player.data.onGround;
    this.player.data.onGround = false;
    
    // Update enemy positions
    for (const enemy of this.enemies) {
      if (!enemy.isActive) continue;
      
      // Apply gravity
      enemy.velocity.y += this.config.gravity * deltaTime;
      
      // Update position
      enemy.position.x += enemy.velocity.x * deltaTime;
      enemy.position.y += enemy.velocity.y * deltaTime;
      
      // Simple AI: reverse direction at edges
      if (enemy.data.movementTimer <= 0) {
        enemy.velocity.x = -enemy.velocity.x;
        enemy.data.movementTimer = enemy.data.movementInterval;
      } else {
        enemy.data.movementTimer -= deltaTime;
      }
    }
  }
  
  /**
   * Check for collisions between game objects
   */
  private checkCollisions(): void {
    const playerHeight = this.player.size.height || 80;
    const playerWidth = this.player.size.width || 50;
    
    // Check player-ground collisions
    for (const ground of this.ground) {
      if (this.checkCollision(this.player, ground)) {
        // Position player on top of ground
        this.player.position.y = ground.position.y - playerHeight;
        this.player.velocity.y = 0;
        this.player.data.onGround = true;
        this.player.data.jumping = false;
      }
    }
    
    // Check player-platform collisions
    for (const platform of this.platforms) {
      const platformWidth = platform.size.width || 100;
      
      // Only check from above
      if (this.player.position.y + playerHeight <= platform.position.y && 
          this.player.position.y + playerHeight + this.player.velocity.y >= platform.position.y) {
        
        if (this.player.position.x + playerWidth > platform.position.x && 
            this.player.position.x < platform.position.x + platformWidth) {
          
          // Position player on top of platform
          this.player.position.y = platform.position.y - playerHeight;
          this.player.velocity.y = 0;
          this.player.data.onGround = true;
          this.player.data.jumping = false;
        }
      }
    }
    
    // Check player-collectible collisions
    for (const collectible of this.collectibles) {
      if (!collectible.isActive) continue;
      
      if (this.checkCollision(this.player, collectible)) {
        // Collect the item
        collectible.isActive = false;
        this.score += collectible.type === 'coin' ? 10 : 0;
        
        // Handle potion (extra life)
        if (collectible.type === 'potion') {
          this.lives++;
        }
      }
    }
    
    // Check player-enemy collisions
    for (const enemy of this.enemies) {
      if (!enemy.isActive) continue;
      
      if (this.checkCollision(this.player, enemy)) {
        const playerHeight = this.player.size.height || 80;
        
        // Player jumps on enemy
        if (this.player.velocity.y > 0 && 
            this.player.position.y + playerHeight * 0.5 < enemy.position.y) {
          enemy.isActive = false;
          this.player.velocity.y = -300; // Bounce a bit
          this.score += 20;
        } else {
          // Player gets hurt
          this.hurtPlayer();
        }
      }
    }
    
    // Check player-obstacle collisions
    for (const obstacle of this.obstacles) {
      if (!obstacle.isActive) continue;
      
      if (this.checkCollision(this.player, obstacle)) {
        // Player gets hurt
        this.hurtPlayer();
      }
    }
    
    // Check player-exit collision
    if (this.exit.isActive && this.checkCollision(this.player, this.exit)) {
      // Player wins
      this.state = GameState.WIN;
      console.log('Player won!');
    }
    
    // Check if player is out of bounds
    if (this.player.position.y > this.engine.getCanvas().height * 1.5) {
      this.hurtPlayer();
      this.resetPlayerPosition();
    }
  }
  
  /**
   * Check collision between two game objects
   */
  private checkCollision(objA: GameObject, objB: GameObject): boolean {
    const widthA = objA.size.width || 0;
    const heightA = objA.size.height || 0;
    const widthB = objB.size.width || 0;
    const heightB = objB.size.height || 0;
    
    return (objA.position.x < objB.position.x + widthB &&
            objA.position.x + widthA > objB.position.x &&
            objA.position.y < objB.position.y + heightB &&
            objA.position.y + heightA > objB.position.y);
  }
  
  /**
   * Update camera position based on player
   */
  private updateCamera(): void {
    // Keep player centered horizontally
    const canvas = this.engine.getCanvas();
    const playerWidth = this.player.size.width || 50;
    const targetX = this.player.position.x - canvas.width / 2 + playerWidth / 2;
    
    // Smooth camera movement
    this.cameraOffset.x += (targetX - this.cameraOffset.x) * 0.1;
    
    // Clamp camera to level bounds
    this.cameraOffset.x = Math.max(0, this.cameraOffset.x);
  }
  
  /**
   * Update all animations in the game
   */
  private updateAnimations(deltaTime: number): void {
    // Update all animations in the animation dictionary
    for (const animName in this.animations) {
      const anim = this.animations[animName];
      
      // Skip paused animations
      if (anim.paused) continue;
      
      // Update animation frame timer
      anim.frameTimer += deltaTime;
      
      // Check if it's time to advance to the next frame
      if (anim.frameTimer >= 1 / anim.frameRate) {
        // Advance to next frame, looping if necessary
        if (anim.loop || anim.currentFrame < anim.frames.length - 1) {
          anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
        }
        
        // Reset frame timer
        anim.frameTimer = 0;
      }
    }
    
    // Apply animations to collectibles
    for (const collectible of this.collectibles) {
      if (!collectible.isActive) continue;
      
      const collectibleAnim = this.animations[collectible.type];
      if (collectibleAnim && collectibleAnim.frames.length > 0) {
        collectible.sprite = collectibleAnim.frames[collectibleAnim.currentFrame];
      }
    }
  }
  
  /**
   * Get the current player animation based on state
   * Enhanced to support jumping and falling animations
   */
  private getPlayerAnimation(): Animation | undefined {
    // Check if player is in the air
    if (!this.player.data.onGround) {
      // Player is jumping or falling
      if (this.player.velocity.y < 0) {
        // Moving upward - use jump animation
        return this.animations['player_jump'];
      } else {
        // Moving downward - use fall animation (currently same as jump)
        return this.animations['player_jump'];
      }
    }
    
    // Player is on the ground
    if (this.player.velocity.x !== 0) {
      // Player is running
      return this.animations['player_run'];
    } else {
      // Player is idle
      return this.animations['player_idle'];
    }
  }
  
  /**
   * Check game state conditions
   */
  private checkGameState(): void {
    // Game over condition
    if (this.lives <= 0) {
      this.state = GameState.GAME_OVER;
      console.log('Game over');
    }
  }
  
  /**
   * Render the background
   */
  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // Draw sky background
    const background = this.assets['background'];
    if (background) {
      ctx.drawImage(background, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }
  
  /**
   * Render all game objects
   */
  private renderGameObjects(ctx: CanvasRenderingContext2D): void {
    // Render ground
    for (const ground of this.ground) {
      this.renderGameObject(ctx, ground);
    }
    
    // Render platforms
    for (const platform of this.platforms) {
      this.renderGameObject(ctx, platform);
    }
    
    // Render collectibles
    for (const collectible of this.collectibles) {
      if (collectible.isActive) {
        this.renderGameObject(ctx, collectible);
      }
    }
    
    // Render enemies
    for (const enemy of this.enemies) {
      if (enemy.isActive) {
        this.renderGameObject(ctx, enemy);
      }
    }
    
    // Render obstacles
    for (const obstacle of this.obstacles) {
      if (obstacle.isActive) {
        this.renderGameObject(ctx, obstacle);
      }
    }
    
    // Render exit
    if (this.exit.isActive) {
      this.renderGameObject(ctx, this.exit);
    }
  }
  
  /**
   * Render the player with current animation
   */
  private renderPlayer(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const animation = this.getPlayerAnimation();
    const width = this.player.size.width || 50;
    const height = this.player.size.height || 80;
    
    if (animation && animation.frames.length > 0) {
      const frame = animation.frames[animation.currentFrame];
      
      // Flip image based on facing direction
      ctx.save();
      if (!this.player.data.facingRight) {
        ctx.translate(this.player.position.x + width, this.player.position.y);
        ctx.scale(-1, 1);
        ctx.drawImage(frame, 0, 0, width, height);
      } else {
        ctx.drawImage(frame, this.player.position.x, this.player.position.y, width, height);
      }
      ctx.restore();
    } else {
      // Fallback rendering
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(this.player.position.x, this.player.position.y, width, height);
    }
    
    // Draw debug box
    if (this.debug) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.player.position.x, this.player.position.y, width, height);
    }
  }
  
  /**
   * Render a generic game object with enhanced visual effects
   */
  private renderGameObject(ctx: CanvasRenderingContext2D, obj: GameObject): void {
    const width = obj.size.width || 30;
    const height = obj.size.height || 30;
    
    // Save the current context state
    ctx.save();
    
    // Apply special effects based on object type
    if (obj.type === 'potion') {
      // Add glow effect for potions
      const pulseAmount = Math.sin(this.timeElapsed * 5) * 0.1 + 1.05;
      ctx.shadowColor = '#FF00FF';
      ctx.shadowBlur = 10;
      
      // Scale the potion slightly based on time for a "pulsing" effect
      ctx.translate(
        obj.position.x + width / 2, 
        obj.position.y + height / 2
      );
      ctx.scale(pulseAmount, pulseAmount);
      
      if (obj.sprite) {
        ctx.drawImage(obj.sprite, -width / 2, -height / 2, width, height);
      } else {
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(-width / 2, -height / 2, width, height);
      }
    } 
    else if (obj.type === 'coin') {
      // Add rotation effect for coins
      const rotationAmount = this.timeElapsed * 2;
      
      // Make coins bob up and down slightly
      const bobAmount = Math.sin(this.timeElapsed * 3) * 5;
      
      ctx.translate(
        obj.position.x + width / 2, 
        obj.position.y + height / 2 + bobAmount
      );
      ctx.rotate(rotationAmount);
      
      // Add shimmering effect
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 5;
      
      if (obj.sprite) {
        ctx.drawImage(obj.sprite, -width / 2, -height / 2, width, height);
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-width / 2, -height / 2, width, height);
      }
    }
    else if (obj.type === 'exit') {
      // Add subtle animation for the chest/exit
      const pulseAmount = Math.sin(this.timeElapsed * 2) * 0.05 + 1;
      
      // Add slight glow effect
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 5;
      
      ctx.translate(
        obj.position.x + width / 2, 
        obj.position.y + height / 2
      );
      ctx.scale(pulseAmount, pulseAmount);
      
      if (obj.sprite) {
        ctx.drawImage(obj.sprite, -width / 2, -height / 2, width, height);
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-width / 2, -height / 2, width, height);
      }
    }
    else {
      // Standard rendering for other objects
      if (obj.sprite) {
        // Draw sprite image
        ctx.drawImage(obj.sprite, obj.position.x, obj.position.y, width, height);
      } else {
        // Fallback rendering with color
        switch (obj.type) {
          case 'ground':
            ctx.fillStyle = '#8B4513';
            break;
          case 'platform':
            ctx.fillStyle = '#A0522D';
            break;
          case 'enemy':
            ctx.fillStyle = '#FF0000';
            break;
          case 'obstacle':
            ctx.fillStyle = '#808080';
            break;
          default:
            ctx.fillStyle = '#000000';
        }
        
        ctx.fillRect(obj.position.x, obj.position.y, width, height);
      }
    }
    
    // Restore context state
    ctx.restore();
    
    // Draw debug box
    if (this.debug) {
      ctx.strokeStyle = '#0000FF';
      ctx.lineWidth = 1;
      ctx.strokeRect(obj.position.x, obj.position.y, width, height);
    }
  }
  
  /**
   * Render UI elements
   */
  private renderUI(ctx: CanvasRenderingContext2D): void {
    // Draw score
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Score: ${this.score}`, 10, 30);
    
    // Draw lives
    ctx.fillText(`Lives: ${this.lives}`, 10, 60);
    
    // Draw timer
    ctx.fillText(`Time: ${Math.floor(this.timeElapsed)}s`, 10, 90);
    
    // Draw game state
    if (this.state === GameState.PAUSED) {
      // Draw semi-transparent background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Draw paused text
      ctx.font = '24px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.textAlign = 'left'; // Reset alignment
    }
  }
  
  /**
   * Render debug information
   */
  private renderDebugInfo(ctx: CanvasRenderingContext2D): void {
    ctx.font = '12px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Player Position: (${Math.floor(this.player.position.x)}, ${Math.floor(this.player.position.y)})`, 10, 120);
    ctx.fillText(`Player Velocity: (${Math.floor(this.player.velocity.x)}, ${Math.floor(this.player.velocity.y)})`, 10, 140);
    ctx.fillText(`On Ground: ${this.player.data.onGround}`, 10, 160);
    ctx.fillText(`Camera Offset: (${Math.floor(this.cameraOffset.x)}, ${Math.floor(this.cameraOffset.y)})`, 10, 180);
  }
  
  /**
   * Hurt the player, decrease lives
   */
  private hurtPlayer(): void {
    this.lives--;
    this.player.data.invulnerable = true;
    
    // Reset invulnerability after a short time
    setTimeout(() => {
      this.player.data.invulnerable = false;
    }, 1000);
  }
  
  /**
   * Reset player position to start point
   */
  private resetPlayerPosition(): void {
    this.player.position.x = 100;
    this.player.position.y = 200;
    this.player.velocity.x = 0;
    this.player.velocity.y = 0;
  }
  
  /**
   * Load game assets
   */
  private async loadAssets(): Promise<void> {
    const assetsToLoad = [
      { key: 'player_idle', src: '/assets/eden/player_idle.svg' },
      { key: 'player_run', src: '/assets/eden/player_run.svg' },
      { key: 'background', src: '/assets/eden/background.svg' },
      { key: 'coin', src: '/assets/eden/coin.svg' },
      { key: 'potion', src: '/assets/eden/potion.svg' },
      { key: 'chest', src: '/assets/eden/chest.svg' }
    ];
    
    const promises = assetsToLoad.map(asset => this.loadImage(asset.key, asset.src));
    
    await Promise.all(promises);
    console.log('All assets loaded');
  }
  
  /**
   * Load a single image
   */
  private loadImage(key: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.assets[key] = img;
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        reject();
      };
      img.src = src;
    });
  }
  
  /**
   * Create animations from assets
   * Advanced support for multi-frame animations from sprite sheets
   */
  private createAnimations(): void {
    // Create player idle animation
    const idleImg = this.assets['player_idle'];
    if (idleImg) {
      // Split the sprite sheet into frames (assuming horizontal layout)
      const framesCount = 4; // Number of frames in the animation
      const frameWidth = idleImg.width / framesCount;
      const frameHeight = idleImg.height;
      const frames: HTMLCanvasElement[] = [];
      
      // Extract individual frames from the sprite sheet using canvas
      for (let i = 0; i < framesCount; i++) {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameWidth;
        frameCanvas.height = frameHeight;
        
        const ctx = frameCanvas.getContext('2d');
        if (ctx) {
          // Draw the specific portion of the sprite sheet to our frame canvas
          ctx.drawImage(
            idleImg,
            i * frameWidth, 0,      // Source position (x,y)
            frameWidth, frameHeight, // Source dimensions (width, height)
            0, 0,                   // Destination position (x,y)
            frameWidth, frameHeight  // Destination dimensions (width, height)
          );
          
          // Convert canvas to image for our animation system
          const frameImg = new Image();
          frameImg.src = frameCanvas.toDataURL();
          frames.push(frameCanvas);
        }
      }
      
      this.animations['player_idle'] = {
        frames: frames,
        frameRate: 6,
        loop: true,
        currentFrame: 0,
        frameTimer: 0,
        name: 'player_idle',
        paused: false
      };
    }
    
    // Create player run animation
    const runImg = this.assets['player_run'];
    if (runImg) {
      // Split the sprite sheet into frames (assuming horizontal layout)
      const framesCount = 6; // Number of frames in the run animation
      const frameWidth = runImg.width / framesCount;
      const frameHeight = runImg.height;
      const frames: HTMLCanvasElement[] = [];
      
      // Extract individual frames from the sprite sheet
      for (let i = 0; i < framesCount; i++) {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameWidth;
        frameCanvas.height = frameHeight;
        
        const ctx = frameCanvas.getContext('2d');
        if (ctx) {
          // Draw the specific portion of the sprite sheet
          ctx.drawImage(
            runImg,
            i * frameWidth, 0,      // Source position
            frameWidth, frameHeight, // Source dimensions
            0, 0,                   // Destination position
            frameWidth, frameHeight  // Destination dimensions
          );
          
          frames.push(frameCanvas);
        }
      }
      
      this.animations['player_run'] = {
        frames: frames,
        frameRate: 12, // Faster framerate for running
        loop: true,
        currentFrame: 0,
        frameTimer: 0,
        name: 'player_run',
        paused: false
      };
    }
    
    // Create jumping animation (using first frame of run animation for now)
    if (runImg) {
      const jumpCanvas = document.createElement('canvas');
      jumpCanvas.width = runImg.width / 6; // Assuming 6 frames in run
      jumpCanvas.height = runImg.height;
      
      const ctx = jumpCanvas.getContext('2d');
      if (ctx) {
        // Use the first frame of the run animation
        ctx.drawImage(
          runImg,
          0, 0,            // Source position
          runImg.width / 6, runImg.height, // Source dimensions
          0, 0,            // Destination position
          runImg.width / 6, runImg.height  // Destination dimensions
        );
        
        this.animations['player_jump'] = {
          frames: [jumpCanvas],
          frameRate: 1,
          loop: false,
          currentFrame: 0,
          frameTimer: 0,
          name: 'player_jump',
          paused: false
        };
      }
    }
    
    // Create coin animation
    const coinImg = this.assets['coin'];
    if (coinImg) {
      this.animations['coin'] = {
        frames: [coinImg],
        frameRate: 8,
        loop: true,
        currentFrame: 0,
        frameTimer: 0,
        name: 'coin',
        paused: false
      };
    }
    
    // Create potion animation with subtle pulsing effect
    const potionImg = this.assets['potion'];
    if (potionImg) {
      this.animations['potion'] = {
        frames: [potionImg],
        frameRate: 4,
        loop: true,
        currentFrame: 0,
        frameTimer: 0,
        name: 'potion',
        paused: false
      };
    }
    
    // Create chest animation
    const chestImg = this.assets['chest'];
    if (chestImg) {
      this.animations['exit'] = {
        frames: [chestImg],
        frameRate: 2,
        loop: true,
        currentFrame: 0,
        frameTimer: 0,
        name: 'exit',
        paused: false
      };
    }
  }
  
  /**
   * Initialize the game level
   */
  private initializeLevel(): void {
    const canvas = this.engine.getCanvas();
    
    // Create ground
    const groundHeight = 40;
    const groundSegments = 20;
    const groundWidth = canvas.width / 2;
    
    for (let i = 0; i < groundSegments; i++) {
      this.ground.push({
        position: { x: i * groundWidth, y: canvas.height - groundHeight },
        size: { x: 0, y: 0, width: groundWidth, height: groundHeight },
        velocity: { x: 0, y: 0 },
        type: 'ground',
        isActive: true
      });
    }
    
    // Create platforms
    const platformCount = 5;
    for (let i = 0; i < platformCount; i++) {
      this.platforms.push({
        position: { 
          x: 200 + i * 250 + Math.random() * 100, 
          y: canvas.height - groundHeight - 100 - i * 50 - Math.random() * 50 
        },
        size: { x: 0, y: 0, width: 100 + Math.random() * 50, height: 20 },
        velocity: { x: 0, y: 0 },
        type: 'platform',
        isActive: true
      });
    }
    
    // Create collectibles
    for (let i = 0; i < this.config.collectibles; i++) {
      // Determine if this will be a coin or potion
      const isPotion = i % 5 === 0; // Every 5th is a potion
      const type = isPotion ? 'potion' : 'coin';
      const sprite = this.assets[type];
      
      this.collectibles.push({
        position: {
          x: 250 + i * 150 + Math.random() * 50,
          y: canvas.height - groundHeight - 60 - Math.random() * 80
        },
        size: { x: 0, y: 0, width: 30, height: 30 },
        velocity: { x: 0, y: 0 },
        type,
        sprite,
        isActive: true
      });
    }
    
    // Create exit
    this.exit = {
      position: { x: (groundSegments - 2) * groundWidth, y: canvas.height - groundHeight - 50 },
      size: { x: 0, y: 0, width: 50, height: 50 },
      velocity: { x: 0, y: 0 },
      type: 'exit',
      sprite: this.assets['chest'],
      isActive: true
    };
    
    // Position player at start
    this.resetPlayerPosition();
  }
  
  /**
   * Create player object
   */
  private createPlayer(): GameObject {
    return {
      position: { x: 100, y: 200 },
      size: { x: 0, y: 0, width: 50, height: 80 },
      velocity: { x: 0, y: 0 },
      type: 'player',
      isActive: true,
      data: {
        onGround: false,
        wasOnGround: false,
        jumping: false,
        fallSince: 0,
        facingRight: true,
        invulnerable: false
      }
    };
  }
  
  /**
   * Create exit object
   */
  private createExit(): GameObject {
    return {
      position: { x: 0, y: 0 },
      size: { x: 0, y: 0, width: 50, height: 50 },
      velocity: { x: 0, y: 0 },
      type: 'exit',
      isActive: true
    };
  }
}