/**
 * Eden's Hollow - Types Definitions
 */

// Game State

/**
 * Overall game state
 */
export interface GameState {
  currentSceneId: string;
  player: PlayerState;
  inventory: InventoryItem[];
  activeDialogId: string | null;
  dialogLineIndex: number;
  activePuzzleId: string | null;
  completedPuzzles: string[];
  discoveredSecrets: string[];
  unlockedScenes: string[];
  gameTime: number; // Minutes since midnight
  fogLevel: number; // 0-100
  notifications: GameNotification[];
  gameFlags: Record<string, any>;
}

/**
 * Player state
 */
export interface PlayerState {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  sanity: number;
  maxSanity: number;
}

/**
 * Game notification
 */
export interface GameNotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'discovery' | 'achievement' | 'danger';
  timeout?: number;
  action?: {
    label: string;
    event: GameEvent;
  };
}

/**
 * Game event
 */
export interface GameEvent {
  type: 'addItem' | 'removeItem' | 'damagePlayer' | 'healPlayer' | 'modifySanity' |
        'unlockScene' | 'setFlag' | 'modifyFog' | 'changeScene' | 'triggerDialog' |
        'showNotification' | 'playSound' | 'startPuzzle' | 'endGame';
  targetId?: string;
  value?: any;
  text?: string;
}

/**
 * Game completion results
 */
export interface GameResults {
  completed: boolean;
  endingType: 'good' | 'neutral' | 'bad' | 'secret';
  timeSpent: number;
  itemsCollected: number;
  secretsDiscovered: number;
  puzzlesSolved: number;
}

// Scenes and Environment

/**
 * Scene definition
 */
export interface Scene {
  id: string;
  name: string;
  description: string;
  background: string;
  backgroundImage?: string;
  foregroundImage?: string;
  hotspots?: Hotspot[];
  exits?: Exit[];
  items?: SceneItem[];
  environment?: SceneEnvironment;
  onEnter?: GameEvent[];
  onExit?: GameEvent[];
}

/**
 * Scene environment settings
 */
export interface SceneEnvironment {
  lighting?: 'normal' | 'dark' | 'dim' | 'flicker' | 'moonlight' | 'firelight';
  fog?: number; // 0-100
  ambientSound?: string;
  particles?: string; // Effect type
  weather?: string; // Weather type
}

/**
 * Interactive hotspot within a scene
 */
export interface Hotspot {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  hidden?: boolean;
  condition?: string;
  actions: HotspotAction[];
}

/**
 * Action for a hotspot
 */
export interface HotspotAction {
  type: 'examine' | 'interact' | 'take' | 'use' | 'dialog';
  requiredItemId?: string;
  targetId?: string;
  resultText?: string;
  events?: GameEvent[];
}

/**
 * Exit from one scene to another
 */
export interface Exit {
  id: string;
  name: string;
  targetSceneId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  locked?: boolean;
  hidden?: boolean;
  requiredItemId?: string;
  unlockMessage?: string;
}

/**
 * Item placed in a scene
 */
export interface SceneItem {
  id: string;
  itemId: string;
  name?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  hidden?: boolean;
  condition?: string;
}

// Inventory and Items

/**
 * Inventory item definition
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  icon?: string;
  type: 'key' | 'tool' | 'weapon' | 'consume' | 'quest' | 'note';
  usableOn?: string[];
  examineText?: string;
  puzzle?: string;
  effects?: ItemEffect[];
  tags?: string[];
}

/**
 * Effect an item can have when used
 */
export interface ItemEffect {
  type: 'heal' | 'damage' | 'mana' | 'sanity' | 'fog';
  value: number;
  duration?: number;
}

// Dialog System

/**
 * Dialog definition
 */
export interface Dialog {
  id: string;
  character: string;
  avatar?: string;
  lines: DialogLine[];
}

/**
 * Dialog line with possible responses
 */
export interface DialogLine {
  text: string;
  responses?: DialogResponse[];
  nextIndex?: number;
  speaker?: string;
  emotion?: string;
}

/**
 * Dialog response option
 */
export interface DialogResponse {
  text: string;
  nextIndex: number;
  events?: GameEvent[];
  condition?: string;
}

// Puzzle System

/**
 * Puzzle definition
 */
export interface Puzzle {
  id: string;
  name: string;
  description: string;
  type: 'riddle' | 'combination' | 'slider' | 'pattern' | 'memory' | 'order';
  difficulty: 1 | 2 | 3 | 4 | 5;
  hints: string[];
  acceptedAnswers?: string[] | string;
  data?: any;
  onSolve?: GameEvent[];
}

// Component Props

/**
 * Props for the main EdenGame component
 */
export interface EdenGameProps {
  onGameComplete?: (results: GameResults) => void;
}

/**
 * Props for the SceneView component
 */
export interface SceneViewProps {
  scene: Scene;
  onHotspotInteract: (hotspotId: string) => void;
  onExitSelect: (exitId: string) => void;
  onItemTake: (itemPlacementId: string) => void;
}

/**
 * Props for the DialogBox component
 */
export interface DialogBoxProps {
  dialog: Dialog;
  currentIndex: number;
  onSelect: (responseIndex: number) => void;
  onClose: () => void;
}

/**
 * Props for the InventoryPanel component
 */
export interface InventoryPanelProps {
  inventory: InventoryItem[];
  onItemSelect: (itemId: string) => void;
  onItemUse: (itemId: string) => void;
  onItemExamine: (itemId: string) => void;
  onItemCombine: (itemId1: string, itemId2: string) => void;
}

/**
 * Props for the StatusBar component
 */
export interface StatusBarProps {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  sanity?: number;
  maxSanity?: number;
}

/**
 * Props for the NotificationSystem component
 */
export interface NotificationSystemProps {
  notifications: GameNotification[];
  onDismiss: (notificationId: string) => void;
  onAction: (notificationId: string) => void;
}

/**
 * Props for the PuzzleInterface component
 */
export interface PuzzleInterfaceProps {
  puzzle: Puzzle;
  onSolve: () => void;
  onClose: () => void;
  onHint: () => void;
}