/**
 * Game Engine Component
 * 
 * This component manages the game state and logic.
 * It handles player choices, scene transitions, and game progress.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { GameEngineProps, PlayerState, Choice, GameStatus } from '../types';
import { applyChoiceEffects, isGameEnding } from '../utils/gameUtils';

const GameEngine: React.FC<GameEngineProps> = ({
  config,
  scenes,
  children
}) => {
  // Game state management
  const [playerState, setPlayerState] = useState<PlayerState>(config.initialState);
  const [currentScene, setCurrentScene] = useState(scenes[config.startScene]);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.LOADING);
  
  // Initialize the game
  useEffect(() => {
    // Short artificial delay for loading effect
    const loadingTimer = setTimeout(() => {
      setGameStatus(GameStatus.PLAYING);
    }, 1500);
    
    return () => clearTimeout(loadingTimer);
  }, []);
  
  // Check for game ending conditions
  useEffect(() => {
    if (isGameEnding(playerState)) {
      setGameStatus(GameStatus.GAME_OVER);
    }
  }, [playerState]);
  
  // Handle scene transitions
  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING) {
      const nextScene = scenes[playerState.currentScene];
      
      if (nextScene) {
        setCurrentScene(nextScene);
        
        // Auto-advance logic
        if (nextScene.autoAdvance && !playerState.visitedScenes.includes(nextScene.id)) {
          const timer = setTimeout(() => {
            handleSceneTransition(nextScene.autoAdvance!.nextScene);
          }, nextScene.autoAdvance.timeout);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [playerState.currentScene, gameStatus, scenes]);
  
  // Handler for player choices
  const handleChoice = useCallback((choice: Choice) => {
    // Apply effects of the choice to the player state
    setPlayerState(prevState => {
      // Create a new state object with the effects applied
      const newState = applyChoiceEffects(choice, prevState);
      
      // Update visited scenes
      if (!newState.visitedScenes.includes(prevState.currentScene)) {
        newState.visitedScenes = [...newState.visitedScenes, prevState.currentScene];
      }
      
      // Set the new current scene
      newState.currentScene = choice.nextScene;
      
      return newState;
    });
  }, []);
  
  // Handle direct scene transitions (for auto-advance)
  const handleSceneTransition = useCallback((sceneId: string) => {
    setPlayerState(prevState => ({
      ...prevState,
      currentScene: sceneId,
      visitedScenes: [...prevState.visitedScenes, prevState.currentScene]
    }));
  }, []);
  
  // Restart the game
  const handleRestart = useCallback(() => {
    setPlayerState(config.initialState);
    setCurrentScene(scenes[config.startScene]);
    setGameStatus(GameStatus.PLAYING);
  }, [config.initialState, config.startScene, scenes]);
  
  // Render the UI with the current game state
  return (
    <div className="eden-game-container">
      <img 
        className="eden-background" 
        src={`/assets/eden/${currentScene.background || 'background.svg'}`} 
        alt="Eden's Hollow"
      />
      {currentScene.effects?.fog && (
        <img 
          className="eden-fog-overlay" 
          src="/assets/eden/fog.svg" 
          alt="Fog"
          style={{ opacity: config.visuals.defaultFogIntensity || 0.3 }}
        />
      )}
      
      {children({
        scene: currentScene,
        playerState: playerState,
        onSelectChoice: handleChoice,
        gameStatus: gameStatus,
        onRestart: handleRestart,
        config: config
      })}
    </div>
  );
};

export default GameEngine;