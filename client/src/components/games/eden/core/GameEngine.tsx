/**
 * Eden's Hollow Game Engine
 * Core game logic and state management
 */

import React, { createContext, useReducer, useEffect, useState, useMemo } from 'react';
import { 
  GameState, GameAction, GameEngineProps, 
  GameContextType, Choice, Scene
} from '../types';
import { initialGameState } from '../data/gameState';
import { gameScenes } from '../data/scenes';

// Create context for the game state
export const GameContext = createContext<GameContextType>({} as GameContextType);

/**
 * Game State Reducer
 * Handles all game state transitions based on actions
 */
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MAKE_CHOICE': {
      const { choice } = action;
      const newSceneId = choice.nextSceneId;
      const newSanity = Math.max(0, Math.min(100, state.player.sanity + (choice.sanityEffect || 0)));
      const newCorruption = Math.max(0, Math.min(100, state.player.corruption + (choice.corruptionEffect || 0)));
      
      // Update visited scenes list
      const newVisitedScenes = state.visitedScenes.includes(newSceneId) 
        ? state.visitedScenes 
        : [...state.visitedScenes, newSceneId];
      
      // Add choice to decisions history
      const newDecisions = [...state.player.decisions, choice.id];
      
      // Add flag if choice has one
      const newFlags = choice.flag 
        ? [...state.player.flags, choice.flag] 
        : state.player.flags;
      
      return {
        ...state,
        currentSceneId: newSceneId,
        player: {
          ...state.player,
          sanity: newSanity,
          corruption: newCorruption,
          decisions: newDecisions,
          flags: newFlags,
        },
        visitedScenes: newVisitedScenes,
        timestamp: Date.now()
      };
    }
    
    case 'UPDATE_SANITY': {
      const { amount } = action;
      const newSanity = Math.max(0, Math.min(100, state.player.sanity + amount));
      
      return {
        ...state,
        player: {
          ...state.player,
          sanity: newSanity,
        },
        timestamp: Date.now()
      };
    }
    
    case 'UPDATE_CORRUPTION': {
      const { amount } = action;
      const newCorruption = Math.max(0, Math.min(100, state.player.corruption + amount));
      
      return {
        ...state,
        player: {
          ...state.player,
          corruption: newCorruption,
        },
        timestamp: Date.now()
      };
    }
    
    case 'ADD_FLAG': {
      const { flag } = action;
      
      // Only add flag if it doesn't already exist
      if (state.player.flags.includes(flag)) {
        return state;
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          flags: [...state.player.flags, flag],
        },
        timestamp: Date.now()
      };
    }
    
    case 'REMOVE_FLAG': {
      const { flag } = action;
      
      return {
        ...state,
        player: {
          ...state.player,
          flags: state.player.flags.filter(f => f !== flag),
        },
        timestamp: Date.now()
      };
    }
    
    case 'ADD_ITEM': {
      const { item } = action;
      
      // Only add item if it doesn't already exist
      if (state.player.inventory.includes(item)) {
        return state;
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          inventory: [...state.player.inventory, item],
        },
        timestamp: Date.now()
      };
    }
    
    case 'REMOVE_ITEM': {
      const { item } = action;
      
      return {
        ...state,
        player: {
          ...state.player,
          inventory: state.player.inventory.filter(i => i !== item),
        },
        timestamp: Date.now()
      };
    }
    
    case 'SET_GAME_OVER': {
      const { won } = action;
      
      return {
        ...state,
        gameOver: true,
        gameWon: won,
        timestamp: Date.now()
      };
    }
    
    case 'RESET_GAME': {
      return {
        ...initialGameState,
        timestamp: Date.now()
      };
    }
    
    default:
      return state;
  }
};

/**
 * Game Engine Component
 * Manages game state and provides context to child components
 */
export const GameEngine: React.FC<GameEngineProps> = ({ children, onGameEnd }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [playTime, setPlayTime] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  
  // Process special scene effects when entering a new scene
  useEffect(() => {
    const currentScene = gameScenes[state.currentSceneId];
    
    // Process onEnter effects if the scene has them
    if (currentScene && currentScene.onEnter) {
      const updatedState = currentScene.onEnter(state);
      
      // Update any state changes from onEnter
      if (updatedState !== state) {
        Object.entries(updatedState).forEach(([key, value]) => {
          // Only update if the value actually changed
          if (value !== (state as any)[key]) {
            switch (key) {
              case 'player':
                // Handle player properties individually
                const playerDiff = value as typeof state.player;
                if (playerDiff.sanity !== state.player.sanity) {
                  dispatch({ type: 'UPDATE_SANITY', amount: playerDiff.sanity - state.player.sanity });
                }
                if (playerDiff.corruption !== state.player.corruption) {
                  dispatch({ type: 'UPDATE_CORRUPTION', amount: playerDiff.corruption - state.player.corruption });
                }
                // Handle other player properties if needed
                break;
              
              // Add handlers for other state properties as needed
              default:
                // Generic handler for other properties
                break;
            }
          }
        });
      }
    }
    
    // Check if this is an ending scene
    if (currentScene && currentScene.isEnding) {
      dispatch({ 
        type: 'SET_GAME_OVER', 
        won: currentScene.endType === 'victory' 
      });
    }
  }, [state.currentSceneId, state]);
  
  // Handle game over state
  useEffect(() => {
    if (state.gameOver && onGameEnd) {
      const finalState = {
        ...state,
        playTime
      };
      onGameEnd(finalState);
      
      // Stop the timer when game is over
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
    }
  }, [state.gameOver, onGameEnd, playTime, state, timerId]);
  
  // Start play time tracking
  useEffect(() => {
    // Create a timer to track play time
    const timer = setInterval(() => {
      setPlayTime(prev => prev + 1);
    }, 1000);
    
    setTimerId(timer);
    
    // Clean up timer on unmount
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Filter available choices based on player state
  const availableChoices = useMemo(() => {
    const currentScene = gameScenes[state.currentSceneId];
    if (!currentScene) return [];
    
    return currentScene.choices.map(choice => {
      // Determine if the choice should be available based on player stats
      let isAvailable = true;
      
      // Check sanity requirements for choice availability
      if (choice.type === 'rational' && state.player.sanity < 60) {
        isAvailable = false;
      } else if (choice.type === 'emotional' && state.player.sanity < 40) {
        isAvailable = false;
      }
      
      // Check corruption requirements - high corruption unlocks corrupted choices
      if (choice.type === 'corrupted' && state.player.corruption < 50) {
        isAvailable = false;
      }
      
      // Return choice with updated availability
      return {
        ...choice,
        available: isAvailable
      };
    });
  }, [state.currentSceneId, state.player.sanity, state.player.corruption]);
  
  // Handle player choice
  const makeChoice = (choice: Choice) => {
    dispatch({ type: 'MAKE_CHOICE', choice });
  };
  
  // Reset the game
  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    setPlayTime(0);
  };
  
  // Create context value
  const contextValue: GameContextType = {
    state,
    dispatch,
    scenes: gameScenes,
    makeChoice,
    availableChoices
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};