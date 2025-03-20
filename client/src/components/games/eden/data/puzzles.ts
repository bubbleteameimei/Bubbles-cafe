import { PuzzleData } from '../types';

export const gamePuzzles: Record<string, PuzzleData> = {
  // Ancient Runes puzzle
  ancient_runes: {
    id: 'ancient_runes',
    type: 'runes',
    title: 'Ancient Runes',
    description: 'Decipher the correct sequence of runes to unlock ancient knowledge.',
    data: {
      runes: [
        { symbol: 'ᚠ', meaning: 'Wealth' },
        { symbol: 'ᚢ', meaning: 'Strength' },
        { symbol: 'ᚦ', meaning: 'Giant' },
        { symbol: 'ᚨ', meaning: 'Deity' },
        { symbol: 'ᚱ', meaning: 'Journey' },
        { symbol: 'ᚲ', meaning: 'Torch' },
        { symbol: 'ᚷ', meaning: 'Gift' },
        { symbol: 'ᚹ', meaning: 'Joy' },
        { symbol: 'ᚺ', meaning: 'Hail' }
      ],
      correctSequence: ['ᚱ', 'ᚦ', 'ᚲ', 'ᚨ'],
      question: 'The stone whispers: "To journey beyond the giants, carry the torch to the gods."'
    },
    solved: false,
    attempts: 0,
    hint: 'Look for the runes whose meanings match the stone\'s message, in the same order.'
  },
  
  // Guardian's riddle
  guardian_riddle: {
    id: 'guardian_riddle',
    type: 'riddle',
    title: 'Guardian\'s Riddle',
    description: 'Answer the castle guardian\'s ancient riddle to gain entry.',
    data: {
      riddle: 'I have no life, yet I can die. I have no lungs, yet I must breathe. I have no mouth, yet I can devour all things. What am I?',
      answer: 'fire',
      caseSensitive: false,
      alternateAnswers: ['a fire', 'the fire', 'flame', 'flames']
    },
    solved: false,
    attempts: 0,
    hint: 'Think of something that consumes, requires air, and can be extinguished.'
  },
  
  // Blood lock pattern
  blood_lock: {
    id: 'blood_lock',
    type: 'pattern',
    title: 'Blood Lock',
    description: 'Trace the pattern of the ancient bloodline to unlock the sealed chamber.',
    data: {
      gridSize: 9,
      correctPattern: [0, 4, 8, 5, 2, 1, 0],
      description: 'The door is marked with a strange pattern. Seven points connected in an unbroken line - the seal of the ancient bloodline.',
      theme: 'blood'
    },
    solved: false,
    attempts: 0,
    hint: 'Look for the pattern that forms the shape of a seven-pointed star, starting and ending at the same point.'
  },
  
  // Celestial alignment puzzle
  celestial_alignment: {
    id: 'celestial_alignment',
    type: 'combination',
    title: 'Celestial Alignment',
    description: 'Align the celestial bodies in their proper sequence to unlock the observatory.',
    data: {
      lockType: 'color',
      combination: ['blue', 'red', 'purple', 'green', 'yellow'],
      description: 'The ancient mechanism requires the five celestial bodies to be aligned in their proper order from the morning star to the wanderer.',
      maxAttempts: 5
    },
    solved: false,
    attempts: 0,
    hint: 'The morning star is blue, followed by the crimson eye, the purple monarch, the green shepherd, and finally the yellow wanderer.'
  },
  
  // Ritual sacrifice
  ritual_sacrifice: {
    id: 'ritual_sacrifice',
    type: 'sacrifice',
    title: 'Ritual of Binding',
    description: 'Complete the ancient ritual by offering the correct sacrifices.',
    data: {
      items: [
        {
          id: 'ritual_dagger',
          name: 'Ritual Dagger',
          type: 'blood',
          value: 3,
          description: 'A ceremonial dagger with a blade of black iron. It thirsts for blood.'
        },
        {
          id: 'childhood_memory',
          name: 'Childhood Memory',
          type: 'memory',
          value: 5,
          description: 'A cherished recollection of innocent days. The ritual would consume it forever.'
        },
        {
          id: 'lovers_locket',
          name: 'Lover\'s Locket',
          type: 'soul',
          value: 7,
          description: 'A silver locket containing a lock of hair from someone beloved.'
        },
        {
          id: 'golden_ring',
          name: 'Golden Ring',
          type: 'treasure',
          value: 2,
          description: 'A simple band of gold, worn smooth by years of wear.'
        },
        {
          id: 'life_essence',
          name: 'Life Essence',
          type: 'life',
          value: 10,
          description: 'Your own vital energy. Sacrificing this would leave you weakened.'
        },
        {
          id: 'forgotten_song',
          name: 'Forgotten Song',
          type: 'memory',
          value: 4,
          description: 'A melody that has been passed down for generations in your family.'
        },
        {
          id: 'crystal_heart',
          name: 'Crystal Heart',
          type: 'soul',
          value: 8,
          description: 'A pulsing crystal organ, still somehow beating with ethereal energy.'
        }
      ],
      targetValue: 15,
      maxSelections: 3,
      description: 'The ritual requires sacrifices with a combined power of 15. Choose wisely - some combinations may have unexpected consequences.'
    },
    solved: false,
    attempts: 0,
    hint: 'The most potent combination may not be the most obvious. Consider how different types of sacrifice might complement each other.'
  },
  
  // Library combination lock
  library_lock: {
    id: 'library_lock',
    type: 'combination',
    title: 'Keeper\'s Lock',
    description: 'The ancient library\'s secret chamber is secured with a complex numerical lock.',
    data: {
      lockType: 'numerical',
      combination: [7, 3, 9, 1],
      description: 'The lock requires a specific sequence of numbers. Perhaps clues lie in the texts scattered throughout the library?',
      maxAttempts: 0
    },
    solved: false,
    attempts: 0,
    hint: 'Look for dates or significant numbers mentioned in the tomes you\'ve discovered throughout your journey.'
  },
  
  // Spirit binding puzzle
  spirit_binding: {
    id: 'spirit_binding',
    type: 'pattern',
    title: 'Spirit Binding',
    description: 'Trace the correct pattern to bind the restless spirit to your service.',
    data: {
      gridSize: 9,
      correctPattern: [4, 1, 2, 5, 8, 7, 6, 3, 0],
      description: 'The spirit realm can be accessed through the correct sequence of gestures, binding a spirit to assist you.',
      theme: 'spirit'
    },
    solved: false,
    attempts: 0,
    hint: 'The pattern forms a spiral, starting from the center and moving outward in a clockwise direction.'
  },
  
  // Nature's cipher
  nature_cipher: {
    id: 'nature_cipher',
    type: 'riddle',
    title: 'Nature\'s Cipher',
    description: 'Solve the ancient druid\'s riddle to gain the forest\'s blessing.',
    data: {
      riddle: 'I drink the blood of the earth and stretch my arms to the sky, yet never move from where I stand. Centuries may pass, kingdoms may fall, but I remain. What am I?',
      answer: 'tree',
      caseSensitive: false,
      alternateAnswers: ['a tree', 'the tree', 'trees']
    },
    solved: false,
    attempts: 0,
    hint: 'I am rooted in place, living for hundreds of years, drawing sustenance from the soil beneath me.'
  },
  
  // Moon phase lock
  moon_phase_lock: {
    id: 'moon_phase_lock',
    type: 'pattern',
    title: 'Lunar Sequence',
    description: 'Arrange the phases of the moon in their correct order to unlock the celestial chamber.',
    data: {
      gridSize: 8,
      correctPattern: [0, 1, 2, 3, 7, 6, 5, 4],
      description: 'The eight phases of the moon must be selected in their proper sequence, from new moon to waning crescent.',
      theme: 'arcane'
    },
    solved: false,
    attempts: 0,
    hint: 'Begin with the new moon (complete darkness), progress through waxing phases to full moon, then through waning phases back toward darkness.'
  }
};