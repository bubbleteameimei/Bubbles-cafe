/**
 * Eden's Hollow - Game Engine Types
 * Defines all the interfaces and types for the game engine
 */

// Scene types
export type LightingLevel = 'bright' | 'dim' | 'dark' | 'eerie';
export type TransitionType = 'fade' | 'slide' | 'dissolve';
export type SceneType = 'exterior' | 'interior' | 'underground';

// Puzzle types
export type PuzzleType = 'sequence' | 'code' | 'choice' | 'item-placement';
export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

// Item types
export type ItemType = 'key' | 'tool' | 'document' | 'consumable' | 'quest' | 'misc';

// Dialog types
export type DialogType = 'conversation' | 'monologue' | 'narration' | 'thought';

// Effect types
export type EffectType = 'health' | 'mana' | 'sanity' | 'flag' | 'item' | 'dialog' | 'scene' | 'time';

// Action types
export type ActionType = 'setFlag' | 'giveItem' | 'removeItem' | 'showDialog' | 'changeScene' | 'modifyStat' | 'showPuzzle' | 'advanceTime';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Position types
export type Position = 'top' | 'middle' | 'bottom';
export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

// Lock types
export type LockType = 'item' | 'flag' | 'puzzle';

// Hotspot types
export type HotspotShape = 'rectangle' | 'circle';

// Game state interfaces
export interface GameState {
  player: PlayerState;
  inventory: InventoryItem[];
  currentScene: string;
  visitedScenes: string[];
  flags: Record<string, boolean | number | string>;
  gameTime: number; // In minutes
  activeEffects: GameEffect[];
  isGameOver: boolean;
  gameOverReason?: string;
  currentDialog?: Dialog;
  currentPuzzle?: Puzzle;
  hintsDisabled: boolean;
}

export interface PlayerState {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  sanity: number;
  maxSanity: number;
  level: number;
  experience: number;
}

export interface GameEffect {
  type: EffectType;
  value: number | string | boolean;
  duration?: number; // In minutes
  icon?: string;
  description?: string;
}

// Scene interfaces
export interface Scene {
  id: string;
  name?: string;
  description?: string;
  backgroundImage?: string;
  lighting?: LightingLevel;
  type?: SceneType;
  hotspots?: Hotspot[];
  exits?: Exit[];
  items?: SceneItem[];
  entryDialog?: string;
  hints?: string[];
  transition?: SceneTransition;
  overlayEffect?: string;
  playerEffects?: GameEffect[];
  environmentEffectsOverTime?: GameEffect[];
  minimapPosition?: { x: number; y: number };
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: HotspotShape;
  tooltip?: string;
  description?: string;
  dialogId?: string;
  puzzleId?: string;
  visible?: boolean;
  requiresItem?: string;
  requiresFlag?: string;
  interactionEffects?: GameEffect[];
}

export interface Exit {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetScene: string;
  locked?: boolean;
  lockType?: LockType;
  requiredItem?: string;
  requiredFlag?: string;
  tooltip?: string;
  lockedTooltip?: string;
  lockedMessage?: string;
  icon?: string;
  name?: string;
}

export interface SceneItem {
  id: string;
  itemId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tooltip?: string;
  visualCue?: boolean;
  condition?: string;
  icon?: string;
}

export interface SceneTransition {
  type: TransitionType;
  duration: number;
  sound?: string;
}

// Inventory interfaces
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type?: ItemType;
  imageUrl?: string;
  quantity?: number;
  stackable?: boolean;
  usable?: boolean;
  combinable?: boolean;
  canCombineWith?: string[];
  effects?: GameEffect[];
  useDialog?: string;
  useEffects?: GameEffect[];
  pickupDialog?: string;
  discoveredAt?: number;
  properties?: Record<string, string | number | boolean>;
  lore?: string;
  consumable?: boolean;
}

// Dialog interfaces
export interface Dialog {
  id: string;
  type: DialogType;
  text: string;
  choices?: DialogChoice[];
  character?: string;
  characterImage?: string;
  nextDialog?: string;
  endEffects?: GameEffect[];
  position?: Position;
  requireFlags?: Record<string, boolean | number | string>;
  requireItems?: string[];
  oneTime?: boolean;
  content?: string; // Alternative to text for backward compatibility
}

export interface DialogChoice {
  text: string;
  nextDialog?: string;
  effects?: DialogEffect[];
  requireItem?: string;
  requireFlag?: string;
  disabled?: boolean;
}

export interface DialogEffect {
  type: string;
  value?: any;
  target?: string;
}

// Puzzle interfaces
export interface Puzzle {
  id: string;
  type: PuzzleType;
  solution: string | string[] | number | Record<string, number>;
  difficulty: PuzzleDifficulty;
  attempts?: number;
  maxAttempts?: number;
  hints?: string[];
  solveEffects?: GameEffect[];
  completionDialog?: string;
  
  // Additional properties for different puzzle types
  items?: string[];
  inputType?: string;
  placeholder?: string;
  choices?: string[];
  positions?: { id: string; name: string }[];
  name?: string;
  description?: string;
  successMessage?: string;
  failureMessage?: string;
  hint?: string;
}

// Action interfaces
export interface GameAction {
  type: ActionType;
  // Flag action
  flag?: string;
  value?: any;
  // Item action
  itemId?: string;
  // Dialog action
  dialogId?: string;
  // Scene action
  sceneId?: string;
  transitionType?: TransitionType;
  // Stat action
  stat?: 'health' | 'mana' | 'sanity';
  absolute?: boolean;
  // Puzzle action
  puzzleId?: string;
  // Time action
  minutes?: number;
}

// Notification interfaces
export interface GameNotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  timestamp?: number;
  details?: string;
  customClass?: string;
}

// Component props interfaces
export interface EdenGameProps {
  onExit?: () => void;
}

export interface StatusBarProps {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  sanity: number;
  maxSanity: number;
  showLabels?: boolean;
  compact?: boolean;
}

export interface DialogBoxProps {
  text: string;
  choices?: DialogChoice[];
  onClose?: () => void;
  onChoiceSelect?: (choice: DialogChoice) => void;
  typewriterSpeed?: number;
  showCloseButton?: boolean;
  characterName?: string;
  characterImage?: string;
  position?: Position;
}

export interface InventoryPanelProps {
  inventory: InventoryItem[];
  onItemUse?: (itemId: string) => void;
  onItemInspect?: (itemId: string) => void;
  onItemCombine?: (itemId1: string, itemId2: string) => void;
  onClose?: () => void;
}

export interface SceneViewProps {
  scene: Scene;
  onHotspotInteract?: (hotspotId: string) => void;
  onExitSelect?: (exitId: string) => void;
  onItemTake?: (itemId: string) => void;
  visitedExits?: string[];
  inventoryItems?: InventoryItem[];
}

export interface PuzzleInterfaceProps {
  puzzle: Puzzle;
  onSolve?: () => void;
  onClose?: () => void;
  onHint?: () => void;
  isOpen?: boolean;
  attempts?: number;
  maxAttempts?: number;
}

export interface NotificationProps {
  notifications: GameNotification[];
  onNotificationClose?: (notification: GameNotification) => void;
  maxVisible?: number;
  autoHideDuration?: number;
  position?: NotificationPosition;
}

// Game engine interfaces
export interface GameEngineConfig {
  initialScene: string;
  showIntro?: boolean;
  enableHints?: boolean;
  enableAutoSave?: boolean;
  saveInterval?: number;
  debugMode?: boolean;
  difficultyLevel?: 'easy' | 'normal' | 'hard';
}

export interface SaveData {
  gameState: GameState;
  saveDate: string;
  playTime: number;
  version: string;
}