// Game data types for Eden's Hollow

// Scene Types
export type NavigationDirection = 'left' | 'right' | 'forward' | 'back' | 'up' | 'down' | 'none' | 
                                 'north' | 'south' | 'east' | 'west';

export interface SceneExit {
  id: string;
  targetScene: string;
  direction: NavigationDirection;
  label: string;
  isLocked?: boolean;
  requiredItem?: string;
  requiredEvent?: string;
}

export interface SceneHotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tooltip: string;
  type: 'item' | 'character' | 'action' | 'secret';
  targetId: string;
  requiredItem?: string;
  triggersEvent?: string;
}

export interface SceneEvent {
  id: string;
  type: 'dialog' | 'puzzle' | 'item' | 'notification' | 'transition' | 'ending';
  targetId: string;
  condition?: {
    type: 'item' | 'event' | 'status';
    value: string;
  };
  triggersOnEnter?: boolean;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  backgroundImage: string;
  ambientSound?: string;
  exits: SceneExit[];
  events: SceneEvent[];
  hotspots: SceneHotspot[];
  isSecret?: boolean;
  isEndingScene?: boolean;
  fogEffect?: boolean;
}

// Item Types
export type ItemCategory = 'key' | 'tool' | 'consumable' | 'quest' | 'lore';

export interface ItemEffect {
  type: 'health' | 'mana' | 'status';
  value: number | string;
  duration?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  image: string;
  category: ItemCategory;
  useableOn?: string[];
  effects?: ItemEffect[];
  isQuestItem?: boolean;
  isConsumable?: boolean;
  destroyOnUse?: boolean;
  quantity?: number;
}

// Dialog Types
export interface DialogResponse {
  id: string;
  text: string;
  outcome?: {
    type: 'item' | 'event' | 'status' | 'scene';
    value: string;
  };
  leadsTo?: number;
}

export interface DialogSegment {
  speaker: string;
  text: string;
  responses?: DialogResponse[];
  nextIndex?: number;
}

export interface DialogCharacter {
  id: string;
  name: string;
  portrait: string;
  description?: string;
}

export interface Dialog {
  id: string;
  character: DialogCharacter | string;
  content: DialogSegment[];
}

// Puzzle Types
export type PuzzleType = 'sequence' | 'combination' | 'matching' | 'riddle' | 'pattern' | 'order' | 'selection';

export interface PuzzleInput {
  id: string;
  type: 'button' | 'toggle' | 'slider' | 'text' | 'draggable';
  label: string;
  value?: string | number;
}

export interface Puzzle {
  id: string;
  name: string;
  type: PuzzleType;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solution: string[] | Record<string, string>;
  hint: string;
  hints?: string[];
  maxAttempts: number;
  timeLimit?: number;
  inputs?: PuzzleInput[];
  initialState?: any;
  items?: string[];
  options?: any[];
  reward?: {
    type: 'item' | 'scene' | 'event';
    value: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'achievement' | 'warning' | 'danger' | 'discovery' | 'hint' | 'quest' | 'item';
  message: string;
  title?: string;
  timeout?: number;
}

// Game State
export interface Inventory {
  items: Item[];
  activeItemId?: string;
}

export interface GameState {
  currentSceneId: string;
  inventory: Inventory;
  visitedScenes: string[];
  unlockedScenes: string[];
  triggeredEvents: string[];
  activeDialogId?: string;
  notifications: Notification[];
  health: number;
  mana: number;
  stats: {
    puzzlesSolved: number;
    itemsFound: number;
    secretsDiscovered: number;
  };
  status: string[];
  puzzleAttempts: Record<string, number>;
  currentPuzzle?: {
    id: string;
    progress: any;
    attempts: number;
  };
}

// Game Engine Options
export interface GameOptions {
  startingSceneId: string;
  startingHealth: number;
  startingMana: number;
  autosave: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}

// Save Game Data
export interface SaveGameData {
  saveDate: string;
  gameState: GameState;
  screenshotUrl?: string;
}