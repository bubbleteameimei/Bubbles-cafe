/**
 * Eden's Hollow Game Initial State
 */
import { GameConfig, PlayerState } from '../types';

/**
 * Initial player state
 */
export const initialPlayerState: PlayerState = {
  currentScene: 'intro',
  inventory: [],
  visitedScenes: [],
  sanity: 100,
  corruption: 0,
  health: 100,
  discovered: {},
  relationships: {
    'villagers': 50,
    'mayor': 50,
    'priest': 50
  },
  flags: {
    'firstVisit': true
  },
  gameOver: false
};

/**
 * Game configuration
 */
export const gameConfig: GameConfig = {
  title: "Eden's Hollow",
  startScene: 'intro',
  initialState: initialPlayerState,
  defaultSoundVolume: 0.5,
  defaultMusicVolume: 0.3,
  visuals: {
    defaultFogIntensity: 0.3,
    textSpeed: 30,
    useTypewriterEffect: true
  },
  debug: {
    enabled: true,
    startWithAllItems: false,
    invincible: false,
    showAllChoices: false
  }
};