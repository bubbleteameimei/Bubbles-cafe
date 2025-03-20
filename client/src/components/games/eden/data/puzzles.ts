import { Puzzle } from '../types';

export const puzzles: Record<string, Puzzle> = {
  'clock_puzzle': {
    id: 'clock_puzzle',
    title: 'Clockwork Mechanism',
    description: 'Align the gears of the ancient clock to restart time in Eden\'s Hollow. Each gear must connect to at least one other.',
    type: 'pattern',
    solution: [
      "1", "2", "3", "4", "5" // These must be strings, not numbers
    ],
    difficulty: 'medium',
    pattern: [
      ["1", "2", "3"],
      ["4", "5", ""]
    ],
    initialState: [
      "5", "3", "1", "4", "2"
    ],
    hints: [
      "The large central gear must connect to the pendulum",
      "The arrangement forms a pattern matching the ritual symbols",
      "Look at the positions of the hour markers for clues"
    ],
    maxAttempts: 5,
    reward: {
      status: { clock_fixed: true },
      notification: {
        id: "clock_fixed",
        message: "The gears align perfectly. With a deep resonating sound, the clock mechanism begins to move, and you feel the air change as if time itself has begun to flow again.",
        type: "discovery"
      }
    }
  },
  
  'binding_ritual': {
    id: 'binding_ritual',
    title: 'The Binding Ritual',
    description: 'Complete the ritual correctly to free the trapped souls of Eden\'s Hollow.',
    type: 'sequence',
    solution: [
      "earth", "water", "fire", "air", "spirit"
    ],
    difficulty: 'hard',
    inputs: [
      {
        id: "element1",
        label: "First Element",
        type: "text"
      },
      {
        id: "element2",
        label: "Second Element",
        type: "text"
      },
      {
        id: "element3",
        label: "Third Element",
        type: "text"
      }
    ],
    hints: [
      "The order matters - the priest's notes mention starting with the most solid element",
      "Water comes before fire in this ritual, unlike in nature",
      "The final element represents transcendence"
    ],
    options: [
      {
        id: "earth",
        text: "Earth"
      },
      {
        id: "water",
        text: "Water"
      },
      {
        id: "fire",
        text: "Fire"
      },
      {
        id: "air",
        text: "Air"
      },
      {
        id: "spirit",
        text: "Spirit"
      }
    ],
    reward: {
      status: { ritual_completed: true },
      notification: {
        id: "ritual_completed",
        message: "As you complete the correct sequence, a blinding light fills the mausoleum. The air feels lighter, and for a moment, you see the transparent figures of villagers all around you, their faces peaceful as they begin to fade away.",
        type: "discovery"
      }
    },
    maxAttempts: 3
  },
  
  'church_door_lock': {
    id: 'church_door_lock',
    title: 'Church Basement Lock',
    description: 'Solve the ancient combination lock to access the church basement.',
    type: 'combination',
    solution: ["1", "8", "9", "7"],
    difficulty: 'medium',
    inputs: [
      {
        id: "digit1",
        label: "First Digit",
        type: "number"
      },
      {
        id: "digit2",
        label: "Second Digit",
        type: "number"
      },
      {
        id: "digit3",
        label: "Third Digit",
        type: "number"
      },
      {
        id: "digit4",
        label: "Fourth Digit",
        type: "number"
      }
    ],
    hints: [
      "The year the ritual took place might be significant",
      "Check the gravestones for dates",
      "The mayor's diary mentions a specific date"
    ],
    reward: {
      status: { basement_unlocked: true },
      notification: {
        id: "basement_unlocked",
        message: "The lock clicks and the heavy door swings open, revealing a narrow staircase descending into darkness.",
        type: "discovery"
      }
    }
  },
  
  'mirror_puzzle': {
    id: 'mirror_puzzle',
    title: 'Reflections of Truth',
    description: 'Arrange the mirrors to reveal what lies beyond the veil.',
    type: 'pattern',
    solution: [
      "1", "2", "3", "4", "5" // These must be strings, not numbers
    ],
    difficulty: 'hard',
    pattern: [
      ["1", "2", ""],
      ["3", "4", "5"]
    ],
    initialState: [
      "3", "1", "5", "4", "2"
    ],
    hints: [
      "The light must reach the central symbol",
      "Each mirror can reflect in only one direction",
      "The pattern forms an ancient symbol of protection"
    ],
    reward: {
      status: { truth_revealed: true },
      notification: {
        id: "truth_revealed",
        message: "As the final mirror clicks into place, a beam of light reflects through all the mirrors, converging on a hidden symbol. The wall before you shimmers and reveals a hidden chamber.",
        type: "discovery"
      }
    }
  }
};

export default puzzles;