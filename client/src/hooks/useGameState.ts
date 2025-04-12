/**
 * Eden's Hollow Game State Hook
 * 
 * This hook manages the game state, story progression, and player actions.
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, Story, Passage, Choice, GameSettings } from '../types/game';
import { DEFAULT_SETTINGS, DEMO_STORY } from '../data/gameSettings';

// Initial game state
const INITIAL_STATE: GameState = {
  currentStoryId: DEMO_STORY.id,
  currentPassageId: DEMO_STORY.startPassageId,
  sanity: 100, // Start with full sanity
  inventory: [],
  visitedPassages: {},
  settings: DEFAULT_SETTINGS,
};

// Game storage key
const SAVE_KEY = 'edens-hollow-save';

export function useGameState() {
  // Load saved game or use initial state
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const savedState = localStorage.getItem(SAVE_KEY);
      return savedState ? JSON.parse(savedState) : INITIAL_STATE;
    } catch (error) {
      console.error('Failed to load saved game:', error);
      return INITIAL_STATE;
    }
  });

  // Current story being played
  const [currentStory, setCurrentStory] = useState<Story>(DEMO_STORY);
  
  // Current passage in the story
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  
  // Computed low sanity effects state
  const showLowSanityEffects = gameState.sanity < 50;
  
  // Track if player can currently make a choice
  const [canMakeChoice, setCanMakeChoice] = useState(true);

  // Initialize the current passage based on the game state
  useEffect(() => {
    if (currentStory && gameState.currentPassageId) {
      const passage = currentStory.passages[gameState.currentPassageId];
      if (passage) {
        setCurrentPassage(passage);
        
        // Mark this passage as visited
        if (!gameState.visitedPassages[passage.id]) {
          setGameState(prev => ({
            ...prev,
            visitedPassages: {
              ...prev.visitedPassages,
              [passage.id]: true
            }
          }));
        }
      }
    }
  }, [currentStory, gameState.currentPassageId]);

  // Make a choice and progress the story
  const makeChoice = useCallback((choice: Choice) => {
    // Disable choosing during transition
    setCanMakeChoice(false);
    
    setTimeout(() => {
      // Update game state with the choice consequences
      setGameState(prev => {
        // Calculate new sanity (clamped between 0 and 100)
        const newSanity = Math.max(0, Math.min(100, prev.sanity + choice.sanityChange));
        
        return {
          ...prev,
          currentPassageId: choice.nextPassageId,
          sanity: newSanity,
        };
      });
      
      // Re-enable choices after transition
      setCanMakeChoice(true);
    }, 1000); // Transition delay
  }, []);

  // Save the game to local storage
  const saveGame = useCallback(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }, [gameState]);

  // Update game settings
  const updateSettings = useCallback((newSettings: GameSettings) => {
    setGameState(prev => ({
      ...prev,
      settings: newSettings
    }));
  }, []);

  // Reset game to initial state
  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE);
    setCurrentPassage(null);
  }, []);

  // Auto-save when game state changes
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      saveGame();
    }, 2000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [gameState, saveGame]);

  return {
    gameState,
    currentStory,
    currentPassage,
    showLowSanityEffects,
    canMakeChoice,
    makeChoice,
    saveGame,
    updateSettings,
    resetGame
  };
}