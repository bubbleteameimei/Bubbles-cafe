import { GameState, SceneData, PuzzleData, DialogData, InventoryItem, MapLocation } from './types';
import { gameScenes } from './data/scenes';
import { gamePuzzles } from './data/puzzles';
import { gameDialogs } from './data/dialogs';
import { gameItems } from './data/items';
import { gameMap } from './data/map';

export class GameEngine {
  private gameState: GameState;
  private setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  private setTextContent: React.Dispatch<React.SetStateAction<string[]>>;
  private setChoices: React.Dispatch<React.SetStateAction<{text: string, nextScene: string}[]>>;
  
  private scenes: Record<string, SceneData>;
  private puzzles: Record<string, PuzzleData>;
  private dialogs: Record<string, DialogData>;
  private items: Record<string, InventoryItem>;
  private map: Record<string, MapLocation>;
  
  constructor(
    setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    setTextContent: React.Dispatch<React.SetStateAction<string[]>>,
    setChoices: React.Dispatch<React.SetStateAction<{text: string, nextScene: string}[]>>
  ) {
    this.setGameState = setGameState;
    this.setTextContent = setTextContent;
    this.setChoices = setChoices;
    
    // Initialize game data
    this.scenes = gameScenes;
    this.puzzles = gamePuzzles;
    this.dialogs = gameDialogs;
    this.items = gameItems;
    this.map = gameMap;
    
    // Initialize default game state
    this.gameState = {
      currentScene: 'intro',
      inventory: [],
      visitedScenes: new Set(['intro']),
      playerHealth: 100,
      playerMana: 50,
      puzzlesSolved: new Set(),
      gameProgress: 0,
      choices: {},
      characterName: '',
      currentDialog: null,
      activePuzzle: null,
      gameOver: false,
      showMap: false,
      showInventory: false,
    };
  }
  
  // Start the game
  public startGame(): void {
    this.transitionToScene('intro');
  }
  
  // Restart the game
  public restartGame(): void {
    // Reset game state
    this.gameState = {
      currentScene: 'intro',
      inventory: [],
      visitedScenes: new Set(['intro']),
      playerHealth: 100,
      playerMana: 50,
      puzzlesSolved: new Set(),
      gameProgress: 0,
      choices: {},
      characterName: '',
      currentDialog: null,
      activePuzzle: null,
      gameOver: false,
      showMap: false,
      showInventory: false,
    };
    
    // Update state
    this.updateGameState();
    
    // Start the game
    this.transitionToScene('intro');
  }
  
  // Transition to a new scene
  public transitionToScene(sceneId: string): void {
    const scene = this.scenes[sceneId];
    
    if (!scene) {
      console.error(`Scene with id ${sceneId} not found!`);
      return;
    }
    
    // Update game state
    this.gameState.currentScene = sceneId;
    this.gameState.visitedScenes.add(sceneId);
    
    // Process scene triggers
    this.processSceneTriggers(scene);
    
    // Set text content
    this.setTextContent(scene.text);
    
    // Filter choices based on conditions
    const availableChoices = scene.choices.filter(choice => {
      if (!choice.condition) return true;
      
      const { condition } = choice;
      
      // Check item condition
      if (condition.item && !this.gameState.inventory.includes(condition.item)) {
        return false;
      }
      
      // Check puzzle condition
      if (condition.puzzle && !this.gameState.puzzlesSolved.has(condition.puzzle)) {
        return false;
      }
      
      // Check choice condition
      if (condition.choice && 
          this.gameState.choices[condition.choice.key] !== condition.choice.value) {
        return false;
      }
      
      // Check health condition
      if (condition.health !== undefined && this.gameState.playerHealth < condition.health) {
        return false;
      }
      
      // Check mana condition
      if (condition.mana !== undefined && this.gameState.playerMana < condition.mana) {
        return false;
      }
      
      return true;
    });
    
    // Set available choices
    this.setChoices(availableChoices.map(choice => ({
      text: choice.text,
      nextScene: choice.nextScene
    })));
    
    // Process choice consequences
    this.updateGameState();
  }
  
  // Process scene triggers
  private processSceneTriggers(scene: SceneData): void {
    if (!scene.triggers) return;
    
    for (const trigger of scene.triggers) {
      // Check trigger condition
      if (trigger.condition) {
        const { condition } = trigger;
        
        // Check item condition
        if (condition.item && !this.gameState.inventory.includes(condition.item)) {
          continue;
        }
        
        // Check puzzle condition
        if (condition.puzzle && !this.gameState.puzzlesSolved.has(condition.puzzle)) {
          continue;
        }
        
        // Check choice condition
        if (condition.choice && 
            this.gameState.choices[condition.choice.key] !== condition.choice.value) {
          continue;
        }
        
        // Check health condition
        if (condition.health !== undefined && this.gameState.playerHealth < condition.health) {
          continue;
        }
        
        // Check mana condition
        if (condition.mana !== undefined && this.gameState.playerMana < condition.mana) {
          continue;
        }
        
        // Check visit count condition
        if (condition.visitCount !== undefined) {
          const visitCount = Array.from(this.gameState.visitedScenes)
            .filter(id => id === scene.id).length;
          
          if (visitCount !== condition.visitCount) {
            continue;
          }
        }
      }
      
      // Process trigger based on type
      switch (trigger.type) {
        case 'dialog':
          this.gameState.currentDialog = this.dialogs[trigger.data.dialogId];
          break;
        
        case 'puzzle':
          this.gameState.activePuzzle = this.puzzles[trigger.data.puzzleId];
          break;
        
        case 'combat':
          // Handle combat trigger
          this.processCombat(trigger.data);
          break;
        
        case 'item':
          // Handle item trigger
          if (trigger.data.action === 'add') {
            this.addItemToInventory(trigger.data.itemId);
          } else if (trigger.data.action === 'remove') {
            this.removeItemFromInventory(trigger.data.itemId);
          }
          break;
        
        case 'status':
          // Handle status effect trigger
          this.processStatusEffect(trigger.data);
          break;
      }
    }
  }
  
  // Process choice consequences
  private processChoiceConsequences(consequences: any): void {
    if (!consequences) return;
    
    // Add item
    if (consequences.addItem) {
      this.addItemToInventory(consequences.addItem);
    }
    
    // Remove item
    if (consequences.removeItem) {
      this.removeItemFromInventory(consequences.removeItem);
    }
    
    // Update health
    if (consequences.health) {
      this.gameState.playerHealth = Math.max(
        0, 
        Math.min(100, this.gameState.playerHealth + consequences.health)
      );
      
      // Check for game over
      if (this.gameState.playerHealth <= 0) {
        this.gameState.gameOver = true;
      }
    }
    
    // Update mana
    if (consequences.mana) {
      this.gameState.playerMana = Math.max(
        0, 
        Math.min(100, this.gameState.playerMana + consequences.mana)
      );
    }
    
    // Update progress
    if (consequences.progress) {
      this.gameState.gameProgress += consequences.progress;
    }
    
    // Set choice
    if (consequences.setChoice) {
      this.gameState.choices[consequences.setChoice.key] = consequences.setChoice.value;
    }
  }
  
  // Process combat
  private processCombat(combatData: any): void {
    // Apply damage to player
    if (combatData.damage) {
      this.gameState.playerHealth = Math.max(
        0, 
        this.gameState.playerHealth - combatData.damage
      );
      
      // Check for game over
      if (this.gameState.playerHealth <= 0) {
        this.gameState.gameOver = true;
      }
    }
    
    // Apply mana cost
    if (combatData.manaCost) {
      this.gameState.playerMana = Math.max(
        0, 
        this.gameState.playerMana - combatData.manaCost
      );
    }
  }
  
  // Process status effect
  private processStatusEffect(statusData: any): void {
    // Apply health effect
    if (statusData.health) {
      this.gameState.playerHealth = Math.max(
        0, 
        Math.min(100, this.gameState.playerHealth + statusData.health)
      );
      
      // Check for game over
      if (this.gameState.playerHealth <= 0) {
        this.gameState.gameOver = true;
      }
    }
    
    // Apply mana effect
    if (statusData.mana) {
      this.gameState.playerMana = Math.max(
        0, 
        Math.min(100, this.gameState.playerMana + statusData.mana)
      );
    }
  }
  
  // Add item to inventory
  public addItemToInventory(itemId: string): void {
    if (!this.gameState.inventory.includes(itemId)) {
      this.gameState.inventory.push(itemId);
    }
  }
  
  // Remove item from inventory
  public removeItemFromInventory(itemId: string): void {
    this.gameState.inventory = this.gameState.inventory.filter(id => id !== itemId);
  }
  
  // Solve puzzle
  public solvePuzzle(puzzleId: string): void {
    // Mark puzzle as solved
    this.gameState.puzzlesSolved.add(puzzleId);
    
    // Close puzzle dialog
    this.gameState.activePuzzle = null;
    
    // Update game progress
    this.gameState.gameProgress += 10;
    
    // Check for special puzzle rewards
    const puzzle = this.puzzles[puzzleId];
    if (puzzle && puzzle.data.reward) {
      if (puzzle.data.reward.item) {
        this.addItemToInventory(puzzle.data.reward.item);
      }
      
      if (puzzle.data.reward.health) {
        this.gameState.playerHealth = Math.min(
          100, 
          this.gameState.playerHealth + puzzle.data.reward.health
        );
      }
      
      if (puzzle.data.reward.mana) {
        this.gameState.playerMana = Math.min(
          100, 
          this.gameState.playerMana + puzzle.data.reward.mana
        );
      }
    }
    
    this.updateGameState();
  }
  
  // Get inventory item details
  public getInventoryItemDetails(itemId: string): InventoryItem | null {
    return this.items[itemId] || null;
  }
  
  // Use inventory item
  public useInventoryItem(itemId: string): void {
    const item = this.items[itemId];
    
    if (!item) return;
    
    // If item has a use action, perform it
    if (item.useAction) {
      switch (item.useAction) {
        case 'heal':
          this.gameState.playerHealth = Math.min(100, this.gameState.playerHealth + 20);
          break;
        
        case 'restore_mana':
          this.gameState.playerMana = Math.min(100, this.gameState.playerMana + 20);
          break;
        
        case 'unlock':
          // This will be handled by scene conditions
          break;
        
        case 'activate':
          // This will be handled by scene conditions
          break;
        
        case 'consume':
          // Remove consumable item after use
          this.removeItemFromInventory(itemId);
          break;
      }
    }
    
    this.updateGameState();
  }
  
  // Get map location
  public getMapLocation(locationId: string): MapLocation | null {
    return this.map[locationId] || null;
  }
  
  // Get scene details
  public getSceneDetails(sceneId: string): SceneData | null {
    return this.scenes[sceneId] || null;
  }
  
  // Update game state
  private updateGameState(): void {
    this.setGameState({...this.gameState});
  }
}