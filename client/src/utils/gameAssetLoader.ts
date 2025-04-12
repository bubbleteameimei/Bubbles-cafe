/**
 * Game Asset Loader
 * 
 * This utility handles loading and caching game assets for efficient use
 * throughout the Eden's Hollow game.
 */

// Background image mapping
const BACKGROUND_PATHS: Record<string, string> = {
  'manor-exterior': '/games/edens-hollow/backgrounds/manor-exterior.jpg',
  'manor-exterior-dusk': '/games/edens-hollow/backgrounds/manor-exterior-dusk.jpg',
  'manor-entrance': '/games/edens-hollow/backgrounds/manor-entrance.jpg',
  'manor-foyer': '/games/edens-hollow/backgrounds/manor-foyer.jpg',
  'manor-garden': '/games/edens-hollow/backgrounds/manor-garden.jpg',
  'manor-cellar': '/games/edens-hollow/backgrounds/manor-cellar.jpg',
  'manor-staircase': '/games/edens-hollow/backgrounds/manor-staircase.jpg',
  'manor-hallway': '/games/edens-hollow/backgrounds/manor-hallway.jpg',
  'manor-sitting-room': '/games/edens-hollow/backgrounds/manor-sitting-room.jpg',
  'manor-bedroom': '/games/edens-hollow/backgrounds/manor-bedroom.jpg',
  'manor-study': '/games/edens-hollow/backgrounds/manor-study.jpg',
  'manor-basement': '/games/edens-hollow/backgrounds/manor-basement.jpg',
  'manor-attic': '/games/edens-hollow/backgrounds/manor-attic.jpg',
  'town-dusk': '/games/edens-hollow/backgrounds/town-dusk.jpg',
  'flashback': '/games/edens-hollow/backgrounds/flashback.jpg'
};

// Effect image mapping
const EFFECT_PATHS: Record<string, string> = {
  'fog': '/games/edens-hollow/effects/fog.png',
  'rain': '/games/edens-hollow/effects/rain.png',
  'blood': '/games/edens-hollow/effects/blood.png',
  'flicker': '/games/edens-hollow/effects/flicker.png',
  'shadow': '/games/edens-hollow/effects/shadow.png',
  'scratches': '/games/edens-hollow/effects/scratches.png',
  'glitch': '/games/edens-hollow/effects/glitch.png'
};

// Item image mapping
const ITEM_PATHS: Record<string, string> = {
  'key': '/games/edens-hollow/items/key.png',
  'lantern': '/games/edens-hollow/items/lantern.png',
  'book': '/games/edens-hollow/items/book.png',
  'amulet': '/games/edens-hollow/items/amulet.png',
  'photo': '/games/edens-hollow/items/photo.png',
  'knife': '/games/edens-hollow/items/knife.png',
  'letter': '/games/edens-hollow/items/letter.png',
  'candle': '/games/edens-hollow/items/candle.png',
  'talisman': '/games/edens-hollow/items/talisman.png'
};

/**
 * Load a background image for a scene
 */
export function loadBackground(scene: Phaser.Scene, backgroundKey: string): void {
  // Skip if already loaded
  if (scene.textures.exists(`background-${backgroundKey}`)) {
    return;
  }
  
  const path = BACKGROUND_PATHS[backgroundKey];
  if (!path) {
    console.error(`Background not found: ${backgroundKey}`);
    return;
  }
  
  // Load the background image
  scene.load.image(`background-${backgroundKey}`, path);
  
  // Start loading
  scene.load.start();
}

/**
 * Load a visual effect for a scene
 */
export function loadEffect(scene: Phaser.Scene, effectKey: string): void {
  // Skip if already loaded
  if (scene.textures.exists(`effect-${effectKey}`)) {
    return;
  }
  
  const path = EFFECT_PATHS[effectKey];
  if (!path) {
    console.error(`Effect not found: ${effectKey}`);
    return;
  }
  
  // Load the effect image
  scene.load.image(`effect-${effectKey}`, path);
  
  // Start loading
  scene.load.start();
}

/**
 * Load an item image for a scene
 */
export function loadItem(scene: Phaser.Scene, itemKey: string): void {
  // Skip if already loaded
  if (scene.textures.exists(`item-${itemKey}`)) {
    return;
  }
  
  const path = ITEM_PATHS[itemKey];
  if (!path) {
    console.error(`Item not found: ${itemKey}`);
    return;
  }
  
  // Load the item image
  scene.load.image(`item-${itemKey}`, path);
  
  // Start loading
  scene.load.start();
}

/**
 * Preload multiple backgrounds at once
 */
export function preloadBackgrounds(scene: Phaser.Scene, backgroundKeys: string[]): void {
  backgroundKeys.forEach(key => {
    if (!scene.textures.exists(`background-${key}`)) {
      const path = BACKGROUND_PATHS[key];
      if (path) {
        scene.load.image(`background-${key}`, path);
      }
    }
  });
  
  // Start loading
  scene.load.start();
}

/**
 * Preload multiple effects at once
 */
export function preloadEffects(scene: Phaser.Scene, effectKeys: string[]): void {
  effectKeys.forEach(key => {
    if (!scene.textures.exists(`effect-${key}`)) {
      const path = EFFECT_PATHS[key];
      if (path) {
        scene.load.image(`effect-${key}`, path);
      }
    }
  });
  
  // Start loading
  scene.load.start();
}

/**
 * Preload multiple items at once
 */
export function preloadItems(scene: Phaser.Scene, itemKeys: string[]): void {
  itemKeys.forEach(key => {
    if (!scene.textures.exists(`item-${key}`)) {
      const path = ITEM_PATHS[key];
      if (path) {
        scene.load.image(`item-${key}`, path);
      }
    }
  });
  
  // Start loading
  scene.load.start();
}

/**
 * Check if an asset is already loaded in the scene
 */
export function isAssetLoaded(scene: Phaser.Scene, assetKey: string): boolean {
  return scene.textures.exists(assetKey);
}

/**
 * Get the full key for an asset type
 */
export function getAssetKey(type: 'background' | 'effect' | 'item', key: string): string {
  return `${type}-${key}`;
}