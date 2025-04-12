import { useState, useEffect } from "react";
import { useGameState } from "../hooks/useGameState";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { Choice } from "../types";
import GameHeader from "./GameHeader";
import GameContent from "./GameContent";
import GameFooter from "./GameFooter";
import ConfirmationModal from "./ConfirmationModal";
import SettingsModal from "./SettingsModal";

export default function GameContainer() {
  const { 
    gameState, 
    currentStory, 
    currentPassage, 
    showLowSanityEffects,
    makeChoice, 
    canMakeChoice,
    saveGame,
    updateSettings
  } = useGameState();
  
  const { 
    playSound, 
    startAmbientSounds, 
    toggleLowSanitySounds 
  } = useSoundEffects(gameState.settings.soundEnabled);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);
  
  // Start ambient sounds when component mounts
  useEffect(() => {
    startAmbientSounds(showLowSanityEffects);
    
    // Clean up on unmount
    return () => {
      // Sound cleanup is handled inside the hook
    };
  }, [startAmbientSounds, showLowSanityEffects]);
  
  // Toggle low sanity sound effects when sanity changes
  useEffect(() => {
    toggleLowSanitySounds(showLowSanityEffects);
  }, [showLowSanityEffects, toggleLowSanitySounds]);
  
  // Handle player making a choice
  const handleChoice = (choice: Choice) => {
    // Play choice sound
    playSound('choice');
    
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
    if (choice.sanityChange < 0) {
      playSound('sanityDrop');
    } else if (choice.sanityChange > 0) {
      playSound('sanityGain');
    }
    
    // Apply the choice
    makeChoice(choice);
  };
  
  // Handle confirmation modal response
  const handleConfirmation = (confirmed: boolean) => {
    setIsConfirmationOpen(false);
    
    if (confirmed && pendingChoice) {
      playSound('confirm');
      processChoice(pendingChoice);
    }
    
    setPendingChoice(null);
  };
  
  // Toggle settings modal
  const toggleSettings = () => {
    setIsSettingsOpen(prev => !prev);
    playSound('choice');
  };
  
  // Handle save game
  const handleSaveGame = () => {
    playSound('confirm');
    saveGame();
  };
  
  return (
    <div className="bg-darkBg min-h-screen flex flex-col">
      {/* Pixel Art Overlay */}
      <div className="pixel-overlay fixed inset-0 opacity-5 z-10 pointer-events-none"></div>
      
      {/* Main Game Components */}
      <GameHeader />
      
      <GameContent 
        gameState={gameState}
        currentStory={currentStory}
        currentPassage={currentPassage}
        showLowSanityEffects={showLowSanityEffects}
        onChoice={handleChoice}
        canMakeChoice={canMakeChoice}
      />
      
      <GameFooter 
        storyPhase={currentPassage?.phase}
        storyTitle={currentStory?.title}
        onSave={handleSaveGame}
        onSettings={toggleSettings}
      />
      
      {/* Modals */}
      <ConfirmationModal 
        isOpen={isConfirmationOpen}
        onConfirm={(confirmed) => handleConfirmation(confirmed)}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        settings={gameState.settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) => {
          updateSettings(newSettings);
          setIsSettingsOpen(false);
          playSound('confirm');
        }}
      />
    </div>
  );
}
