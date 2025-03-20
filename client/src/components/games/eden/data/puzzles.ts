import { Puzzle } from '../types';

// Map of all game puzzles
const puzzles: Record<string, Puzzle> = {
  // Combination lock puzzle in the abandoned store
  'store_safe': {
    id: 'store_safe',
    type: 'combination',
    title: 'General Store Safe',
    description: 'An old combination safe behind the store counter. It has three dials, each with numbers from 0-9. The metal is rusted, but the mechanism seems intact.',
    solution: ['4', '2', '7'],
    pieces: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    attempts: 0,
    hints: [
      'Look for any dates or significant numbers around the store.',
      'The shopkeeper might have hidden the combination somewhere nearby.',
      'Check the ledger on the counter for any unusual entries.'
    ],
    image: '/assets/eden/puzzles/store_safe.jpg',
    reward: {
      item: 'rusted_lantern',
      message: 'The safe opens with a creak. Inside, you find an old lantern that still appears to be functional.',
      notification: {
        id: 'safe_solved',
        type: 'success',
        message: 'You\'ve successfully opened the old safe!',
        duration: 5000,
        autoDismiss: true
      }
    }
  },
  
  // Pattern puzzle in town hall
  'ritual_pattern': {
    id: 'ritual_pattern',
    type: 'pattern',
    title: 'Ritual Symbol Arrangement',
    description: 'A circular indentation in the floor with five stone symbols scattered nearby. Each symbol seems to fit into specific slots around the circle.',
    solution: ['moon', 'tree', 'eye', 'crown', 'hand'],
    pieces: ['moon', 'tree', 'eye', 'crown', 'hand', 'star'],
    attempts: 0,
    hints: [
      'The symbols may need to be arranged in a specific order.',
      'Look for clues in the murals on the walls.',
      'The order might relate to the village\'s history.'
    ],
    image: '/assets/eden/puzzles/ritual_symbols.jpg',
    reward: {
      status: { 'ritual_completed': true },
      message: 'As you place the last symbol, the floor begins to rumble. The center of the circle descends, revealing a hidden staircase.',
      notification: {
        id: 'ritual_solved',
        type: 'discovery',
        message: 'You\'ve discovered a hidden passage beneath the town hall!',
        duration: 5000,
        autoDismiss: true
      }
    }
  },
  
  // Riddle puzzle by the whispering well
  'well_riddle': {
    id: 'well_riddle',
    type: 'riddle',
    title: 'The Whispering Well',
    description: 'An ancient well with strange inscriptions around its rim. A voice emanates from the depths, posing a riddle that seems to require a spoken answer.',
    solution: ['silence', 'nothing'],
    attempts: 0,
    hints: [
      'The answer is something intangible.',
      'Consider what the well itself represents.',
      'Sometimes what isn\'t said is more important than what is.'
    ],
    image: '/assets/eden/puzzles/whispering_well.jpg',
    reward: {
      item: 'mysterious_amulet',
      message: 'As you speak the answer, the whispers cease momentarily. Then, from the depths of the well, a small object rises to the surface, carried by an unseen force.',
      notification: {
        id: 'riddle_solved',
        type: 'success',
        message: 'You\'ve answered the well\'s riddle!',
        duration: 5000,
        autoDismiss: true
      }
    }
  },
  
  // Slider puzzle in the abandoned library
  'bookshelf_puzzle': {
    id: 'bookshelf_puzzle',
    type: 'slider',
    title: 'Ancient Bookshelf',
    description: 'A bookshelf with sliding sections. The books are arranged in a way that suggests they can be moved to form a specific pattern or image.',
    solution: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    pieces: ['3', '1', '4', '8', '6', '2', '7', '5', '9'],
    attempts: 0,
    hints: [
      'The books form sections that can slide horizontally and vertically.',
      'Try to arrange them in numerical order.',
      'The correct arrangement may reveal a hidden message or symbol.'
    ],
    image: '/assets/eden/puzzles/bookshelf.jpg',
    reward: {
      status: { 'library_secret_found': true },
      message: 'As the last section clicks into place, a hidden compartment in the bookshelf slides open, revealing an ancient text.',
      notification: {
        id: 'bookshelf_solved',
        type: 'discovery',
        message: 'You\'ve uncovered a hidden compartment in the bookshelf!',
        duration: 5000,
        autoDismiss: true
      }
    }
  },
  
  // Lock puzzle for the cellar door
  'cellar_lock': {
    id: 'cellar_lock',
    type: 'lock',
    title: 'Cellar Door Lock',
    description: 'A sturdy iron lock on the cellar door. It appears to require a key with a specific shape.',
    solution: ['old_key'],
    attempts: 0,
    hints: [
      'The lock seems old and ornate, possibly requiring an equally distinctive key.',
      'Check the tavern for any keys that might have been left behind.',
      'Perhaps someone hid a key somewhere nearby.'
    ],
    image: '/assets/eden/puzzles/cellar_lock.jpg',
    reward: {
      status: { 'cellar_unlocked': true },
      message: 'The key fits perfectly. With a turn and a heavy click, the lock opens, and the cellar door swings inward on creaking hinges.',
      notification: {
        id: 'cellar_unlocked',
        type: 'success',
        message: 'You\'ve unlocked the cellar door!',
        duration: 5000,
        autoDismiss: true
      }
    }
  }
};

export default puzzles;