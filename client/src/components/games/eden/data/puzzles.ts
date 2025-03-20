import { Puzzle } from '../types';

// Game puzzles collection
export const gamePuzzles: Record<string, Puzzle> = {
  tree_symbols: {
    id: 'tree_symbols',
    name: 'Strange Tree Symbols',
    description: 'Strange symbols have been carved into several trees. They seem to form some kind of pattern.',
    type: 'pattern',
    data: {
      type: 'pattern',
      description: 'Select the symbols in the correct sequence to decode their meaning.',
      patterns: [
        { symbol: '⦵', image: '/images/eden/puzzles/symbol1.png' },
        { symbol: '⧖', image: '/images/eden/puzzles/symbol2.png' },
        { symbol: '⧗', image: '/images/eden/puzzles/symbol3.png' },
        { symbol: '⧉', image: '/images/eden/puzzles/symbol4.png' },
        { symbol: '⧊', image: '/images/eden/puzzles/symbol5.png' },
        { symbol: '⧋', image: '/images/eden/puzzles/symbol6.png' }
      ],
      correctPattern: [0, 2, 5, 1],
      hint: 'Look for the symbols that appear more worn than others. They might have been touched more frequently.'
    },
    attempts: 0,
    solved: false,
    onSolve: {
      status: { 'symbols_solved': true },
      notification: {
        id: 'symbols_solved',
        message: 'You've deciphered the symbols! They seem to be an ancient warning about the village ahead.',
        type: 'success'
      }
    },
    onFail: {
      notification: {
        id: 'symbols_failed',
        message: 'That doesn't seem right. The symbols remain mysterious.',
        type: 'error'
      }
    }
  },
  
  fountain_puzzle: {
    id: 'fountain_puzzle',
    name: 'Mysterious Fountain',
    description: 'The old fountain has strange symbols carved around its rim. The water is still, reflecting the night sky.',
    type: 'combination',
    data: {
      type: 'combination',
      description: 'Rotate the dials to match the sequence suggested by the symbols around the fountain.',
      digits: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9']
      ],
      combination: '3749',
      hint: 'The phases of the moon depicted on the fountain might suggest a sequence.'
    },
    attempts: 0,
    solved: false,
    onSolve: {
      status: { 'fountain_solved': true },
      notification: {
        id: 'fountain_solved',
        message: 'The water in the fountain begins to bubble and swirl. Something gleams at the bottom.',
        type: 'success'
      }
    },
    onFail: {
      notification: {
        id: 'fountain_failed',
        message: 'Nothing happens. The water remains still and murky.',
        type: 'error'
      }
    }
  },
  
  locked_box: {
    id: 'locked_box',
    name: 'Ornate Wooden Box',
    description: 'A finely crafted wooden box with intricate carvings. It has a complex locking mechanism.',
    type: 'riddle',
    data: {
      type: 'riddle',
      question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
      answer: 'echo',
      alternateAnswers: ['an echo', 'the echo'],
      hint: 'Think about sounds that return to you in certain environments.'
    },
    attempts: 0,
    solved: false,
    onSolve: {
      item: 'small_key',
      notification: {
        id: 'box_solved',
        message: 'The box springs open! Inside, you find a small brass key.',
        type: 'success'
      }
    },
    onFail: {
      notification: {
        id: 'box_failed',
        message: 'The box remains locked. Perhaps there's another answer.',
        type: 'error'
      }
    }
  },
  
  ancient_altar: {
    id: 'ancient_altar',
    name: 'Ancient Stone Altar',
    description: 'A weathered stone altar with strange markings and several shallow depressions on its surface.',
    type: 'sacrifice',
    data: {
      type: 'sacrifice',
      description: 'Place items on the altar that match the ritualistic symbols. The combined value must be precise.',
      items: [
        { id: 'candle', name: 'Black Candle', value: 3, image: '/images/eden/puzzles/candle.png' },
        { id: 'herb', name: 'Dried Herbs', value: 2, image: '/images/eden/puzzles/herbs.png' },
        { id: 'bone', name: 'Small Bone', value: 4, image: '/images/eden/puzzles/bone.png' },
        { id: 'feather', name: 'Raven Feather', value: 1, image: '/images/eden/puzzles/feather.png' },
        { id: 'crystal', name: 'Dark Crystal', value: 5, image: '/images/eden/puzzles/crystal.png' },
        { id: 'coin', name: 'Ancient Coin', value: 3, image: '/images/eden/puzzles/coin.png' }
      ],
      targetValue: 13,
      maxSelections: 3,
      hint: 'The symbols around the altar depict offerings to ancient spirits. Choose items that would please them.'
    },
    attempts: 0,
    solved: false,
    onSolve: {
      status: { 'altar_activated': true },
      notification: {
        id: 'altar_solved',
        message: 'The items sink into the altar and disappear. A low rumbling sound emerges from beneath the ground.',
        type: 'success'
      }
    },
    onFail: {
      notification: {
        id: 'altar_failed',
        message: 'The items remain on the altar. Nothing happens.',
        type: 'warning'
      }
    }
  },
  
  mysterious_door: {
    id: 'mysterious_door',
    name: 'Mysterious Stone Door',
    description: 'A heavy stone door covered in ancient runes. There is no visible handle or mechanism.',
    type: 'runes',
    data: {
      type: 'runes',
      description: 'Activate the correct sequence of runes to unlock the door.',
      runes: [
        { id: 'protection', symbol: '᛭', name: 'Protection', image: '/images/eden/puzzles/rune1.png' },
        { id: 'journey', symbol: '᛫', name: 'Journey', image: '/images/eden/puzzles/rune2.png' },
        { id: 'knowledge', symbol: '᛬', name: 'Knowledge', image: '/images/eden/puzzles/rune3.png' },
        { id: 'darkness', symbol: '᛭', name: 'Darkness', image: '/images/eden/puzzles/rune4.png' },
        { id: 'gateway', symbol: 'ᛮ', name: 'Gateway', image: '/images/eden/puzzles/rune5.png' },
        { id: 'sacrifice', symbol: 'ᛯ', name: 'Sacrifice', image: '/images/eden/puzzles/rune6.png' },
        { id: 'binding', symbol: 'ᛰ', name: 'Binding', image: '/images/eden/puzzles/rune7.png' },
        { id: 'revelation', symbol: 'ᛱ', name: 'Revelation', image: '/images/eden/puzzles/rune8.png' }
      ],
      correctSequence: ['journey', 'darkness', 'gateway', 'revelation'],
      hint: 'The journal you found might contain clues about the correct sequence.'
    },
    attempts: 0,
    solved: false,
    onSolve: {
      status: { 'door_opened': true },
      notification: {
        id: 'door_solved',
        message: 'The runes glow with an eerie light, and the stone door slowly grinds open.',
        type: 'success'
      }
    },
    onFail: {
      notification: {
        id: 'door_failed',
        message: 'The runes flicker briefly, but nothing happens. The door remains closed.',
        type: 'error'
      },
      damage: 5
    }
  }
};