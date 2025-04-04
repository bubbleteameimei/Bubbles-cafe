/**
 * Eden's Hollow Game Utilities
 * 
 * This file provides utility functions for the game.
 */
import { Choice, PlayerState, Scene } from '../types';

/**
 * Filter choices based on player state, inventory, and requirements
 */
export const filterAvailableChoices = (
  scene: Scene,
  playerState: PlayerState
): Choice[] => {
  return scene.choices.filter(choice => {
    // Check required items
    if (choice.requiredItems && 
        !choice.requiredItems.every(item => playerState.inventory.includes(item))) {
      return false;
    }

    // Check required flags
    if (choice.requiredFlags) {
      for (const [flag, value] of Object.entries(choice.requiredFlags)) {
        if (playerState.flags[flag] !== value) {
          return false;
        }
      }
    }

    // Check sanity requirements
    if (choice.minimumSanity !== undefined && playerState.sanity < choice.minimumSanity) {
      return false;
    }
    if (choice.maximumSanity !== undefined && playerState.sanity > choice.maximumSanity) {
      return false;
    }

    // Check corruption requirements
    if (choice.minimumCorruption !== undefined && 
        playerState.corruption < choice.minimumCorruption) {
      return false;
    }

    return true;
  });
};

/**
 * Get sanity status text based on current level
 */
export const getSanityStatusText = (sanity: number): string => {
  if (sanity >= 90) return 'Rational';
  if (sanity >= 70) return 'Clear-Minded';
  if (sanity >= 50) return 'Unsettled';
  if (sanity >= 30) return 'Disturbed';
  if (sanity >= 10) return 'Unhinged';
  return 'Broken';
};

/**
 * Get corruption status text based on current level
 */
export const getCorruptionStatusText = (corruption: number): string => {
  if (corruption <= 10) return 'Pure';
  if (corruption <= 30) return 'Tainted';
  if (corruption <= 50) return 'Corrupted';
  if (corruption <= 70) return 'Defiled';
  if (corruption <= 90) return 'Unholy';
  return 'Abominable';
};

/**
 * Randomly select an item from an array
 */
export const randomFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Add glitch/corruption effect to text
 */
export const corruptText = (text: string, intensity: number = 0.2): string => {
  const corruptionCharacters = '̸̵̶̷̓̀́͋͊̕̚͘͜͠͝҉̷̴̡̢̛̖̗̘̙̜̝̞̟̠̣̤̥̦̪̫̬̭̮̯̰̱̲̳̹̺̻̼ͅ';
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    // Add the original character
    result += text[i];
    
    // Randomly add corruption characters based on intensity
    if (Math.random() < intensity) {
      const numCorruption = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numCorruption; j++) {
        const randomIndex = Math.floor(Math.random() * corruptionCharacters.length);
        result += corruptionCharacters[randomIndex];
      }
    }
  }
  
  return result;
};

/**
 * Check if game is in an ending state
 */
export const isGameEnding = (playerState: PlayerState): boolean => {
  return playerState.sanity <= 0 || 
         playerState.health <= 0 || 
         playerState.corruption >= 100 ||
         playerState.gameOver;
};

/**
 * Limit a number between min and max values
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Apply choice effects to player state
 */
export const applyChoiceEffects = (
  choice: Choice,
  playerState: PlayerState
): PlayerState => {
  const newState = { ...playerState };
  
  // Apply sanity changes
  if (choice.sanityChange) {
    newState.sanity = clamp(newState.sanity + choice.sanityChange, 0, 100);
  }
  
  // Apply corruption changes
  if (choice.corruptionChange) {
    newState.corruption = clamp(newState.corruption + choice.corruptionChange, 0, 100);
  }
  
  // Apply health changes
  if (choice.healthChange) {
    newState.health = clamp(newState.health + choice.healthChange, 0, 100);
  }
  
  // Add items to inventory
  if (choice.addItems) {
    newState.inventory = [...newState.inventory, ...choice.addItems];
  }
  
  // Remove items from inventory
  if (choice.removeItems) {
    newState.inventory = newState.inventory.filter(
      item => !choice.removeItems?.includes(item)
    );
  }
  
  // Set flags
  if (choice.setFlags) {
    newState.flags = { ...newState.flags, ...choice.setFlags };
  }
  
  // Apply relationship changes
  if (choice.relationshipChanges) {
    const newRelationships = { ...newState.relationships };
    
    for (const [character, change] of Object.entries(choice.relationshipChanges)) {
      newRelationships[character] = (newRelationships[character] || 0) + change;
    }
    
    newState.relationships = newRelationships;
  }
  
  return newState;
};

/**
 * Get the appropriate description for a scene based on player state
 */
export const getSceneDescription = (scene: Scene, playerState: PlayerState): string => {
  if (!scene.alternateDescriptions || scene.alternateDescriptions.length === 0) {
    return scene.description;
  }

  // Check alternate descriptions in order
  for (const altDesc of scene.alternateDescriptions) {
    const { condition } = altDesc;
    let conditionMet = true;

    // Check sanity condition
    if (condition.sanityBelow !== undefined && !(playerState.sanity < condition.sanityBelow)) {
      conditionMet = false;
    }

    if (condition.sanityAbove !== undefined && !(playerState.sanity > condition.sanityAbove)) {
      conditionMet = false;
    }

    // Check corruption condition
    if (condition.corruptionAbove !== undefined && 
        !(playerState.corruption > condition.corruptionAbove)) {
      conditionMet = false;
    }

    // Check items condition
    if (condition.hasItems && 
        !condition.hasItems.every(item => playerState.inventory.includes(item))) {
      conditionMet = false;
    }

    // Check flags condition
    if (condition.hasFlags) {
      for (const [flag, value] of Object.entries(condition.hasFlags)) {
        if (playerState.flags[flag] !== value) {
          conditionMet = false;
          break;
        }
      }
    }

    // If all conditions are met, use this alternate description
    if (conditionMet) {
      return altDesc.text;
    }
  }

  // If no alternate descriptions match, use the default
  return scene.description;
};