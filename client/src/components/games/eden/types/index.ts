/**
 * Eden's Hollow Game Types
 * 
 * This file contains all the type definitions used throughout the game.
 */
import { ReactNode } from 'react';

// Player state type
export interface PlayerState {
  currentScene: string;
  inventory: string[];
  visitedScenes: string[];
  sanity: number;
  corruption: number;
  health: number;
  discovered: {
    [key: string]: boolean;
  };
  relationships: {
    [key: string]: number;
  };
  flags: {
    [key: string]: boolean | number | string;
  };
  gameOver: boolean;
}

// Choice type for player decisions
export interface Choice {
  text: string;
  nextScene: string;
  requiredItems?: string[];
  requiredFlags?: {
    [key: string]: boolean | number | string;
  };
  sanityChange?: number;
  corruptionChange?: number;
  healthChange?: number;
  addItems?: string[];
  removeItems?: string[];
  setFlags?: {
    [key: string]: boolean | number | string;
  };
  relationshipChanges?: {
    [key: string]: number;
  };
  // Minimum sanity required to see this choice
  minimumSanity?: number;
  // Maximum sanity allowed to see this choice
  maximumSanity?: number;
  // Minimum corruption required to see this choice
  minimumCorruption?: number;
  // Special effect to apply when this choice is shown
  effectClass?: string;
}

// Scene type for game narrative
export interface Scene {
  id: string;
  title: string;
  description: string;
  // For alternate descriptions based on player state
  alternateDescriptions?: {
    condition: {
      sanityBelow?: number;
      sanityAbove?: number;
      corruptionAbove?: number;
      hasItems?: string[];
      hasFlags?: {
        [key: string]: boolean | number | string;
      };
    };
    text: string;
  }[];
  choices: Choice[];
  // Background image or effect
  background?: string;
  // Environmental effects
  effects?: {
    fog?: boolean;
    rain?: boolean;
    darkness?: number; // 0-100
    soundEffect?: string;
  };
  // Auto-advance to next scene after timeout (ms)
  autoAdvance?: {
    timeout: number;
    nextScene: string;
  };
  // Items that can be discovered in this scene
  discoverableItems?: string[];
  // Shows a confirmation dialog before making critical choices
  requireConfirmation?: boolean;
}

// Game engine status for UI coordination
export enum GameStatus {
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver'
}

// Sound effect types
export enum SoundType {
  AMBIENCE = 'ambience',
  EFFECT = 'effect',
  MUSIC = 'music'
}

// Game configuration
export interface GameConfig {
  title: string;
  startScene: string;
  initialState: PlayerState;
  defaultSoundVolume?: number;
  defaultMusicVolume?: number;
  // Visual settings
  visuals: {
    defaultFogIntensity?: number;
    textSpeed?: number; // ms per character
    useTypewriterEffect?: boolean;
  };
  // Debug mode settings
  debug?: {
    enabled: boolean;
    startWithAllItems?: boolean;
    invincible?: boolean;
    showAllChoices?: boolean;
  };
}

// UI Component Props

// Choice Button Props
export interface ChoiceButtonProps {
  choice: Choice;
  onSelect: (choice: Choice) => void;
  disabled?: boolean;
  sanity: number;
  corruption: number;
  showTypewriterEffect?: boolean;
  textSpeed?: number;
}

// Typewriter Text Props
export interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  sanity?: number;
  corruption?: number;
}

// Status Bar Props
export interface StatusBarProps {
  playerState: PlayerState;
}

// Confirmation Dialog Props
export interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  corruption?: number;
}

// Game UI Props
export interface GameUIProps {
  scene: Scene;
  playerState: PlayerState;
  onSelectChoice: (choice: Choice) => void;
  gameStatus: GameStatus;
  onRestart: () => void;
  config: GameConfig;
}

// Game Engine Props
export interface GameEngineProps {
  config: GameConfig;
  scenes: Record<string, Scene>;
  children: (props: GameUIProps) => ReactNode;
}