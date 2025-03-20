/**
 * Type definitions for Eden's Hollow game
 * 
 * This file contains all the interfaces and types needed for
 * the game engine, scene management, inventory, and dialog systems.
 */

// ===== Core Game Types =====

/**
 * Options passed when initializing the game engine
 */
export interface GameOptions {
  startScene: string;
  onStateChange?: (state: GameState) => void;
  scenes: Scene[];
  items: Item[];
  dialogs: Dialog[];
  puzzles: Puzzle[];
}

/**
 * Main game state interface that tracks all game progress
 */
export interface GameState {
  currentSceneId: string;
  inventory: Inventory;
  activeDialogId: string | null;
  dialogIndex: number;
  currentPuzzleId: string | null;
  visitedScenes: string[];
  flags: Record<string, boolean>;
  counters: Record<string, number>;
  playerStatus: PlayerStatus;
  activePuzzles: {
    [id: string]: {
      id: string;
      progress: any;
      attempts: number;
    }
  };
  notifications: Notification[];
  secrets: {
    found: string[];
    hints: string[];
  };
  progress: {
    puzzlesSolved: number;
    itemsFound: number;
    secretsDiscovered: number;
    completionPercentage: number;
  };
}

/**
 * Player status including health, energy, etc.
 */
export interface PlayerStatus {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  sanity: number;
  maxSanity: number;
  conditions: string[];
}

// ===== Scene & Environment =====

/**
 * Scene definition with all required details
 */
export interface Scene {
  id: string;
  name: string;
  description: string;
  backgroundImage: string;
  exits: SceneExit[];
  items: string[];
  events: SceneEvent[];
  interactables: SceneInteractable[];
  actions?: SceneAction[];
  features?: SceneFeature[];
  lighting?: 'dark' | 'dim' | 'normal' | 'bright';
  ambience?: {
    soundEffect?: string;
    volume?: number;
    loop?: boolean;
    fadeIn?: number;
    fadeOut?: number;
  };
  title?: string;
  isStartScene?: boolean;
  isEndScene?: boolean;
  mapPosition?: {
    x: number;
    y: number;
  };
}

/**
 * Exit to another scene
 */
export interface SceneExit {
  id: string;
  target: string;
  condition?: Condition;
  locked?: boolean;
  keyItem?: string;
  name?: string;
  description?: string;
  position?: {
    top?: string;
    left?: string;
    bottom?: string;
    right?: string;
  };
}

/**
 * Interactive element in a scene
 */
export interface SceneInteractable {
  id: string;
  name: string;
  description: string;
  type: 'object' | 'character' | 'mechanism' | 'decoration';
  position: {
    top: string;
    left: string;
    width?: string;
    height?: string;
  };
  state?: string;
  states?: Record<string, string>;
  dialogId?: string;
  actionId?: string;
  examinable?: boolean;
  condition?: Condition;
  itemRequired?: string;
  puzzle?: string;
  image?: string;
  animation?: string;
  interactions?: {
    default?: SceneEvent;
    examine?: SceneEvent;
    use?: Record<string, SceneEvent>;
    talk?: SceneEvent;
    push?: SceneEvent;
    pull?: SceneEvent;
    activate?: SceneEvent;
  };
}

/**
 * Visual feature or detail in a scene
 */
export interface SceneFeature {
  id: string;
  name: string;
  description: string;
  position: {
    top: string;
    left: string;
    width?: string;
    height?: string;
  };
  image?: string;
  opacity?: number;
  visible?: boolean;
  condition?: Condition;
  event?: SceneEvent;
  layer?: number;
  animation?: string;
  transformOrigin?: string;
  transform?: string;
  zIndex?: number;
}

/**
 * Action available in a scene
 */
export interface SceneAction {
  id: string;
  name: string;
  description: string;
  condition?: Condition;
  outcome: SceneEvent;
  energy?: number;
  cooldown?: number;
  icon?: string;
}

/**
 * Event triggered in a scene
 */
export interface SceneEvent {
  id: string;
  effect: GameEffect;
  trigger?: 'enter' | 'examine' | 'use' | 'time' | 'condition';
  condition?: Condition;
  delay?: number;
  chance?: number;
  outcome?: {
    success?: GameEffect;
    failure?: GameEffect;
  };
}

/**
 * Condition that must be met
 */
export interface Condition {
  type: 'item' | 'flag' | 'counter' | 'combination';
  item?: string;
  flag?: string;
  counter?: {
    id: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
  };
  items?: string[];
  flags?: string[];
  counters?: Array<{
    id: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
  }>;
  operator?: 'AND' | 'OR';
  value?: any;
  not?: boolean;
}

/**
 * Effect on game state
 */
export interface GameEffect {
  type: 'scene' | 'item' | 'event' | 'status';
  value: string;
  scene?: string;
  item?: {
    id: string;
    operation: 'add' | 'remove';
    count?: number;
  };
  flag?: {
    id: string;
    value: boolean;
  };
  counter?: {
    id: string;
    operation: 'set' | 'increment' | 'decrement';
    value: number;
  };
  status?: {
    type: 'health' | 'energy' | 'sanity';
    operation: 'set' | 'add' | 'subtract';
    value: number;
  };
  notification?: {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
  };
  puzzle?: string;
  condition?: Condition;
  dialog?: string;
}

// ===== Inventory & Items =====

/**
 * Player inventory
 */
export interface Inventory {
  items: Item[];
  maxItems?: number;
  categories?: Record<string, Item[]>;
  get: (id: string) => Item | undefined;
  add: (item: Item) => boolean;
  remove: (id: string) => boolean;
  has: (id: string) => boolean;
  count: (id: string) => number;
  filter: (filterFn: (id: string) => boolean) => string[];
}

/**
 * Item that can be collected or used
 */
export interface Item {
  id: string;
  name: string;
  description: string;
  image: string;
  category: 'quest' | 'tool' | 'consumable' | 'lore';
  type?: 'weapon' | 'key' | 'document' | 'artifact' | 'valuable';
  effects?: ItemEffect[];
  count?: number;
  stackable?: boolean;
  isUsable?: boolean;
  usable?: boolean;
  single_use?: boolean;
  value?: number;
  combines_with?: string[];
  combination_result?: string;
  condition?: Condition;
  examine_text?: string;
  use_text?: string;
  inventory_text?: string;
  lore?: string;
  secret?: boolean;
  state?: 'new' | 'used' | 'damaged' | 'repaired';
}

/**
 * Effect when using an item
 */
export interface ItemEffect {
  type: 'health' | 'mana' | 'status' | 'flag' | 'counter' | 'scene' | 'remove';
  value: any;
  health?: {
    operation: 'add' | 'subtract' | 'set';
    amount: number;
  };
  mana?: {
    operation: 'add' | 'subtract' | 'set';
    amount: number;
  };
  status?: {
    operation: 'add' | 'remove';
    condition: string;
  };
  flag?: {
    id: string;
    value: boolean;
  };
  counter?: {
    id: string;
    operation: 'add' | 'subtract' | 'set';
    value: number;
  };
  scene?: string;
  duration?: number;
  remove?: boolean;
  message?: string;
  notification?: {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
  };
}

// ===== Dialog System =====

/**
 * Character dialog tree
 */
export interface Dialog {
  id: string;
  character: DialogCharacter | string;
  content: DialogSegment[];
  condition?: Condition;
  triggers?: Record<string, GameEffect>;
  initial?: number;
}

/**
 * Character involved in dialog
 */
export interface DialogCharacter {
  id: string;
  name: string;
  portrait: string;
  portraits?: {
    neutral?: string;
    happy?: string;
    sad?: string;
    angry?: string;
    surprised?: string;
    scared?: string;
    [key: string]: string | undefined;
  };
  voice?: string;
  description?: string;
  relationship?: number;
}

/**
 * Single segment of dialog
 */
export interface DialogSegment {
  text: string;
  speaker?: string;
  emotion?: string;
  responses?: DialogResponse[];
  events?: SceneEvent[];
  animation?: string;
  audio?: string;
  condition?: Condition;
  outcome?: GameEffect;
}

/**
 * Response option in dialog
 */
export interface DialogResponse {
  text: string;
  nextIndex?: number;
  condition?: Condition;
  outcome?: GameEffect;
  requiresItem?: string;
  endsDialog?: boolean;
}

// ===== Puzzle System =====

/**
 * Puzzle that can be solved
 */
export interface Puzzle {
  id: string;
  name: string;
  description: string;
  type: 'combination' | 'pattern' | 'riddle' | 'sequence' | 'slider' | 'lock';
  difficulty: 'easy' | 'medium' | 'hard';
  maxAttempts?: number;
  timeLimit?: number;
  clues?: string[];
  solution: string[] | Record<string, string>;
  inputs?: PuzzleInput[];
  hintItem?: string;
  onSolve: GameEffect;
  onFail?: GameEffect;
  image?: string;
  resetOnFail?: boolean;
  allowHints?: boolean;
  trackAttempts?: boolean;
  progressSaved?: boolean;
  helpText?: string;
}

/**
 * Input for puzzles
 */
export interface PuzzleInput {
  id: string;
  type: 'button' | 'dial' | 'slider' | 'toggle' | 'text' | 'select';
  label: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  default?: any;
  position?: {
    top: string;
    left: string;
  };
  image?: string;
  sounds?: {
    activate?: string;
    success?: string;
    failure?: string;
  };
}

// ===== Notification System =====

/**
 * Types of notifications
 */
export type NotificationType = 
  | 'item' 
  | 'quest' 
  | 'discovery' 
  | 'achievement' 
  | 'hint' 
  | 'warning' 
  | 'danger' 
  | 'info';

/**
 * Notification displayed to player
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  dismissible?: boolean;
  icon?: string;
}