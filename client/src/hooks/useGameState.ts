/**
 * useGameState Hook
 * 
 * This hook manages the game state for Eden's Hollow.
 * It handles loading stories, tracking progress, managing inventory,
 * and applying game effects based on player choices.
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, Story, Passage, Choice, GameEffect, GameSettings } from '../types/game';
import stories from '../data/stories';

// Default game settings
const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  textSpeed: 'normal',
  showGore: true,
  autoSave: true
};

// Initial game state
const initialGameState: GameState = {
  sanity: 100,
  inventory: [],
  flags: {},
  variables: {},
  passageHistory: [],
  settings: defaultSettings
};

export default function useGameState() {
  // Main game state
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  
  // Derived state values
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [showLowSanityEffects, setShowLowSanityEffects] = useState(false);
  
  // Load saved game on initial render
  useEffect(() => {
    loadGame();
  }, []);
  
  // Update sanity effects when sanity changes
  useEffect(() => {
    if (gameState.sanity < 30) {
      setShowLowSanityEffects(true);
    } else {
      setShowLowSanityEffects(false);
    }
  }, [gameState.sanity]);
  
  // Update current story and passage when IDs change
  useEffect(() => {
    if (gameState.currentStoryId) {
      const story = stories[gameState.currentStoryId];
      setCurrentStory(story || null);
      
      if (story && gameState.currentPassageId) {
        const passage = story.passages[gameState.currentPassageId];
        setCurrentPassage(passage || null);
      } else {
        setCurrentPassage(null);
      }
    } else {
      setCurrentStory(null);
      setCurrentPassage(null);
    }
  }, [gameState.currentStoryId, gameState.currentPassageId]);
  
  // Start a new game
  const startNewGame = useCallback((storyId: string) => {
    const story = stories[storyId];
    
    if (!story) {
      console.error(`Story with ID ${storyId} not found.`);
      return;
    }
    
    const startPassageId = story.startPassage;
    
    setGameState({
      currentStoryId: storyId,
      currentPassageId: startPassageId,
      passageHistory: [],
      settings: gameState.settings,
      sanity: 100,
      inventory: [],
      flags: {},
      variables: {}
    });
    
    // Auto-save if enabled
    if (gameState.settings.autoSave) {
      saveGame();
    }
  }, [gameState.settings]);
  
  // Process a player choice
  const makeChoice = useCallback((choice: Choice) => {
    if (!currentStory) return;
    
    // Apply choice effects
    const newState = applyEffects(choice.effects || []);
    
    // Add current passage to history
    const updatedHistory = [
      ...(gameState.passageHistory || []),
      gameState.currentPassageId as string
    ];
    
    // Update to next passage
    setGameState({
      ...newState,
      currentPassageId: choice.nextPassageId,
      passageHistory: updatedHistory
    });
    
    // Auto-save if enabled
    if (gameState.settings.autoSave) {
      saveGame();
    }
  }, [gameState, currentStory]);
  
  // Go back to the previous passage if available
  const goBack = useCallback(() => {
    if (!gameState.passageHistory || gameState.passageHistory.length === 0) {
      return;
    }
    
    // Get the last passage from history
    const history = [...gameState.passageHistory];
    const previousPassageId = history.pop();
    
    // Update state to go back
    setGameState({
      ...gameState,
      currentPassageId: previousPassageId,
      passageHistory: history
    });
  }, [gameState]);
  
  // Reset game to initial state
  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    localStorage.removeItem('edensHollowSave');
  }, []);
  
  // Update a single game setting
  const updateSetting = useCallback((key: keyof GameSettings, value: any) => {
    setGameState(prevState => ({
      ...prevState,
      settings: {
        ...prevState.settings,
        [key]: value
      }
    }));
    
    // Auto-save settings changes
    saveGame();
  }, []);
  
  // Apply game effects to state
  const applyEffects = useCallback((effects: GameEffect[]): GameState => {
    let updatedState = { ...gameState };
    
    effects.forEach(effect => {
      switch (effect.type) {
        case 'SANITY_CHANGE':
          // Clamp sanity between 0 and 100
          const newSanity = Math.max(0, Math.min(100, updatedState.sanity + effect.value));
          updatedState.sanity = newSanity;
          break;
          
        case 'INVENTORY_ADD':
          if (!updatedState.inventory.includes(effect.item)) {
            updatedState.inventory = [...updatedState.inventory, effect.item];
          }
          break;
          
        case 'INVENTORY_REMOVE':
          updatedState.inventory = updatedState.inventory.filter(item => item !== effect.item);
          break;
          
        case 'SET_FLAG':
          updatedState.flags = {
            ...updatedState.flags,
            [effect.flag]: effect.value
          };
          break;
          
        case 'SET_VARIABLE':
          updatedState.variables = {
            ...updatedState.variables,
            [effect.variable]: effect.value
          };
          break;
          
        case 'PLAY_SOUND':
          // Sound effects are handled by the useSoundEffects hook
          break;
      }
    });
    
    return updatedState;
  }, [gameState]);
  
  // Save game to localStorage
  const saveGame = useCallback(() => {
    try {
      localStorage.setItem('edensHollowSave', JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }, [gameState]);
  
  // Load game from localStorage
  const loadGame = useCallback(() => {
    try {
      const savedGame = localStorage.getItem('edensHollowSave');
      
      if (savedGame) {
        const parsedState = JSON.parse(savedGame);
        setGameState({
          ...initialGameState,
          ...parsedState
        });
      }
    } catch (error) {
      console.error('Failed to load saved game:', error);
    }
  }, []);
  
  // Check if player can go back to a previous passage
  const canGoBack = gameState.passageHistory && gameState.passageHistory.length > 0;
  
  return {
    gameState,
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
  };
}