import { 
  GameState, 
  Scene, 
  InventoryItem, 
  Dialog, 
  Puzzle,
  GameAction,
  SaveData,
  PlayerStats
} from './types';

/**
 * GameEngine - Core game logic that manages state transitions and game mechanics
 */
class GameEngine {
  private gameState: GameState;
  private scenes: Record<string, Scene>;
  private dialogs: Record<string, Dialog>;
  private items: Record<string, InventoryItem>;
  private puzzles: Record<string, Puzzle>;
  private saveKey: string = 'eden_hollow_save';
  private listeners: Set<(state: GameState) => void>;
  
  constructor(
    scenes: Record<string, Scene>,
    dialogs: Record<string, Dialog>,
    items: Record<string, InventoryItem>,
    puzzles: Record<string, Puzzle>
  ) {
    this.scenes = scenes;
    this.dialogs = dialogs;
    this.items = items;
    this.puzzles = puzzles;
    this.listeners = new Set();
    
    // Initialize with default state or load saved state
    this.gameState = this.loadGame() || this.getInitialState();
  }
  
  /**
   * Create a default initial game state
   */
  private getInitialState(): GameState {
    return {
      currentSceneId: 'village_entrance',
      visitedScenes: ['village_entrance'],
      inventory: [],
      currentDialog: null,
      activeEffects: [],
      flags: {
        hasEncounteredTownspeople: false,
        hasInvestigatedChurch: false,
        hasFoundAbandondedHouse: false,
        hasMetStorekeeper: false,
        hasDiscoveredSecret: false,
      },
      activePuzzleId: null,
      player: {
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        sanity: 100,
        maxSanity: 100
      },
      gameTime: 0, // Time in minutes (in-game time)
      timeLastPlayed: Date.now()
    };
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: GameState) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * Notify all subscribers about state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback({ ...this.gameState }));
  }
  
  /**
   * Save the current game state to local storage
   */
  saveGame(): void {
    const saveData: SaveData = {
      gameState: this.gameState,
      savedAt: Date.now()
    };
    
    localStorage.setItem(this.saveKey, JSON.stringify(saveData));
  }
  
  /**
   * Load game state from local storage
   */
  loadGame(): GameState | null {
    const saveDataString = localStorage.getItem(this.saveKey);
    if (!saveDataString) return null;
    
    try {
      const saveData: SaveData = JSON.parse(saveDataString);
      return saveData.gameState;
    } catch (error) {
      console.error("Failed to load save data:", error);
      return null;
    }
  }
  
  /**
   * Delete save data from local storage
   */
  deleteSave(): void {
    localStorage.removeItem(this.saveKey);
    this.gameState = this.getInitialState();
    this.notifyListeners();
  }
  
  /**
   * Get current game state
   */
  getState(): GameState {
    return { ...this.gameState };
  }
  
  /**
   * Get current scene
   */
  getCurrentScene(): Scene {
    return this.scenes[this.gameState.currentSceneId];
  }
  
  /**
   * Navigate to a new scene
   */
  navigateToScene(sceneId: string): void {
    if (!this.scenes[sceneId]) {
      console.error(`Scene ${sceneId} does not exist`);
      return;
    }
    
    // Update state
    this.gameState.currentSceneId = sceneId;
    
    // Add to visited scenes if not already visited
    if (!this.gameState.visitedScenes.includes(sceneId)) {
      this.gameState.visitedScenes.push(sceneId);
    }
    
    // Handle scene-specific logic
    this.handleSceneEntry(sceneId);
    
    // Notify listeners about the state change
    this.notifyListeners();
    this.saveGame();
  }
  
  /**
   * Handle logic when entering a new scene
   */
  private handleSceneEntry(sceneId: string): void {
    const scene = this.scenes[sceneId];
    
    // Add ambient effects if there are any
    if (scene.environment && scene.environment.ambientEffect) {
      const newEffect = {
        id: `ambient_${sceneId}`,
        type: scene.environment.ambientEffect,
        duration: 0 // Permanent while in scene
      };
      
      // Don't add duplicate effects
      if (!this.gameState.activeEffects.some(e => e.id === newEffect.id)) {
        this.gameState.activeEffects.push(newEffect);
      }
    }
    
    // Trigger entry dialog if available and conditions are met
    if (scene.entryDialog) {
      const dialogId = scene.entryDialog;
      // Check if dialog should be displayed
      if (this.shouldTriggerDialog(dialogId)) {
        this.startDialog(dialogId);
      }
    }
    
    // Apply scene effects on player stats if any
    if (scene.playerEffects) {
      if (scene.playerEffects.healthChange) {
        this.updatePlayerStat('health', scene.playerEffects.healthChange);
      }
      
      if (scene.playerEffects.manaChange) {
        this.updatePlayerStat('mana', scene.playerEffects.manaChange);
      }
      
      if (scene.playerEffects.sanityChange) {
        this.updatePlayerStat('sanity', scene.playerEffects.sanityChange);
      }
    }
  }
  
  /**
   * Update a player stat with validation
   */
  updatePlayerStat(
    statName: keyof PlayerStats, 
    value: number, 
    isAbsolute: boolean = false
  ): void {
    const player = this.gameState.player;
    
    // Get the current and max values
    const current = player[statName] as number;
    const maxKey = `max${statName.charAt(0).toUpperCase() + statName.slice(1)}` as keyof PlayerStats;
    const max = player[maxKey] as number;
    
    // Calculate new value
    let newValue: number;
    if (isAbsolute) {
      newValue = value;
    } else {
      newValue = current + value;
    }
    
    // Clamp value between 0 and max
    newValue = Math.max(0, Math.min(newValue, max));
    
    // Update the stat
    player[statName] = newValue;
    
    // If health reaches 0, handle player death
    if (statName === 'health' && newValue <= 0) {
      this.handlePlayerDeath();
    }
    
    // If sanity reaches 0, handle sanity loss
    if (statName === 'sanity' && newValue <= 0) {
      this.handleSanityLoss();
    }
    
    this.notifyListeners();
  }
  
  /**
   * Handle player death
   */
  private handlePlayerDeath(): void {
    // Set game over state flag
    this.gameState.isGameOver = true;
    this.gameState.gameOverReason = 'death';
    
    // You could also navigate to a death scene
    this.startDialog('game_over_death');
    
    this.notifyListeners();
  }
  
  /**
   * Handle complete loss of sanity
   */
  private handleSanityLoss(): void {
    // Set game over state flag
    this.gameState.isGameOver = true;
    this.gameState.gameOverReason = 'insanity';
    
    // Navigate to insanity scene or dialog
    this.startDialog('game_over_insanity');
    
    this.notifyListeners();
  }
  
  /**
   * Add an item to the player's inventory
   */
  addItemToInventory(itemId: string): boolean {
    // Check if item exists
    if (!this.items[itemId]) {
      console.error(`Item ${itemId} does not exist`);
      return false;
    }
    
    // Check if inventory already has this item
    if (this.gameState.inventory.some(item => item.id === itemId)) {
      return false;
    }
    
    // Add item to inventory
    this.gameState.inventory.push({ ...this.items[itemId] });
    
    // Trigger any effects from picking up the item
    this.handleItemPickup(itemId);
    
    this.notifyListeners();
    this.saveGame();
    return true;
  }
  
  /**
   * Remove an item from inventory
   */
  removeItemFromInventory(itemId: string): boolean {
    const initialLength = this.gameState.inventory.length;
    
    this.gameState.inventory = this.gameState.inventory.filter(
      item => item.id !== itemId
    );
    
    const removed = initialLength > this.gameState.inventory.length;
    
    if (removed) {
      this.notifyListeners();
      this.saveGame();
    }
    
    return removed;
  }
  
  /**
   * Handle special effects when picking up an item
   */
  private handleItemPickup(itemId: string): void {
    const item = this.items[itemId];
    
    // Add item effects if they exist
    if (item.effects) {
      if (item.effects.healthChange) {
        this.updatePlayerStat('health', item.effects.healthChange);
      }
      
      if (item.effects.manaChange) {
        this.updatePlayerStat('mana', item.effects.manaChange);
      }
      
      if (item.effects.sanityChange) {
        this.updatePlayerStat('sanity', item.effects.sanityChange);
      }
      
      if (item.effects.addFlags) {
        item.effects.addFlags.forEach(flag => {
          this.gameState.flags[flag] = true;
        });
      }
    }
    
    // Start the item pickup dialog if it exists
    if (item.pickupDialog) {
      this.startDialog(item.pickupDialog);
    }
  }
  
  /**
   * Use an item from inventory
   */
  useItem(itemId: string): boolean {
    // Check if player has the item
    const itemIndex = this.gameState.inventory.findIndex(
      item => item.id === itemId
    );
    
    if (itemIndex === -1) {
      console.error(`Item ${itemId} not in inventory`);
      return false;
    }
    
    const item = this.gameState.inventory[itemIndex];
    
    // Handle item use effects
    if (item.useEffects) {
      if (item.useEffects.healthChange) {
        this.updatePlayerStat('health', item.useEffects.healthChange);
      }
      
      if (item.useEffects.manaChange) {
        this.updatePlayerStat('mana', item.useEffects.manaChange);
      }
      
      if (item.useEffects.sanityChange) {
        this.updatePlayerStat('sanity', item.useEffects.sanityChange);
      }
      
      if (item.useEffects.addFlags) {
        item.useEffects.addFlags.forEach(flag => {
          this.gameState.flags[flag] = true;
        });
      }
      
      if (item.useEffects.removeFlags) {
        item.useEffects.removeFlags.forEach(flag => {
          this.gameState.flags[flag] = false;
        });
      }
    }
    
    // Start dialog if one exists for this item
    if (item.useDialog) {
      this.startDialog(item.useDialog);
    }
    
    // Remove consumable items
    if (item.consumable) {
      this.gameState.inventory.splice(itemIndex, 1);
    }
    
    this.notifyListeners();
    this.saveGame();
    return true;
  }
  
  /**
   * Check if player has a specific item
   */
  hasItem(itemId: string): boolean {
    return this.gameState.inventory.some(item => item.id === itemId);
  }
  
  /**
   * Start a dialog sequence
   */
  startDialog(dialogId: string): void {
    // Check if dialog exists
    if (!this.dialogs[dialogId]) {
      console.error(`Dialog ${dialogId} does not exist`);
      return;
    }
    
    // Set current dialog
    this.gameState.currentDialog = {
      ...this.dialogs[dialogId],
      currentNodeIndex: 0
    };
    
    this.notifyListeners();
  }
  
  /**
   * Advance dialog to next node or handle dialog choice
   */
  advanceDialog(choiceIndex?: number): void {
    if (!this.gameState.currentDialog) {
      return;
    }
    
    const dialog = this.gameState.currentDialog;
    
    // If dialog has choices and a choice was selected
    if (dialog.choices && choiceIndex !== undefined) {
      const choice = dialog.choices[choiceIndex];
      
      // Handle choice effects
      if (choice.effects) {
        this.processGameActions(choice.effects);
      }
      
      // If choice leads to another dialog
      if (choice.nextDialogId) {
        this.startDialog(choice.nextDialogId);
        return;
      }
      
      // If choice ends the dialog
      this.endDialog();
      return;
    }
    
    // No choices, just advance to next node if it exists
    const currentNodeIndex = dialog.currentNodeIndex || 0;
    
    if (dialog.nodes && currentNodeIndex < dialog.nodes.length - 1) {
      dialog.currentNodeIndex = currentNodeIndex + 1;
    } else {
      // If there's a next dialog
      if (dialog.nextDialogId) {
        this.startDialog(dialog.nextDialogId);
        return;
      }
      
      // End dialog since there's nothing more
      this.endDialog();
    }
    
    this.notifyListeners();
  }
  
  /**
   * End the current dialog
   */
  endDialog(): void {
    if (!this.gameState.currentDialog) {
      return;
    }
    
    // Process end dialog effects if any
    const dialogId = this.gameState.currentDialog.id;
    const dialog = this.dialogs[dialogId];
    
    if (dialog.endEffects) {
      this.processGameActions(dialog.endEffects);
    }
    
    // Clear current dialog
    this.gameState.currentDialog = null;
    
    this.notifyListeners();
  }
  
  /**
   * Check if a dialog should be triggered
   */
  private shouldTriggerDialog(dialogId: string): boolean {
    const dialog = this.dialogs[dialogId];
    
    if (!dialog) return false;
    
    // If dialog has requireFlags condition, check if all flags are set
    if (dialog.requireFlags) {
      for (const flag of dialog.requireFlags) {
        if (!this.gameState.flags[flag]) {
          return false;
        }
      }
    }
    
    // If dialog has requireItems condition, check if player has all items
    if (dialog.requireItems) {
      for (const itemId of dialog.requireItems) {
        if (!this.hasItem(itemId)) {
          return false;
        }
      }
    }
    
    // If one-time dialog and has been shown already
    if (dialog.oneTime && this.gameState.flags[`dialog_shown_${dialogId}`]) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Start a puzzle challenge
   */
  startPuzzle(puzzleId: string): void {
    // Check if puzzle exists
    if (!this.puzzles[puzzleId]) {
      console.error(`Puzzle ${puzzleId} does not exist`);
      return;
    }
    
    // Set active puzzle
    this.gameState.activePuzzleId = puzzleId;
    
    this.notifyListeners();
  }
  
  /**
   * Solve the current puzzle
   */
  solvePuzzle(): void {
    if (!this.gameState.activePuzzleId) {
      return;
    }
    
    const puzzleId = this.gameState.activePuzzleId;
    const puzzle = this.puzzles[puzzleId];
    
    // Process any effects from solving the puzzle
    if (puzzle.solveEffects) {
      this.processGameActions(puzzle.solveEffects);
    }
    
    // Mark puzzle as solved
    this.gameState.flags[`puzzle_solved_${puzzleId}`] = true;
    
    // Clear active puzzle
    this.gameState.activePuzzleId = null;
    
    // Start completion dialog if exists
    if (puzzle.completionDialog) {
      this.startDialog(puzzle.completionDialog);
    }
    
    this.notifyListeners();
    this.saveGame();
  }
  
  /**
   * Cancel the current puzzle without solving
   */
  cancelPuzzle(): void {
    if (!this.gameState.activePuzzleId) {
      return;
    }
    
    // Clear active puzzle
    this.gameState.activePuzzleId = null;
    
    this.notifyListeners();
  }
  
  /**
   * Process a list of game actions (effects)
   */
  processGameActions(actions: GameAction[]): void {
    for (const action of actions) {
      switch (action.type) {
        case 'setFlag':
          this.gameState.flags[action.flag] = action.value;
          break;
          
        case 'giveItem':
          this.addItemToInventory(action.itemId);
          break;
          
        case 'removeItem':
          this.removeItemFromInventory(action.itemId);
          break;
          
        case 'startDialog':
          this.startDialog(action.dialogId);
          break;
          
        case 'changeScene':
          this.navigateToScene(action.sceneId);
          break;
          
        case 'modifyPlayerStat':
          this.updatePlayerStat(
            action.stat, 
            action.value, 
            action.absolute
          );
          break;
          
        case 'startPuzzle':
          this.startPuzzle(action.puzzleId);
          break;
          
        case 'advanceTime':
          this.gameState.gameTime += action.minutes;
          break;
          
        default:
          console.error(`Unknown action type: ${(action as any).type}`);
          break;
      }
    }
  }
  
  /**
   * Interact with a hotspot in the current scene
   */
  interactWithHotspot(hotspotId: string): void {
    const scene = this.scenes[this.gameState.currentSceneId];
    
    if (!scene.hotspots) {
      return;
    }
    
    const hotspot = scene.hotspots.find(h => h.id === hotspotId);
    
    if (!hotspot) {
      console.error(`Hotspot ${hotspotId} not found in scene ${scene.id}`);
      return;
    }
    
    // Process interaction effects
    if (hotspot.interactionEffects) {
      this.processGameActions(hotspot.interactionEffects);
    }
    
    this.notifyListeners();
    this.saveGame();
  }
  
  /**
   * Get active puzzle if any
   */
  getActivePuzzle(): Puzzle | null {
    if (!this.gameState.activePuzzleId) {
      return null;
    }
    
    return this.puzzles[this.gameState.activePuzzleId];
  }
  
  /**
   * Check if game should show a hint
   */
  shouldShowHint(): boolean {
    // Check various conditions to determine if a hint should be shown
    
    // For example, if player has been stuck in the same scene for a while
    const minutesInScene = 5; // You'd calculate this based on actual play time
    
    return minutesInScene > 10 && !this.gameState.hintsDisabled;
  }
  
  /**
   * Get appropriate hint for the current situation
   */
  getCurrentHint(): string | null {
    // Current scene
    const scene = this.scenes[this.gameState.currentSceneId];
    
    // If scene has hints, return one
    if (scene.hints && scene.hints.length > 0) {
      // Return a hint based on game state
      return scene.hints[0];
    }
    
    // Active puzzle hints
    if (this.gameState.activePuzzleId) {
      const puzzle = this.puzzles[this.gameState.activePuzzleId];
      if (puzzle.hints && puzzle.hints.length > 0) {
        return puzzle.hints[0];
      }
    }
    
    return null;
  }
  
  /**
   * Get current game progress percentage
   */
  getGameProgress(): number {
    // This would vary based on how you define progress
    // Example: based on visited scenes or completed puzzles
    
    // Using visited scenes as a simple metric
    const totalScenes = Object.keys(this.scenes).length;
    const visitedScenes = this.gameState.visitedScenes.length;
    
    return Math.min(100, Math.round((visitedScenes / totalScenes) * 100));
  }
  
  /**
   * Update game time and effects that happen over time
   */
  update(elapsedMs: number): void {
    // Convert real-time to game-time (e.g., 1 real second = 1 game minute)
    const elapsedGameMinutes = elapsedMs / 1000;
    
    // Update game time
    this.gameState.gameTime += elapsedGameMinutes;
    
    // Process time-based effects
    this.processTimeEffects(elapsedGameMinutes);
    
    // Update active effects durations and remove expired ones
    this.updateActiveEffects(elapsedGameMinutes);
    
    this.notifyListeners();
  }
  
  /**
   * Process effects that happen over time
   */
  private processTimeEffects(elapsedMinutes: number): void {
    // Example: Sanity drain in spooky areas
    const scene = this.scenes[this.gameState.currentSceneId];
    
    if (scene.environmentEffectsOverTime) {
      if (scene.environmentEffectsOverTime.sanityDrainPerMinute) {
        const drain = scene.environmentEffectsOverTime.sanityDrainPerMinute * elapsedMinutes;
        this.updatePlayerStat('sanity', -drain);
      }
      
      if (scene.environmentEffectsOverTime.healthDrainPerMinute) {
        const drain = scene.environmentEffectsOverTime.healthDrainPerMinute * elapsedMinutes;
        this.updatePlayerStat('health', -drain);
      }
      
      if (scene.environmentEffectsOverTime.manaRegenPerMinute) {
        const regen = scene.environmentEffectsOverTime.manaRegenPerMinute * elapsedMinutes;
        this.updatePlayerStat('mana', regen);
      }
    }
  }
  
  /**
   * Update active effects durations and remove expired ones
   */
  private updateActiveEffects(elapsedMinutes: number): void {
    const newActiveEffects = this.gameState.activeEffects.filter(effect => {
      // Skip permanent effects (duration = 0)
      if (effect.duration === 0) return true;
      
      // Decrease duration and filter out expired effects
      const newDuration = effect.duration - elapsedMinutes;
      
      if (newDuration <= 0) {
        return false;
      }
      
      effect.duration = newDuration;
      return true;
    });
    
    this.gameState.activeEffects = newActiveEffects;
  }
}

export default GameEngine;