/**
 * GameWorld - Main game scene for Eden's Hollow
 * 
 * Handles game logic, player movement, collectibles, and environment interactions.
 */

import { PixelEngine, Sprite, CollisionCallback } from '../PixelEngine';

export interface GameConfig {
  gravity?: number;
  playerSpeed?: number;
  jumpForce?: number;
  collectibles?: number;
  debug?: boolean;
}

export enum GameState {
  LOADING = 'loading',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameover',
  WIN = 'win'
}

export class GameWorld {
  private engine: PixelEngine;
  private config: GameConfig;
  
  // Game state
  private state: GameState = GameState.LOADING;
  private score: number = 0;
  private lives: number = 3;
  private timeElapsed: number = 0;
  
  // Player properties
  private playerId: string = 'player';
  private playerX: number = 100;
  private playerY: number = 200;
  private isPlayerMoving: boolean = false;
  private isPlayerJumping: boolean = false;
  private playerDirection: 'left' | 'right' = 'right';
  
  // Asset paths
  private assets = {
    background: '/assets/eden/background.svg',
    playerIdle: '/assets/eden/player_idle.svg',
    playerRun: '/assets/eden/player_run.svg',
    coin: '/assets/eden/coin.svg',
    potion: '/assets/eden/potion.svg',
    chest: '/assets/eden/chest.svg'
  };
  
  // Collectibles
  private coins: string[] = [];
  private potions: string[] = [];
  private chests: string[] = [];
  
  // Game boundaries
  private groundLevel: number = 300;
  private worldWidth: number = 1600;
  private worldHeight: number = 400;
  
  // UI Elements
  private uiElements: {
    scoreText?: string;
    livesText?: string;
    timerText?: string;
    pauseButton?: string;
  } = {};
  
  // Asset loading status
  private assetsLoaded: boolean = false;
  private loadedAssets: Set<string> = new Set();
  private totalAssets: number = 0;
  
  constructor(engine: PixelEngine, config: GameConfig = {}) {
    this.engine = engine;
    this.config = {
      gravity: config.gravity || 980,
      playerSpeed: config.playerSpeed || 200,
      jumpForce: config.jumpForce || 400,
      collectibles: config.collectibles || 10,
      debug: config.debug || false
    };
    
    // Count total assets to load
    this.totalAssets = Object.keys(this.assets).length;
    
    // Initialize game
    this.init();
  }
  
  private async init() {
    // Set state to loading
    this.state = GameState.LOADING;
    
    // Load background
    try {
      await this.engine.setBackground(this.assets.background);
      this.loadedAssets.add('background');
      this.checkAssetsLoaded();
    } catch (error) {
      console.error('Failed to load background:', error);
    }
    
    // Load player sprites
    try {
      // Idle animation
      await this.engine.addSprite({
        id: 'player_idle',
        x: this.playerX,
        y: this.playerY,
        width: 32,
        height: 48,
        imageUrl: this.assets.playerIdle,
        spriteSheet: true,
        frameWidth: 32,
        frameHeight: 48,
        totalFrames: 4,
        animationSpeed: 5,
        visible: true,
        scale: 2,
        collisionBox: {
          x: 6, // offset from sprite x
          y: 8, // offset from sprite y
          width: 20,
          height: 40
        }
      });
      
      // Running animation (initially hidden)
      await this.engine.addSprite({
        id: 'player_run',
        x: this.playerX,
        y: this.playerY,
        width: 32,
        height: 48,
        imageUrl: this.assets.playerRun,
        spriteSheet: true,
        frameWidth: 32,
        frameHeight: 48,
        totalFrames: 6,
        animationSpeed: 10,
        visible: false,
        scale: 2,
        collisionBox: {
          x: 6,
          y: 8,
          width: 20,
          height: 40
        }
      });
      
      this.loadedAssets.add('player');
      this.checkAssetsLoaded();
    } catch (error) {
      console.error('Failed to load player sprites:', error);
    }
    
    // Load collectibles
    try {
      // Create coins
      for (let i = 0; i < this.config.collectibles!; i++) {
        const coinId = `coin_${i}`;
        const coinX = 400 + Math.random() * (this.worldWidth - 800);
        const coinY = this.groundLevel - 50 - Math.random() * 50;
        
        await this.engine.addSprite({
          id: coinId,
          x: coinX,
          y: coinY,
          width: 16,
          height: 16,
          imageUrl: this.assets.coin,
          spriteSheet: true,
          frameWidth: 16,
          frameHeight: 16,
          totalFrames: 4,
          animationSpeed: 6,
          visible: true,
          scale: 1.5,
          collisionBox: {
            x: 2,
            y: 2,
            width: 12,
            height: 12
          }
        });
        
        this.coins.push(coinId);
        
        // Add collision with player
        this.engine.addCollision('player_idle', coinId, this.collectCoin.bind(this));
        this.engine.addCollision('player_run', coinId, this.collectCoin.bind(this));
      }
      
      // Create potions
      for (let i = 0; i < 3; i++) {
        const potionId = `potion_${i}`;
        const potionX = 600 + Math.random() * (this.worldWidth - 800);
        const potionY = this.groundLevel - 40;
        
        await this.engine.addSprite({
          id: potionId,
          x: potionX,
          y: potionY,
          width: 16,
          height: 24,
          imageUrl: this.assets.potion,
          visible: true,
          scale: 1.5,
          collisionBox: {
            x: 2,
            y: 2,
            width: 12,
            height: 20
          }
        });
        
        this.potions.push(potionId);
        
        // Add collision with player
        this.engine.addCollision('player_idle', potionId, this.collectPotion.bind(this));
        this.engine.addCollision('player_run', potionId, this.collectPotion.bind(this));
      }
      
      // Add treasure chest
      const chestId = 'chest_1';
      await this.engine.addSprite({
        id: chestId,
        x: this.worldWidth - 200,
        y: this.groundLevel - 50,
        width: 32,
        height: 32,
        imageUrl: this.assets.chest,
        visible: true,
        scale: 1.5,
        collisionBox: {
          x: 2,
          y: 2,
          width: 28,
          height: 28
        }
      });
      
      this.chests.push(chestId);
      
      // Add collision with player
      this.engine.addCollision('player_idle', chestId, this.openChest.bind(this));
      this.engine.addCollision('player_run', chestId, this.openChest.bind(this));
      
      this.loadedAssets.add('collectibles');
      this.checkAssetsLoaded();
    } catch (error) {
      console.error('Failed to load collectibles:', error);
    }
    
    // Register update handler
    this.engine.onUpdate(this.update.bind(this));
  }
  
  private checkAssetsLoaded() {
    if (this.loadedAssets.size >= 3) { // background, player, collectibles
      this.assetsLoaded = true;
      this.state = GameState.READY;
      
      // Set initial player state
      this.setActivePlayerSprite('idle');
      
      console.log('Game ready to start!');
    }
  }
  
  private update(deltaTime: number) {
    // Skip updates if game is not playing
    if (this.state !== GameState.PLAYING && this.state !== GameState.READY) {
      return;
    }
    
    // Start game if ready and any key is pressed
    if (this.state === GameState.READY) {
      if (
        this.engine.isKeyPressed('arrowleft') || 
        this.engine.isKeyPressed('arrowright') || 
        this.engine.isKeyPressed('arrowup') || 
        this.engine.isKeyPressed('space')
      ) {
        this.state = GameState.PLAYING;
      }
      
      return;
    }
    
    // Update game timer
    this.timeElapsed += deltaTime;
    
    // Handle player input
    this.handlePlayerInput(deltaTime);
    
    // Handle player movement and physics
    this.updatePlayerPhysics(deltaTime);
    
    // Update camera to follow player
    this.updateCamera();
  }
  
  private handlePlayerInput(deltaTime: number) {
    const player = this.getPlayer();
    if (!player) return;
    
    // Reset movement flags
    this.isPlayerMoving = false;
    
    // Initialize velocity if needed
    if (!player.velocity) {
      player.velocity = { x: 0, y: 0 };
    }
    
    // Handle left/right movement
    if (this.engine.isKeyPressed('arrowleft')) {
      player.velocity.x = -this.config.playerSpeed!;
      this.isPlayerMoving = true;
      this.playerDirection = 'left';
      this.engine.setSpriteFlip('player_idle', true);
      this.engine.setSpriteFlip('player_run', true);
    } else if (this.engine.isKeyPressed('arrowright')) {
      player.velocity.x = this.config.playerSpeed!;
      this.isPlayerMoving = true;
      this.playerDirection = 'right';
      this.engine.setSpriteFlip('player_idle', false);
      this.engine.setSpriteFlip('player_run', false);
    } else {
      // Apply friction/deceleration when no keys are pressed
      player.velocity.x *= 0.9; // Simple linear damping
    }
    
    // Handle jumping
    if (
      (this.engine.isKeyPressed('arrowup') || this.engine.isKeyPressed('space')) && 
      player.onGround && 
      !this.isPlayerJumping
    ) {
      player.velocity.y = -this.config.jumpForce!;
      player.onGround = false;
      this.isPlayerJumping = true;
    }
    
    // Switch between idle and running animations
    if (this.isPlayerMoving) {
      this.setActivePlayerSprite('run');
    } else {
      this.setActivePlayerSprite('idle');
    }
  }
  
  private updatePlayerPhysics(deltaTime: number) {
    const player = this.getPlayer();
    if (!player) return;
    
    // Apply gravity
    player.velocity!.y += this.config.gravity! * deltaTime;
    
    // Update position
    this.playerX = player.x;
    this.playerY = player.y;
    
    // Ground collision detection
    if (player.y + player.height >= this.groundLevel) {
      player.y = this.groundLevel - player.height;
      player.velocity!.y = 0;
      player.onGround = true;
      this.isPlayerJumping = false;
    }
    
    // Left boundary
    if (player.x < 0) {
      player.x = 0;
      player.velocity!.x = 0;
    }
    
    // Right boundary
    if (player.x + player.width > this.worldWidth) {
      player.x = this.worldWidth - player.width;
      player.velocity!.x = 0;
    }
    
    // Update the other player sprite position to match
    if (this.isPlayerMoving) {
      this.engine.setSpritePosition('player_idle', player.x, player.y);
    } else {
      this.engine.setSpritePosition('player_run', player.x, player.y);
    }
  }
  
  private updateCamera() {
    // Center camera on player, but with boundaries
    if (!this.getPlayer()) return;
    
    const playerCenterX = this.playerX + 32; // player width / 2
    const screenWidth = this.engine['canvasWidth']; // accessing private property
    
    let cameraX = Math.max(0, playerCenterX - screenWidth / 2);
    cameraX = Math.min(cameraX, this.worldWidth - screenWidth);
    
    this.engine.setCamera(cameraX, 0);
  }
  
  private getPlayer(): Sprite | undefined {
    return this.isPlayerMoving 
      ? this.engine.getSprite('player_run') 
      : this.engine.getSprite('player_idle');
  }
  
  private setActivePlayerSprite(type: 'idle' | 'run') {
    if (type === 'idle') {
      this.engine.setSpriteVisible('player_idle', true);
      this.engine.setSpriteVisible('player_run', false);
    } else {
      this.engine.setSpriteVisible('player_idle', false);
      this.engine.setSpriteVisible('player_run', true);
    }
  }
  
  private collectCoin: CollisionCallback = (player, coin) => {
    // Increase score
    this.score += 10;
    console.log(`Collected coin! Score: ${this.score}`);
    
    // Hide the coin
    this.engine.setSpriteVisible(coin.id, false);
    
    // Remove collision
    this.engine.removeCollision('player_idle', coin.id);
    this.engine.removeCollision('player_run', coin.id);
    
    // Remove from internal list
    this.coins = this.coins.filter(id => id !== coin.id);
    
    // Check if all coins are collected
    this.checkGameCompletion();
  };
  
  private collectPotion: CollisionCallback = (player, potion) => {
    // Increase lives
    this.lives += 1;
    console.log(`Collected potion! Lives: ${this.lives}`);
    
    // Hide the potion
    this.engine.setSpriteVisible(potion.id, false);
    
    // Remove collision
    this.engine.removeCollision('player_idle', potion.id);
    this.engine.removeCollision('player_run', potion.id);
    
    // Remove from internal list
    this.potions = this.potions.filter(id => id !== potion.id);
  };
  
  private openChest: CollisionCallback = (player, chest) => {
    // Bonus points
    this.score += 50;
    console.log(`Opened chest! Score: ${this.score}`);
    
    // Hide the chest
    this.engine.setSpriteVisible(chest.id, false);
    
    // Remove collision
    this.engine.removeCollision('player_idle', chest.id);
    this.engine.removeCollision('player_run', chest.id);
    
    // Remove from internal list
    this.chests = this.chests.filter(id => id !== chest.id);
    
    // Check if all collectibles are collected
    this.checkGameCompletion();
  };
  
  private checkGameCompletion() {
    if (this.coins.length === 0 && this.chests.length === 0) {
      this.state = GameState.WIN;
      console.log('You win! All collectibles gathered!');
      
      // Here you could show a win screen or trigger other events
    }
  }
  
  // Public methods
  
  public startGame() {
    if (this.state === GameState.READY || this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      console.log('Game started!');
    }
  }
  
  public pauseGame() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      console.log('Game paused!');
    }
  }
  
  public resumeGame() {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      console.log('Game resumed!');
    }
  }
  
  public resetGame() {
    // TO-DO: Implement game reset logic
    console.log('Game reset not implemented yet!');
  }
  
  public getGameState(): GameState {
    return this.state;
  }
  
  public getScore(): number {
    return this.score;
  }
  
  public getLives(): number {
    return this.lives;
  }
  
  public getTimeElapsed(): number {
    return this.timeElapsed;
  }
  
  public isReady(): boolean {
    return this.assetsLoaded;
  }
}