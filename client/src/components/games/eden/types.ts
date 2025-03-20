/**
 * Interface definitions for the Eden's Hollow game
 */

// Game state interface
export interface GameState {
  currentScene: string;
  inventory: Item[];
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  status: Record<string, boolean>;
  visitedScenes: string[];
  activeDialog: string | null;
  notifications: Notification[];
  activePuzzle: string | null;
  solvedPuzzles: string[];
  interactedHotspots: string[];
  gameTime: number; // In-game time in minutes (0-1440, representing a day)
  fogLevel: number; // 0-100, affects visibility
}

// Scene Interface
export interface Scene {
  id: string;
  name: string;
  description: string;
  background: string;
  ambient: AmbientSound;
  hotspots: Hotspot[];
  exits: Exit[];
  items: ItemPlacement[];
  onEnter?: SceneEffect;
  onExit?: SceneEffect;
  lighting?: 'normal' | 'dark' | 'fog' | 'moonlight';
}

// Ambient Sound Interface
export interface AmbientSound {
  sound: string;
  volume?: number;
  loop?: boolean;
}

// Scene Effect Interface
export interface SceneEffect {
  message?: string;
  status?: Record<string, boolean>;
  dialog?: string;
  notification?: Notification;
  damage?: number;
  heal?: number;
  mana?: number;
  item?: string;
  removeItem?: string;
  fogChange?: number;
}

// Hotspot Interface
export interface Hotspot {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: 'examine' | 'take' | 'use' | 'puzzle' | 'dialog' | 'custom';
  onInteract?: SceneEffect;
  condition?: Condition;
  puzzle?: string;
  requiresItem?: string;
  animation?: string;
  // For custom actions
  customAction?: (gameState: GameState) => GameState;
}

// Exit Interface
export interface Exit {
  id: string;
  name: string;
  description: string;
  targetScene: string | null;
  condition?: Condition;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onInteract?: SceneEffect;
  transition?: 'fade' | 'slide' | 'dissolve';
}

// Item Interface
export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'key' | 'weapon' | 'tool' | 'consumable' | 'quest' | 'note' | 'artifact';
  quantity: number;
  usable: boolean;
  isConsumable: boolean;
  effects?: Effect[];
  metadata?: Record<string, any>;
  condition?: Condition;
  onUse?: (gameState: GameState, targetId?: string) => GameState;
}

// Item Placement Interface (for items in scenes)
export interface ItemPlacement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  condition?: Condition;
  animation?: string;
}

// Effect Interface (for items, puzzles, etc.)
export interface Effect {
  type: 'health' | 'mana' | 'status' | 'damage' | 'visibility' | 'special';
  value: number | Record<string, boolean> | string;
  duration?: number;
}

// Condition Interface
export interface Condition {
  item?: string;
  hasItem?: boolean;
  status?: Record<string, boolean>;
  health?: { min?: number; max?: number };
  mana?: { min?: number; max?: number };
  gameTime?: { min?: number; max?: number };
  dialog?: string;
  mustBeCompleted?: boolean;
  puzzle?: string;
  mustBeSolved?: boolean;
  fogLevel?: { min?: number; max?: number };
  hotspot?: string;
  mustBeInteracted?: boolean;
  visitedScene?: string;
  customCondition?: (gameState: GameState) => boolean;
}

// Notification Interface
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'discovery' | 'success' | 'danger';
  duration: number;
  autoDismiss: boolean;
  icon?: string;
  actionText?: string;
  onAction?: (gameState: GameState) => GameState;
}

// Dialog Interface
export interface Dialog {
  id: string;
  content: DialogSegment[];
  condition?: Condition;
  onComplete?: SceneEffect;
}

// Dialog Segment Interface
export interface DialogSegment {
  text: string;
  speaker: {
    name: string;
    color: string;
    portrait?: string;
  };
  responses?: DialogResponse[];
  animation?: string;
  sfx?: string;
  nextIndex?: number;
}

// Dialog Response Interface
export interface DialogResponse {
  text: string;
  nextIndex: number;
  condition?: Condition;
  outcome?: SceneEffect;
}

// Puzzle Interface
export interface Puzzle {
  id: string;
  type: 'combination' | 'slider' | 'pattern' | 'riddle' | 'lock';
  title: string;
  description: string;
  solution: string[];
  pieces?: string[];
  attempts: number;
  hints?: string[];
  image?: string;
  reward?: SceneEffect;
  onFail?: SceneEffect;
  condition?: Condition;
  maxAttempts?: number;
}

// Character Interface for NPCs
export interface Character {
  id: string;
  name: string;
  portrait: string;
  description: string;
  dialogStyle: {
    color: string;
    font?: string;
    speed?: number;
  };
  initialDialog: string;
  condition?: Condition;
  animation?: string;
}

// Game Engine Interface
export interface GameEngine {
  initGame: () => GameState;
  loadGame: (savedState: string) => GameState;
  saveGame: (state: GameState) => string;
  changeScene: (state: GameState, sceneId: string) => GameState;
  interactWithHotspot: (state: GameState, hotspotId: string) => GameState;
  useItem: (state: GameState, itemId: string, targetId?: string) => GameState;
  takeItem: (state: GameState, itemId: string) => GameState;
  showDialog: (state: GameState, dialogId: string) => GameState;
  selectDialogOption: (state: GameState, optionIndex: number) => GameState;
  attemptPuzzle: (state: GameState, puzzleId: string, attempt: string[]) => GameState;
  addNotification: (state: GameState, notification: Notification) => GameState;
  dismissNotification: (state: GameState, notificationId: string) => GameState;
  updateGameTime: (state: GameState, minutes: number) => GameState;
  changeFogLevel: (state: GameState, amount: number) => GameState;
  applyEffect: (state: GameState, effect: Effect) => GameState;
  checkCondition: (state: GameState, condition: Condition) => boolean;
}

// Props for various UI components
export interface DialogBoxProps {
  dialog: Dialog;
  currentIndex: number;
  onSelect: (optionIndex: number) => void;
  onClose: () => void;
}

export interface SceneViewProps {
  scene: Scene;
  gameState: GameState;
  onHotspotInteract: (hotspotId: string) => void;
  onExitSelect: (exitId: string) => void;
  onItemTake: (itemId: string) => void;
}

export interface InventoryPanelProps {
  items: Item[];
  onItemUse: (itemId: string) => void;
  onItemInspect: (itemId: string) => void;
}

export interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (notificationId: string) => void;
  onAction: (notificationId: string) => void;
}

export interface PuzzleInterfaceProps {
  puzzle: Puzzle;
  onAttempt: (attempt: string[]) => void;
  onClose: () => void;
}

export interface StatusBarProps {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gameTime: number;
  fogLevel: number;
}