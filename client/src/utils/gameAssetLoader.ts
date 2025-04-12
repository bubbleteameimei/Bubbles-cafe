/**
 * Game Asset Loader Utility
 * 
 * This utility helps load game assets with proper error handling and fallbacks
 */

import Phaser from 'phaser';

// Base paths
export const ASSET_BASE_PATH = '/games/edens-hollow';
export const BACKGROUNDS_PATH = `${ASSET_BASE_PATH}/backgrounds`;
export const EFFECTS_PATH = `${ASSET_BASE_PATH}/effects`;
export const ITEMS_PATH = `${ASSET_BASE_PATH}/items`;
export const SOUNDS_PATH = `${ASSET_BASE_PATH}/sounds`;
export const UI_PATH = `${ASSET_BASE_PATH}/ui`;

// Sound paths mapping
export const SOUND_PATHS: Record<string, string> = {
  'choice': `${SOUNDS_PATH}/choice.mp3`,
  'confirm': `${SOUNDS_PATH}/confirm.mp3`,
  'cancel': `${SOUNDS_PATH}/cancel.mp3`,
  'sanityDrop': `${SOUNDS_PATH}/sanity-drop.mp3`,
  'sanityGain': `${SOUNDS_PATH}/sanity-gain.mp3`,
  'itemGet': `${SOUNDS_PATH}/item-get.mp3`,
  'ambientNormal': `${SOUNDS_PATH}/ambient-normal.mp3`,
  'ambientLowSanity': `${SOUNDS_PATH}/ambient-low-sanity.mp3`,
  'jumpscare': `${SOUNDS_PATH}/jumpscare.mp3`,
  'revelation': `${SOUNDS_PATH}/revelation.mp3`,
  'ending': `${SOUNDS_PATH}/ending.mp3`,
  'creaking-gate': `${SOUNDS_PATH}/choice.mp3`, // Fallback to the choice sound for now
};

/**
 * Load a background image for the scene
 */
export function loadBackground(scene: Phaser.Scene, key: string) {
  const imagePath = `${BACKGROUNDS_PATH}/${key}.jpg`;
  const textureKey = `background-${key}`;
  
  // Check if already loaded
  if (scene.textures.exists(textureKey)) {
    return true;
  }
  
  // Create fallback texture immediately
  createFallbackBackground(scene, key);
  
  try {
    // Load image
    scene.load.image(textureKey, imagePath);
    
    // Start the load
    scene.load.once('complete', () => {
      console.log(`Background loaded: ${key}`);
      // Dispatch an event that the texture is ready
      scene.textures.emit(`addtexture_${textureKey}`);
    });
    
    scene.load.once('loaderror', (fileObj: any) => {
      console.log(`Using fallback for background: ${key}`);
      // The fallback was already created, so we're good
    });
    
    scene.load.start();
    return true;
  } catch (error) {
    console.log(`Using fallback for background ${key}`);
    // We already created the fallback, no need to do it again
    return true;
  }
}

/**
 * Create a fallback background if the image can't be loaded
 */
function createFallbackBackground(scene: Phaser.Scene, key: string) {
  const textureKey = `background-${key}`;
  if (scene.textures.exists(textureKey)) return;

  const width = scene.cameras.main.width;
  const height = scene.cameras.main.height;
  
  // Create a graphics object to draw the background
  const graphics = scene.add.graphics();
  
  // Create a gradient background based on the key
  let colors = [0x000000, 0x111122];
  
  if (key.includes('manor')) {
    // Manor areas get dark blue gradient
    colors = [0x000011, 0x112233];
  } else if (key.includes('garden')) {
    // Garden areas get dark green gradient
    colors = [0x001100, 0x112211];
  } else if (key.includes('foyer')) {
    // Interior areas get warm dark gradient
    colors = [0x110000, 0x221111];
  } else if (key.includes('dusk')) {
    // Dusk scenes get purple gradient
    colors = [0x110022, 0x221133];
  }
  
  // Fill with gradient
  graphics.fillGradientStyle(colors[0], colors[0], colors[1], colors[1], 1);
  graphics.fillRect(0, 0, width, height);
  
  // Add some visual noise/texture
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2 + 1;
    const alpha = Math.random() * 0.2;
    
    graphics.fillStyle(0xffffff, alpha);
    graphics.fillCircle(x, y, size);
  }
  
  // Generate the texture
  try {
    graphics.generateTexture(textureKey, width, height);
    console.log(`Created fallback texture for: ${textureKey}`);
    
    // Dispatch an event that the texture is ready
    scene.textures.emit(`addtexture_${textureKey}`);
  } catch (e) {
    console.warn(`Could not generate fallback texture: ${e}`);
  }
  
  // Clean up the graphics object
  graphics.destroy();
}

/**
 * Load a UI element
 */
export function loadUIElement(scene: Phaser.Scene, key: string) {
  const imagePath = `${UI_PATH}/${key}.png`;
  
  // Check if already loaded
  if (scene.textures.exists(key)) {
    return true;
  }
  
  try {
    // Load image
    scene.load.image(key, imagePath);
    
    // Start the load
    scene.load.once('complete', () => {
      console.log(`UI element loaded: ${key}`);
    });
    
    scene.load.start();
    return true;
  } catch (error) {
    console.error(`Error loading UI element ${key}:`, error);
    return false;
  }
}

/**
 * Load a sound effect
 */
export function loadSound(scene: Phaser.Scene, key: string) {
  const soundPath = SOUND_PATHS[key];
  
  if (!soundPath) {
    console.log(`Sound not defined: ${key}, using silent fallback`);
    // Create a silent sound as fallback - prevents errors in the game
    createSilentSound(scene, key);
    return true;
  }
  
  // Check if already loaded
  if (scene.cache.audio.exists(key)) {
    return true;
  }
  
  try {
    // Create a silent fallback first
    createSilentSound(scene, key + '_fallback');
    
    // Load sound
    scene.load.audio(key, soundPath);
    
    // Start the load
    scene.load.once('complete', () => {
      console.log(`Sound loaded: ${key}`);
    });
    
    scene.load.once('loaderror', () => {
      console.log(`Sound ${key} failed to load, using fallback`);
      // If the real sound fails to load, copy the fallback
      if (scene.cache.audio.exists(key + '_fallback')) {
        scene.cache.audio.add(key, scene.cache.audio.get(key + '_fallback'));
      }
    });
    
    scene.load.start();
    return true;
  } catch (error) {
    console.log(`Error loading sound ${key}, using fallback`);
    createSilentSound(scene, key);
    return true;
  }
}

/**
 * Create a silent sound as fallback
 */
function createSilentSound(scene: Phaser.Scene, key: string) {
  if (scene.cache.audio.exists(key)) return;
  
  try {
    // Create a very short silent audio buffer
    const audioContext = new AudioContext();
    const buffer = audioContext.createBuffer(1, 1024, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Convert to base64 data URL of silence
    const silenceDataURL = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    
    // Add to the cache
    scene.cache.audio.add(key, {
      decoded: true,
      duration: 0.1,
      isDecoded: true,
      isSoundDecoded: true,
      isCompressedAudio: true,
      data: silenceDataURL
    });
    
    console.log(`Created silent fallback for sound: ${key}`);
  } catch (e) {
    console.warn(`Could not create silent fallback: ${e}`);
  }
}