/**
 * Eden's Hollow - Type Definitions
 */

// Game State
export interface GameState {
  currentScene: string;
  previousScene?: string;
  inventory: string[];
  status: Record<string, boolean>;
  time: 'dawn' | 'day' | 'dusk' | 'night';
  visitedScenes: string[];
  solvedPuzzles: string[];
  health: number;
  mana: number;
  dialogHistory: DialogHistoryEntry[];
  activeDialog?: string;
  activeCharacter?: string;
  currentPuzzle?: string;
  puzzleAttempts?: number;
  notifications: Notification[];
}

// Dialog history entry
export interface DialogHistoryEntry {
  character: string;
  text: string;
  timestamp: string;
}

// Notification
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  duration?: number;
}

// Game Save Data
export interface GameSaveData {
  id: string;
  name?: string;
  timestamp: string;
  playTime: number;
  gameState: GameState;
  screenshot?: string;
}

// Game Settings
export interface GameSettings {
  textSpeed: 'slow' | 'medium' | 'fast';
  volume: number;
  darkMode: boolean;
  showHints: boolean;
  language: string;
  autoSave: boolean;
}

// Scene
export interface GameScene {
  id: string;
  title: string;
  description: string;
  backgroundImage?: string;
  ambientSound?: string;
  exits: Exit[];
  characters?: Character[];
  items?: ItemPlacement[];
  puzzles?: PuzzlePlacement[];
  actions?: SceneAction[];
  discovery?: {
    requires: Requirement;
    text: string;
  };
}

// Exit
export interface Exit {
  destination: string;
  name: string;
  requirement?: Requirement;
}

// Requirement
export interface Requirement {
  item?: string;
  status?: Record<string, boolean>;
  time?: 'dawn' | 'day' | 'dusk' | 'night';
  puzzle?: string;
}

// Character
export interface Character {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  portrait: string;
  icon?: React.ReactNode;
  dialog?: string;
  requirement?: Requirement;
}

// Item Placement in scene
export interface ItemPlacement {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  requirement?: Requirement;
  isHidden?: boolean;
}

// Puzzle placement in scene
export interface PuzzlePlacement {
  id: string;
  introduction: string;
  requirement?: Requirement;
}

// Scene Action
export interface SceneAction {
  action: string;
  label: string;
  result: string;
  outcomes?: ActionOutcome[];
  requirement?: Requirement;
}

// Action Outcome
export interface ActionOutcome {
  type: 'item' | 'status' | 'health' | 'mana';
  value: any;
  message?: string;
}

// Dialog Data
export interface DialogData {
  id: string;
  character: {
    name: string;
    portrait: string;
    avatarUrl?: string;
  };
  text: string;
  responses: DialogResponse[];
}

// Dialog Response
export interface DialogResponse {
  text: string;
  action?: 'continue' | 'leave';
  nextDialog?: string;
  outcome?: {
    type: 'item' | 'status' | 'scene' | 'puzzle';
    value: any;
    message?: string;
  };
}

// Inventory Item
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  useAction?: 'heal' | 'restore_mana' | 'unlock' | 'activate' | 'read';
  iconUrl?: string;
  lore?: string;
  properties?: Record<string, any>;
}

// Puzzle Types
export type PuzzleType = 'riddle' | 'pattern' | 'combination' | 'runes' | 'sacrifice';

// Puzzle Data
export interface PuzzleData {
  id: string;
  title: string;
  type: PuzzleType;
  description?: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  data: RiddlePuzzleData | PatternPuzzleData | CombinationPuzzleData | RunesPuzzleData | SacrificePuzzleData;
}

// Riddle Puzzle
export interface RiddlePuzzleData {
  question: string;
  answer: string;
  alternateAnswers?: string[];
  maxAttempts?: number;
}

// Pattern Puzzle
export interface PatternPuzzleData {
  description: string;
  patterns: Array<{
    symbol?: string;
    color?: string;
    image?: string;
  }>;
  correctPattern: number[];
  maxAttempts?: number;
}

// Combination Puzzle
export interface CombinationPuzzleData {
  description: string;
  digits: number;
  combination: number[];
  maxAttempts?: number;
}

// Runes Puzzle
export interface RunesPuzzleData {
  description: string;
  runes: Array<{
    id: string;
    symbol: string;
  }>;
  correctSequence: string[];
  maxAttempts?: number;
}

// Sacrifice Puzzle
export interface SacrificePuzzleData {
  description: string;
  items: Array<{
    id: string;
    name: string;
    icon?: string;
    value: number;
  }>;
  targetValue: number;
  maxSelections: number;
  maxAttempts?: number;
}