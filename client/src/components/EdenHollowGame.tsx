/**
 * Eden's Hollow Game Component
 * 
 * This is the main entry point for the Eden's Hollow game experience.
 * It coordinates all game components and manages the overall game state.
 */

import React, { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useSoundEffects } from '../hooks/useSoundEffects';
import GameContainer from './game/GameContainer';
import GameHeader from './game/GameHeader';
import GameFooter from './game/GameFooter';
import GameSettingsModal from './game/GameSettingsModal';
import PhaserGame from './game/PhaserGame';
import { Choice } from '../types/game';

interface EdenHollowGameProps {
  initialStoryId?: string;
  className?: string;
}

const EdenHollowGame: React.FC<EdenHollowGameProps> = ({
  initialStoryId = 'abandoned-manor',
  className = ''
}) => {
  // Game state management
  const {
    gameState,
    currentStory,
    currentPassage,
    showLowSanityEffects,
    makeChoice,
    startNewGame,
    goBack,
    updateSetting,
    resetGame
  } = useGameState(initialStoryId);
  
  // Sound effects management
  const { playSound, stopSound, stopAllSounds } = useSoundEffects(gameState.settings);
  
  // UI state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gameContainerSize, setGameContainerSize] = useState({ width: 800, height: 600 });
  
  // Handle container resize
  const updateContainerSize = () => {
    const container = document.getElementById('game-container');
    if (container) {
      setGameContainerSize({
        width: container.clientWidth,
        height: container.clientHeight
      });
    }
  };
  
  // Set up resize listener
  useEffect(() => {
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    return () => {
      window.removeEventListener('resize', updateContainerSize);
      stopAllSounds();
    };
  }, [stopAllSounds]);
  
  // Handle choice selection
  const handleChoiceSelected = (choice: Choice) => {
    // Play sound effects
    playSound('choice');
    
    // Make the choice
    makeChoice(choice);
  };
  
  // Handle settings changes
  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key as any, value);
  };
  
  return (
    <div className={`eden-hollow-game ${className}`}>
      {/* Game header with title and back button */}
      <GameHeader />
      
      {/* Main game container */}
      <div 
        id="game-container"
        className="game-container relative w-full" 
        style={{ minHeight: '600px' }}
      >
        <PhaserGame 
          gameState={gameState}
          currentStory={currentStory}
          currentPassage={currentPassage}
          showLowSanityEffects={showLowSanityEffects}
          onChoiceSelected={handleChoiceSelected}
        />
      </div>
      
      {/* Game footer with controls */}
      <GameFooter 
        onSettingsClick={() => setSettingsOpen(true)}
        onBackClick={goBack}
        canGoBack={gameState.passageHistory.length > 0}
      />
      
      {/* Settings modal */}
      <GameSettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        settings={gameState.settings}
        onSettingsChange={handleSettingChange}
      />
    </div>
  );
};

export default EdenHollowGame;