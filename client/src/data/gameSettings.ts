/**
 * Default Game Settings
 * 
 * This file defines the default settings used in Eden's Hollow game.
 */

import { GameSettings } from '../types/game';

export const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  textSpeed: 'normal',
  showGore: true,
  autoSave: true
};

// Text speeds in characters per second
export const TEXT_SPEEDS = {
  slow: 20,
  normal: 35,
  fast: 60
};

// Features that can be toggled by the player
export const FEATURE_TOGGLES = {
  soundEffects: 'soundEnabled',
  backgroundMusic: 'musicVolume',
  sfxVolume: 'sfxVolume',
  textSpeed: 'textSpeed',
  graphicContent: 'showGore',
  autoSave: 'autoSave'
};

// Default key bindings for game controls
export const KEY_BINDINGS = {
  navigateUp: 'ArrowUp',
  navigateDown: 'ArrowDown',
  select: 'Enter',
  back: 'Escape'
};

// Game difficulty settings (affects sanity drain rates, item requirements)
export const DIFFICULTY_PRESETS = {
  easy: {
    sanityDrainRate: 0.5,  // 50% of normal
    itemRequirements: 0.5  // 50% of normal items required
  },
  normal: {
    sanityDrainRate: 1.0,  // Normal rate
    itemRequirements: 1.0  // All items required
  },
  hard: {
    sanityDrainRate: 1.5,  // 150% of normal
    itemRequirements: 1.5  // 50% more items required
  }
};