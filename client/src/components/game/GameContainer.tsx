/**
 * Game Container Component
 * 
 * This component serves as the main entry point for the Eden's Hollow game.
 * It provides a properly sized container and handles game initialization.
 */

import React, { useState, useEffect } from 'react';
import useGameState from '../../hooks/useGameState';
import useSoundEffects from '../../hooks/useSoundEffects';
import PhaserGame from './PhaserGame';
import GameFooter from './GameFooter';
import GameSettingsModal from './GameSettingsModal';
import { Choice, StoryPhase } from '../../types/game';

// Default size for the game container
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

interface GameContainerProps {
  className?: string;
  defaultStory?: string;
}

const GameContainer: React.FC<GameContainerProps> = ({
  className = '',
  defaultStory = 'haunted-manor'
}) => {
  // Get game state from custom hook
  const gameState = useGameState();
  const {
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
  } = gameState;
  
  // Sound effects hook
  const soundEffects = useSoundEffects(gameState.gameState.settings);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Container size (responsive)
  const [containerSize, setContainerSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  });
  
  // Container ref for measuring
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Update container size when window resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // Get the actual size of our container
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    // Initialize size
    updateSize();
    
    // Add resize listener
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  
  // Initialize game when first mounted
  useEffect(() => {
    if (!initialized && !currentStory) {
      startNewGame(defaultStory);
      setInitialized(true);
      
      // Start ambient sounds
      soundEffects.startAmbientSounds(false);
    }
  }, [initialized, defaultStory, currentStory, startNewGame, soundEffects]);
  
  // Update ambient sounds when sanity state changes
  useEffect(() => {
    if (initialized) {
      soundEffects.toggleLowSanitySounds(showLowSanityEffects);
    }
    
    // Cleanup sounds on unmount
    return () => {
      soundEffects.stopAllSounds();
    };
  }, [initialized, showLowSanityEffects, soundEffects]);
  
  // Handle player choice
  const handleChoice = (choiceId: string) => {
    if (!currentPassage || !currentPassage.choices) return;
    
    // Find the selected choice
    const choice = currentPassage.choices.find(c => c.id === choiceId);
    if (!choice) return;
    
    // Play sound effect
    soundEffects.playSound('choice');
    
    // Play sanity change sound if applicable
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
  
  // Settings handlers
  const handleSettingsOpen = () => setShowSettings(true);
  const handleSettingsClose = () => setShowSettings(false);
  const handleSettingsSave = (newSettings: any) => {
    // Update all settings that have changed
    Object.entries(newSettings).forEach(([key, value]) => {
      updateSetting(key as any, value);
    });
    
    // Update sound system
    soundEffects.updateVolumes();
    
    // Close modal
    handleSettingsClose();
  };
  
  // Get story phase for displaying in the footer
  const getStoryPhase = (): StoryPhase | undefined => {
    return currentPassage?.phase;
  };
  
  return (
    <div 
      ref={containerRef}
      className={`w-full h-full flex flex-col bg-black relative overflow-hidden ${className}`}
    >
      {/* Game Canvas */}
      <div className="flex-grow relative">
        {initialized && (
          <PhaserGame
            gameState={gameState.gameState}
            currentStory={currentStory}
            currentPassage={currentPassage}
            showLowSanityEffects={showLowSanityEffects}
            onChoice={handleChoice}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />
        )}
      </div>
      
      {/* Footer Controls */}
      <div className="flex-shrink-0">
        <GameFooter
          storyPhase={getStoryPhase()}
          storyTitle={currentStory?.title}
          onSave={saveGame}
          onSettings={handleSettingsOpen}
          onReset={resetGame}
          onBack={goBack}
          canGoBack={canGoBack}
        />
      </div>
      
      {/* Settings Modal */}
      <GameSettingsModal
        isOpen={showSettings}
        settings={gameState.gameState.settings}
        onClose={handleSettingsClose}
        onSettingChange={updateSetting}
      />
    </div>
  );
};

export default GameContainer;