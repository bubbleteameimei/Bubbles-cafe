// Game State Types
export interface GameState {
  currentScene: string;
  inventory: string[];
  status: Record<string, boolean>;
  time: 'dawn' | 'day' | 'dusk' | 'night';
  visitedScenes: string[];
  solvedPuzzles: string[];
  health: number;
  mana: number;
  dialogHistory: string[];
  notifications: Notification[];
  activeDialog?: string;
  currentPuzzle?: string;
  puzzleAttempts?: number;
  previousScene?: string;
  activeCharacter?: string;
}

// These types alias the main types for compatibility with the GameEngine.tsx
export type GameScene = Scene;
export type PuzzleData = Puzzle;
export type DialogData = Dialog;
export type InventoryItem = Item;

// Game Scene Types
export interface Scene {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  time?: 'dawn' | 'day' | 'dusk' | 'night';
  music?: string;
  ambientSound?: string;
  exits?: SceneExit[];
  characters?: Character[];
  items?: ItemPlacement[];
  puzzles?: PuzzleReference[];
  actions?: SceneAction[];
  events?: SceneEvent[];
}

export interface SceneExit {
  id: string;
  name: string;
  target: string;
  position: string;
  requiresItem?: string;
  requiresStatus?: string;
}

export interface SceneAction {
  id: string;
  name: string;
  description?: string;
  requiresItem?: string;
  requiresStatus?: string;
  outcome?: OutcomeEffect;
}

export interface SceneEvent {
  id: string;
  trigger: 'enter' | 'exit' | 'item-use' | 'dialog-complete' | 'timer';
  condition?: string;
  outcome: OutcomeEffect;
}

export interface OutcomeEffect {
  dialog?: string;
  puzzle?: string;
  item?: string;
  removeItem?: string;
  status?: Record<string, boolean>;
  notification?: Notification;
  scene?: string;
  damage?: number;
  heal?: number;
}

// Character Types
export interface Character {
  id: string;
  name: string;
  image: string;
  position: string;
  dialog: string;
  requiresStatus?: string;
}

// Item Types
export interface Item {
  id: string;
  name: string;
  description: string;
  image?: string;
  type?: string;
  canUse?: boolean;
  useEffect?: OutcomeEffect;
  quantity?: number;
}

export interface ItemPlacement {
  id: string;
  name: string;
  image?: string;
  position: string;
  isHidden: boolean;
  requiresStatus?: string;
}

// Dialog Types
export interface Dialog {
  id: string;
  speaker?: string;
  speakerImage?: string;
  text: string;
  responses?: DialogResponse[];
  onComplete?: OutcomeEffect;
}

export interface DialogResponse {
  text: string;
  nextDialog?: string;
  outcome?: OutcomeEffect;
}

// Puzzle Types
export interface Puzzle {
  id: string;
  name: string;
  description: string;
  type: PuzzleType;
  data: RiddlePuzzleData | PatternPuzzleData | CombinationPuzzleData | RunesPuzzleData | SacrificePuzzleData;
  attempts: number;
  solved: boolean;
  onSolve?: OutcomeEffect;
  onFail?: OutcomeEffect;
}

export interface PuzzleReference {
  id: string;
  name: string;
  description?: string;
  position: string;
  requiresItem?: string;
  requiresStatus?: string;
}

export type PuzzleType = 'riddle' | 'pattern' | 'combination' | 'runes' | 'sacrifice';

export interface RiddlePuzzleData {
  type: 'riddle';
  question: string;
  answer: string;
  alternateAnswers?: string[];
  hint?: string;
}

export interface PatternPuzzleData {
  type: 'pattern';
  description: string;
  patterns: Array<{
    image?: string;
    symbol?: string;
  }>;
  correctPattern: number[];
  hint?: string;
}

export interface CombinationPuzzleData {
  type: 'combination';
  description: string;
  digits: string[][];
  combination: string;
  hint?: string;
}

export interface RunesPuzzleData {
  type: 'runes';
  description: string;
  runes: Array<{
    id: string;
    symbol: string;
    name: string;
    image?: string;
  }>;
  correctSequence: string[];
  hint?: string;
}

export interface SacrificePuzzleData {
  type: 'sacrifice';
  description: string;
  items: Array<{
    id: string;
    name: string;
    value: number;
    icon?: string;
    image?: string;
  }>;
  targetValue: number;
  maxSelections: number;
  hint?: string;
}

// Notification System
export interface Notification {
  id: string;
  message: string;
  title?: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'danger';
  duration?: number;
  action?: {
    label: string;
    callback?: () => void;
  };
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
  name?: string;
  timestamp?: string;
  data: GameState;
}

// Game Engine Interface
export interface GameEngineInterface {
  transitionToScene: (sceneId: string) => void;
  useItem: (itemId: string) => void;
  selectDialogResponse: (responseIndex: number) => void;
  attemptPuzzle: (puzzleId: string, solution: any) => void;
  performAction: (actionId: string) => void;
  closeDialog: () => void;
  closePuzzle: () => void;
  saveGame: () => void;
  loadGame: (saveId: string) => void;
  updateSettings: (settings: GameSettings) => void;
  dismissNotification: (id: string) => void;
}