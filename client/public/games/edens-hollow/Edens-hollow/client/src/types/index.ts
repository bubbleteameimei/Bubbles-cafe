// Game progress types
export type StoryPhase = 'introduction' | 'descent' | 'fragmentation' | 'confrontation' | 'ending';

// Story types
export interface Choice {
  id: string;
  text: string;
  sanityChange: number;
  requiredSanity?: number;
  nextPassageId: string;
  critical?: boolean;
}

export interface Passage {
  id: string;
  title?: string;
  content: string[];
  choices: Choice[];
  phase: StoryPhase;
}

export interface Story {
  id: string;
  title: string;
  startPassageId: string;
  passages: Record<string, Passage>;
  completed?: boolean;
}

// Game state
export interface GameState {
  sanity: number;
  currentStoryId: string;
  currentPassageId: string;
  completedStories: string[];
  unlockedStories: string[];
  settings: GameSettings;
}

// Game settings
export interface GameSettings {
  typewriterSpeed: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

// Modal state
export interface ModalState {
  isSettingsOpen: boolean;
  isConfirmationOpen: boolean;
  pendingChoice: Choice | null;
}
