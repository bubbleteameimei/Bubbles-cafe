/**
 * Eden's Hollow Game Page
 * 
 * This page integrates the Eden's Hollow pixel art game into the application.
 * It provides game information, instructions, and houses the game container.
 */

import React, { useState } from 'react';
import GameContainer from '../../components/GameContainer';

const EdenGamePage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="container mx-auto py-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Eden's Hollow</h1>
        <p className="text-gray-600 dark:text-gray-400">A pixel art adventure in a mysterious town</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Game Container */}
          <div className="relative mb-4">
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  onClick={() => setIsPlaying(true)}
                >
                  <span>▶</span> Start Game
                </button>
              </div>
            )}
            
            <GameContainer 
              width={640} 
              height={480} 
              className={isPlaying ? '' : 'pointer-events-none blur-sm'}
            />
          </div>
          
          {/* Game Controls */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isPlaying ? 'Game running...' : 'Click Start to begin your adventure'}
            </div>
            
            <div className="flex gap-2">
              {isPlaying ? (
                <button 
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded text-sm flex items-center gap-1"
                  onClick={() => setIsPlaying(false)}
                >
                  <span>⏸</span> Pause
                </button>
              ) : (
                <button 
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded text-sm flex items-center gap-1"
                  onClick={() => setIsPlaying(true)}
                >
                  <span>▶</span> Play
                </button>
              )}
            </div>
          </div>
          
          {/* Game Tips */}
          <div className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-500">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Game Tip</h3>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Interact with objects by pressing the Space key. Open your inventory with the E key.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          {/* Game Information */}
          <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">About Eden's Hollow</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">A mysterious pixel art adventure</p>
            </div>
            <div className="p-4">
              <p className="mb-4 text-sm">
                Eden's Hollow is a pixel art adventure game set in a small, mysterious town where strange occurrences happen after dark. You play as a visitor who must uncover the town's dark secrets.
              </p>
              <p className="text-sm">
                Explore the town, interact with the residents, and collect items to solve puzzles. But be careful - not everything is as it seems in Eden's Hollow...
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
              <button 
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 py-2 px-4 rounded text-sm"
                onClick={() => {
                  setIsPlaying(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Start Your Adventure
              </button>
            </div>
          </div>
          
          {/* Game Features */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Game Features</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-1 rounded-full mt-0.5">✓</span>
                <span>Authentic pixel art aesthetic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-1 rounded-full mt-0.5">✓</span>
                <span>Engaging story and atmosphere</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-1 rounded-full mt-0.5">✓</span>
                <span>Interactive NPCs with unique dialogue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-1 rounded-full mt-0.5">✓</span>
                <span>Puzzles and exploration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-1 rounded-full mt-0.5">✓</span>
                <span>Inventory system</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdenGamePage;