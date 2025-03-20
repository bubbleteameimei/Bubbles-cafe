import { Item, ItemEffect } from '../types';

export const items: Record<string, Item> = {
  'rusty_key': {
    id: 'rusty_key',
    name: 'Rusty Key',
    description: 'An old, rusted key. It might unlock a door somewhere in the village.',
    type: 'key',
    icon: '/assets/items/rusty_key.png',
    usable: true,
    useableOn: ['abandoned_house_door'],
    quantity: 1
  },
  
  'dusk_lily': {
    id: 'dusk_lily',
    name: 'Dusk Lily',
    description: 'A strange flower that only grows in the perpetual twilight of Eden\'s Hollow. It seems to glow with a faint inner light.',
    type: 'quest',
    icon: '/assets/items/dusk_lily.png',
    usable: true,
    useableOn: ['church_altar'],
    quantity: 1
  },
  
  'church_key': {
    id: 'church_key',
    name: 'Church Key',
    description: 'A heavy iron key with a cross-shaped handle. It likely unlocks an important door in the church.',
    type: 'key',
    icon: '/assets/items/church_key.png',
    usable: true,
    useableOn: ['church_basement_door', 'locked_cabinet'],
    quantity: 1
  },
  
  'healing_potion': {
    id: 'healing_potion',
    name: 'Strange Tonic',
    description: 'A small bottle containing a glowing red liquid. It smells like herbs and iron.',
    type: 'consumable',
    icon: '/assets/items/healing_potion.png',
    effects: [
      { type: 'health', value: 20 }
    ],
    usable: true,
    isConsumable: true,
    destroyOnUse: true,
    quantity: 1
  },
  
  'clarity_crystal': {
    id: 'clarity_crystal',
    name: 'Clarity Crystal',
    description: 'A small, blue crystal that seems to resonate with your thoughts. Holding it makes your mind feel clearer.',
    type: 'consumable',
    icon: '/assets/items/clarity_crystal.png',
    effects: [
      { type: 'mana', value: 15 }
    ],
    usable: true,
    isConsumable: true,
    destroyOnUse: true,
    quantity: 1
  },
  
  'ritual_page': {
    id: 'ritual_page',
    name: 'Ritual Page',
    description: 'A torn page from an ancient book. It describes part of a ritual involving five elements arranged in a specific order.',
    type: 'document',
    icon: '/assets/items/ritual_page.png',
    usable: true,
    useableOn: ['research_table'],
    quantity: 1
  },
  
  'mausoleum_key': {
    id: 'mausoleum_key',
    name: 'Mausoleum Key',
    description: 'A small, ornate key with a skull-shaped handle. It was hidden beneath fresh flowers on a grave.',
    type: 'key',
    icon: '/assets/items/mausoleum_key.png',
    usable: true,
    useableOn: ['mausoleum_door'],
    quantity: 1
  },
  
  'ritual_amulet': {
    id: 'ritual_amulet',
    name: 'Ritual Amulet',
    description: 'An ancient amulet with strange symbols etched into its surface. It pulses with an unnatural energy.',
    type: 'artifact',
    icon: '/assets/items/ritual_amulet.png',
    usable: true,
    useableOn: ['mausoleum_altar', 'ritual_circle'],
    quantity: 1
  },
  
  'old_photograph': {
    id: 'old_photograph',
    name: 'Faded Photograph',
    description: 'A black and white photograph showing the village as it once was. The people in the image appear happy and unaware of what was to come.',
    type: 'document',
    icon: '/assets/items/old_photograph.png',
    usable: true,
    quantity: 1
  },
  
  'pocket_watch': {
    id: 'pocket_watch',
    name: 'Stopped Pocket Watch',
    description: 'An ornate pocket watch that has stopped at exactly midnight. The hands refuse to move no matter how much you wind it.',
    type: 'artifact',
    icon: '/assets/items/pocket_watch.png',
    usable: true,
    useableOn: ['clock_mechanism'],
    quantity: 1
  }
};

export default items;