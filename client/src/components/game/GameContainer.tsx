/**
 * Eden's Hollow Game Container
 * 
 * Main container component for the Eden's Hollow game experience.
 * Uses Phaser.js for enhanced visual storytelling.
 */

import React, { useState, useEffect, useRef } from "react";
import { useGameState } from "../../hooks/useGameState";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { Choice } from "../../types/game";
import GameHeader from "./GameHeader";
import GameFooter from "./GameFooter";
import GameSettingsModal from "./GameSettingsModal";
import PhaserGame from "./PhaserGame";

export default function GameContainer() {
  const { 
    gameState, 
    currentStory, 
    currentPassage, 
    showLowSanityEffects,
    makeChoice, 
    canMakeChoice,
    saveGame,
    updateSettings,
    resetGame
  } = useGameState();
  
  const { 
    playSound, 
    startAmbientSounds, 
    toggleLowSanitySounds,
    updateVolumes
  } = useSoundEffects(gameState.settings.soundEnabled);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Start ambient sounds when component mounts
  useEffect(() => {
    if (gameState.settings.soundEnabled) {
      startAmbientSounds(showLowSanityEffects);
    }
    
    // Update volumes based on settings
    updateVolumes(
      gameState.settings.sfxVolume, 
      gameState.settings.musicVolume
    );
    
    // Clean up on unmount
    return () => {
      // Sound cleanup is handled inside the hook
    };
  }, [startAmbientSounds, showLowSanityEffects, gameState.settings, updateVolumes]);
  
  // Toggle low sanity sound effects when sanity changes
  useEffect(() => {
    if (gameState.settings.soundEnabled) {
      toggleLowSanitySounds(showLowSanityEffects);
    }
  }, [showLowSanityEffects, toggleLowSanitySounds, gameState.settings.soundEnabled]);
  
  // Handle choice selection
  const handleChoice = (choiceId: string) => {
    if (!currentPassage || !canMakeChoice) return;
    
    // Find the selected choice
    const choice = currentPassage.choices.find(c => c.id === choiceId);
    if (!choice) return;
    
    // Play choice sound
    if (gameState.settings.soundEnabled) {
      playSound('choice');
    }
    
    // If choice is critical, show confirmation modal
    if (choice.critical) {
      setPendingChoice(choice);
      setIsConfirmationOpen(true);
      return;
    }
    
    // Otherwise, process choice immediately
    processChoice(choice);
  };
  
  // Process the confirmed choice
  const processChoice = (choice: Choice) => {
    // Play different sounds based on sanity change
    if (gameState.settings.soundEnabled) {
      if (choice.sanityChange < 0) {
        playSound('sanityDrop');
      } else if (choice.sanityChange > 0) {
        playSound('sanityGain');
      }
    }
    
    // Apply the choice
    makeChoice(choice);
  };
  
  // Handle confirmation modal response
  const handleConfirmation = (confirmed: boolean) => {
    setIsConfirmationOpen(false);
    
    if (confirmed && pendingChoice) {
      if (gameState.settings.soundEnabled) {
        playSound('confirm');
      }
      processChoice(pendingChoice);
    }
    
    setPendingChoice(null);
  };
  
  // Toggle settings modal
  const toggleSettings = () => {
    setIsSettingsOpen(prev => !prev);
    if (gameState.settings.soundEnabled) {
      playSound('choice');
    }
  };
  
  // Handle save game
  const handleSaveGame = () => {
    if (gameState.settings.soundEnabled) {
      playSound('confirm');
    }
    saveGame();
    // Show a save confirmation message (or toast)
    alert("Game saved successfully!");
  };
  
  // Handle settings update
  const handleSettingsUpdate = (newSettings: any) => {
    updateSettings(newSettings);
    if (newSettings.soundEnabled) {
      playSound('confirm');
    }
    setIsSettingsOpen(false);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col text-white" ref={containerRef}>
      {/* Game Header */}
      <GameHeader />
      
      {/* Main Game Content - Phaser Game */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {containerRef.current && (
          <PhaserGame
            gameState={gameState}
            currentStory={currentStory}
            currentPassage={currentPassage}
            showLowSanityEffects={showLowSanityEffects}
            onChoice={handleChoice}
            containerWidth={containerRef.current.clientWidth}
            containerHeight={containerRef.current.clientHeight - 120} // Account for header/footer
          />
        )}
        
        {/* Confirmation Modal */}
        {isConfirmationOpen && pendingChoice && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-md text-center">
              <h3 className="text-xl font-bold mb-4">Are you sure?</h3>
              <p className="mb-6">This choice could have significant consequences. Are you certain you want to proceed?</p>
              <div className="flex justify-center space-x-4">
                <button 
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  onClick={() => handleConfirmation(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-red-700 rounded hover:bg-red-600"
                  onClick={() => handleConfirmation(true)}
                >
                  Yes, I'm Sure
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Game Footer */}
      <GameFooter 
        storyPhase={currentPassage?.phase}
        storyTitle={currentStory?.title}
        onSave={handleSaveGame}
        onSettings={toggleSettings}
        onReset={resetGame}
      />
      
      {/* Settings Modal */}
      <GameSettingsModal 
        isOpen={isSettingsOpen}
        settings={gameState.settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsUpdate}
      />
    </div>
  );
}