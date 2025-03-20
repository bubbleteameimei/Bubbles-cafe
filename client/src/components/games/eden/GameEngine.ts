import { 
  GameState, 
  PlayerState,
  Scene, 
  Dialog, 
  InventoryItem,
  Puzzle,
  GameEffect,
  GameAction,
  SaveData,
  GameEngineConfig,
  DialogEffect,
  ActionType
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
    
    try {
      // Try to load existing game progress from the database
      const progressResponse = await fetch('/api/game/progress');
      
      if (progressResponse.ok) {
        // We have existing progress - load it
        const progress = await progressResponse.json();
        
        if (progress) {
          console.log('Loading existing game progress:', progress);
          
          // Update game state with progress data
          if (progress.currentSceneId) {
            this.gameState.currentScene = progress.currentSceneId;
          } else {
            this.gameState.currentScene = this.config.initialScene;
          }
          
          if (progress.visitedScenes && progress.visitedScenes.length > 0) {
            this.gameState.visitedScenes = progress.visitedScenes;
          } else {
            this.gameState.visitedScenes = [this.gameState.currentScene];
          }
          
          if (progress.inventory) {
            this.gameState.inventory = progress.inventory;
          }
          
          if (progress.flags) {
            this.gameState.flags = progress.flags;
          }
          
          if (progress.gameTime) {
            this.gameState.gameTime = progress.gameTime;
          }
          
          // Load available game data from the database (scenes, items, dialogs, puzzles)
          await this.loadGameData();
        }
      } else {
        // No existing progress or error - set up new game
        console.log('No existing game progress found, starting new game');
        this.gameState.currentScene = this.config.initialScene;
        this.gameState.visitedScenes = [this.config.initialScene];
        
        // Load available game data from the database (scenes, items, dialogs, puzzles)
        await this.loadGameData();
      }
    } catch (error) {
      // Error loading progress - default to new game
      console.error('Error loading game progress:', error);
      this.gameState.currentScene = this.config.initialScene;
      this.gameState.visitedScenes = [this.config.initialScene];
      
      // Still try to load game data
      try {
        await this.loadGameData();
      } catch (dataError) {
        console.error('Error loading game data:', dataError);
      }
    }
    
    this.isInitialized = true;
    
    // Notify all callbacks about state change
    this.notifyStateChange();
  }
  
  /**
   * Load game data (scenes, items, dialogs, puzzles) from the database
   */
  private async loadGameData(): Promise<void> {
    try {
      // In a full implementation, we would load all game data here
      // For now, we'll leave it as a placeholder for future implementation
      
      // Example implementation:
      /*
      // Load scenes
      const scenesResponse = await fetch('/api/game/scenes');
      if (scenesResponse.ok) {
        const scenes = await scenesResponse.json();
        scenes.forEach(scene => {
          this.sceneData[scene.sceneId] = scene.data;
        });
      }
      
      // Load items
      const itemsResponse = await fetch('/api/game/items');
      if (itemsResponse.ok) {
        const items = await itemsResponse.json();
        items.forEach(item => {
          this.itemData[item.itemId] = item.data;
        });
      }
      
      // Load dialogs
      const dialogsResponse = await fetch('/api/game/dialogs');
      if (dialogsResponse.ok) {
        const dialogs = await dialogsResponse.json();
        dialogs.forEach(dialog => {
          this.dialogData[dialog.dialogId] = dialog.data;
        });
      }
      
      // Load puzzles
      const puzzlesResponse = await fetch('/api/game/puzzles');
      if (puzzlesResponse.ok) {
        const puzzles = await puzzlesResponse.json();
        puzzles.forEach(puzzle => {
          this.puzzleData[puzzle.puzzleId] = puzzle.data;
        });
      }
      */
    } catch (error) {
      console.error('Error loading game data:', error);
    }
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
    
    // Save the initial game state and update stats
    this.saveProgress().catch(error => {
      console.error('Error saving initial game progress:', error);
    });
    
    // Update game stats - new game started
    this.updateStats({
      gamesStarted: 1
    }).catch(error => {
      console.error('Error updating game stats:', error);
    });
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
    
    // Track if this is a newly discovered scene
    const isNewScene = !this.gameState.visitedScenes.includes(sceneId);
    
    // Add to visited scenes if not already visited
    if (isNewScene) {
      this.gameState.visitedScenes.push(sceneId);
      
      // Update stats for newly discovered area
      this.updateStats({
        areasDiscovered: 1
      }).catch(error => {
        console.error('Error updating areas discovered stats:', error);
      });
    }
    
    // Notify callbacks
    this.notifyStateChange();
    this.notifySceneChange(sceneId);
    
    // Check for entry dialog in the new scene
    this.checkSceneEntryDialog();
    
    // Apply any environment effects from the scene
    this.applySceneEnvironmentEffects();
    
    // Save progress when changing scenes
    this.saveProgress().catch(error => {
      console.error('Error saving progress after scene change:', error);
    });
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
    
    // Update game stats for puzzle solved
    this.updateStats({
      puzzlesSolved: 1
    }).catch(error => {
      console.error('Error updating puzzle stats:', error);
    });
    
    // Save progress after solving puzzle
    this.saveProgress().catch(error => {
      console.error('Error saving progress after puzzle solved:', error);
    });
    
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
    
    // Check if this is a new item collection
    const isNewItem = !this.gameState.inventory.some(i => i.id === itemId);
    
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
    
    // Update stats if this is a new item
    if (isNewItem) {
      this.updateStats({
        itemsCollected: 1
      }).catch(error => {
        console.error('Error updating item collection stats:', error);
      });
      
      // Save progress after collecting a new item
      this.saveProgress().catch(error => {
        console.error('Error saving progress after item collection:', error);
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
    let maxValue: number;
    
    // Direct access to the max values
    switch (stat) {
      case 'health':
        maxValue = this.gameState.player.maxHealth;
        break;
      case 'mana':
        maxValue = this.gameState.player.maxMana;
        break;
      case 'sanity':
        maxValue = this.gameState.player.maxSanity;
        break;
      default:
        maxValue = 100; // Default fallback
    }
    
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
   * Save game progress to the database
   */
  async saveProgress(): Promise<boolean> {
    try {
      const progress = {
        currentSceneId: this.gameState.currentScene,
        visitedScenes: this.gameState.visitedScenes,
        inventory: this.gameState.inventory,
        flags: this.gameState.flags,
        gameTime: this.gameState.gameTime
      };

      const response = await fetch('/api/game/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progress)
      });

      if (!response.ok) {
        throw new Error(`Failed to save progress: ${response.status}`);
      }

      console.log('Game progress saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving game progress:', error);
      return false;
    }
  }

  /**
   * Update game stats in the database
   */
  async updateStats(stats: {
    playtime?: number;
    puzzlesSolved?: number;
    itemsCollected?: number;
    areasDiscovered?: number;
    gamesStarted?: number;
    gamesCompleted?: number;
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/game/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stats)
      });

      if (!response.ok) {
        throw new Error(`Failed to update stats: ${response.status}`);
      }

      console.log('Game stats updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating game stats:', error);
      return false;
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
        this.config.saveInterval && 
        this.gameState.gameTime % (this.config.saveInterval * 60) < minutes) {
      // We can't make this method async, so handle the promise separately
      this.autoSave().catch(error => {
        console.error('Error during auto-save:', error);
      });
      
      // Also save progress
      this.saveProgress().catch(error => {
        console.error('Error saving progress:', error);
      });
    }
  }
  
  /**
   * Game over
   */
  gameOver(reason: string): void {
    this.gameState.isGameOver = true;
    this.gameState.gameOverReason = reason;
    
    // Check if game was completed (not died)
    const isCompleted = !reason.includes('died') && !reason.includes('lost your mind');
    
    // Update game stats
    this.updateStats({
      gamesCompleted: isCompleted ? 1 : 0,
      playtime: this.gameState.gameTime
    }).catch(error => {
      console.error('Error updating game completion stats:', error);
    });
    
    // Save final game state
    this.saveProgress().catch(error => {
      console.error('Error saving final game state:', error);
    });
    
    // Create a final save if the game was completed successfully
    if (isCompleted) {
      const saveName = `Completed Game - ${new Date().toLocaleDateString()}`;
      this.saveGame(saveName).catch(error => {
        console.error('Error creating completion save:', error);
      });
    }
    
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
  private async autoSave(): Promise<void> {
    if (!this.config.enableAutoSave) return;
    
    const saveData: SaveData = {
      gameState: this.getState(),
      saveDate: new Date().toISOString(),
      playTime: this.gameState.gameTime,
      version: '1.0.0' // Game version
    };
    
    try {
      // Use the auto-save slot name
      const saveName = "Auto-save";
      
      // Check if auto-save already exists
      const saves = await this.getSaves();
      const autoSave = saves.find(save => save.name === saveName);
      
      if (autoSave) {
        // Update existing auto-save
        await fetch(`/api/game/saves/${autoSave.saveId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            gameState: saveData.gameState,
            playtime: saveData.playTime
          })
        });
      } else {
        // Create a new auto-save
        await fetch('/api/game/saves', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: saveName,
            gameState: saveData.gameState,
            playtime: saveData.playTime,
            saveId: `autosave-${Date.now()}`
          })
        });
      }
      
      console.log('Auto-saving game:', saveName);
    } catch (error) {
      console.error('Failed to auto-save game:', error);
    }
  }
  
  /**
   * Get all saved games
   */
  async getSaves(): Promise<any[]> {
    try {
      const response = await fetch('/api/game/saves');
      if (!response.ok) {
        throw new Error(`Failed to fetch saves: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching game saves:', error);
      return [];
    }
  }
  
  /**
   * Save the game to a slot
   */
  async saveGame(name: string): Promise<boolean> {
    try {
      const saveData: SaveData = {
        gameState: this.getState(),
        saveDate: new Date().toISOString(),
        playTime: this.gameState.gameTime,
        version: '1.0.0' // Game version
      };
      
      // Take a screenshot for the save (simplified for now)
      // In a real implementation, we would create a thumbnail of the current scene
      const screenshot = this.getCurrentScene()?.backgroundImage || '';
      
      // Create a unique save ID
      const saveId = `save-${Date.now()}`;
      
      const response = await fetch('/api/game/saves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          saveId,
          gameState: saveData.gameState,
          playtime: saveData.playTime,
          screenshot
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save game: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`Game saved successfully:`, result);
      return true;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  }
  
  /**
   * Load the game from a save ID
   */
  async loadGame(saveId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/game/saves/${saveId}`);
      if (!response.ok) {
        throw new Error(`Failed to load save: ${response.status}`);
      }
      
      const saveData = await response.json();
      
      // Restore game state
      this.gameState = saveData.gameState;
      
      // Notify callbacks
      this.notifyStateChange();
      this.notifySceneChange(this.gameState.currentScene);
      
      console.log(`Game loaded successfully:`, saveData);
      return true;
    } catch (error) {
      console.error('Error loading game save:', error);
      return false;
    }
  }
  
  /**
   * Delete a saved game
   */
  async deleteSave(saveId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/game/saves/${saveId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete save: ${response.status}`);
      }
      
      console.log(`Save ${saveId} deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting game save:', error);
      return false;
    }
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