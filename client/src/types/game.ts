/**
 * Eden's Hollow Game Types
 * 
 * This file defines the core types used throughout the game.
 */

// Game settings configuration
export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  textSpeed: 'slow' | 'normal' | 'fast';
  showGore: boolean;
  autoSave: boolean;
}

// Main game state
export interface GameState {
  currentStoryId?: string;
  currentPassageId?: string;
  passageHistory: string[];
  sanity: number;
  inventory: string[];
  flags: Record<string, boolean>;
  variables: Record<string, any>;
  settings: GameSettings;
}

// Story phases for progression tracking
export enum StoryPhase {
  INTRO = 'intro',
  EARLY = 'early',
  MID = 'mid',
  LATE = 'late',
  ENDING = 'ending'
}

// A single passage (scene/moment) in the story
export interface Passage {
  id: string;
  text: string;
  choices?: Choice[];
  phase?: StoryPhase;
  requiredItems?: string[];
  effects?: GameEffect[];
  background?: string;
  ambientSound?: string;
  isSanityCheck?: boolean;
}

// A choice the player can make
export interface Choice {
  id: string;
  text: string;
  nextPassageId: string;
  effects?: GameEffect[];
  minSanity?: number;
  maxSanity?: number;
  requiredItems?: string[];
  requiresFlags?: Record<string, boolean>;
  sanityChange?: number;
}

// A complete story with all its passages
export interface Story {
  id: string;
  title: string;
  description: string;
  author: string;
  startPassage: string;
  passages: Record<string, Passage>;
  defaultSanity: number;
  endingPassages: string[];
  sanityThreshold?: number;
}

// Game effect types
export type GameEffect = 
  | SanityChangeEffect
  | InventoryAddEffect
  | InventoryRemoveEffect
  | SetFlagEffect
  | SetVariableEffect
  | PlaySoundEffect;

// Effects - Sanity Change
export interface SanityChangeEffect {
  type: 'SANITY_CHANGE';
  value: number;
}

// Effects - Inventory Add
export interface InventoryAddEffect {
  type: 'INVENTORY_ADD';
  item: string;
}

// Effects - Inventory Remove
export interface InventoryRemoveEffect {
  type: 'INVENTORY_REMOVE';
  item: string;
}

// Effects - Set Flag
export interface SetFlagEffect {
  type: 'SET_FLAG';
  flag: string;
  value: boolean;
}

// Effects - Set Variable
export interface SetVariableEffect {
  type: 'SET_VARIABLE';
  variable: string;
  value: any;
}

// Effects - Play Sound
export interface PlaySoundEffect {
  type: 'PLAY_SOUND';
  sound: string;
  loop?: boolean;
}