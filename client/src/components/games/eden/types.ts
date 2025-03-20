// Game state types
export interface GameState {
  currentScene: string;
  inventory: string[];
  visitedScenes: Set<string>;
  playerHealth: number;
  playerMana: number;
  puzzlesSolved: Set<string>;
  gameProgress: number;
  choices: Record<string, string>;
  characterName: string;
  currentDialog: DialogData | null;
  activePuzzle: PuzzleData | null;
  gameOver: boolean;
  showMap: boolean;
  showInventory: boolean;
}

// Item types
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'weapon' | 'key' | 'artifact' | 'consumable';
  useAction?: string;
  damage?: number;
  properties?: string[];
}

// Dialog types
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
  requirement?: {
    item?: string;
    puzzle?: string;
    choice?: {
      key: string;
      value: string;
    }
  };
}

// Puzzle types
export type PuzzleType = 'runes' | 'pattern' | 'riddle' | 'combination' | 'sacrifice';

export interface PuzzleData {
  id: string;
  type: PuzzleType;
  title: string;
  description: string;
  data: any; // Specific data for each puzzle type
  solved: boolean;
  attempts: number;
  maxAttempts?: number;
  hint?: string;
}

// Scene types
export interface SceneData {
  id: string;
  text: string[];
  image?: string;
  background?: string;
  choices: SceneChoice[];
  triggers?: SceneTrigger[];
  items?: string[];
}

export interface SceneChoice {
  text: string;
  nextScene: string;
  condition?: {
    item?: string;
    puzzle?: string;
    choice?: {
      key: string;
      value: string;
    };
    health?: number;
    mana?: number;
  };
  consequences?: {
    addItem?: string;
    removeItem?: string;
    health?: number;
    mana?: number;
    progress?: number;
    setChoice?: {
      key: string;
      value: string;
    };
  };
}

export interface SceneTrigger {
  type: 'dialog' | 'puzzle' | 'combat' | 'item' | 'status';
  condition?: {
    item?: string;
    puzzle?: string;
    choice?: {
      key: string;
      value: string;
    };
    health?: number;
    mana?: number;
    visitCount?: number;
  };
  data: any; // Specific data for each trigger type
}

// Map types
export interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'castle' | 'forest' | 'dungeon' | 'village' | 'ritual' | 'cliff';
  connections: string[];
  accessible: boolean;
  discovered: boolean;
}