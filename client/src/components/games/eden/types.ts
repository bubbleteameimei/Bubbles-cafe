import { GameEngine } from './GameEngine';

/**
 * Game state for Eden's Hollow
 * Contains all dynamic game data
 */
export interface GameState {
  currentScene: string;
  inventory: string[];
  health: number;
  mana: number;
  status: {
    [key: string]: any;
  };
  notifications: Notification[];
  visitedScenes: string[];
  activeDialog?: string;
  dialogIndex?: number;
  currentPuzzle?: string;
  puzzleAttempts: number;
}

/**
 * Game scene
 * Represents a location in the game
 */
export interface Scene {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  time: 'dawn' | 'day' | 'dusk' | 'night';
  ambientSound?: string;
  exits: Exit[];
  items?: SceneItem[];
  characters?: Character[];
  actions?: Action[];
  puzzles?: PuzzleInstance[];
}

/**
 * Exit from one scene to another
 */
export interface Exit {
  id: string;
  name: string;
  target: string;
  destination: string;
  position: 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
  isLocked?: boolean;
  requiredItem?: string;
  requiredStatus?: {
    [key: string]: any;
  };
}

/**
 * Item instance in a scene
 */
export interface SceneItem {
  id: string;
  name: string;
  position: string;
  isHidden: boolean;
  requiredItem?: string;
  requiredStatus?: {
    [key: string]: any;
  };
}

/**
 * Character in a scene
 */
export interface Character {
  id: string;
  name: string;
  image: string;
  position: string;
  dialog: string;
  isInteractive: boolean;
  requiredStatus?: {
    [key: string]: any;
  };
}

/**
 * Interactive action in a scene
 */
export interface Action {
  id: string;
  name: string;
  outcome: ActionOutcome;
  requiredItem?: string;
  requiredStatus?: {
    [key: string]: any;
  };
}

/**
 * Outcome of an action
 */
export interface ActionOutcome {
  addItem?: string;
  notification?: {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
  status?: {
    [key: string]: any;
  };
  dialog?: string;
  puzzle?: string;
}

/**
 * Game notification
 */
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Inventory item
 */
export interface Item {
  id: string;
  name: string;
  description: string;
  image?: string;
  isConsumable: boolean;
  isUsable: boolean;
  useEffect?: {
    health?: number;
    mana?: number;
    status?: {
      [key: string]: any;
    };
    message?: string;
  };
}

/**
 * Dialog with characters
 */
export interface Dialog {
  id: string;
  content: DialogContent[];
  onEnd?: (engine: GameEngine) => void;
}

/**
 * Single dialog part
 */
export interface DialogContent {
  speaker: string;
  text: string;
  responses?: DialogResponse[];
}

/**
 * Dialog response option
 */
export interface DialogResponse {
  text: string;
  nextDialog: string;
  requiredItem?: string;
  requiredStatus?: {
    [key: string]: any;
  };
}

/**
 * Puzzle instance in a scene
 */
export interface PuzzleInstance {
  id: string;
  name: string;
  position: string;
  isLocked: boolean;
  requiredItem?: string;
  requiredStatus?: {
    [key: string]: any;
  };
}

/**
 * Game puzzle
 */
export interface Puzzle {
  id: string;
  name: string;
  type: 'combination' | 'pattern' | 'riddle' | 'memory' | 'custom';
  instruction: string;
  options?: string[];
  maxAttempts?: number;
  checkSolution: (solution: any, gameState: GameState) => boolean;
  onSolve?: (engine: GameEngine) => void;
  onFail?: (engine: GameEngine) => void;
}