/**
 * Eden's Hollow Game Types
 * 
 * Type definitions for the Eden's Hollow game components and data structures.
 */

// Story phases represent different stages in the narrative
export type StoryPhase = 'intro' | 'exploration' | 'danger' | 'climax' | 'resolution';

// Game settings for user preferences
export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  textSpeed: 'slow' | 'normal' | 'fast';
  showGore: boolean;
}

// A choice the player can make
export interface Choice {
  id: string;
  text: string;
  nextPassageId: string;
  sanityChange: number;
  critical?: boolean; // Critical choices require confirmation
  requiredItems?: string[]; // Items needed to enable this choice
  disabled?: boolean; // Whether this choice is currently disabled
}

// A passage in the story
export interface Passage {
  id: string;
  text: string;
  choices: Choice[];
  phase?: StoryPhase; // The narrative phase of this passage
  backgroundImage?: string; // Optional background image
  music?: string; // Optional music track
  soundEffect?: string; // Optional sound effect to play
  sanityThreshold?: number; // Minimum sanity required to see the real content
  insaneText?: string; // Alternative text when below sanity threshold
}

// A complete story with passages
export interface Story {
  id: string;
  title: string;
  author: string;
  startPassageId: string;
  passages: {
    [passageId: string]: Passage;
  };
}

// The player's game state
export interface GameState {
  currentStoryId: string;
  currentPassageId: string;
  sanity: number; // 0-100, lower means more mental instability
  inventory: string[]; // Items the player has collected
  visitedPassages: {
    [passageId: string]: boolean;
  };
  settings: GameSettings;
}