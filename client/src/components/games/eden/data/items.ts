import { Item } from '../types';

// Game items collection
export const gameItems: Record<string, Item> = {
  rusty_key: {
    id: 'rusty_key',
    name: 'Rusty Key',
    description: 'An old, rusty key. It might unlock something nearby.',
    image: '/images/eden/items/rusty_key.png',
    type: 'key',
    canUse: true,
    useEffect: {
      notification: {
        id: 'use_key',
        message: 'You need to find the right lock for this key.',
        type: 'info'
      }
    }
  },
  
  old_journal: {
    id: 'old_journal',
    name: 'Weathered Journal',
    description: 'A worn leather journal filled with hurried handwriting. Many pages are torn or stained.',
    image: '/images/eden/items/journal.png',
    type: 'document',
    canUse: true,
    useEffect: {
      dialog: 'journal_entry_1'
    }
  },
  
  strange_amulet: {
    id: 'strange_amulet',
    name: 'Strange Amulet',
    description: 'A peculiar amulet with shifting symbols that seem to change when not directly observed.',
    image: '/images/eden/items/amulet.png',
    type: 'artifact',
    canUse: true
  },
  
  lantern: {
    id: 'lantern',
    name: 'Oil Lantern',
    description: 'A brass oil lantern that casts a warm, flickering light. It helps illuminate dark areas.',
    image: '/images/eden/items/lantern.png',
    type: 'tool',
    canUse: true,
    useEffect: {
      status: { 'has_light': true },
      notification: {
        id: 'lantern_lit',
        message: 'You light the lantern, illuminating the darkness around you.',
        type: 'success'
      }
    }
  },
  
  herb_pouch: {
    id: 'herb_pouch',
    name: 'Herb Pouch',
    description: 'A small leather pouch containing medicinal herbs with a strong, pleasant aroma.',
    image: '/images/eden/items/herbs.png',
    type: 'consumable',
    canUse: true,
    useEffect: {
      heal: 20,
      notification: {
        id: 'used_herbs',
        message: 'You apply the herbs to your wounds, feeling a soothing relief.',
        type: 'success'
      }
    }
  },
  
  old_photograph: {
    id: 'old_photograph',
    name: 'Faded Photograph',
    description: 'A black and white photograph showing a family standing in front of a large house. The edges are burned.',
    image: '/images/eden/items/photograph.png',
    type: 'document',
    canUse: true
  },
  
  strange_coin: {
    id: 'strange_coin',
    name: 'Strange Coin',
    description: 'A coin made of an unknown metal with unusual markings. It feels unnaturally cold to the touch.',
    image: '/images/eden/items/coin.png',
    type: 'artifact',
    canUse: false
  },
  
  ancient_rune: {
    id: 'ancient_rune',
    name: 'Ancient Rune Stone',
    description: 'A small stone tablet etched with mysterious symbols that glow faintly in the dark.',
    image: '/images/eden/items/rune.png',
    type: 'artifact',
    canUse: true
  },
  
  broken_doll: {
    id: 'broken_doll',
    name: 'Broken Porcelain Doll',
    description: 'A child\'s doll with a cracked porcelain face. Its glass eyes seem to follow you.',
    image: '/images/eden/items/doll.png',
    type: 'artifact',
    canUse: false
  },
  
  small_key: {
    id: 'small_key',
    name: 'Small Brass Key',
    description: 'A small, ornate brass key that might open a box or cabinet.',
    image: '/images/eden/items/small_key.png',
    type: 'key',
    canUse: true
  }
};