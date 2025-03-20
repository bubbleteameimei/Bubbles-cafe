/**
 * Eden's Hollow Game Types
 * These types define the structure of the game's state and components
 */

// Game State 
export interface GameState {
  currentScene: string;
  status: {
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    has_light: boolean;
    fog_reduction: boolean;
    [key: string]: any;
  };
  inventory: InventoryItem[];
  visitedScenes: Record<string, boolean>;
  completedPuzzles: Record<string, boolean>;
  triggeredDialogs: Record<string, boolean>;
  collectedItems: Record<string, boolean>;
  gameFlags: Record<string, boolean>;
  activeDialog?: string;
  activePuzzle?: string;
}

// Game Actions
export type GameAction =
  | { type: 'CHANGE_SCENE'; payload: string }
  | { type: 'INTERACT_HOTSPOT'; payload: string }
  | { type: 'COLLECT_ITEM'; payload: string }
  | { type: 'USE_ITEM'; payload: string }
  | { type: 'COMBINE_ITEMS'; payload: { item1: string; item2: string } }
  | { type: 'SOLVE_PUZZLE'; payload: { puzzleId: string; solution: string[] } }
  | { type: 'DIALOG_CHOICE'; payload: { dialogId: string; choiceIndex: number } }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'UPDATE_STATUS'; payload: { key: string; value: any } }
  | { type: 'SAVE_GAME' }
  | { type: 'LOAD_GAME' };

// Scene Types
export interface Scene {
  id: string;
  name: string;
  description: string;
  background: string;
  music?: string;
  ambientSound?: string;
  lighting: 'dark' | 'normal' | 'bright' | 'fog';
  hotspots: Hotspot[];
  exits: Exit[];
  items?: SceneItem[];
  triggers?: SceneTrigger[];
}

export interface Hotspot {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interaction: {
    type: 'dialog' | 'puzzle' | 'item' | 'effect';
    targetId: string;
    data?: any;
  };
  condition?: string;
}

export interface Exit {
  id: string;
  name: string;
  description: string;
  targetScene: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  locked?: boolean;
  keyId?: string;
  condition?: string;
}

export interface SceneItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  condition?: string;
}

export interface SceneTrigger {
  id: string;
  type: 'dialog' | 'puzzle' | 'notification' | 'effect';
  targetId: string;
  condition: string;
  oneTime: boolean;
  data?: any;
}

// Item System
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: 'key' | 'weapon' | 'consumable' | 'quest' | 'tool' | 'misc';
  usable: boolean;
  combinable?: boolean;
  quantity?: number;
  effect?: {
    type: 'heal' | 'mana' | 'light' | 'status';
    value: number;
    duration?: number;
  };
}

// Dialog System
export interface Dialog {
  id: string;
  content: DialogLine[];
  choices?: DialogChoice[];
}

export interface DialogLine {
  text: string;
  speaker: {
    name: string;
    portrait?: string;
    color?: string;
  };
}

export interface DialogChoice {
  text: string;
  next?: string;
  effect?: {
    type: 'status' | 'item' | 'health' | 'mana';
    value: any;
  };
}

// Puzzle System
export interface Puzzle {
  id: string;
  name: string;
  description: string;
  type: 'sequence' | 'combination' | 'riddle' | 'pattern' | 'text';
  difficulty: 'easy' | 'medium' | 'hard';
  solution: string[];
  acceptedAnswers?: string[];
  hint?: string;
  image?: string;
  reward?: {
    type: 'item' | 'scene' | 'status';
    id: string;
    value?: any;
  };
}

// Notification System
export interface GameNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number; // in milliseconds, 0 for no auto-dismiss
}

// Component Props
export interface StatusBarProps {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
}

export interface SceneViewProps {
  scene: Scene;
  gameState: GameState;
  onHotspotClick: (hotspot: Hotspot) => void;
  onExitClick: (exit: Exit) => void;
  onItemClick: (item: SceneItem) => void;
}

export interface DialogBoxProps {
  dialog: Dialog;
  onComplete: () => void;
  onChoiceSelected: (choice: DialogChoice) => void;
}

export interface NotificationSystemProps {
  notifications: GameNotification[];
  onDismiss: (id: string) => void;
}

export interface InventoryPanelProps {
  items: InventoryItem[];
  onUse: (item: InventoryItem) => void;
  onExamine: (item: InventoryItem) => void;
  onCombine: (item1: InventoryItem, item2: InventoryItem) => void;
}

export interface PuzzleInterfaceProps {
  puzzle: Puzzle;
  onSolve: (solution: string[]) => void;
  onCancel: () => void;
}

export interface EdenGameProps {
  // Any props for the main game component
}