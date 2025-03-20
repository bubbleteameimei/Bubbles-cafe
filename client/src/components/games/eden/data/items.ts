import { Item } from '../types';

// Map of all game items
const items: Record<string, Item> = {
  // Key Items
  'old_key': {
    id: 'old_key',
    name: 'Brass Key',
    description: 'A tarnished brass key with a strange symbol etched into it. It looks very old but still sturdy.',
    icon: '/assets/eden/items/old_key.png',
    type: 'key',
    quantity: 1,
    usable: true,
    isConsumable: false
  },
  
  // Documents & Notes
  'village_journal': {
    id: 'village_journal',
    name: 'Weathered Journal',
    description: 'A weathered leather journal found in the village square. Many pages are missing or damaged, but some entries remain legible. It appears to document strange events in Eden\'s Hollow.',
    icon: '/assets/eden/items/journal.png',
    type: 'note',
    quantity: 1,
    usable: true,
    isConsumable: false,
    metadata: {
      pages: [
        "April 15th - The excavation beneath the fountain has uncovered something... unusual. Mayor won't let anyone near it.",
        "April 20th - Three children have fallen ill with the same symptoms. High fever, hallucinations, and speaking in what sounds like another language.",
        "May 3rd - More villagers sick. Doctor suspects something in the water. The fountain has been sealed off.",
        "May 10th - The voices... they're getting louder. I'm not sleeping. I think I saw something moving in the shadows last night.",
        "May 15th - They're coming from below. God help us all."
      ]
    }
  },
  
  // Consumables
  'strange_elixir': {
    id: 'strange_elixir',
    name: 'Strange Elixir',
    description: 'A glass bottle containing a luminescent blue liquid. It pulses with an inner light that seems almost alive. The contents smell like night-blooming flowers and ozone.',
    icon: '/assets/eden/items/elixir.png',
    type: 'consumable',
    quantity: 1,
    usable: true,
    isConsumable: true,
    effects: [
      {
        type: 'health',
        value: 25
      },
      {
        type: 'mana',
        value: 15
      },
      {
        type: 'status',
        value: { 'enhanced_perception': true }
      }
    ]
  },
  
  'healing_herb': {
    id: 'healing_herb',
    name: 'Mist Bloom',
    description: 'A pale, luminescent flower that only grows in perpetual fog. Its petals are cool to the touch and smell faintly of mint. Known for its healing properties.',
    icon: '/assets/eden/items/herb.png',
    type: 'consumable',
    quantity: 1,
    usable: true,
    isConsumable: true,
    effects: [
      {
        type: 'health',
        value: 15
      }
    ]
  },
  
  // Tools
  'rusted_lantern': {
    id: 'rusted_lantern',
    name: 'Rusted Lantern',
    description: 'An old iron lantern, surprisingly still functional. It casts a warm, steady light that seems to penetrate the unnatural fog better than it should.',
    icon: '/assets/eden/items/lantern.png',
    type: 'tool',
    quantity: 1,
    usable: true,
    isConsumable: false,
    effects: [
      {
        type: 'status',
        value: { 'has_light': true }
      }
    ]
  },
  
  // Artifacts
  'mysterious_amulet': {
    id: 'mysterious_amulet',
    name: 'Whispering Amulet',
    description: 'A silver amulet with a black stone at its center. When held, you can hear faint whispers emanating from it. The stone seems to absorb light rather than reflect it.',
    icon: '/assets/eden/items/amulet.png',
    type: 'artifact',
    quantity: 1,
    usable: true,
    isConsumable: false,
    effects: [
      {
        type: 'status',
        value: { 'can_hear_whispers': true }
      }
    ]
  }
};

export default items;