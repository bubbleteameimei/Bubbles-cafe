/**
 * Eden's Hollow Game Component
 * 
 * This is the main game component that brings together all the game elements:
 * - Game state management
 * - Sound effects
 * - Interactive UI
 * - Game scenes
 */

import React, { useState, useEffect, useRef } from 'react';
import useGameState from '../hooks/useGameState';
import useSoundEffects from '../hooks/useSoundEffects';
import PhaserGame from './game/PhaserGame';
import GameFooter from './game/GameFooter';
import GameSettingsModal from './game/GameSettingsModal';
import { Choice } from '../types/game';

const EdenHollowGame: React.FC = () => {
  // Game state
  const {
    gameState,
    currentStory,
    currentPassage,
    showLowSanityEffects,
    makeChoice,
    startNewGame,
    goBack,
    canGoBack,
    updateSetting,
    resetGame,
    saveGame
  } = useGameState();
  
  // Sound effects
  const soundEffects = useSoundEffects(gameState.settings);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Container size for the game
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  // Track container size for responsive game canvas
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    // Initial size
    updateSize();
    
    // Update on window resize
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  
  // Start the game when mounted
  useEffect(() => {
    if (!initialized && !currentStory) {
      // Start with the first story (later we could show a selection screen)
      startNewGame('haunted-manor');
      setInitialized(true);
    }
  }, [initialized, currentStory, startNewGame]);
  
  // Toggle ambient sounds based on sanity state
  useEffect(() => {
    if (initialized) {
      soundEffects.startAmbientSounds(showLowSanityEffects);
    }
    
    return () => {
      soundEffects.stopAllSounds();
    };
  }, [initialized, showLowSanityEffects, soundEffects]);
  
  // Handle player choices
  const handleChoiceSelected = (choice: Choice) => {
    // Play appropriate sound for choice
    soundEffects.playSound('choice');
    
    // Handle sanity change sound effects if applicable
    if (choice.sanityChange) {
      if (choice.sanityChange < 0) {
        soundEffects.playSound('sanityDrop');
      } else if (choice.sanityChange > 0) {
        soundEffects.playSound('sanityGain');
      }
    }
    
    // Apply the choice
    makeChoice(choice);
  };
  
  // Handle settings changes
  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key as any, value);
    
    // Update sound system if sound settings change
    if (key === 'soundEnabled' || key === 'musicVolume' || key === 'sfxVolume') {
      soundEffects.updateVolumes();
    }
  };
  
  return (
    <div className="flex flex-col w-full h-full bg-black overflow-hidden">
      {/* Game Container */}
      <div 
        ref={containerRef}
        className="flex-grow relative overflow-hidden"
      >
        {/* Phaser Game Canvas */}
        <PhaserGame
          gameState={gameState}
          currentStory={currentStory}
          currentPassage={currentPassage}
          showLowSanityEffects={showLowSanityEffects}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          onChoiceSelected={handleChoiceSelected}
        />
      </div>
      
      {/* Game Footer Controls */}
      <GameFooter
        storyPhase={currentPassage?.phase}
        storyTitle={currentStory?.title}
        canGoBack={canGoBack}
        onSettings={() => setShowSettings(true)}
        onSave={saveGame}
        onReset={resetGame}
        onBack={goBack}
      />
      
      {/* Settings Modal */}
      <GameSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={gameState.settings}
        onSettingChange={handleSettingChange}
      />
    </div>
  );
};

export default EdenHollowGame;