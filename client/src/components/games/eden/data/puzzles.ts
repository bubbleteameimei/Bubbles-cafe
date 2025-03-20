import { Puzzle } from '../types';

/**
 * Eden's Hollow Puzzles Data
 * Defines all puzzles and challenges in the game
 */

const puzzles: Record<string, Puzzle> = {
  // Sequence puzzles
  'blood_symbol_puzzle': {
    id: 'blood_symbol_puzzle',
    name: "Blood Symbol Pattern",
    description: "The symbol painted in blood on the cobblestones seems to be missing parts of its pattern. Complete it by arranging the segments in the correct order.",
    type: 'sequence',
    difficulty: 'medium',
    solution: ['eye', 'tentacle', 'circle', 'rune', 'star'],
    hint: "The central eye must be placed first. Look for similar symbols around the village for clues to the pattern.",
    image: '/assets/eden/puzzles/blood_symbol.jpg',
    reward: {
      type: 'status',
      id: 'blood_symbol_knowledge',
      value: true
    }
  },
  
  'painting_puzzle': {
    id: 'painting_puzzle',
    name: "Shifting Portrait",
    description: "The eyes in the portrait follow you, but they seem to be trying to communicate something. Can you trace the pattern they're making?",
    type: 'pattern',
    difficulty: 'hard',
    solution: ['left', 'up', 'right', 'right', 'down', 'left'],
    hint: "Watch the movement of the eyes carefully. They trace a symbol - try to follow their gaze in the correct order.",
    image: '/assets/eden/puzzles/portrait_puzzle.jpg',
    reward: {
      type: 'item',
      id: 'cellar_key'
    }
  },
  
  // Combination puzzles
  'altar_puzzle': {
    id: 'altar_puzzle',
    name: "Ritual Altar Configuration",
    description: "Five stone pieces must be arranged on the altar in a specific pattern. Symbols on each piece must align with markings on the altar.",
    type: 'combination',
    difficulty: 'hard',
    solution: ['chalice_center', 'dagger_north', 'skull_east', 'candle_south', 'book_west'],
    hint: "The journal found in the house describes the ritual arrangement. 'The vessel of life at center, surrounded by the tools of sacrifice.'",
    image: '/assets/eden/puzzles/altar_puzzle.jpg',
    reward: {
      type: 'scene',
      id: 'ritual_complete',
      value: true
    }
  },
  
  'church_altar_puzzle': {
    id: 'church_altar_puzzle',
    name: "Sanctified Stone",
    description: "The church altar has circular indentations that must be filled with the correct stones in the right order to reveal a hidden compartment.",
    type: 'combination',
    difficulty: 'medium',
    solution: ['faith', 'sacrifice', 'rebirth', 'eternity', 'silence'],
    hint: "The stained glass windows tell a story - follow the narrative from left to right to determine the correct order.",
    image: '/assets/eden/puzzles/church_altar.jpg',
    reward: {
      type: 'scene',
      id: 'church_crypt_access',
      value: true
    }
  },
  
  // Riddle puzzles
  'well_carvings_puzzle': {
    id: 'well_carvings_puzzle',
    name: "Well Riddle",
    description: "Ancient carvings around the well's edge form a riddle that must be solved.",
    type: 'riddle',
    difficulty: 'medium',
    solution: ['water'],
    acceptedAnswers: ['water', 'reflection', 'mirror', 'looking glass'],
    hint: "The riddle speaks of something that 'shows all but touches nothing' and 'gives life but can take it away'.",
    image: '/assets/eden/puzzles/well_carvings.jpg',
    reward: {
      type: 'item',
      id: 'church_key'
    }
  },
  
  'confessional_puzzle': {
    id: 'confessional_puzzle',
    name: "Whispers of Confession",
    description: "A ghostly voice in the confessional asks a series of questions. You must answer truthfully to gain its trust.",
    type: 'riddle',
    difficulty: 'hard',
    solution: ['sin', 'forgiveness', 'sacrifice'],
    acceptedAnswers: ['sin', 'guilt', 'shame', 'transgression', 'forgiveness', 'absolution', 'redemption', 'sacrifice', 'offering', 'atonement'],
    hint: "The questions relate to fundamental concepts of redemption and atonement. Listen carefully to the phrasing.",
    image: '/assets/eden/puzzles/confessional.jpg',
    reward: {
      type: 'item',
      id: 'sacred_medallion'
    }
  },
  
  // Text-based puzzles  
  'journal_cipher_puzzle': {
    id: 'journal_cipher_puzzle',
    name: "Harper's Journal Cipher",
    description: "The final pages of Harper's journal contain strange symbols that appear to be a coded message.",
    type: 'text',
    difficulty: 'hard',
    solution: ['beneath the well lies the gateway'],
    hint: "The cipher substitutes letters with symbols that relate to elements of the ritual. Look for repeated patterns and common words.",
    image: '/assets/eden/puzzles/journal_cipher.jpg',
    reward: {
      type: 'status',
      id: 'cipher_knowledge',
      value: true
    }
  },
  
  'strange_amulet_puzzle': {
    id: 'strange_amulet_puzzle',
    name: "Amulet Inscription",
    description: "The strange amulet has tiny inscriptions around its edge. They appear to form words when the inner ring is rotated to specific positions.",
    type: 'combination',
    difficulty: 'medium',
    solution: ['eye', 'below', 'open', 'forth'],
    hint: "Each correct alignment reveals one word of a four-word phrase. The symbols on the outer ring indicate which direction to rotate.",
    image: '/assets/eden/puzzles/amulet_puzzle.jpg',
    reward: {
      type: 'status',
      id: 'amulet_activated',
      value: true
    }
  },
  
  'gravestone_puzzle': {
    id: 'gravestone_puzzle',
    name: "Forgotten Names",
    description: "Five weathered gravestones form a circle. Their names have been worn away, but symbols at the base of each remain visible.",
    type: 'sequence',
    difficulty: 'hard',
    solution: ['shepherd', 'blacksmith', 'mayor', 'doctor', 'priest'],
    hint: "The village records in the church mention the five who performed the ritual. Their professions are the key.",
    image: '/assets/eden/puzzles/graveyard_circle.jpg',
    reward: {
      type: 'item',
      id: 'ritual_component'
    }
  }
};

export default puzzles;