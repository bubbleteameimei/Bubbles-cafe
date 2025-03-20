// Eden's Hollow Game Types

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
  notifications: GameNotification[];
  currentPuzzle?: string;
  puzzleAttempts?: number;
}

// Dialog History Entry
export interface DialogHistoryEntry {
  character: string;
  text: string;
  timestamp: string;
}

// Game Notification
export interface GameNotification {
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  duration?: number;
  id: string;
}

// Characters
export interface Character {
  id: string;
  name: string;
  portrait?: string;
  description: string;
  dialog: string;
  requirement: RequirementCheck | null;
}

// Dialog Data
export interface DialogData {
  character: {
    name: string;
    portrait: string;
  };
  text: string[];
  responses: DialogResponse[];
}

export interface DialogResponse {
  text: string;
  nextDialog?: string;
  action?: string;
  outcome?: DialogOutcome;
}

export interface DialogOutcome {
  type: 'item' | 'status' | 'scene' | 'puzzle';
  value: any;
  message?: string;
}

// Inventory Items
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'weapon' | 'artifact' | 'key' | 'consumable' | 'quest';
  damage?: number;
  useAction?: 'heal' | 'unlock' | 'activate' | 'read' | 'restore_mana' | 'consume';
  properties?: string[];
}

// Scene Data
export interface GameScene {
  id: string;
  title: string;
  description: string[];
  image: string;
  backgroundAudio?: string;
  exits: Exit[];
  characters: Character[];
  items: ItemPlacement[];
  actions?: SceneAction[];
  puzzles?: PuzzlePlacement[];
  discovery?: SceneDiscovery;
}

// Exit/Transition
export interface Exit {
  label: string;
  destination: string;
  requirement: RequirementCheck | null;
}

// Item Placement
export interface ItemPlacement {
  id: string;
  requirement: RequirementCheck | null;
  hidden: boolean;
}

// Puzzle Placement
export interface PuzzlePlacement {
  id: string;
  introduction: string;
  type: 'riddle' | 'pattern' | 'combination' | 'runes' | 'sacrifice';
}

// Scene Actions
export interface SceneAction {
  label: string;
  action: string;
  result: string;
  outcomes: ActionOutcome[];
}

// Action Outcome
export interface ActionOutcome {
  type: 'item' | 'status' | 'health' | 'mana';
  value: any;
  message?: string;
}

// Scene Discovery
export interface SceneDiscovery {
  text: string;
  requires: RequirementCheck | null;
}

// Puzzle Data
export interface PuzzleData {
  id: string;
  type: 'riddle' | 'pattern' | 'combination' | 'runes' | 'sacrifice';
  title: string;
  description: string;
  data: any;
  solved: boolean;
  attempts: number;
  hint: string;
}

// Rune Puzzle
export interface RunePuzzleData {
  runes: Array<{ symbol: string, meaning: string }>;
  correctSequence: string[];
  question: string;
}

// Pattern Puzzle
export interface PatternPuzzleData {
  gridSize: number;
  correctPattern: number[];
  description: string;
  theme: 'blood' | 'spirit' | 'arcane';
}

// Riddle Puzzle
export interface RiddlePuzzleData {
  riddle: string;
  answer: string;
  caseSensitive: boolean;
  alternateAnswers?: string[];
}

// Combination Puzzle
export interface CombinationPuzzleData {
  lockType: 'numerical' | 'color' | 'symbol';
  combination: string[] | number[];
  description: string;
  maxAttempts: number;
}

// Sacrifice Puzzle
export interface SacrificePuzzleData {
  items: Array<{
    id: string;
    name: string;
    type: string;
    value: number;
    description: string;
  }>;
  targetValue: number;
  maxSelections: number;
  description: string;
}

// Requirement Check
export type RequirementCheck = 
  | { item: string }
  | { status: Record<string, boolean> }
  | { time: 'dawn' | 'day' | 'dusk' | 'night' }
  | { puzzle: string }
  | null;

// Game Audio
export interface GameAudio {
  id: string;
  src: string;
  type: 'ambient' | 'effect' | 'music';
  loop: boolean;
  volume: number;
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

// Game Save Data
export interface GameSaveData {
  id: string;
  timestamp: string;
  gameState: GameState;
  screenshot?: string;
  playTime: number;
}