import { InventoryItem } from '../types';

/**
 * Eden's Hollow Items Data
 * Defines all collectible items and their properties
 */

const items: Record<string, InventoryItem> = {
  // General items
  'matches': {
    id: 'matches',
    name: 'Box of Matches',
    description: 'A damp box of matches. Only a few remain dry enough to light.',
    image: '/assets/eden/items/matches.png',
    category: 'tool',
    combinable: true,
    consumable: true,
    usableOn: ['old_lantern', 'church_candle'],
    weight: 0.1
  },
  
  'old_lantern': {
    id: 'old_lantern',
    name: 'Rusty Lantern',
    description: 'An old oil lantern. Its light flickers weakly, casting moving shadows.',
    image: '/assets/eden/items/lantern.png',
    category: 'tool',
    combinable: true,
    illuminates: true,
    weight: 1.5
  },
  
  'torn_journal': {
    id: 'torn_journal',
    name: 'Torn Journal Page',
    description: 'A page ripped from a journal. The handwriting is frantic and difficult to read.',
    image: '/assets/eden/items/journal_page.png',
    category: 'document',
    examinable: true,
    examineText: `"...the ritual must be performed at midnight. The five of us have agreed. We've gone too far to turn back now. The symbols must be drawn exactly as shown in the old text. God help us if we've misinterpreted anything..."`,
    weight: 0.1
  },
  
  // Keys and access items
  'rusty_key': {
    id: 'rusty_key',
    name: 'Rusty Key',
    description: 'An old iron key, heavily rusted. It looks ancient.',
    image: '/assets/eden/items/rusty_key.png',
    category: 'key',
    combinable: true,
    usableOn: ['old_chest'],
    weight: 0.2
  },
  
  'cellar_key': {
    id: 'cellar_key',
    name: 'Cellar Key',
    description: 'A heavy iron key with an unusual tooth pattern. It feels unnaturally cold to the touch.',
    image: '/assets/eden/items/cellar_key.png',
    category: 'key',
    combinable: false,
    weight: 0.3
  },
  
  'church_key': {
    id: 'church_key',
    name: 'Church Key',
    description: 'An ornate brass key with a cross-shaped bow. It seems well-preserved despite its age.',
    image: '/assets/eden/items/church_key.png',
    category: 'key',
    combinable: false,
    weight: 0.3
  },
  
  'empty_bottle': {
    id: 'empty_bottle',
    name: 'Empty Bottle',
    description: 'A small glass bottle. It could be used to hold liquids.',
    image: '/assets/eden/items/empty_bottle.png',
    category: 'container',
    combinable: true,
    usableOn: ['well_bucket', 'strange_liquid'],
    weight: 0.4
  },
  
  'water_bottle': {
    id: 'water_bottle',
    name: 'Bottle of Well Water',
    description: 'A bottle filled with strangely clear water from the village well. It seems to shimmer slightly in the light.',
    image: '/assets/eden/items/water_bottle.png',
    category: 'container',
    combinable: true,
    consumable: true,
    usableOn: ['withered_plant', 'ritual_circle'],
    weight: 0.8
  },
  
  // Special/ritual items
  'strange_amulet': {
    id: 'strange_amulet',
    name: 'Strange Amulet',
    description: 'A bronze amulet with unusual symbols around its edge. The central symbol depicts an eye surrounded by tentacle-like shapes.',
    image: '/assets/eden/items/amulet.png',
    category: 'artifact',
    puzzle: 'strange_amulet_puzzle',
    weight: 0.3
  },
  
  'eliza_doll': {
    id: 'eliza_doll',
    name: 'Porcelain Doll',
    description: "A worn porcelain doll with glass eyes and a faded blue dress. The name 'ELIZA' is stitched into the hem.",
    image: '/assets/eden/items/doll.png',
    category: 'artifact',
    combinable: true,
    usableOn: ['doll_shelf', 'ritual_circle'],
    weight: 0.6,
    lore: "Sometimes at night, you could swear you hear the doll whispering."
  },
  
  'ritual_dagger': {
    id: 'ritual_dagger',
    name: 'Ceremonial Dagger',
    description: 'An ornate dagger with a curved blade and strange symbols etched into the hilt. Dark stains mar the blade.',
    image: '/assets/eden/items/ritual_dagger.png',
    category: 'weapon',
    combinable: true,
    usableOn: ['ritual_circle', 'strange_vines'],
    damage: 10,
    weight: 0.8
  },
  
  'sacred_medallion': {
    id: 'sacred_medallion',
    name: 'Sacred Medallion',
    description: 'A silver medallion depicting a radiant sun. It feels warm to the touch and seems to repel the darkness around it.',
    image: '/assets/eden/items/medallion.png',
    category: 'artifact',
    combinable: true,
    usableOn: ['shadow_barrier', 'possessed_villager'],
    illuminates: true,
    weight: 0.3
  },
  
  'harpers_journal': {
    id: 'harpers_journal',
    name: "Harper's Journal",
    description: "A leather-bound journal belonging to Thomas Harper, dated 1879. The later entries show increasingly erratic handwriting.",
    image: '/assets/eden/items/journal.png',
    category: 'document',
    examinable: true,
    puzzle: 'journal_cipher_puzzle',
    weight: 0.7,
    lore: "The final pages contain strange symbols that seem to form a code."
  },
  
  'church_candle': {
    id: 'church_candle',
    name: 'Blessed Candle',
    description: 'A tall white candle from the church. It gives off a steady, pure light when lit.',
    image: '/assets/eden/items/candle.png',
    category: 'tool',
    combinable: true,
    consumable: true,
    usableOn: ['dark_corner', 'ritual_circle'],
    illuminates: true,
    weight: 0.4
  },
  
  'ritual_component': {
    id: 'ritual_component',
    name: 'Ancient Relic',
    description: 'A small stone object covered in strange markings. It pulses with an eerie blue light when held near other mystical objects.',
    image: '/assets/eden/items/ritual_component.png',
    category: 'artifact',
    combinable: true,
    usableOn: ['ritual_circle', 'strange_altar'],
    weight: 0.5,
    lore: "One of five components needed to complete the ritual."
  },
  
  'crowbar': {
    id: 'crowbar',
    name: 'Rusty Crowbar',
    description: 'A sturdy iron crowbar with patches of rust. Good for prying things open.',
    image: '/assets/eden/items/crowbar.png',
    category: 'tool',
    combinable: true,
    usableOn: ['boarded_window', 'crumbling_wall', 'nailed_chest'],
    damage: 5,
    weight: 2.0
  }
};

export default items;