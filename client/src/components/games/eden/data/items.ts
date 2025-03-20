import { InventoryItem } from '../types';

export const gameItems: Record<string, InventoryItem> = {
  // Ancient Amulet
  ancient_amulet: {
    id: 'ancient_amulet',
    name: 'Ancient Amulet',
    description: 'A silver amulet adorned with strange symbols. It pulses with a faint blue light and feels unnaturally cold to the touch.',
    icon: 'amulet',
    type: 'artifact',
    properties: [
      'Protects against minor magical attacks',
      'Glows brighter in the presence of spirits',
      'Cannot be removed once worn until certain conditions are met'
    ]
  },
  
  // Ritual Dagger
  ritual_dagger: {
    id: 'ritual_dagger',
    name: 'Ritual Dagger',
    description: 'A ceremonial blade with runes etched into its black iron surface. The edge remains impossibly sharp despite its apparent age.',
    icon: 'dagger',
    type: 'weapon',
    useAction: 'activate',
    damage: 15,
    properties: [
      'Deals extra damage to spectral entities',
      'Can draw blood safely for ritual purposes',
      'Blade absorbs blood, leaving no traces'
    ]
  },
  
  // Castle Key
  castle_key: {
    id: 'castle_key',
    name: 'Guardian\'s Key',
    description: 'A heavy iron key forged in the shape of a twisted flame. It radiates heat when near the locks it opens.',
    icon: 'key',
    type: 'key',
    useAction: 'unlock',
    properties: [
      'Opens sealed doors within Shadowspire Castle',
      'Grows warmer as you approach a compatible lock',
      'Sometimes whispers warnings in an ancient tongue'
    ]
  },
  
  // Healing Potion
  healing_potion: {
    id: 'healing_potion',
    name: 'Crimson Elixir',
    description: 'A small vial of vibrant red liquid. The contents swirl with an inner light and smell faintly of cinnamon.',
    icon: 'potion',
    type: 'consumable',
    useAction: 'heal',
    properties: [
      'Restores 25 health points when consumed',
      'Creates a warming sensation throughout the body',
      'Side effect: Temporarily heightens awareness of supernatural entities'
    ]
  },
  
  // Mana Potion
  mana_potion: {
    id: 'mana_potion',
    name: 'Azure Essence',
    description: 'A glass vial containing shimmering blue liquid that seems to move with a mind of its own.',
    icon: 'potion',
    type: 'consumable',
    useAction: 'restore_mana',
    properties: [
      'Restores 25 mana points when consumed',
      'Enhances magical abilities for a short time',
      'Side effect: Creates a brief feeling of dissociation from the physical world'
    ]
  },
  
  // Ghostlight Lantern
  ghostlight_lantern: {
    id: 'ghostlight_lantern',
    name: 'Ghostlight Lantern',
    description: 'An ornate brass lantern that emits a pale blue flame requiring no fuel. The light reveals entities usually invisible to the human eye.',
    icon: 'lantern',
    type: 'artifact',
    useAction: 'activate',
    properties: [
      'Reveals hidden spirits and messages',
      'Light cannot be seen by most supernatural entities',
      'Flame brightens in areas of strong magical energy'
    ]
  },
  
  // Ancient Tome
  ancient_tome: {
    id: 'ancient_tome',
    name: 'Codex of Binding',
    description: 'A weathered leather-bound book with pages of thin metal rather than paper. The text shifts and changes when not observed directly.',
    icon: 'book',
    type: 'artifact',
    useAction: 'read',
    properties: [
      'Contains instructions for the Ritual of Binding',
      'Reading causes minor psychic damage',
      'Pages reveal different content depending on the reader\'s intent'
    ]
  },
  
  // Skeleton Key
  skeleton_key: {
    id: 'skeleton_key',
    name: 'Bonecrafted Key',
    description: 'A key crafted from human bone, polished to an ivory sheen. It feels unnaturally warm and sometimes twitches like a living thing.',
    icon: 'key',
    type: 'key',
    useAction: 'unlock',
    properties: [
      'Can open any lock in the crypt areas',
      'Occasionally whispers secrets about nearby dangers',
      'Slowly drains life force from the holder'
    ]
  },
  
  // Crystal Heart
  crystal_heart: {
    id: 'crystal_heart',
    name: 'Crystal Heart',
    description: 'A heart-shaped crystal that pulses with an inner light. Despite its solid form, it beats like a living heart, growing warmer with each pulse.',
    icon: 'artifact',
    type: 'artifact',
    useAction: 'activate',
    properties: [
      'Key component in the Ritual of Binding',
      'Resonates with other magical artifacts',
      'Connected to the villagers\' curse'
    ]
  },
  
  // Spirit Essence
  spirit_essence: {
    id: 'spirit_essence',
    name: 'Captured Essence',
    description: 'A small glass vial containing swirling mist that occasionally forms into fleeting faces. It feels cold and whispers can be heard emanating from it.',
    icon: 'potion',
    type: 'consumable',
    useAction: 'consume',
    properties: [
      'Temporarily allows communication with spirits',
      'Key ingredient in advanced rituals',
      'Fragile - will shatter if dropped'
    ]
  },
  
  // Obsidian Shard
  obsidian_shard: {
    id: 'obsidian_shard',
    name: 'Void Fragment',
    description: 'A jagged piece of obsidian that seems to absorb light rather than reflect it. Staring into it for too long causes unsettling visions.',
    icon: 'artifact',
    type: 'artifact',
    properties: [
      'Absorbs magical energy directed at the holder',
      'Edge is sharp enough to cut through even spiritual entities',
      'Grows heavier with each ritual it witnesses'
    ]
  },
  
  // Arcane Map
  arcane_map: {
    id: 'arcane_map',
    name: 'Shifting Map',
    description: 'A map of Eden\'s Hollow drawn on parchment with ink that moves and changes. It shows the current layout of the realm, which seems to shift over time.',
    icon: 'book',
    type: 'artifact',
    useAction: 'read',
    properties: [
      'Reveals hidden locations not visible on normal maps',
      'Updates itself to reflect changes in the environment',
      'Marks the location of powerful magical artifacts'
    ]
  },
  
  // Soul Cage
  soul_cage: {
    id: 'soul_cage',
    name: 'Soul Cage',
    description: 'A small iron cage with bars twisted into complex patterns. Despite its solid appearance, spiritual entities can be trapped within it.',
    icon: 'artifact',
    type: 'artifact',
    useAction: 'activate',
    properties: [
      'Can trap and contain minor spirits',
      'Bound spirits may offer information or services',
      'Gradually damages the spirit contained within'
    ]
  }
};