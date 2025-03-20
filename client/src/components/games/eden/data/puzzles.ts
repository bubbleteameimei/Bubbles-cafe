import { Puzzle, GameState } from '../types';
import { GameEngine } from '../GameEngine';

/**
 * Puzzles in Eden's Hollow
 * These are interactive challenges the player must solve
 */
export const gamePuzzles: Record<string, Puzzle> = {
  // Altar puzzle in the church
  altar_puzzle: {
    id: 'altar_puzzle',
    name: 'Altar Symbols',
    type: 'pattern',
    instruction: 'Arrange the symbols in the correct order according to the inscription: "As the heavens move, life grows beneath their light. What begins in darkness reaches toward the sky."',
    options: ['Moon', 'Star', 'Sun', 'Tree', 'Flame'],
    maxAttempts: 3,
    checkSolution: (solution: string[], gameState: GameState) => {
      // The correct order: Moon, Star, Sun (heavenly bodies), then Tree, Flame (life growing)
      const correctOrder = ['Moon', 'Star', 'Sun', 'Tree', 'Flame'];
      
      if (solution.length !== correctOrder.length) {
        return false;
      }
      
      // Check if the arrays match
      for (let i = 0; i < correctOrder.length; i++) {
        if (solution[i] !== correctOrder[i]) {
          return false;
        }
      }
      
      return true;
    },
    onSolve: (engine: GameEngine) => {
      engine.addNotification('As you press the symbols in sequence, you hear a click from beneath the altar.', 'success');
      engine.updateState({
        status: { ...engine.debugState().status, altar_puzzle_solved: true }
      });
    },
    onFail: (engine: GameEngine) => {
      engine.addNotification('The symbols reset themselves. Perhaps there\'s a clue somewhere in the church.', 'warning');
    }
  },
  
  // Clock tower puzzle
  clock_puzzle: {
    id: 'clock_puzzle',
    name: 'Church Clock',
    type: 'combination',
    instruction: 'Set the four dials to the correct time. The pocket watch and the inscription might hold a clue.',
    maxAttempts: 5,
    checkSolution: (solution: string, gameState: GameState) => {
      // The correct solution is 3:17, the time shown on the pocket watch
      return solution === '317' || solution === '3:17';
    },
    onSolve: (engine: GameEngine) => {
      engine.addNotification('The clock mechanism begins to turn. The hands rotate to 3:17 and lock in place. A section of the wall slides open.', 'success');
      engine.updateState({
        status: { ...engine.debugState().status, clock_tower_activated: true }
      });
    },
    onFail: (engine: GameEngine) => {
      engine.addNotification('The dials turn but nothing happens. There must be a specific time that\'s significant.', 'warning');
    }
  },
  
  // Bookshelf puzzle in the town hall
  bookshelf_puzzle: {
    id: 'bookshelf_puzzle',
    name: 'Hidden Library',
    type: 'pattern',
    instruction: 'Arrange the books in the correct order according to the librarian\'s notes: "When arranged correctly, they tell the village\'s true history."',
    options: ['Village Founding', 'The Great Harvest', 'The Blackwood Family', 'Ancient Rituals', 'The Children\'s Fate'],
    maxAttempts: 4,
    checkSolution: (solution: string[], gameState: GameState) => {
      // The correct order tells the story chronologically
      const correctOrder = [
        'Village Founding',
        'The Blackwood Family',
        'Ancient Rituals',
        'The Children\'s Fate',
        'The Great Harvest'
      ];
      
      if (solution.length !== correctOrder.length) {
        return false;
      }
      
      // Check if the arrays match
      for (let i = 0; i < correctOrder.length; i++) {
        if (solution[i] !== correctOrder[i]) {
          return false;
        }
      }
      
      return true;
    },
    onSolve: (engine: GameEngine) => {
      engine.addNotification('As you place the last book, the entire bookshelf shudders and slides to the side, revealing a hidden room.', 'success');
      engine.updateState({
        status: { ...engine.debugState().status, bookshelf_puzzle_solved: true }
      });
    }
  },
  
  // Ritual circle puzzle
  ritual_circle: {
    id: 'ritual_circle',
    name: 'The Binding Circle',
    type: 'custom',
    instruction: 'Complete the ritual by placing the correct items on each pedestal and speaking the ritual words.',
    maxAttempts: 1, // Only one attempt allowed - high stakes!
    checkSolution: (solution: any, gameState: GameState) => {
      // This puzzle would be more complex in a full implementation
      // For now, we'll just check if the player has collected all the necessary items
      const requiredItems = [
        'strange_amulet',
        'church_candle',
        'ritual_dagger',
        'music_box',
        'pastor_diary'
      ];
      
      // Check if player has all required items
      for (const item of requiredItems) {
        if (!gameState.inventory.includes(item)) {
          return false;
        }
      }
      
      // Also require the player to have learned the ritual words
      return gameState.status.learned_ritual === true;
    },
    onSolve: (engine: GameEngine) => {
      engine.addNotification('As you complete the ritual, the ground begins to shake. Five spectral children appear around the circle, then fade away. You sense their gratitude - they have been freed.', 'success');
      engine.updateState({
        status: { ...engine.debugState().status, ritual_completed: true, game_completed: true }
      });
    },
    onFail: (engine: GameEngine) => {
      engine.addNotification('The ritual fails. You sense that you\'re missing something important - either items for the pedestals or the knowledge of how to perform the ritual properly.', 'error');
    }
  },
  
  // Music box puzzle to appease the ghost children
  music_box_puzzle: {
    id: 'music_box_puzzle',
    name: 'Ghostly Lullaby',
    type: 'memory',
    instruction: 'Play the correct lullaby sequence on the music box to calm the spectral children.',
    options: ['Soft Note', 'Medium Note', 'Loud Note'],
    maxAttempts: 5,
    checkSolution: (solution: string[], gameState: GameState) => {
      // The correct sequence mimics the children's song heard in the church
      const correctSequence = [
        'Soft Note',
        'Medium Note',
        'Soft Note',
        'Loud Note',
        'Medium Note',
        'Soft Note'
      ];
      
      if (solution.length !== correctSequence.length) {
        return false;
      }
      
      // Check if the arrays match
      for (let i = 0; i < correctSequence.length; i++) {
        if (solution[i] !== correctSequence[i]) {
          return false;
        }
      }
      
      return true;
    },
    onSolve: (engine: GameEngine) => {
      engine.addNotification('The ghostly children appear around you, humming along with the lullaby. They seem calmer now, and one points toward the church crypt.', 'success');
      engine.updateState({
        status: { ...engine.debugState().status, ghost_children_appeased: true }
      });
    }
  },
  
  // Crypt door riddle
  crypt_riddle: {
    id: 'crypt_riddle',
    name: 'Crypt Door Riddle',
    type: 'riddle',
    instruction: 'Solve the riddle inscribed on the crypt door: "I am always hungry, I must always be fed. The finger I touch, will soon turn red."',
    maxAttempts: 3,
    checkSolution: (solution: string, gameState: GameState) => {
      // The answer to the riddle is "fire"
      const answer = solution.trim().toLowerCase();
      return answer === 'fire' || answer === 'flame';
    },
    onSolve: (engine: GameEngine) => {
      engine.addNotification('As you speak the answer, the crypt door creaks open, revealing a stone staircase descending into darkness.', 'success');
      engine.updateState({
        status: { ...engine.debugState().status, crypt_riddle_solved: true }
      });
    },
    onFail: (engine: GameEngine) => {
      engine.addNotification('Nothing happens. The door remains firmly shut.', 'warning');
    }
  },
  
  // Innkeeper's cellar lock combination
  cellar_lock: {
    id: 'cellar_lock',
    name: 'Cellar Padlock',
    type: 'combination',
    instruction: 'Enter the three-digit combination for the padlock. The innkeeper mentioned "the year it all changed" might be the key.',
    maxAttempts: 5,
    checkSolution: (solution: string, gameState: GameState) => {
      // The correct combination is 891 - from 1891, the year mentioned throughout the game
      return solution === '891' || solution === '1891';
    },
    onSolve: (engine: GameEngine) => {
      engine.addNotification('The padlock clicks open. You can now access the inn\'s cellar.', 'success');
      engine.updateState({
        status: { ...engine.debugState().status, cellar_unlocked: true }
      });
    }
  }
};