/**
 * Game UI Component
 * 
 * This component is responsible for rendering the game interface including
 * the scene description, player choices, and status indicators.
 */
import React, { useState, useEffect } from 'react';
import { GameUIProps, Choice, GameStatus } from '../types';
import StatusBar from './StatusBar';
import ChoiceButton from './ChoiceButton';
import TypewriterText from './TypewriterText';
import ConfirmationDialog from './ConfirmationDialog';
import { filterAvailableChoices, getSceneDescription } from '../utils/gameUtils';
import '../styles/game.css';

const GameUI: React.FC<GameUIProps> = ({
  scene,
  playerState,
  onSelectChoice,
  gameStatus,
  onRestart,
  config
}) => {
  const [availableChoices, setAvailableChoices] = useState<Choice[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);
  const [descriptionComplete, setDescriptionComplete] = useState(false);
  
  // Get scene description with potential alterations based on player state
  const sceneDescription = getSceneDescription(scene, playerState);
  
  // Set available choices based on player state
  useEffect(() => {
    const filtered = filterAvailableChoices(scene, playerState);
    
    // If the player's sanity is low, limit their choices
    let availableCount = filtered.length;
    
    if (playerState.sanity < 30) {
      // Very low sanity - only 1 choice maximum
      availableCount = Math.min(1, availableCount);
    } else if (playerState.sanity < 60) {
      // Low sanity - max 2 choices
      availableCount = Math.min(2, availableCount);
    } else {
      // Normal sanity - all choices
      availableCount = filtered.length;
    }
    
    // Slice to limit choices and set the state
    setAvailableChoices(filtered.slice(0, availableCount));
    
  }, [scene, playerState]);

  // Handle choice selection
  const handleChoiceSelect = (choice: Choice) => {
    if (scene.requireConfirmation) {
      setPendingChoice(choice);
      setShowDialog(true);
    } else {
      onSelectChoice(choice);
    }
  };

  // Handle dialog confirmation
  const handleConfirm = () => {
    if (pendingChoice) {
      onSelectChoice(pendingChoice);
      setShowDialog(false);
      setPendingChoice(null);
    }
  };

  // Handle dialog cancellation
  const handleCancel = () => {
    setShowDialog(false);
    setPendingChoice(null);
  };

  // Handle description completion
  const handleDescriptionComplete = () => {
    setDescriptionComplete(true);
  };
  
  // Render loading state
  if (gameStatus === GameStatus.LOADING) {
    return (
      <div className="eden-game-ui">
        <div className="eden-loading">
          <div className="eden-spinner"></div>
          <div className="eden-loading-text">Loading Eden's Hollow...</div>
        </div>
      </div>
    );
  }
  
  // Render game over state
  if (gameStatus === GameStatus.GAME_OVER) {
    return (
      <div className="eden-game-ui">
        <div className="eden-game-over">
          <h1 className="eden-game-over-title">Game Over</h1>
          <p className="eden-game-over-text">
            {playerState.sanity <= 0 ? 
              "Your sanity has been completely shattered. The horrors of Eden's Hollow have claimed your mind." : 
              playerState.corruption >= 100 ? 
                "You have been fully corrupted. You are now one with the darkness that dwells in Eden's Hollow." : 
                "Your journey has come to an end in the twisted realm of Eden's Hollow."}
          </p>
          <button 
            className="eden-restart-button"
            onClick={onRestart}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Render the main game UI
  return (
    <div className="eden-game-ui">
      <StatusBar playerState={playerState} />
      
      <h1 className="eden-scene-title">{scene.title}</h1>
      
      <div className={`eden-scene-description ${playerState.sanity < 60 ? 'eden-low-sanity' : ''} ${playerState.sanity < 30 ? 'eden-very-low-sanity' : ''}`}>
        {config.visuals.useTypewriterEffect ? (
          <TypewriterText 
            text={sceneDescription}
            speed={config.visuals.textSpeed || 30}
            sanity={playerState.sanity}
            corruption={playerState.corruption}
            onComplete={handleDescriptionComplete}
          />
        ) : (
          <p>{sceneDescription}</p>
        )}
      </div>
      
      <div className="eden-choices-container">
        {availableChoices.map((choice) => (
          <ChoiceButton
            key={choice.text}
            choice={choice}
            onSelect={handleChoiceSelect}
            disabled={!descriptionComplete && config.visuals.useTypewriterEffect}
            sanity={playerState.sanity}
            corruption={playerState.corruption}
            showTypewriterEffect={config.visuals.useTypewriterEffect}
            textSpeed={config.visuals.textSpeed}
          />
        ))}
      </div>
      
      <ConfirmationDialog 
        isOpen={showDialog} 
        title="Confirm Your Choice" 
        message={`Are you sure you want to ${pendingChoice?.text.toLowerCase()}?`}
        onConfirm={handleConfirm} 
        onCancel={handleCancel}
        corruption={playerState.corruption} 
      />
    </div>
  );
};

export default GameUI;