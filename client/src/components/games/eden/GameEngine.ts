import { 
  GameState, 
  Scene, 
  Dialog, 
  InventoryItem,
  Puzzle,
  GameEffect,
  GameAction,
  SaveData,
  GameEngineConfig
} from './types';

/**
 * GameEngine - Core engine that manages game state and game logic
 * 
 * This is a simplified version that will be expanded with more functionality
 * including scene management, dialog system, inventory management, puzzle solving,
 * save/load functionality, and more.
 */
class GameEngine {
  private gameState: GameState;
  private config: GameEngineConfig;
  private sceneData: Record<string, Scene> = {};
  private dialogData: Record<string, Dialog> = {};
  private itemData: Record<string, InventoryItem> = {};
  private puzzleData: Record<string, Puzzle> = {};
  private saveSlots: SaveData[] = [];
  private isInitialized: boolean = false;
  
  // Event callbacks
  private onStateChangeCallbacks: ((state: GameState) => void)[] = [];
  private onSceneChangeCallbacks: ((sceneId: string) => void)[] = [];
  private onDialogStartCallbacks: ((dialog: Dialog) => void)[] = [];
  private onDialogEndCallbacks: ((dialogId: string) => void)[] = [];
  private onItemAddedCallbacks: ((item: InventoryItem) => void)[] = [];
  private onPuzzleStartCallbacks: ((puzzle: Puzzle) => void)[] = [];
  private onGameOverCallbacks: ((reason: string) => void)[] = [];
  
  constructor() {
    // Initialize with default state
    this.gameState = {
      player: {
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        sanity: 100,
        maxSanity: 100,
        level: 1,
        experience: 0
      },
      inventory: [],
      currentScene: '',
      visitedScenes: [],
      flags: {},
      gameTime: 0,
      activeEffects: [],
      isGameOver: false,
      hintsDisabled: false
    };
    
    // Default config
    this.config = {
      initialScene: 'village_entrance',
      showIntro: true,
      enableHints: true,
      enableAutoSave: true,
      saveInterval: 5, // minutes
      debugMode: false,
      difficultyLevel: 'normal'
    };
  }
  
  /**
   * Initialize the game engine with configuration and data
   */
  async initialize(config?: Partial<GameEngineConfig>): Promise<void> {
    if (this.isInitialized) {
      console.warn('GameEngine is already initialized');
      return;
    }
    
    // Merge provided config with defaults
    this.config = { ...this.config, ...config };
    
    // In a real implementation, we would load scene, dialog, item, and puzzle data here
    // For now, we'll just set the initial scene
    this.gameState.currentScene = this.config.initialScene;
    this.gameState.visitedScenes = [this.config.initialScene];
    
    this.isInitialized = true;
    
    // Notify all callbacks about state change
    this.notifyStateChange();
  }
  
  /**
   * Start a new game
   */
  startNewGame(): void {
    if (!this.isInitialized) {
      console.error('GameEngine must be initialized before starting a new game');
      return;
    }
    
    // Reset game state
    this.gameState = {
      player: {
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        sanity: 100,
        maxSanity: 100,
        level: 1,
        experience: 0
      },
      inventory: [],
      currentScene: this.config.initialScene,
      visitedScenes: [this.config.initialScene],
      flags: {},
      gameTime: 0,
      activeEffects: [],
      isGameOver: false,
      hintsDisabled: !this.config.enableHints
    };
    
    // Trigger onStateChange event
    this.notifyStateChange();
    
    // Trigger onSceneChange event
    this.notifySceneChange(this.gameState.currentScene);
    
    // Check for entry dialog in the initial scene
    this.checkSceneEntryDialog();
  }
  
  /**
   * Get the current game state
   */
  getState(): GameState {
    return { ...this.gameState };
  }
  
  /**
   * Get the current scene
   */
  getCurrentScene(): Scene | null {
    if (!this.gameState.currentScene) return null;
    return this.sceneData[this.gameState.currentScene] || null;
  }
  
  /**
   * Change to a different scene
   */
  changeScene(sceneId: string): void {
    if (!this.sceneData[sceneId]) {
      console.error(`Scene ${sceneId} not found`);
      return;
    }
    
    // Update scene in game state
    this.gameState.currentScene = sceneId;
    
    // Add to visited scenes if not already visited
    if (!this.gameState.visitedScenes.includes(sceneId)) {
      this.gameState.visitedScenes.push(sceneId);
    }
    
    // Notify callbacks
    this.notifyStateChange();
    this.notifySceneChange(sceneId);
    
    // Check for entry dialog in the new scene
    this.checkSceneEntryDialog();
    
    // Apply any environment effects from the scene
    this.applySceneEnvironmentEffects();
  }
  
  /**
   * Check if the current scene has an entry dialog and trigger it
   */
  private checkSceneEntryDialog(): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;
    
    if (currentScene.entryDialog) {
      const dialog = this.dialogData[currentScene.entryDialog];
      if (dialog) {
        this.startDialog(currentScene.entryDialog);
      }
    }
  }
  
  /**
   * Apply environment effects from the current scene
   */
  private applySceneEnvironmentEffects(): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;
    
    // Apply immediate player effects if any
    if (currentScene.playerEffects) {
      currentScene.playerEffects.forEach(effect => {
        this.applyEffect(effect);
      });
    }
  }
  
  /**
   * Apply time-based environmental effects
   */
  private applyEnvironmentalEffectsOverTime(): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene || !currentScene.environmentEffectsOverTime) return;
    
    currentScene.environmentEffectsOverTime.forEach(effect => {
      this.applyEffect(effect);
    });
  }
  
  /**
   * Update active effects, removing expired ones
   */
  private updateActiveEffects(): void {
    if (!this.gameState.activeEffects.length) return;
    
    this.gameState.activeEffects = this.gameState.activeEffects.filter(effect => {
      // If no duration or duration is <= 0, it's permanent
      if (!effect.duration || effect.duration <= 0) return true;
      
      // Check if effect has expired
      const timeRemaining = effect.duration - this.gameState.gameTime;
      return timeRemaining > 0;
    });
  }
  
  /**
   * Start a dialog by ID
   */
  startDialog(dialogId: string): void {
    const dialog = this.dialogData[dialogId];
    if (!dialog) {
      console.error(`Dialog ${dialogId} not found`);
      return;
    }
    
    // Check if dialog has requirements
    if (dialog.requireFlags) {
      // Check if all required flags match
      const allFlagsMatch = Object.entries(dialog.requireFlags).every(
        ([flag, value]) => this.gameState.flags[flag] === value
      );
      
      if (!allFlagsMatch) return;
    }
    
    // Check if dialog requires items
    if (dialog.requireItems) {
      const hasAllItems = dialog.requireItems.every(itemId => 
        this.gameState.inventory.some(item => item.id === itemId)
      );
      
      if (!hasAllItems) return;
    }
    
    // Check if one-time dialog has already been shown
    if (dialog.oneTime && this.gameState.flags[`dialog_shown_${dialogId}`]) {
      return;
    }
    
    // Set current dialog in game state
    this.gameState.currentDialog = dialog;
    
    // Mark one-time dialog as shown
    if (dialog.oneTime) {
      this.gameState.flags[`dialog_shown_${dialogId}`] = true;
    }
    
    // Notify callbacks
    this.notifyStateChange();
    this.notifyDialogStart(dialog);
  }
  
  /**
   * End the current dialog
   */
  endDialog(): void {
    if (!this.gameState.currentDialog) return;
    
    const dialogId = this.gameState.currentDialog.id;
    
    // Apply end effects if any
    if (this.gameState.currentDialog.endEffects) {
      this.gameState.currentDialog.endEffects.forEach(effect => {
        this.applyEffect(effect);
      });
    }
    
    // Clear current dialog
    const previousDialog = this.gameState.currentDialog;
    this.gameState.currentDialog = undefined;
    
    // Notify callbacks
    this.notifyStateChange();
    this.notifyDialogEnd(dialogId);
    
    // Check if there's a next dialog to show
    if (previousDialog.nextDialog) {
      this.startDialog(previousDialog.nextDialog);
    }
  }
  
  /**
   * Select a dialog choice
   */
  selectDialogChoice(choiceIndex: number): void {
    if (!this.gameState.currentDialog || !this.gameState.currentDialog.choices) {
      return;
    }
    
    const choices = this.gameState.currentDialog.choices;
    if (choiceIndex < 0 || choiceIndex >= choices.length) {
      console.error(`Invalid choice index: ${choiceIndex}`);
      return;
    }
    
    const choice = choices[choiceIndex];
    
    // Apply choice effects if any
    if (choice.effects) {
      choice.effects.forEach(effect => {
        this.applyGameEffect(effect);
      });
    }
    
    // End current dialog
    this.endDialog();
    
    // Start next dialog if specified
    if (choice.nextDialog) {
      this.startDialog(choice.nextDialog);
    }
  }
  
  /**
   * Start a puzzle
   */
  startPuzzle(puzzleId: string): void {
    const puzzle = this.puzzleData[puzzleId];
    if (!puzzle) {
      console.error(`Puzzle ${puzzleId} not found`);
      return;
    }
    
    // Set current puzzle in game state
    this.gameState.currentPuzzle = puzzle;
    
    // Notify callbacks
    this.notifyStateChange();
    this.notifyPuzzleStart(puzzle);
  }
  
  /**
   * Solve the current puzzle
   */
  solvePuzzle(): void {
    if (!this.gameState.currentPuzzle) return;
    
    // Apply solve effects if any
    if (this.gameState.currentPuzzle.solveEffects) {
      this.gameState.currentPuzzle.solveEffects.forEach(effect => {
        this.applyEffect(effect);
      });
    }
    
    // Mark puzzle as solved
    this.gameState.flags[`puzzle_solved_${this.gameState.currentPuzzle.id}`] = true;
    
    // Show completion dialog if specified
    const puzzleId = this.gameState.currentPuzzle.id;
    const completionDialogId = this.gameState.currentPuzzle.completionDialog;
    
    // Clear current puzzle
    this.gameState.currentPuzzle = undefined;
    
    // Notify callbacks
    this.notifyStateChange();
    
    // Start completion dialog if specified
    if (completionDialogId) {
      this.startDialog(completionDialogId);
    }
  }
  
  /**
   * Apply a game action
   */
  applyAction(action: GameAction): void {
    switch (action.type) {
      case 'setFlag':
        if (action.flag !== undefined) {
          this.gameState.flags[action.flag] = action.value !== undefined ? action.value : true;
        }
        break;
        
      case 'giveItem':
        if (action.itemId) {
          this.addInventoryItem(action.itemId);
        }
        break;
        
      case 'removeItem':
        if (action.itemId) {
          this.removeInventoryItem(action.itemId);
        }
        break;
        
      case 'showDialog':
        if (action.dialogId) {
          this.startDialog(action.dialogId);
        }
        break;
        
      case 'changeScene':
        if (action.sceneId) {
          this.changeScene(action.sceneId);
        }
        break;
        
      case 'modifyStat':
        if (action.stat && action.value !== undefined) {
          this.modifyPlayerStat(action.stat, action.value, action.absolute || false);
        }
        break;
        
      case 'showPuzzle':
        if (action.puzzleId) {
          this.startPuzzle(action.puzzleId);
        }
        break;
        
      case 'advanceTime':
        if (action.minutes !== undefined) {
          this.advanceTime(action.minutes);
        }
        break;
    }
    
    // Notify callbacks
    this.notifyStateChange();
  }
  
  /**
   * Apply a dialog effect (simplified version of a game action)
   */
  private applyGameEffect(effect: DialogEffect): void {
    // For simplicity, map dialog effects to game actions
    const action: Partial<GameAction> = {
      type: effect.type as ActionType
    };
    
    if (effect.value !== undefined) {
      action.value = effect.value;
    }
    
    if (effect.target !== undefined) {
      switch (effect.type) {
        case 'setFlag':
          action.flag = effect.target;
          break;
        case 'giveItem':
        case 'removeItem':
          action.itemId = effect.target;
          break;
        case 'showDialog':
          action.dialogId = effect.target;
          break;
        case 'changeScene':
          action.sceneId = effect.target;
          break;
        case 'modifyStat':
          action.stat = effect.target as 'health' | 'mana' | 'sanity';
          break;
        case 'showPuzzle':
          action.puzzleId = effect.target;
          break;
      }
    }
    
    // Apply the action
    this.applyAction(action as GameAction);
  }
  
  /**
   * Apply a game effect
   */
  private applyEffect(effect: GameEffect): void {
    switch (effect.type) {
      case 'health':
        this.modifyPlayerStat('health', effect.value as number);
        break;
        
      case 'mana':
        this.modifyPlayerStat('mana', effect.value as number);
        break;
        
      case 'sanity':
        this.modifyPlayerStat('sanity', effect.value as number);
        break;
        
      case 'flag':
        if (typeof effect.value === 'string') {
          const [flag, value] = effect.value.split(':');
          this.gameState.flags[flag] = value === 'true' ? true : 
                                      value === 'false' ? false : 
                                      !isNaN(Number(value)) ? Number(value) : value;
        }
        break;
        
      case 'item':
        if (typeof effect.value === 'string') {
          // Format can be "add:itemId" or "remove:itemId"
          const [action, itemId] = effect.value.split(':');
          if (action === 'add') {
            this.addInventoryItem(itemId);
          } else if (action === 'remove') {
            this.removeInventoryItem(itemId);
          }
        }
        break;
        
      case 'dialog':
        if (typeof effect.value === 'string') {
          this.startDialog(effect.value);
        }
        break;
        
      case 'scene':
        if (typeof effect.value === 'string') {
          this.changeScene(effect.value);
        }
        break;
        
      case 'time':
        if (typeof effect.value === 'number') {
          this.advanceTime(effect.value);
        }
        break;
    }
    
    // If effect has a duration, add it to active effects
    if (effect.duration) {
      // Add effect to active effects if not already there
      if (!this.gameState.activeEffects.some(e => 
        e.type === effect.type && e.value === effect.value
      )) {
        this.gameState.activeEffects.push({
          ...effect,
          duration: this.gameState.gameTime + effect.duration
        });
      }
    }
  }
  
  /**
   * Add an item to the player's inventory
   */
  addInventoryItem(itemId: string): void {
    const item = this.itemData[itemId];
    if (!item) {
      console.error(`Item ${itemId} not found`);
      return;
    }
    
    // Check if item is stackable and already in inventory
    if (item.stackable) {
      const existingItem = this.gameState.inventory.find(i => i.id === itemId);
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        this.gameState.inventory.push({
          ...item,
          quantity: 1,
          discoveredAt: this.gameState.gameTime
        });
      }
    } else {
      // Add new item to inventory
      this.gameState.inventory.push({
        ...item,
        discoveredAt: this.gameState.gameTime
      });
    }
    
    // Notify callbacks
    this.notifyStateChange();
    this.notifyItemAdded(item);
  }
  
  /**
   * Remove an item from the player's inventory
   */
  removeInventoryItem(itemId: string): void {
    const itemIndex = this.gameState.inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    const item = this.gameState.inventory[itemIndex];
    
    // If stackable and quantity > 1, just reduce quantity
    if (item.stackable && item.quantity && item.quantity > 1) {
      item.quantity--;
    } else {
      // Remove item from inventory
      this.gameState.inventory.splice(itemIndex, 1);
    }
    
    // Notify callbacks
    this.notifyStateChange();
  }
  
  /**
   * Modify a player stat
   */
  private modifyPlayerStat(stat: 'health' | 'mana' | 'sanity', value: number, absolute = false): void {
    if (!this.gameState.player) return;
    
    const currentValue = this.gameState.player[stat];
    const maxValue = this.gameState.player[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`];
    
    if (absolute) {
      // Set absolute value, clamped to max
      this.gameState.player[stat] = Math.min(value, maxValue);
    } else {
      // Add value (can be negative), clamped between 0 and max
      this.gameState.player[stat] = Math.max(0, Math.min(currentValue + value, maxValue));
    }
    
    // Check for game over if health reaches 0
    if (stat === 'health' && this.gameState.player.health <= 0) {
      this.gameOver('You have died.');
    }
    
    // Check for game over if sanity reaches 0
    if (stat === 'sanity' && this.gameState.player.sanity <= 0) {
      this.gameOver('You have lost your mind to the darkness.');
    }
  }
  
  /**
   * Advance game time
   */
  advanceTime(minutes: number): void {
    this.gameState.gameTime += minutes;
    
    // Apply environmental effects over time
    this.applyEnvironmentalEffectsOverTime();
    
    // Update active effects, removing expired ones
    this.updateActiveEffects();
    
    // Auto-save if enabled
    if (this.config.enableAutoSave && 
        this.gameState.gameTime % (this.config.saveInterval * 60) < minutes) {
      this.autoSave();
    }
  }
  
  /**
   * Game over
   */
  gameOver(reason: string): void {
    this.gameState.isGameOver = true;
    this.gameState.gameOverReason = reason;
    
    // Notify callbacks
    this.notifyStateChange();
    this.notifyGameOver(reason);
  }
  
  /**
   * Interact with a hotspot
   */
  interactWithHotspot(hotspotId: string): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene || !currentScene.hotspots) return;
    
    const hotspot = currentScene.hotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;
    
    // Apply interaction effects if any
    if (hotspot.interactionEffects) {
      hotspot.interactionEffects.forEach(effect => {
        this.applyEffect(effect);
      });
    }
    
    // Start dialog if specified
    if (hotspot.dialogId) {
      this.startDialog(hotspot.dialogId);
    }
    
    // Start puzzle if specified
    if (hotspot.puzzleId) {
      this.startPuzzle(hotspot.puzzleId);
    }
  }
  
  /**
   * Get a hint for the current scene
   */
  getSceneHint(): string | null {
    if (this.gameState.hintsDisabled) return null;
    
    const currentScene = this.getCurrentScene();
    if (!currentScene || !currentScene.hints || currentScene.hints.length === 0) {
      return null;
    }
    
    // For simplicity, return a random hint
    const randomIndex = Math.floor(Math.random() * currentScene.hints.length);
    return currentScene.hints[randomIndex];
  }
  
  /**
   * Auto-save the game
   */
  private autoSave(): void {
    if (!this.config.enableAutoSave) return;
    
    const saveData: SaveData = {
      gameState: this.getState(),
      saveDate: new Date().toISOString(),
      playTime: this.gameState.gameTime,
      version: '1.0.0' // Game version
    };
    
    // In a real implementation, we would save to localStorage or a server
    console.log('Auto-saving game:', saveData);
  }
  
  /**
   * Save the game to a slot
   */
  saveGame(slotIndex: number): void {
    const saveData: SaveData = {
      gameState: this.getState(),
      saveDate: new Date().toISOString(),
      playTime: this.gameState.gameTime,
      version: '1.0.0' // Game version
    };
    
    // In a real implementation, we would save to localStorage or a server
    this.saveSlots[slotIndex] = saveData;
    console.log(`Game saved to slot ${slotIndex}:`, saveData);
  }
  
  /**
   * Load the game from a slot
   */
  loadGame(slotIndex: number): boolean {
    const saveData = this.saveSlots[slotIndex];
    if (!saveData) {
      console.error(`No save data found in slot ${slotIndex}`);
      return false;
    }
    
    // Restore game state
    this.gameState = saveData.gameState;
    
    // Notify callbacks
    this.notifyStateChange();
    this.notifySceneChange(this.gameState.currentScene);
    
    console.log(`Game loaded from slot ${slotIndex}:`, saveData);
    return true;
  }
  
  /**
   * Subscribe to state change events
   */
  onStateChange(callback: (state: GameState) => void): () => void {
    this.onStateChangeCallbacks.push(callback);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Subscribe to scene change events
   */
  onSceneChange(callback: (sceneId: string) => void): () => void {
    this.onSceneChangeCallbacks.push(callback);
    return () => {
      this.onSceneChangeCallbacks = this.onSceneChangeCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Subscribe to dialog start events
   */
  onDialogStart(callback: (dialog: Dialog) => void): () => void {
    this.onDialogStartCallbacks.push(callback);
    return () => {
      this.onDialogStartCallbacks = this.onDialogStartCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Subscribe to dialog end events
   */
  onDialogEnd(callback: (dialogId: string) => void): () => void {
    this.onDialogEndCallbacks.push(callback);
    return () => {
      this.onDialogEndCallbacks = this.onDialogEndCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Subscribe to item added events
   */
  onItemAdded(callback: (item: InventoryItem) => void): () => void {
    this.onItemAddedCallbacks.push(callback);
    return () => {
      this.onItemAddedCallbacks = this.onItemAddedCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Subscribe to puzzle start events
   */
  onPuzzleStart(callback: (puzzle: Puzzle) => void): () => void {
    this.onPuzzleStartCallbacks.push(callback);
    return () => {
      this.onPuzzleStartCallbacks = this.onPuzzleStartCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Subscribe to game over events
   */
  onGameOver(callback: (reason: string) => void): () => void {
    this.onGameOverCallbacks.push(callback);
    return () => {
      this.onGameOverCallbacks = this.onGameOverCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify all state change callbacks
   */
  private notifyStateChange(): void {
    this.onStateChangeCallbacks.forEach(callback => {
      callback(this.getState());
    });
  }
  
  /**
   * Notify all scene change callbacks
   */
  private notifySceneChange(sceneId: string): void {
    this.onSceneChangeCallbacks.forEach(callback => {
      callback(sceneId);
    });
  }
  
  /**
   * Notify all dialog start callbacks
   */
  private notifyDialogStart(dialog: Dialog): void {
    this.onDialogStartCallbacks.forEach(callback => {
      callback(dialog);
    });
  }
  
  /**
   * Notify all dialog end callbacks
   */
  private notifyDialogEnd(dialogId: string): void {
    this.onDialogEndCallbacks.forEach(callback => {
      callback(dialogId);
    });
  }
  
  /**
   * Notify all item added callbacks
   */
  private notifyItemAdded(item: InventoryItem): void {
    this.onItemAddedCallbacks.forEach(callback => {
      callback(item);
    });
  }
  
  /**
   * Notify all puzzle start callbacks
   */
  private notifyPuzzleStart(puzzle: Puzzle): void {
    this.onPuzzleStartCallbacks.forEach(callback => {
      callback(puzzle);
    });
  }
  
  /**
   * Notify all game over callbacks
   */
  private notifyGameOver(reason: string): void {
    this.onGameOverCallbacks.forEach(callback => {
      callback(reason);
    });
  }
}

// Create and export a singleton instance
export const gameEngine = new GameEngine();

// For convenience, also export the class
export default GameEngine;