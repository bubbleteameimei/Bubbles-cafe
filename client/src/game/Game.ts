/**
 * Game.ts
 * 
 * The main game controller that manages scenes, assets, and game state.
 * Handles the initialization, scene transitions, and game lifecycle.
 */

import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

type GameState = 'loading' | 'playing' | 'paused' | 'gameover';

export class Game {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private currentScene: BootScene | GameScene | null = null;
  private gameState: GameState = 'loading';
  private width: number;
  private height: number;
  
  constructor(container: HTMLElement, width: number = 640, height: number = 480) {
    this.container = container;
    this.width = width;
    this.height = height;
    
    // Create the canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.display = 'block';
    this.canvas.style.imageRendering = 'pixelated'; // Ensure pixel art rendering
    
    // Add the canvas to the container
    container.appendChild(this.canvas);
    
    // Listen for window resize events
    window.addEventListener('resize', this.handleResize);
  }
  
  public async start(): Promise<void> {
    console.log('[Game] Starting game initialization');
    
    // Start with the boot scene
    this.startBootScene();
  }
  
  private startBootScene(): void {
    console.log('[Game] Starting boot scene');
    
    // Remove any existing scene elements
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    
    // Create and start boot scene
    const bootScene = new BootScene(() => this.onBootComplete());
    
    // Add loading screen to the container
    const loadingElement = bootScene.render();
    this.container.appendChild(loadingElement);
    
    // Start the boot process
    bootScene.preload();
    
    // Store current scene
    this.currentScene = bootScene;
    this.gameState = 'loading';
  }
  
  private onBootComplete(): void {
    console.log('[Game] Boot scene complete, transitioning to game scene');
    
    // Clean up boot scene
    if (this.currentScene instanceof BootScene) {
      this.currentScene.destroy();
    }
    
    // Remove any loading UI
    const loadingScreen = this.container.querySelector('.loading-screen');
    if (loadingScreen) {
      this.container.removeChild(loadingScreen);
    }
    
    // Start the game scene
    this.startGameScene();
  }
  
  private startGameScene(): void {
    console.log('[Game] Starting game scene');
    
    try {
      // Create and start the game scene
      const gameScene = new GameScene(this.canvas);
      gameScene.start();
      
      // Store current scene
      this.currentScene = gameScene;
      this.gameState = 'playing';
      
      console.log('[Game] Game scene started successfully');
    } catch (error) {
      console.error('[Game] Failed to start game scene:', error);
      this.showError('Failed to start game. Please try again.');
    }
  }
  
  public pause(): void {
    if (this.gameState === 'playing' && this.currentScene instanceof GameScene) {
      this.currentScene.stop();
      this.gameState = 'paused';
      console.log('[Game] Game paused');
    }
  }
  
  public resume(): void {
    if (this.gameState === 'paused' && this.currentScene instanceof GameScene) {
      this.currentScene.start();
      this.gameState = 'playing';
      console.log('[Game] Game resumed');
    }
  }
  
  public restart(): void {
    console.log('[Game] Restarting game');
    
    // Clean up current scene
    this.destroy();
    
    // Start fresh
    this.start();
  }
  
  public destroy(): void {
    console.log('[Game] Destroying game instance');
    
    // Clean up current scene
    if (this.currentScene) {
      if (this.currentScene instanceof GameScene) {
        this.currentScene.destroy();
      } else if (this.currentScene instanceof BootScene) {
        this.currentScene.destroy();
      }
      this.currentScene = null;
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Remove canvas from container
    if (this.canvas.parentNode === this.container) {
      this.container.removeChild(this.canvas);
    }
    
    console.log('[Game] Game instance destroyed');
  }
  
  private handleResize = (): void => {
    // Implement responsive resizing if needed
    // For now, we'll maintain the game's original dimensions
    
    if (this.currentScene instanceof GameScene) {
      // In a more advanced implementation, we might scale the canvas here
      // this.currentScene.resize(newWidth, newHeight);
    }
  };
  
  private showError(message: string): void {
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'game-error';
    errorElement.style.position = 'absolute';
    errorElement.style.top = '50%';
    errorElement.style.left = '50%';
    errorElement.style.transform = 'translate(-50%, -50%)';
    errorElement.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorElement.style.color = 'white';
    errorElement.style.padding = '20px';
    errorElement.style.borderRadius = '5px';
    errorElement.style.textAlign = 'center';
    errorElement.style.maxWidth = '80%';
    
    // Add message
    errorElement.textContent = message;
    
    // Add retry button
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry';
    retryButton.style.marginTop = '10px';
    retryButton.style.padding = '5px 10px';
    retryButton.style.border = 'none';
    retryButton.style.backgroundColor = 'white';
    retryButton.style.color = 'black';
    retryButton.style.cursor = 'pointer';
    retryButton.style.borderRadius = '3px';
    
    retryButton.addEventListener('click', () => {
      // Remove error element
      if (errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
      }
      
      // Restart the game
      this.restart();
    });
    
    errorElement.appendChild(document.createElement('br'));
    errorElement.appendChild(retryButton);
    
    // Add to container
    this.container.appendChild(errorElement);
  }
}