import { GameState, Story, Passage } from "../types";

/**
 * Save the current game state to local storage
 */
export const saveGameState = (gameState: GameState): boolean => {
  try {
    localStorage.setItem('darkEchoes_gameState', JSON.stringify(gameState));
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    return false;
  }
};

/**
 * Load game state from local storage
 */
export const loadGameState = (): GameState | null => {
  try {
    const savedState = localStorage.getItem('darkEchoes_gameState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

/**
 * Get the current passage from a story
 */
export const getCurrentPassage = (
  story: Story | null, 
  passageId: string
): Passage | null => {
  if (!story) return null;
  return story.passages[passageId] || null;
};

/**
 * Calculate new sanity value clamped between 0 and 100
 */
export const calculateNewSanity = (
  currentSanity: number, 
  change: number
): number => {
  return Math.max(0, Math.min(100, currentSanity + change));
};

/**
 * Check if a story is completed (reached an ending)
 */
export const isStoryCompleted = (
  story: Story, 
  currentPassage: Passage | null
): boolean => {
  if (!currentPassage) return false;
  
  // A story is completed if the current passage is an ending with no choices
  return currentPassage.phase === 'ending' && 
    (!currentPassage.choices || currentPassage.choices.length === 0);
};

/**
 * Get the next unlocked story
 */
export const getNextUnlockedStory = (
  stories: Story[], 
  completedStories: string[]
): Story | null => {
  const uncompletedStories = stories.filter(
    story => !completedStories.includes(story.id)
  );
  
  return uncompletedStories.length > 0 ? uncompletedStories[0] : null;
};
