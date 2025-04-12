/**
 * Eden's Hollow Game Container
 * 
 * Main container component for the Eden's Hollow game experience.
 */

import React, { useState, useEffect } from "react";
import { useGameState } from "../../hooks/useGameState";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { Choice } from "../../types/game";
import GameHeader from "./GameHeader";
import GameContent from "./GameContent";
import GameFooter from "./GameFooter";
import GameSettingsModal from "./GameSettingsModal";

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
  
  // Handle player making a choice
  const handleChoice = (choice: Choice) => {
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
    <div className="bg-black min-h-screen flex flex-col text-white">
      {/* Game overlay for visual effects */}
      {showLowSanityEffects && (
        <div className="fixed inset-0 bg-red-900/10 z-10 pointer-events-none"></div>
      )}
      
      {/* Main Game Components */}
      <GameHeader />
      
      <GameContent 
        gameState={gameState}
        currentStory={currentStory}
        currentPassage={currentPassage}
        showLowSanityEffects={showLowSanityEffects}
        onChoice={handleChoice}
        canMakeChoice={canMakeChoice}
        onConfirm={handleConfirmation}
        isConfirmationOpen={isConfirmationOpen}
      />
      
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