import { Puzzle } from '../types';

/**
 * Game puzzles to be solved
 */
export const gamePuzzles: Record<string, Puzzle> = {
  altar_puzzle: {
    id: 'altar_puzzle',
    name: 'Altar Symbols',
    type: 'order',
    description: 'Arrange the symbols in the correct order according to the ritual.',
    hints: [
      'The ancient text mentions "as the day progresses"...',
      'The symbols represent celestial bodies and natural elements.',
      'Moon begins the night, and flame marks its end.'
    ],
    solution: [1, 3, 5, 2, 4], // Moon, Star, Sun, Tree, Flame
    items: [
      { id: 1, name: 'Moon' },
      { id: 2, name: 'Tree' },
      { id: 3, name: 'Star' },
      { id: 4, name: 'Flame' },
      { id: 5, name: 'Sun' }
    ],
    initialState: [2, 4, 1, 5, 3],
    maxAttempts: 5,
    reward: {
      status: { altar_solved: true },
      notification: {
        id: 'altar-solved',
        message: 'The symbols align correctly. The wall behind the altar slowly opens, revealing a hidden passage.',
        type: 'discovery'
      }
    }
  },
  
  clock_puzzle: {
    id: 'clock_puzzle',
    name: 'Clock Tower Mechanism',
    type: 'combination',
    description: 'Set the clock to the correct time to restart the mechanism.',
    hints: [
      'The time is frozen for a reason...',
      'Check historical records for significant events.',
      'The journal mentions a terrible event at a specific time.'
    ],
    solution: {
      hour: '3',
      minute: '17',
      second: '42'
    },
    inputs: [
      { id: 'hour', label: 'Hour' },
      { id: 'minute', label: 'Minute' },
      { id: 'second', label: 'Second' }
    ],
    maxAttempts: 3,
    reward: {
      status: { clock_fixed: true },
      item: 'clockwork_gear',
      notification: {
        id: 'clock-fixed',
        message: 'The clock mechanism whirs to life! As the hands move, a small compartment opens, revealing a clockwork gear.',
        type: 'discovery'
      }
    }
  },
  
  mirror_puzzle: {
    id: 'mirror_puzzle',
    name: 'Reflection of Truth',
    type: 'selection',
    description: 'The silver mirror shows ghostly reflections. Choose the one that speaks the truth.',
    hints: [
      'The youngest always tells the truth...',
      'Compare what you know about the village history.',
      'The children in the photograph might provide a clue.'
    ],
    solution: 'child',
    options: [
      { id: 'elder', label: 'Elderly Man', value: 'elder' },
      { id: 'woman', label: 'Young Woman', value: 'woman' },
      { id: 'child', label: 'Small Child', value: 'child' },
      { id: 'priest', label: 'Village Priest', value: 'priest' }
    ],
    maxAttempts: 1,
    reward: {
      status: { truth_revealed: true },
      notification: {
        id: 'truth-revealed',
        message: 'The child's reflection speaks: "The ritual was never completed. We remain between worlds, forever at dusk."',
        type: 'discovery'
      }
    }
  },
  
  door_code_puzzle: {
    id: 'door_code_puzzle',
    name: 'Locked Cellar Door',
    type: 'combination',
    description: 'The cellar door has a combination lock with 4 digits.',
    hints: [
      'Look for dates around the church...',
      'The gravestones might hold the answer.',
      'The year the children died might be significant.'
    ],
    solution: {
      digit1: '1',
      digit2: '8',
      digit3: '9',
      digit4: '1'
    },
    inputs: [
      { id: 'digit1', label: '1st Digit' },
      { id: 'digit2', label: '2nd Digit' },
      { id: 'digit3', label: '3rd Digit' },
      { id: 'digit4', label: '4th Digit' }
    ],
    maxAttempts: 5,
    reward: {
      status: { cellar_unlocked: true },
      notification: {
        id: 'cellar-unlocked',
        message: 'The lock mechanism clicks and the heavy cellar door creaks open.',
        type: 'success'
      }
    }
  },
  
  ritual_puzzle: {
    id: 'ritual_puzzle',
    name: 'Complete the Ritual',
    type: 'order',
    description: 'Place the ritual items in the correct positions to complete the interrupted ceremony.',
    hints: [
      'The journal describes the proper arrangement...',
      'The five positions match the five children.',
      'Each element corresponds to a specific child.'
    ],
    solution: [1, 3, 5, 2, 4], // Candle, Amulet, Mirror, Herb, Journal
    items: [
      { id: 1, name: 'Ritual Candle' },
      { id: 2, name: 'Healing Herb' },
      { id: 3, name: 'Strange Amulet' },
      { id: 4, name: 'Ancient Journal' },
      { id: 5, name: 'Silver Mirror' }
    ],
    initialState: [5, 1, 4, 2, 3],
    maxAttempts: 1,
    reward: {
      status: { ritual_completed: true },
      notification: {
        id: 'ritual-completed',
        message: 'As you place the final item, the ghostly figures of five children appear. "Thank you for setting us free," they whisper as they fade away. The eternal dusk lifts, and sunlight begins to stream into Eden's Hollow.',
        type: 'discovery'
      }
    }
  }
};