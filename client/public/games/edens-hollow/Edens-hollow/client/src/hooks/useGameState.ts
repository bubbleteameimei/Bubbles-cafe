import { useState, useCallback, useEffect } from 'react';
import { GameState, Choice, Story, Passage } from '../types';
import { getInitialStory, getStory } from '../data/stories';
import { defaultGameSettings, loadGameSettings, saveGameSettings } from '../data/gameSettings';
import { useToast } from '@/hooks/use-toast';

const initialGameState: GameState = {
  sanity: 100,
  currentStoryId: '',
  currentPassageId: '',
  completedStories: [],
  unlockedStories: [],
  settings: defaultGameSettings
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [showLowSanityEffects, setShowLowSanityEffects] = useState(false);
  const { toast } = useToast();
  
  // Initialize game state
  const initializeNewGame = useCallback(() => {
    const initialStory = getInitialStory();
    const loadedSettings = loadGameSettings();
    
    setGameState({
      ...initialGameState,
      currentStoryId: initialStory.id,
      currentPassageId: initialStory.startPassageId,
      unlockedStories: [initialStory.id],
      settings: loadedSettings
    });
  }, []);

  // Load game from localStorage
  const loadSavedGame = useCallback(() => {
    try {
      const savedState = localStorage.getItem('darkEchoes_saveGame');
      if (savedState) {
        const parsedState = JSON.parse(savedState) as GameState;
        setGameState(parsedState);
        toast({
          title: "Game Loaded",
          description: "Your previous progress has been restored.",
          duration: 3000
        });
        return true;
      } else {
        // No saved game found, initialize new game
        initializeNewGame();
        return false;
      }
    } catch (error) {
      console.error('Failed to load saved game:', error);
      initializeNewGame();
      return false;
    }
  }, [initializeNewGame, toast]);

  // Save game to localStorage
  const saveGame = useCallback(() => {
    try {
      localStorage.setItem('darkEchoes_saveGame', JSON.stringify(gameState));
      toast({
        title: "Game Saved",
        description: "Your progress has been saved.",
        duration: 3000
      });
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save your progress.",
        variant: "destructive",
        duration: 3000
      });
      return false;
    }
  }, [gameState, toast]);

  // Update game settings
  const updateSettings = useCallback((newSettings: Partial<typeof gameState.settings>) => {
    setGameState(prev => {
      const updatedSettings = { ...prev.settings, ...newSettings };
      saveGameSettings(updatedSettings);
      return { ...prev, settings: updatedSettings };
    });
  }, []);

  // Process a player choice
  const makeChoice = useCallback((choice: Choice) => {
    setGameState(prev => {
      // Calculate new sanity value, clamping between 0 and 100
      const newSanity = Math.max(0, Math.min(100, prev.sanity + choice.sanityChange));
      
      // Update state with new sanity and passage
      const newState = {
        ...prev,
        sanity: newSanity,
        currentPassageId: choice.nextPassageId
      };
      
      return newState;
    });
  }, []);

  // Check if player can make a specific choice based on sanity requirements
  const canMakeChoice = useCallback((choice: Choice): boolean => {
    if (choice.requiredSanity === undefined) return true;
    return gameState.sanity >= choice.requiredSanity;
  }, [gameState.sanity]);

  // Update current story and passage whenever gameState changes
  useEffect(() => {
    if (gameState.currentStoryId) {
      const story = getStory(gameState.currentStoryId);
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
    
    // Update low sanity effects
    setShowLowSanityEffects(gameState.sanity < 40);
  }, [gameState]);

  // Initialize game if needed
  useEffect(() => {
    if (!currentStory && !currentPassage && gameState === initialGameState) {
      initializeNewGame();
    }
  }, [currentStory, currentPassage, gameState, initializeNewGame]);

  return {
    gameState,
    currentStory,
    currentPassage,
    showLowSanityEffects,
    initializeNewGame,
    loadSavedGame,
    saveGame,
    makeChoice,
    canMakeChoice,
    updateSettings
  };
}
