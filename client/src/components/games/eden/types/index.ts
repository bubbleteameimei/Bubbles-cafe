/**
 * Eden's Hollow Type Definitions
 * Contains all type definitions for the game
 */

// Choice Types
export type ChoiceType = 'rational' | 'emotional' | 'desperate' | 'corrupted';

// Player Choice
export interface Choice {
  id: string;
  text: string;
  type: ChoiceType;
  nextSceneId: string;
  available: boolean;
  requiresConfirmation?: boolean;
  confirmationText?: string;
  sanityEffect?: number;
  corruptionEffect?: number;
  flag?: string;
}

// Scene
export interface Scene {
  id: string;
  title: string;
  description: string;
  image?: string;
  choices: Choice[];
  sanityRequirement?: number;
  corruptionRequirement?: number;
  isEnding?: boolean;
  endType?: 'victory' | 'defeat' | 'neutral';
  onEnter?: (gameState: GameState) => GameState;
}

// Player
export interface Player {
  sanity: number;
  corruption: number;
  location: string;
  time: string;
  decisions: string[];
  flags: string[];
  inventory: string[];
}

// Game State
export interface GameState {
  currentSceneId: string;
  player: Player;
  visitedScenes: string[];
  playTime: number;
  gameWon: boolean;
  gameOver: boolean;
  timestamp: number;
}

// Game Action
export type GameAction = 
  | { type: 'MAKE_CHOICE'; choice: Choice }
  | { type: 'UPDATE_SANITY'; amount: number }
  | { type: 'UPDATE_CORRUPTION'; amount: number }
  | { type: 'ADD_FLAG'; flag: string }
  | { type: 'REMOVE_FLAG'; flag: string }
  | { type: 'ADD_ITEM'; item: string }
  | { type: 'REMOVE_ITEM'; item: string }
  | { type: 'SET_GAME_OVER'; won: boolean }
  | { type: 'RESET_GAME' };

// Game Context
export interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  scenes: Record<string, Scene>;
  makeChoice: (choice: Choice) => void;
  availableChoices: Choice[];
}

// Game Engine Props
export interface GameEngineProps {
  children: React.ReactNode;
  onGameEnd?: (state: GameState) => void;
}

// Game UI Props
export interface GameUIProps {
  showTutorial?: boolean;
}