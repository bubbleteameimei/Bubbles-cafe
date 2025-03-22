/**
 * Test page for Eden's Hollow game components
 * 
 * This page allows us to test individual game components without needing
 * the full game page setup.
 */

import React, { useEffect, useState } from 'react';
import { PixelArtAssetLoader, AssetConfig } from '../game/utils/assetLoader';

const GameTestPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  
  useEffect(() => {
    // Define the assets to load
    const assets: AssetConfig[] = [
      {
        key: 'tileset',
        type: 'image',
        url: '/assets/environment/tileset.svg'
      },
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
        key: 'map',
        type: 'tilemap',
        url: '/assets/environment/map.json'
      }
    ];
    
    // Clear any previous assets and load the new ones
    PixelArtAssetLoader.clearCache();
    PixelArtAssetLoader.addToQueue(assets);
    
    // Start loading assets
    PixelArtAssetLoader.loadAll((progress) => {
      setProgress(Math.floor(progress * 100));
    })
      .then(() => {
        setLoading(false);
        setAssetsLoaded(true);
      })
      .catch((err) => {
        setLoading(false);
        setError(`Error loading assets: ${err.message || err}`);
      });
  }, []);
  
  // Create player animation
  useEffect(() => {
    if (!assetsLoaded) return;
    
    // Create player animation
    const playerAnim = PixelArtAssetLoader.createAnimation('player', 0, 3, 8);
    
    if (playerAnim) {
      // Add player animation to the DOM
      const container = document.getElementById('player-animation');
      if (container) {
        container.innerHTML = '';
        
        // Scale the player animation
        playerAnim.domElement.style.transform = 'scale(3)';
        playerAnim.domElement.style.transformOrigin = 'top left';
        
        container.appendChild(playerAnim.domElement);
        playerAnim.play();
      }
    }
    
    // Cleanup
    return () => {
      const container = document.getElementById('player-animation');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [assetsLoaded]);
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Eden's Hollow Game Test</h1>
      
      {loading && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Loading Assets</h2>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm text-gray-600">Progress: {progress}%</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      {assetsLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Animation */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Player Animation</h2>
            <div 
              id="player-animation" 
              className="w-[96px] h-[144px] bg-gray-800"
            ></div>
          </div>
          
          {/* Asset Preview */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Asset Preview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Tileset</h3>
                <img 
                  src="/assets/environment/tileset.svg" 
                  alt="Tileset" 
                  className="w-full max-w-[128px] h-auto border"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Items</h3>
                <div className="flex gap-2">
                  <img 
                    src="/assets/items/potion.svg" 
                    alt="Potion" 
                    className="w-[32px] h-[32px]"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <img 
                    src="/assets/items/coin.svg" 
                    alt="Coin" 
                    className="w-[32px] h-[32px]"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Game Controls */}
          <div className="border p-4 rounded-lg md:col-span-2">
            <h2 className="text-xl font-semibold mb-3">Game Controls</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded text-center">
                <span className="block text-sm text-gray-600 dark:text-gray-400">Movement</span>
                <span className="font-mono">Arrow Keys</span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded text-center">
                <span className="block text-sm text-gray-600 dark:text-gray-400">Interact</span>
                <span className="font-mono">Space</span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded text-center">
                <span className="block text-sm text-gray-600 dark:text-gray-400">Inventory</span>
                <span className="font-mono">E</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTestPage;