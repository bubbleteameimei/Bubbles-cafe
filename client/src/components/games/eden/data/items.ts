import { Item } from '../types';

/**
 * Game items that can be collected and used
 */
export const gameItems: Record<string, Item> = {
  rusty_key: {
    id: 'rusty_key',
    name: 'Rusty Key',
    description: 'An old, rusted key. It might open a door somewhere in the village.',
    type: 'key',
    isUsable: true,
    useableOn: ['to_inn_interior']
  },
  
  strange_amulet: {
    id: 'strange_amulet',
    name: 'Strange Amulet',
    description: 'A peculiar amulet with five symbols engraved around its edge.',
    type: 'tool',
    isUsable: true,
    useableOn: ['altar_puzzle']
  },
  
  ancient_journal: {
    id: 'ancient_journal',
    name: 'Ancient Journal',
    description: 'A weathered journal with entries dating back to 1891. Many pages are missing or damaged.',
    type: 'quest',
    isUsable: true
  },
  
  healing_herb: {
    id: 'healing_herb',
    name: 'Healing Herb',
    description: 'A medicinal herb with rejuvenating properties.',
    type: 'consumable',
    isUsable: true,
    isConsumable: true,
    effects: {
      health: 25
    }
  },
  
  willpower_potion: {
    id: 'willpower_potion',
    name: 'Willpower Potion',
    description: 'A mysterious blue liquid that enhances mental fortitude.',
    type: 'consumable',
    isUsable: true,
    isConsumable: true,
    effects: {
      mana: 40
    }
  },
  
  silver_mirror: {
    id: 'silver_mirror',
    name: 'Silver Mirror',
    description: 'An ornate silver mirror. It feels cold to the touch.',
    type: 'tool',
    isUsable: true,
    useableOn: ['mirror_puzzle']
  },
  
  clockwork_gear: {
    id: 'clockwork_gear',
    name: 'Clockwork Gear',
    description: 'A precision-engineered gear, seemingly from the village clock tower.',
    type: 'tool',
    isUsable: true,
    useableOn: ['clock_puzzle']
  },
  
  ritual_candle: {
    id: 'ritual_candle',
    name: 'Ritual Candle',
    description: 'A black candle with strange symbols carved into the wax.',
    type: 'quest',
    isUsable: true
  },
  
  church_key: {
    id: 'church_key',
    name: 'Church Key',
    description: 'A large iron key that likely opens a door in the church.',
    type: 'key',
    isUsable: true,
    useableOn: ['to_church_cellar']
  },
  
  old_photograph: {
    id: 'old_photograph',
    name: 'Old Photograph',
    description: 'A faded photograph showing five children standing in front of the village church.',
    type: 'collectible',
    isUsable: true
  }
};