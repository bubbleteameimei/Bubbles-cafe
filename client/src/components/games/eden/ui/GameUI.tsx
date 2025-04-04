/**
 * Eden's Hollow Game UI
 * Main user interface component for the game
 */

import React, { useState, useContext, useEffect } from 'react';
import './GameUI.css';
import { GameContext } from '../core/GameEngine';
import { Choice, GameUIProps } from '../types';
import StatusBar from './StatusBar';
import ChoiceButton from './ChoiceButton';
import ConfirmationDialog from './ConfirmationDialog';
import TypewriterText from './TypewriterText';

/**
 * Game UI Component
 * The main interface for player interaction with the game
 */
const GameUI: React.FC<GameUIProps> = ({ showTutorial = false }) => {
  const { state, scenes, makeChoice, availableChoices } = useContext(GameContext);
  const [typingComplete, setTypingComplete] = useState(false);
  const [choiceConfirmation, setChoiceConfirmation] = useState<{
    choice: Choice;
    message: string;
  } | null>(null);
  const [showTutorialDialog, setShowTutorialDialog] = useState(showTutorial);
  
  // Reset typing state when the scene changes
  useEffect(() => {
    setTypingComplete(false);
  }, [state.currentSceneId]);
  
  // Get the current scene data
  const currentScene = scenes[state.currentSceneId];
  
  // If scene not found, show error
  if (!currentScene) {
    return (
      <div className="eden-error-screen">
        <h2>Scene Error</h2>
        <p>The scene "{state.currentSceneId}" could not be found.</p>
        <button onClick={() => window.location.reload()}>Restart Game</button>
      </div>
    );
  }
  
  // Handle typewriter completion
  const handleTypingComplete = () => {
    setTypingComplete(true);
  };
  
  // Handle player choice
  const handleChoiceClick = (choice: Choice) => {
    if (choice.requiresConfirmation) {
      // Show confirmation dialog for dangerous choices
      setChoiceConfirmation({
        choice,
        message: choice.confirmationText || "This choice may have severe consequences. Are you certain?"
      });
    } else {
      // Process the choice directly
      makeChoice(choice);
    }
  };
  
  // Handle confirmation dialog responses
  const handleConfirmChoice = () => {
    if (choiceConfirmation) {
      makeChoice(choiceConfirmation.choice);
      setChoiceConfirmation(null);
    }
  };
  
  const handleCancelChoice = () => {
    setChoiceConfirmation(null);
  };
  
  // Handle tutorial dialog
  const handleCloseTutorial = () => {
    setShowTutorialDialog(false);
  };
  
  // Render tutorial if it's active
  const renderTutorial = () => {
    if (!showTutorialDialog) return null;
    
    return (
      <div className="eden-tutorial-overlay">
        <div className="eden-tutorial-dialog">
          <h3>Welcome to Eden's Hollow</h3>
          <p>In this dark fantasy game, your sanity affects your available choices.</p>
          <p>As your sanity decreases, rational choices become unavailable, leaving only desperate or corrupted options.</p>
          <p>Be careful with your decisions - they may lead you deeper into madness.</p>
          <button className="eden-tutorial-btn" onClick={handleCloseTutorial}>Begin Your Journey</button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="eden-game-ui">
      {/* Player status */}
      <StatusBar player={state.player} />
      
      {/* Game content area */}
      <div className="eden-scene-container">
        {/* Scene title */}
        <h2 className="eden-scene-title">{currentScene.title}</h2>
        
        {/* Scene description */}
        <div className="eden-scene-description">
          <TypewriterText 
            text={currentScene.description} 
            onComplete={handleTypingComplete}
          />
        </div>
        
        {/* Player choices */}
        <div className={`eden-choices-container ${typingComplete ? 'visible' : 'hidden'}`}>
          {availableChoices.length > 0 ? (
            <>
              <h3 className="eden-choices-header">What will you do?</h3>
              <div className="eden-choices">
                {availableChoices.map(choice => (
                  <ChoiceButton
                    key={choice.id}
                    choice={choice}
                    onClick={handleChoiceClick}
                    isSanityLimited={state.player.sanity < 50}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="eden-no-choices">
              {currentScene.isEnding ? (
                <p className="eden-ending-message">Your journey has ended.</p>
              ) : (
                <p className="eden-loading-choices">Contemplating your options...</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation dialog */}
      {choiceConfirmation && (
        <ConfirmationDialog
          message={choiceConfirmation.message}
          onConfirm={handleConfirmChoice}
          onCancel={handleCancelChoice}
        />
      )}
      
      {/* Tutorial overlay */}
      {renderTutorial()}
    </div>
  );
};

export default GameUI;