// Game state types
export interface GameState {
  currentSceneId: string;
  previousSceneId: string | null;
  inventory: Inventory;
  score: Record<string, number>;
  status: Record<string, boolean>;
  player: PlayerStatus;
  visitedScenes: Set<string>;
  activeDialogId: string | null;
  dialogIndex: number;
  currentPuzzleId: string | null;
  notificationQueue: Notification[];
  lastAction: string | null;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
}

export interface GameContext {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export interface Inventory {
  items: Item[];
  get: (id: string) => Item | undefined;
  add: (item: Item) => boolean;
  remove: (id: string) => boolean;
  has: (id: string) => boolean;
  filter: (predicate: (id: string) => boolean) => Item[];
  map: <T>(callback: (itemId: string, item: Item) => T) => T[];
}

export interface PlayerStatus {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;
  status: string[];
}

// Action types
export type GameAction =
  | { type: 'MOVE_TO_SCENE'; sceneId: string }
  | { type: 'ADD_ITEM'; item: Item }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'USE_ITEM'; itemId: string; targetId: string }
  | { type: 'UPDATE_STATUS'; status: Record<string, boolean> }
  | { type: 'ADD_SCORE'; key: string; value: number }
  | { type: 'START_DIALOG'; dialogId: string }
  | { type: 'ADVANCE_DIALOG'; responseIndex?: number }
  | { type: 'END_DIALOG' }
  | { type: 'START_PUZZLE'; puzzleId: string }
  | { type: 'SUBMIT_PUZZLE_SOLUTION'; solution: string[] }
  | { type: 'END_PUZZLE'; success: boolean }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'CLEAR_NOTIFICATION'; id: string }
  | { type: 'UPDATE_HEALTH'; value: number }
  | { type: 'UPDATE_MANA'; value: number }
  | { type: 'UPDATE_STATE'; partialState: Partial<GameState> };

// Scene types
export interface Scene {
  id: string;
  name: string;
  description: string;
  backgroundImage: string;
  features: SceneFeature[];
  exits: SceneExit[];
  events?: SceneEvent[];
  ambientSound?: string;
}

export interface SceneFeature {
  id: string;
  name: string;
  description: string;
  position: {
    top: string;
    left: string;
  };
  isInteractive: boolean;
  isHidden?: boolean;
  requiredStatus?: Record<string, boolean>;
  requiredItems?: string[];
  interactions: SceneInteraction[];
}

export interface SceneInteraction {
  id: string;
  name: string;
  action: 'examine' | 'collect' | 'use' | 'interact';
  condition?: {
    requiredItems?: string[];
    requiredStatus?: Record<string, boolean>;
  };
  outcome: InteractionOutcome;
}

export interface InteractionOutcome {
  success?: GameEffect;
  failure?: GameEffect;
  status?: Record<string, boolean>;
  notification?: Notification;
  dialog?: string;
  item?: string;
  scene?: string;
  puzzle?: string;
}

export interface GameEffect {
  health?: number;
  mana?: number;
  status?: Record<string, boolean>;
}

export interface SceneExit {
  id: string;
  name: string;
  description: string;
  targetScene: string;
  position: {
    top: string;
    left: string;
  };
  isHidden?: boolean;
  requiredStatus?: Record<string, boolean>;
  requiredItems?: string[];
}

export interface SceneEvent {
  trigger: 'entry' | 'exit' | 'timer';
  delay?: number;
  condition?: {
    requiredItems?: string[];
    requiredStatus?: Record<string, boolean>;
  };
  outcome: InteractionOutcome;
}

// Dialog types
export interface Dialog {
  id: string;
  character: Character;
  content: DialogSegment[];
}

export interface Character {
  id: string;
  name: string;
  avatarImage: string;
  nameColor: string;
}

export interface DialogSegment {
  speaker: string;
  text: string;
  responses: DialogResponse[];
}

export interface DialogResponse {
  text: string;
  nextIndex: number;
  condition?: {
    requiredItems?: string[];
    requiredStatus?: Record<string, boolean>;
  };
  outcome?: InteractionOutcome;
}

// Item types
export interface Item {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  usable: boolean;
  useableOn?: string[];
  effects?: ItemEffect[];
  isConsumable?: boolean;
  destroyOnUse?: boolean;
  quantity: number;
  category?: string;
}

export interface ItemEffect {
  type: string;
  value: number;
  duration?: number;
}

// Puzzle types
export interface Puzzle {
  id: string;
  title: string;
  description: string;
  type: 'combination' | 'pattern' | 'sequence' | 'riddle';
  solution: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  pattern?: string[][];
  initialState?: string[];
  inputs?: PuzzleInput[];
  options?: PuzzleOption[];
  items?: string[];
  hints: string[];
  maxAttempts?: number;
  currentAttempt?: number;
  reward: InteractionOutcome;
}

export interface PuzzleInput {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
}

export interface PuzzleOption {
  id: string;
  text: string;
}

// Notification types
export type NotificationType = 'info' | 'warning' | 'discovery' | 'achievement' | 'error' | 'success';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  autoDismiss?: boolean;
}

// UI component props
export interface LoadingScreenProps {
  message: string;
  isLoading: boolean;
}

export interface SceneViewProps {
  scene: Scene;
  onFeatureClick?: (featureId: string) => void;
  onExitClick?: (exitId: string) => void;
  onActionClick?: (actionId: string) => void;
}

export interface DialogBoxProps {
  dialog: Dialog;
  currentIndex: number;
  onResponseClick: (responseIndex: number) => void;
  onClose: () => void;
}

export interface InventoryPanelProps {
  inventory: Inventory;
  onItemClick: (itemId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface NotificationProps {
  notification: Notification;
  onDismiss: () => void;
}

export interface GameOptions {
  initialScene: string;
  debugMode?: boolean;
  autoSave?: boolean;
}

export interface PuzzleInterfaceProps {
  puzzle: Puzzle;
  onSubmit: (solution: string[]) => void;
  onClose: () => void;
}

// Utility type for mix-blend-mode CSS property
export type MixBlendMode = 
  'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 
  'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 
  'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';