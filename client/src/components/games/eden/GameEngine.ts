import { 
  GameState, 
  PlayerState, 
  Scene, 
  Dialog, 
  Puzzle,
  GameEvent,
  InventoryItem, 
  GameNotification,
  GameResults
} from './types';

import scenes from './data/scenes';
import items from './data/items';
import dialogs from './data/dialogs';
import puzzles from './data/puzzles';

/**
 * Game Engine for Eden's Hollow
 * Manages game state and logic for the interactive horror story
 */
export class GameEngine {
  private state: GameState;
  private initialState: GameState;
  private eventListeners: Record<string, Function[]> = {};
  
  /**
   * Initialize the game engine with default state
   */
  constructor(initialState?: Partial<GameState>) {
    // Create default game state
    const defaultState: GameState = {
      currentSceneId: 'village_entrance',
      player: {
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        sanity: 100,
        maxSanity: 100
      },
      inventory: [],
      activeDialogId: null,
      dialogLineIndex: 0,
      activePuzzleId: null,
      completedPuzzles: [],
      discoveredSecrets: [],
      unlockedScenes: ['village_entrance'],
      gameTime: 720, // Start at noon (12:00)
      fogLevel: 30,
      notifications: [],
      gameFlags: {}
    };
    
    // Merge with provided initial state if any
    this.initialState = { ...defaultState, ...initialState };
    this.state = JSON.parse(JSON.stringify(this.initialState));
  }
  
  /**
   * Get the current game state
   */
  getState(): GameState {
    return this.state;
  }
  
  /**
   * Reset the game to initial state
   */
  resetGame(): void {
    this.state = JSON.parse(JSON.stringify(this.initialState));
    this.emit('gameReset', this.state);
  }
  
  /**
   * Add an event listener
   */
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(event: string, callback: Function): void {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }
  
  /**
   * Emit an event to all registered listeners
   */
  private emit(event: string, ...args: any[]): void {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => callback(...args));
  }
  
  /**
   * Get the current scene
   */
  getCurrentScene(): Scene {
    return scenes[this.state.currentSceneId];
  }
  
  /**
   * Change to a different scene
   */
  changeScene(sceneId: string): void {
    const currentScene = this.getCurrentScene();
    
    // Run exit events for the current scene
    if (currentScene.onExit) {
      this.processEvents(currentScene.onExit);
    }
    
    // Update current scene
    this.state.currentSceneId = sceneId;
    
    // Run enter events for the new scene
    const newScene = this.getCurrentScene();
    if (newScene.onEnter) {
      this.processEvents(newScene.onEnter);
    }
    
    // Add to unlocked scenes
    if (!this.state.unlockedScenes.includes(sceneId)) {
      this.state.unlockedScenes.push(sceneId);
    }
    
    this.emit('sceneChanged', newScene);
  }
  
  /**
   * Use an exit to move to another scene
   */
  useExit(exitId: string): void {
    const scene = this.getCurrentScene();
    const exit = scene.exits?.find(e => e.id === exitId);
    
    if (!exit) return;
    
    // Check if exit is locked
    if (exit.locked) {
      // Check if player has required item
      if (exit.requiredItemId && this.hasItem(exit.requiredItemId)) {
        // Unlock the exit
        this.showNotification({
          id: `exit_unlock_${exitId}`,
          message: exit.unlockMessage || 'You unlocked the way forward.',
          type: 'discovery'
        });
        
        // TODO: Should we remove the key item?
        // this.removeItem(exit.requiredItemId);
        
        this.changeScene(exit.targetSceneId);
      } else {
        // Show locked message
        this.showNotification({
          id: `exit_locked_${exitId}`,
          message: exit.unlockMessage || 'This way is locked. You need to find a key.',
          type: 'info'
        });
      }
    } else {
      // Exit is not locked, proceed to the new scene
      this.changeScene(exit.targetSceneId);
    }
  }
  
  /**
   * Interact with a hotspot
   */
  interactWithHotspot(hotspotId: string): void {
    const scene = this.getCurrentScene();
    const hotspot = scene.hotspots?.find(h => h.id === hotspotId);
    
    if (!hotspot) return;
    
    // Find the first available action for this hotspot
    for (const action of hotspot.actions) {
      // Check if action requires an item
      if (action.requiredItemId && !this.hasItem(action.requiredItemId)) {
        continue;
      }
      
      // Handle action based on type
      switch (action.type) {
        case 'examine':
          this.showNotification({
            id: `examine_${hotspotId}`,
            message: action.resultText || hotspot.description,
            type: 'info'
          });
          break;
          
        case 'interact':
          this.showNotification({
            id: `interact_${hotspotId}`,
            message: action.resultText || `You interact with ${hotspot.name}.`,
            type: 'info'
          });
          if (action.events) {
            this.processEvents(action.events);
          }
          break;
          
        case 'take':
          if (action.targetId) {
            this.takeItem(action.targetId);
          }
          break;
          
        case 'use':
          this.showNotification({
            id: `use_${hotspotId}`,
            message: action.resultText || `You use ${hotspot.name}.`,
            type: 'info'
          });
          if (action.events) {
            this.processEvents(action.events);
          }
          break;
          
        case 'dialog':
          if (action.targetId) {
            this.openDialog(action.targetId);
          }
          break;
      }
      
      // Only perform the first valid action
      break;
    }
    
    this.emit('hotspotInteracted', hotspotId);
  }
  
  /**
   * Take an item from the scene
   */
  takeItem(itemPlacementId: string): void {
    const scene = this.getCurrentScene();
    const itemPlacement = scene.items?.find(i => i.id === itemPlacementId);
    
    if (!itemPlacement) return;
    
    const itemId = itemPlacement.itemId;
    const item = items[itemId];
    
    if (!item) return;
    
    // Add item to inventory
    this.state.inventory.push({ ...item });
    
    // Show notification
    this.showNotification({
      id: `item_taken_${itemId}`,
      message: `You found: ${item.name}`,
      type: 'discovery'
    });
    
    // Remove item from scene (by hiding it)
    if (scene.items) {
      const index = scene.items.findIndex(i => i.id === itemPlacementId);
      if (index >= 0) {
        scene.items[index].hidden = true;
      }
    }
    
    this.emit('itemTaken', item);
  }
  
  /**
   * Check if player has an item
   */
  hasItem(itemId: string): boolean {
    return this.state.inventory.some(item => item.id === itemId);
  }
  
  /**
   * Remove an item from inventory
   */
  removeItem(itemId: string): void {
    this.state.inventory = this.state.inventory.filter(item => item.id !== itemId);
    this.emit('inventoryChanged', this.state.inventory);
  }
  
  /**
   * Open a dialog
   */
  openDialog(dialogId: string): void {
    this.state.activeDialogId = dialogId;
    this.state.dialogLineIndex = 0;
    this.emit('dialogOpened', dialogs[dialogId]);
  }
  
  /**
   * End the current dialog
   */
  endDialog(): void {
    this.state.activeDialogId = null;
    this.state.dialogLineIndex = 0;
    this.emit('dialogClosed');
  }
  
  /**
   * Select a dialog response
   */
  selectDialogResponse(responseIndex: number): void {
    if (!this.state.activeDialogId) return;
    
    const dialog = dialogs[this.state.activeDialogId];
    const currentLine = dialog.lines[this.state.dialogLineIndex];
    
    if (!currentLine.responses || responseIndex >= currentLine.responses.length) return;
    
    const response = currentLine.responses[responseIndex];
    
    // Process any events tied to this response
    if (response.events) {
      this.processEvents(response.events);
    }
    
    // Move to the next dialog line
    if (response.nextIndex !== undefined) {
      if (response.nextIndex < 0) {
        // Negative index means end the dialog
        this.endDialog();
      } else {
        this.state.dialogLineIndex = response.nextIndex;
        this.emit('dialogAdvanced', dialog, this.state.dialogLineIndex);
      }
    }
  }
  
  /**
   * Start a puzzle
   */
  startPuzzle(puzzleId: string): void {
    this.state.activePuzzleId = puzzleId;
    this.emit('puzzleStarted', puzzles[puzzleId]);
  }
  
  /**
   * Cancel the current puzzle
   */
  cancelPuzzle(): void {
    this.state.activePuzzleId = null;
    this.emit('puzzleCancelled');
  }
  
  /**
   * Solve the current puzzle
   */
  solvePuzzle(): void {
    if (!this.state.activePuzzleId) return;
    
    const puzzleId = this.state.activePuzzleId;
    const puzzle = puzzles[puzzleId];
    
    // Add to completed puzzles
    if (!this.state.completedPuzzles.includes(puzzleId)) {
      this.state.completedPuzzles.push(puzzleId);
    }
    
    // Process puzzle completion events
    if (puzzle.onSolve) {
      this.processEvents(puzzle.onSolve);
    }
    
    // Show notification
    this.showNotification({
      id: `puzzle_solved_${puzzleId}`,
      message: `Puzzle solved: ${puzzle.name}`,
      type: 'achievement'
    });
    
    // Close the puzzle
    this.state.activePuzzleId = null;
    this.emit('puzzleSolved', puzzleId);
  }
  
  /**
   * Examine an inventory item
   */
  examineItem(itemId: string): void {
    const item = this.state.inventory.find(i => i.id === itemId);
    
    if (!item) return;
    
    // If item has a puzzle, start it
    if (item.puzzle) {
      this.startPuzzle(item.puzzle);
      return;
    }
    
    // Show examination text
    if (item.examineText) {
      this.showNotification({
        id: `examine_item_${itemId}`,
        message: item.examineText,
        type: 'info'
      });
    } else {
      this.showNotification({
        id: `examine_item_${itemId}`,
        message: item.description,
        type: 'info'
      });
    }
    
    this.emit('itemExamined', item);
  }
  
  /**
   * Use an inventory item
   */
  useItem(itemId: string): void {
    const item = this.state.inventory.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Default use behavior
    this.showNotification({
      id: `use_item_${itemId}`,
      message: `You use the ${item.name}. Nothing happens.`,
      type: 'info'
    });
    
    this.emit('itemUsed', item);
  }
  
  /**
   * Combine two inventory items
   */
  combineItems(itemId1: string, itemId2: string): void {
    const item1 = this.state.inventory.find(i => i.id === itemId1);
    const item2 = this.state.inventory.find(i => i.id === itemId2);
    
    if (!item1 || !item2) return;
    
    // Check if items can be combined
    if (item1.usableOn?.includes(item2.id) || item2.usableOn?.includes(item1.id)) {
      // Items can be combined - action depends on the specific items
      // This would typically be handled by a combination table or specific rules
      
      this.showNotification({
        id: `combine_items_${itemId1}_${itemId2}`,
        message: `You combine ${item1.name} with ${item2.name}.`,
        type: 'discovery'
      });
      
      // Example: specific combination handling
      if (itemId1 === 'empty_bottle' && itemId2 === 'well_bucket') {
        // Remove empty bottle and add water bottle
        this.removeItem('empty_bottle');
        this.addItem('water_bottle');
      }
      
      this.emit('itemsCombined', item1, item2);
    } else {
      // Items can't be combined
      this.showNotification({
        id: `combine_fail_${itemId1}_${itemId2}`,
        message: `You can't combine these items.`,
        type: 'info'
      });
    }
  }
  
  /**
   * Add a new item to inventory
   */
  addItem(itemId: string): void {
    const item = items[itemId];
    
    if (!item) return;
    
    this.state.inventory.push({ ...item });
    
    this.showNotification({
      id: `item_added_${itemId}`,
      message: `You received: ${item.name}`,
      type: 'discovery'
    });
    
    this.emit('inventoryChanged', this.state.inventory);
  }
  
  /**
   * Show a notification
   */
  showNotification(notification: GameNotification): void {
    // Generate ID if not provided
    if (!notification.id) {
      notification.id = `notification_${Date.now()}`;
    }
    
    this.state.notifications.push(notification);
    this.emit('notificationShown', notification);
    
    // Auto-dismiss notification after timeout if specified
    if (notification.timeout) {
      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, notification.timeout);
    }
  }
  
  /**
   * Dismiss a notification
   */
  dismissNotification(notificationId: string): void {
    this.state.notifications = this.state.notifications.filter(n => n.id !== notificationId);
    this.emit('notificationDismissed', notificationId);
  }
  
  /**
   * Update in-game time
   */
  advanceTime(minutes: number): void {
    this.state.gameTime += minutes;
    
    // Day/night cycle logic (1440 minutes in a day)
    if (this.state.gameTime >= 1440) {
      this.state.gameTime %= 1440;
    }
    
    // Update environmental conditions based on time
    this.updateEnvironment();
    
    this.emit('timeAdvanced', this.state.gameTime);
  }
  
  /**
   * Update environmental conditions based on time and story progress
   */
  private updateEnvironment(): void {
    const hour = Math.floor(this.state.gameTime / 60);
    
    // Adjust fog based on time of day
    if (hour >= 18 || hour < 6) {
      // Night time - heavier fog
      this.state.fogLevel = Math.min(this.state.fogLevel + 5, 100);
    } else if (hour >= 10 && hour < 16) {
      // Midday - lower fog
      this.state.fogLevel = Math.max(this.state.fogLevel - 5, 0);
    }
    
    this.emit('environmentChanged', { 
      time: this.state.gameTime,
      fogLevel: this.state.fogLevel 
    });
  }
  
  /**
   * Process game events
   */
  processEvents(events: GameEvent[]): void {
    for (const event of events) {
      switch (event.type) {
        case 'addItem':
          if (event.targetId) {
            this.addItem(event.targetId);
          }
          break;
          
        case 'removeItem':
          if (event.targetId) {
            this.removeItem(event.targetId);
          }
          break;
          
        case 'damagePlayer':
          if (typeof event.value === 'number') {
            this.damagePlayer(event.value);
          }
          break;
          
        case 'healPlayer':
          if (typeof event.value === 'number') {
            this.healPlayer(event.value);
          }
          break;
          
        case 'modifySanity':
          if (typeof event.value === 'number') {
            this.modifySanity(event.value);
          }
          break;
          
        case 'unlockScene':
          if (event.targetId && !this.state.unlockedScenes.includes(event.targetId)) {
            this.state.unlockedScenes.push(event.targetId);
          }
          break;
          
        case 'setFlag':
          if (event.targetId) {
            this.state.gameFlags[event.targetId] = event.value;
          }
          break;
          
        case 'modifyFog':
          if (typeof event.value === 'number') {
            this.state.fogLevel = Math.max(0, Math.min(100, this.state.fogLevel + event.value));
          }
          break;
          
        case 'changeScene':
          if (event.targetId) {
            this.changeScene(event.targetId);
          }
          break;
          
        case 'triggerDialog':
          if (event.targetId) {
            this.openDialog(event.targetId);
          }
          break;
          
        case 'showNotification':
          if (event.text) {
            this.showNotification({
              id: `event_notification_${Date.now()}`,
              message: event.text,
              type: event.value || 'info',
              timeout: 5000
            });
          }
          break;
          
        case 'startPuzzle':
          if (event.targetId) {
            this.startPuzzle(event.targetId);
          }
          break;
          
        case 'playSound':
          // This would be handled by a sound manager
          this.emit('playSound', event.targetId, event.value);
          break;
          
        case 'endGame':
          this.endGame(event.value || 'neutral');
          break;
      }
    }
  }
  
  /**
   * Damage the player
   */
  private damagePlayer(amount: number): void {
    this.state.player.health = Math.max(0, this.state.player.health - amount);
    
    if (this.state.player.health <= 0) {
      this.playerDeath();
    }
    
    this.emit('playerStateChanged', this.state.player);
  }
  
  /**
   * Heal the player
   */
  private healPlayer(amount: number): void {
    this.state.player.health = Math.min(
      this.state.player.maxHealth, 
      this.state.player.health + amount
    );
    
    this.emit('playerStateChanged', this.state.player);
  }
  
  /**
   * Modify player's sanity
   */
  private modifySanity(amount: number): void {
    this.state.player.sanity = Math.max(
      0,
      Math.min(this.state.player.maxSanity, this.state.player.sanity + amount)
    );
    
    // If sanity gets too low, start applying effects
    if (this.state.player.sanity < 30) {
      this.state.fogLevel = Math.min(this.state.fogLevel + 10, 100);
      
      if (this.state.player.sanity < 15) {
        // Random hallucination chance
        if (Math.random() < 0.3) {
          this.showNotification({
            id: `hallucination_${Date.now()}`,
            message: 'You see strange shadows moving at the corner of your vision...',
            type: 'warning',
            timeout: 4000
          });
        }
      }
    }
    
    this.emit('playerStateChanged', this.state.player);
  }
  
  /**
   * Handle player death
   */
  private playerDeath(): void {
    this.showNotification({
      id: 'player_death',
      message: 'You have died. The darkness claims another victim.',
      type: 'danger'
    });
    
    // End the game
    this.endGame('bad');
  }
  
  /**
   * End the game
   */
  private endGame(endingType: 'good' | 'neutral' | 'bad' | 'secret'): void {
    const results: GameResults = {
      completed: true,
      timeSpent: this.state.gameTime,
      itemsCollected: this.state.inventory.length,
      secretsDiscovered: this.state.discoveredSecrets.length,
      puzzlesSolved: this.state.completedPuzzles.length,
      endingType
    };
    
    this.emit('gameCompleted', results);
  }
  
  /**
   * Save the current game state
   */
  saveGame(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }
  
  /**
   * Load a saved game state
   */
  loadGame(savedState: GameState): void {
    this.state = JSON.parse(JSON.stringify(savedState));
    this.emit('gameLoaded', this.state);
  }
}

export default GameEngine;