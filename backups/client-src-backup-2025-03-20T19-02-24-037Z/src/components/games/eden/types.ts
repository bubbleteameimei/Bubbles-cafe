/**
 * Eden's Hollow Game Type Definitions
 */

// Game state
export interface GameState {
  currentScene: string;
  inventory: InventoryItem[];
  collectedItems: string[];
  unlockedScenes: string[];
  completedPuzzles: string[];
  triggeredEvents: string[];
  gameFlags: Record<string, boolean>;
  playerStats: PlayerStats;
  activeDialogId: string | null;
  activePuzzleId: string | null;
  activeNotifications: GameNotification[];
  gameProgress: number;
  selectedInventoryItem: string | null;
}

// Player statistics and attributes
export interface PlayerStats {
  health: number;
  maxHealth: number;
  sanity: number;
  maxSanity: number;
  mana: number;
  maxMana: number;
  strength: number;
  perception: number;
  effects: StatusEffect[];
}

// Status effect (buffs/debuffs)
export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number;
  remaining: number;
  effectType: 'buff' | 'debuff' | 'neutral';
  effects: Record<string, number>;
}

// Scene definition
export interface Scene {
  id: string;
  name: string;
  description: string;
  backgroundUrl: string;
  overlayUrl?: string;
  foregroundUrl?: string;
  blurAmount?: number;
  ambientSound?: string;
  ambientEffects?: SceneEffect[];
  lighting?: 'bright' | 'dim' | 'dark' | 'eerie';
  hotspots: Hotspot[];
  exits: Exit[];
  items: SceneItem[];
  requiredItemId?: string;
  requiredFlag?: string;
  onEnter?: string;
  onExit?: string;
}

// Scene visual effect
export interface SceneEffect {
  id: string;
  type: 'fog' | 'rain' | 'snow' | 'sparks' | 'dust' | 'lightning';
  intensity: number;
  color?: string;
  zIndex?: number;
}

// Interactable hotspot in a scene
export interface Hotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'inspect' | 'interact' | 'dialog' | 'puzzle';
  tooltip?: string;
  description?: string;
  dialogId?: string;
  puzzleId?: string;
  requiredItem?: string;
  requiredFlag?: string;
  grantFlag?: string;
  imageUrl?: string;
  hoverImageUrl?: string;
  onClick?: string;
  onInspect?: string;
}

// Scene exit point
export interface Exit {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetScene: string;
  type: 'door' | 'path' | 'ladder' | 'portal' | 'window';
  tooltip?: string;
  description?: string;
  locked?: boolean;
  lockState?: 'locked' | 'unlocked' | 'sealed';
  keyItemId?: string;
  requiredFlag?: string;
  onUsed?: string;
}

// Item in a scene
export interface SceneItem {
  id: string;
  itemId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  iconUrl?: string;
  tooltip?: string;
  condition?: string;
  requiredFlag?: string;
  onPickup?: string;
}

// Inventory item
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  detailImageUrl?: string;
  category?: 'quest' | 'weapon' | 'key' | 'consumable' | 'document' | 'tool' | 'artifact' | 'container';
  value?: number;
  weight?: number;
  combinable?: boolean;
  combinableWith?: string[];
  usableOn?: string[];
  notes?: string;
  effects?: {
    health?: number;
    sanity?: number;
    mana?: number;
    [key: string]: number | undefined;
  };
  onUse?: string;
  onCombine?: string;
  metadata?: Record<string, any>;
}

// Dialog definitions
export interface Dialog {
  id: string;
  sequence: DialogSequence[];
  startAt: string;
  metadata?: Record<string, any>;
}

// Dialog sequence
export interface DialogSequence {
  id: string;
  dialogs: CurrentDialog[];
  choices?: DialogChoice[];
  next?: string;
  condition?: string;
  onComplete?: string;
}

// Current dialog being displayed
export interface CurrentDialog {
  id: string;
  speaker: string | { name: string; color: string };
  text: string;
  choices?: DialogChoice[];
  effects?: DialogEffect[];
  continueText?: string;
  onDisplay?: string;
}

// Dialog choice option
export interface DialogChoice {
  id: string;
  text: string;
  disabled?: boolean;
  requiredFlag?: string;
  requiredItem?: string;
  grantFlag?: string;
  next?: string;
  effects?: DialogEffect[];
  onSelect?: string;
}

// Effect of dialog on game state
export interface DialogEffect {
  type: 'health' | 'sanity' | 'mana' | 'item' | 'flag';
  value: number | string | boolean;
  target?: string;
}

// Puzzle definition
export interface Puzzle {
  id: string;
  type: PuzzleType;
  title: string;
  question: string;
  difficulty: PuzzleDifficulty;
  solution: string | string[];
  items?: string[];
  hints?: string[];
  maxAttempts?: number;
  context?: string;
  hintAfterAttempts?: number;
  multiSelect?: boolean;
  reward?: {
    item?: string;
    flag?: string;
    effect?: DialogEffect[];
  };
  onComplete?: string;
  onFail?: string;
}

// Puzzle types
export type PuzzleType = 'sequence' | 'choice' | 'combination' | 'text' | 'code' | 'word';

// Puzzle difficulty levels
export type PuzzleDifficulty = 1 | 2 | 3;

// Game notification
export interface GameNotification {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'achievement' | 'item' | 'quest';
  title?: string;
  message: string;
  iconUrl?: string;
  duration?: number;
  autoDismiss?: boolean;
  onDismiss?: string;
}

// Component props interfaces
export interface SceneViewProps {
  scene: Scene;
  onHotspotClick: (hotspotId: string) => void;
  onExitClick: (exitId: string) => void;
  onItemClick: (itemId: string) => void;
  activeInventoryItem: string | null;
  lighting: string;
  fogAmount: number;
  effectFilters: Record<string, boolean>;
}

export interface DialogBoxProps {
  currentDialog: CurrentDialog | null;
  isOpen: boolean;
  onClose: () => void;
  onChoiceSelect: (choice: DialogChoice) => void;
  autoAdvance?: boolean;
  typingSpeed?: number;
}

export interface InventoryPanelProps {
  items: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onItemSelect?: (itemId: string) => void;
  onItemCombine?: (sourceId: string, targetId: string) => void;
  onItemExamine?: (itemId: string) => void;
  selectedItemId?: string | null;
}

export interface PuzzleInterfaceProps {
  puzzle: Puzzle | null;
  isOpen: boolean;
  onClose: () => void;
  onSolve?: (puzzleId: string) => void;
  onHint?: (puzzleId: string) => void;
}

export interface StatusBarProps {
  stats: PlayerStats;
  effects?: StatusEffect[];
}

export interface NotificationProps {
  notifications: GameNotification[];
  onDismiss: (id: string) => void;
}

export interface EdenGameProps {
  initialState?: Partial<GameState>;
  onProgress?: (progress: number) => void;
  onCompletion?: () => void;
  debugMode?: boolean;
}

// Game engine event handlers and utilities
export interface GameAction {
  type: string;
  payload?: any;
}

export interface GameReducer {
  (state: GameState, action: GameAction): GameState;
}

export interface GameEvent {
  id: string;
  condition: string;
  actions: string[];
  once?: boolean;
  triggered?: boolean;
}

export interface GameCondition {
  (state: GameState): boolean;
}

export interface SaveGame {
  saveDate: string;
  gameState: GameState;
  screenshot?: string;
  playTime: number;
  version: string;
}