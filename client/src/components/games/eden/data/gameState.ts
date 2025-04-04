/**
 * Eden's Hollow Initial Game State
 * Defines the starting state of the game
 */

import { GameState, Player } from '../types';

/**
 * Initial player state
 */
export const initialPlayer: Player = {
  sanity: 100,       // Start with full sanity
  corruption: 0,     // Start with no corruption
  location: 'The Outskirts of Eden\'s Hollow',
  time: 'Dusk',
  decisions: [],     // No decisions made yet
  flags: [],         // No flags set yet
  inventory: []      // No items yet
};

/**
 * Initial game state
 */
export const initialGameState: GameState = {
  currentSceneId: 'intro',  // Start at the intro scene
  player: initialPlayer,
  visitedScenes: ['intro'],  // The intro scene is considered visited
  playTime: 0,               // Play time in seconds
  gameWon: false,            // Game not won yet
  gameOver: false,           // Game not over yet
  timestamp: Date.now()      // Current timestamp
};