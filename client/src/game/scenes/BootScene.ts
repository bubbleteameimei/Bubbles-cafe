/**
 * BootScene.ts
 * 
 * The Boot Scene is responsible for initializing the game,
 * loading the initial assets, and transitioning to the main game scene.
 */

import { PixelArtAssetLoader, AssetConfig } from '../utils/assetLoader';

export class BootScene {
  private loadingProgress: number = 0;
  private onComplete: () => void;
  
  constructor(onComplete: () => void) {
    this.onComplete = onComplete;
  }
  
  preload(): void {
    console.log('[BootScene] Preloading game assets...');
    
    // Define all the assets we need to load
    const assets: AssetConfig[] = [
      // Environment assets
      {
        key: 'tileset',
        type: 'image',
        url: '/assets/environment/tileset.svg'
      },
      {
        key: 'background',
        type: 'image',
        url: '/assets/environment/background.svg'
      },
      {
        key: 'map',
        type: 'tilemap',
        url: '/assets/environment/map.json'
      },
      
      // Character assets
      {
        key: 'player',
        type: 'spritesheet',
        url: '/assets/characters/player/player.svg',
        frameConfig: {
          frameWidth: 32,
          frameHeight: 48
        }
      },
      {
        key: 'npc_villager',
        type: 'spritesheet',
        url: '/assets/characters/npcs/villager.svg',
        frameConfig: {
          frameWidth: 32,
          frameHeight: 48
        }
      },
      
      // Item assets
      {
        key: 'potion',
        type: 'image',
        url: '/assets/items/potion.svg'
      },
      {
        key: 'coin',
        type: 'image',
        url: '/assets/items/coin.svg'
      },
      {
        key: 'chest',
        type: 'image',
        url: '/assets/items/chest.svg'
      },
      
      // UI assets
      {
        key: 'ui_frame',
        type: 'image',
        url: '/assets/ui/frame.svg'
      },
      {
        key: 'ui_button',
        type: 'image',
        url: '/assets/ui/button.svg'
      },
      
      // Audio assets
      {
        key: 'bgm_village',
        type: 'audio',
        url: '/assets/audio/village_theme.mp3'
      },
      {
        key: 'sfx_pickup',
        type: 'audio',
        url: '/assets/audio/pickup.mp3'
      }
    ];
    
    // Clear any existing assets and add new ones to the queue
    PixelArtAssetLoader.clearCache();
    PixelArtAssetLoader.addToQueue(assets);
    
    // Start loading assets
    this.loadAssets();
  }
  
  private async loadAssets(): Promise<void> {
    try {
      await PixelArtAssetLoader.loadAll((progress) => {
        this.loadingProgress = progress;
        this.updateLoadingBar();
      });
      
      console.log('[BootScene] Assets loaded successfully');
      
      // Short delay before completing to show 100% progress
      setTimeout(() => {
        this.onComplete();
      }, 500);
    } catch (error) {
      console.error('[BootScene] Error loading assets:', error);
    }
  }
  
  private updateLoadingBar(): void {
    // Update loading bar visual (for standalone implementation)
    const progressElement = document.getElementById('game-loading-progress');
    const progressBarElement = document.getElementById('game-loading-bar');
    
    if (progressElement) {
      progressElement.textContent = `${Math.floor(this.loadingProgress * 100)}%`;
    }
    
    if (progressBarElement) {
      progressBarElement.style.width = `${this.loadingProgress * 100}%`;
    }
  }
  
  render(): HTMLElement {
    // Create loading screen element
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.style.position = 'absolute';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.flexDirection = 'column';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.backgroundColor = '#000';
    loadingScreen.style.color = '#fff';
    
    // Create title
    const title = document.createElement('h1');
    title.textContent = "Eden's Hollow";
    title.style.marginBottom = '20px';
    title.style.fontFamily = 'monospace';
    title.style.fontSize = '24px';
    loadingScreen.appendChild(title);
    
    // Create loading bar container
    const loadingBarContainer = document.createElement('div');
    loadingBarContainer.style.width = '80%';
    loadingBarContainer.style.height = '20px';
    loadingBarContainer.style.backgroundColor = '#333';
    loadingBarContainer.style.borderRadius = '4px';
    loadingBarContainer.style.overflow = 'hidden';
    
    // Create loading bar
    const loadingBar = document.createElement('div');
    loadingBar.id = 'game-loading-bar';
    loadingBar.style.width = '0%';
    loadingBar.style.height = '100%';
    loadingBar.style.backgroundColor = '#4CAF50';
    loadingBar.style.transition = 'width 0.3s ease-in-out';
    loadingBarContainer.appendChild(loadingBar);
    loadingScreen.appendChild(loadingBarContainer);
    
    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.id = 'game-loading-progress';
    loadingText.textContent = '0%';
    loadingText.style.marginTop = '10px';
    loadingText.style.fontFamily = 'monospace';
    loadingScreen.appendChild(loadingText);
    
    return loadingScreen;
  }
  
  update(delta: number): void {
    // Nothing to update in boot scene
  }
  
  destroy(): void {
    // Clean up any resources
    const progressElement = document.getElementById('game-loading-progress');
    if (progressElement && progressElement.parentNode) {
      progressElement.parentNode.removeChild(progressElement);
    }
    
    const progressBarElement = document.getElementById('game-loading-bar');
    if (progressBarElement && progressBarElement.parentNode) {
      progressBarElement.parentNode.removeChild(progressBarElement);
    }
  }
}