/**
 * Eden's Hollow Game Engine
 * Handles game state management, event processing, and core logic
 */

import { GameState, GameAction, Scene, Hotspot, Exit, SceneItem, GameNotification, 
  Dialog, DialogChoice, SceneTrigger, Puzzle, InventoryItem } from './types';
import scenes from './data/scenes';
import items from './data/items';
import dialogs from './data/dialogs';
import puzzles from './data/puzzles';

// Initial game state
const DEFAULT_HEALTH = 100;
const DEFAULT_MANA = 50;

export const initialState: GameState = {
  currentScene: 'village_entrance',
  status: {
    health: DEFAULT_HEALTH,
    maxHealth: DEFAULT_HEALTH,
    mana: DEFAULT_MANA,
    maxMana: DEFAULT_MANA,
    has_light: false,
    fog_reduction: false
  },
  inventory: [],
  visitedScenes: {},
  completedPuzzles: {},
  triggeredDialogs: {},
  collectedItems: {},
  gameFlags: {},
  activeDialog: undefined,
  activePuzzle: undefined
};

/**
 * Game logic engine
 */
export class GameEngine {
  state: GameState;
  notifications: GameNotification[];
  eventListeners: Record<string, Function[]>;
  stateHistory: GameState[];
  saveEnabled: boolean;

  constructor(initialState?: Partial<GameState>) {
    // Initialize with default state or provided initial state
    this.state = {
      ...initialState,
      currentScene: initialState?.currentScene || 'village_entrance',
      status: {
        health: initialState?.status?.health || DEFAULT_HEALTH,
        maxHealth: initialState?.status?.maxHealth || DEFAULT_HEALTH,
        mana: initialState?.status?.mana || DEFAULT_MANA,
        maxMana: initialState?.status?.maxMana || DEFAULT_MANA,
        has_light: initialState?.status?.has_light || false,
        fog_reduction: initialState?.status?.fog_reduction || false
      },
      inventory: initialState?.inventory || [],
      visitedScenes: initialState?.visitedScenes || {},
      completedPuzzles: initialState?.completedPuzzles || {},
      triggeredDialogs: initialState?.triggeredDialogs || {},
      collectedItems: initialState?.collectedItems || {},
      gameFlags: initialState?.gameFlags || {}
    };

    this.notifications = [];
    this.eventListeners = {};
    this.stateHistory = [this.cloneState(this.state)];
    this.saveEnabled = true;
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Handle various game actions
   */
  dispatch(action: GameAction): void {
    switch (action.type) {
      case 'CHANGE_SCENE':
        this.changeScene(action.payload);
        break;
      case 'INTERACT_HOTSPOT':
        this.interactWithHotspot(action.payload);
        break;
      case 'COLLECT_ITEM':
        this.collectItem(action.payload);
        break;
      case 'USE_ITEM':
        this.useItem(action.payload);
        break;
      case 'COMBINE_ITEMS':
        this.combineItems(action.payload.item1, action.payload.item2);
        break;
      case 'SOLVE_PUZZLE':
        this.solvePuzzle(action.payload.puzzleId, action.payload.solution);
        break;
      case 'DIALOG_CHOICE':
        this.processDialogChoice(action.payload.dialogId, action.payload.choiceIndex);
        break;
      case 'CLOSE_DIALOG':
        this.closeDialog();
        break;
      case 'UPDATE_STATUS':
        this.updateStatus(action.payload.key, action.payload.value);
        break;
      case 'SAVE_GAME':
        this.saveGame();
        break;
      case 'LOAD_GAME':
        this.loadGame();
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }

    // Save state history if enabled
    if (this.saveEnabled) {
      this.stateHistory.push(this.cloneState(this.state));
      // Limit history to prevent memory issues
      if (this.stateHistory.length > 50) {
        this.stateHistory.shift();
      }
    }

    // Emit state change event
    this.emit('stateChanged', this.state);
  }

  /**
   * Change to a different scene
   */
  changeScene(sceneId: string): void {
    // Validate scene exists
    const scene = scenes[sceneId];
    if (!scene) {
      this.addNotification({
        id: `scene-error-${Date.now()}`,
        type: 'error',
        message: `Scene ${sceneId} not found!`
      });
      return;
    }

    // Mark as visited
    const visitedScenes = { ...this.state.visitedScenes };
    visitedScenes[sceneId] = true;

    // Update state
    this.state = {
      ...this.state,
      currentScene: sceneId,
      visitedScenes
    };

    // Process scene triggers
    this.processSceneTriggers(scene);
    
    // Emit scene changed event
    this.emit('sceneChanged', sceneId);
  }

  /**
   * Process scene triggers based on conditions
   */
  processSceneTriggers(scene: Scene): void {
    if (!scene.triggers) return;

    for (const trigger of scene.triggers) {
      // Skip if one-time trigger already triggered
      if (trigger.oneTime && this.state.triggeredDialogs[trigger.id]) {
        continue;
      }

      // Check trigger condition
      if (this.evaluateCondition(trigger.condition)) {
        // Execute trigger based on type
        switch (trigger.type) {
          case 'dialog':
            this.openDialog(trigger.targetId);
            break;
          case 'puzzle':
            this.openPuzzle(trigger.targetId);
            break;
          case 'notification':
            this.addNotification({
              id: `trigger-${trigger.id}-${Date.now()}`,
              type: 'info',
              message: trigger.targetId
            });
            break;
          case 'effect':
            if (trigger.data && trigger.data.statusEffect) {
              this.updateStatus(trigger.data.statusEffect.key, trigger.data.statusEffect.value);
            }
            break;
        }

        // Mark as triggered for one-time triggers
        if (trigger.oneTime) {
          const triggeredDialogs = { ...this.state.triggeredDialogs };
          triggeredDialogs[trigger.id] = true;
          this.state.triggeredDialogs = triggeredDialogs;
        }
      }
    }
  }

  /**
   * Interact with a hotspot in the current scene
   */
  interactWithHotspot(hotspotId: string): void {
    const scene = scenes[this.state.currentScene];
    if (!scene) return;

    const hotspot = scene.hotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;

    // Check if interaction is conditional
    if (hotspot.condition && !this.evaluateCondition(hotspot.condition)) {
      this.addNotification({
        id: `condition-failed-${Date.now()}`,
        type: 'info',
        message: 'You cannot interact with that right now.'
      });
      return;
    }

    // Process interaction based on type
    switch (hotspot.interaction.type) {
      case 'dialog':
        this.openDialog(hotspot.interaction.targetId);
        break;
      case 'puzzle':
        this.openPuzzle(hotspot.interaction.targetId);
        break;
      case 'item':
        this.collectItem(hotspot.interaction.targetId);
        break;
      case 'effect':
        // Apply effect (could be status change, animation, etc.)
        this.applyEffect(hotspot.interaction);
        break;
    }

    this.emit('hotspotInteraction', { sceneId: scene.id, hotspotId });
  }

  /**
   * Apply an effect from hotspot interaction
   */
  applyEffect(interaction: Hotspot['interaction']): void {
    // Implementation depends on the types of effects we support
    // This is a placeholder for effect implementation
    console.log('Applying effect:', interaction);
    
    // Example: damage effect
    if (interaction.data?.type === 'damage') {
      this.updateHealth(-interaction.data.value);
      this.addNotification({
        id: `damage-effect-${Date.now()}`,
        type: 'warning',
        message: `You took ${interaction.data.value} damage!`
      });
    }
    
    // Example: heal effect
    if (interaction.data?.type === 'heal') {
      this.updateHealth(interaction.data.value);
      this.addNotification({
        id: `heal-effect-${Date.now()}`,
        type: 'success',
        message: `You recovered ${interaction.data.value} health!`
      });
    }
    
    // Example: status effect
    if (interaction.data?.type === 'status') {
      this.updateStatus(interaction.data.key, interaction.data.value);
      this.addNotification({
        id: `status-effect-${Date.now()}`,
        type: 'info',
        message: interaction.data.message || `Status changed: ${interaction.data.key}`
      });
    }
  }

  /**
   * Open a dialog
   */
  openDialog(dialogId: string): void {
    // Validate dialog exists
    const dialog = dialogs[dialogId];
    if (!dialog) {
      console.error(`Dialog ${dialogId} not found!`);
      return;
    }

    // Update state with active dialog
    this.state = {
      ...this.state,
      activeDialog: dialogId
    };

    // Mark dialog as triggered
    const triggeredDialogs = { ...this.state.triggeredDialogs };
    triggeredDialogs[dialogId] = true;
    this.state.triggeredDialogs = triggeredDialogs;

    this.emit('dialogOpened', dialogId);
  }

  /**
   * Process a dialog choice
   */
  processDialogChoice(dialogId: string, choiceIndex: number): void {
    const dialog = dialogs[dialogId];
    if (!dialog || !dialog.choices) return;

    const choice = dialog.choices[choiceIndex];
    if (!choice) return;

    // Apply any effects from the choice
    if (choice.effect) {
      switch (choice.effect.type) {
        case 'status':
          this.updateStatus(choice.effect.value.key, choice.effect.value.value);
          break;
        case 'item':
          this.addItemToInventory(choice.effect.value);
          break;
        case 'health':
          this.updateHealth(choice.effect.value);
          break;
        case 'mana':
          this.updateMana(choice.effect.value);
          break;
      }
    }

    // Move to next dialog if specified
    if (choice.next) {
      this.closeDialog();
      this.openDialog(choice.next);
    } else {
      this.closeDialog();
    }
  }

  /**
   * Close the current dialog
   */
  closeDialog(): void {
    if (!this.state.activeDialog) return;

    const dialogId = this.state.activeDialog;
    
    this.state = {
      ...this.state,
      activeDialog: undefined
    };

    this.emit('dialogClosed', dialogId);
  }

  /**
   * Open a puzzle
   */
  openPuzzle(puzzleId: string): void {
    // Validate puzzle exists
    const puzzle = puzzles[puzzleId];
    if (!puzzle) {
      console.error(`Puzzle ${puzzleId} not found!`);
      return;
    }

    // Update state with active puzzle
    this.state = {
      ...this.state,
      activePuzzle: puzzleId
    };

    this.emit('puzzleOpened', puzzleId);
  }

  /**
   * Attempt to solve a puzzle
   */
  solvePuzzle(puzzleId: string, solution: string[]): boolean {
    const puzzle = puzzles[puzzleId];
    if (!puzzle) return false;

    // Check if solution is correct
    const isCorrect = this.checkPuzzleSolution(puzzle, solution);
    
    if (isCorrect) {
      // Mark puzzle as completed
      const completedPuzzles = { ...this.state.completedPuzzles };
      completedPuzzles[puzzleId] = true;
      this.state.completedPuzzles = completedPuzzles;

      // Process puzzle reward
      this.processPuzzleReward(puzzle);

      // Close the puzzle
      this.state = {
        ...this.state,
        activePuzzle: undefined
      };

      this.addNotification({
        id: `puzzle-solved-${Date.now()}`,
        type: 'success',
        message: `Puzzle solved successfully!`
      });

      this.emit('puzzleSolved', puzzleId);
      return true;
    } else {
      this.addNotification({
        id: `puzzle-failed-${Date.now()}`,
        type: 'warning',
        message: `That's not the correct solution. Try again.`
      });

      this.emit('puzzleFailed', puzzleId);
      return false;
    }
  }

  /**
   * Check if a puzzle solution is correct
   */
  checkPuzzleSolution(puzzle: Puzzle, solution: string[]): boolean {
    if (puzzle.type === 'riddle' || puzzle.type === 'text') {
      // For riddles and text answers, we check if the answer is in the accepted answers list
      const answer = solution[0].toLowerCase();
      return (puzzle.acceptedAnswers || puzzle.solution).some(
        acceptable => answer === acceptable.toLowerCase()
      );
    } else {
      // For other puzzles, solutions must match exactly
      if (solution.length !== puzzle.solution.length) return false;
      
      return solution.every((answer, index) => 
        answer.toLowerCase() === puzzle.solution[index].toLowerCase()
      );
    }
  }

  /**
   * Process a puzzle reward
   */
  processPuzzleReward(puzzle: Puzzle): void {
    if (!puzzle.reward) return;

    switch (puzzle.reward.type) {
      case 'item':
        this.addItemToInventory(puzzle.reward.id);
        break;
      case 'scene':
        // Maybe unlock a new scene or transition to it
        if (puzzle.reward.value === 'unlock') {
          // Just unlock the scene
          this.addNotification({
            id: `scene-unlocked-${Date.now()}`,
            type: 'info',
            message: `You've unlocked a new area!`
          });
        } else {
          // Change to the scene
          this.changeScene(puzzle.reward.id);
        }
        break;
      case 'status':
        // Update a status flag
        this.updateStatus(puzzle.reward.id, puzzle.reward.value);
        break;
    }
  }

  /**
   * Close the current puzzle
   */
  closePuzzle(): void {
    if (!this.state.activePuzzle) return;

    const puzzleId = this.state.activePuzzle;
    
    this.state = {
      ...this.state,
      activePuzzle: undefined
    };

    this.emit('puzzleClosed', puzzleId);
  }

  /**
   * Collect an item from the scene
   */
  collectItem(itemId: string): void {
    // Check if item exists
    const item = items[itemId];
    if (!item) {
      console.error(`Item ${itemId} not found!`);
      return;
    }

    // Add to inventory
    this.addItemToInventory(itemId);

    // Mark as collected
    const collectedItems = { ...this.state.collectedItems };
    collectedItems[itemId] = true;
    this.state.collectedItems = collectedItems;

    this.addNotification({
      id: `item-collected-${Date.now()}`,
      type: 'success',
      message: `You found: ${item.name}`
    });

    this.emit('itemCollected', itemId);
  }

  /**
   * Add an item to the player's inventory
   */
  addItemToInventory(itemId: string): void {
    // Check if item exists
    const item = items[itemId];
    if (!item) {
      console.error(`Item ${itemId} not found!`);
      return;
    }

    // Check if stackable item already exists in inventory
    if (item.quantity !== undefined) {
      const existingItem = this.state.inventory.find(i => i.id === itemId);
      if (existingItem && existingItem.quantity !== undefined) {
        // Increase quantity of existing item
        const inventory = this.state.inventory.map(i => 
          i.id === itemId 
            ? { ...i, quantity: (i.quantity || 0) + 1 } 
            : i
        );
        
        this.state = {
          ...this.state,
          inventory
        };
        return;
      }
    }

    // Add new item to inventory
    const inventory = [...this.state.inventory, { ...item }];
    
    this.state = {
      ...this.state,
      inventory
    };
  }

  /**
   * Remove an item from the player's inventory
   */
  removeItemFromInventory(itemId: string): void {
    const item = this.state.inventory.find(i => i.id === itemId);
    if (!item) return;

    // If item has quantity > 1, reduce quantity
    if (item.quantity && item.quantity > 1) {
      const inventory = this.state.inventory.map(i => 
        i.id === itemId 
          ? { ...i, quantity: i.quantity! - 1 } 
          : i
      );
      
      this.state = {
        ...this.state,
        inventory
      };
    } else {
      // Remove item completely
      const inventory = this.state.inventory.filter(i => i.id !== itemId);
      
      this.state = {
        ...this.state,
        inventory
      };
    }
  }

  /**
   * Use an item from inventory
   */
  useItem(itemId: string): void {
    const item = this.state.inventory.find(i => i.id === itemId);
    if (!item || !item.usable) {
      this.addNotification({
        id: `item-use-error-${Date.now()}`,
        type: 'warning',
        message: `You can't use that item.`
      });
      return;
    }

    // Process item effects
    if (item.effect) {
      switch (item.effect.type) {
        case 'heal':
          this.updateHealth(item.effect.value);
          this.addNotification({
            id: `heal-effect-${Date.now()}`,
            type: 'success',
            message: `You recovered ${item.effect.value} health!`
          });
          break;
        case 'mana':
          this.updateMana(item.effect.value);
          this.addNotification({
            id: `mana-effect-${Date.now()}`,
            type: 'success',
            message: `You recovered ${item.effect.value} mana!`
          });
          break;
        case 'light':
          this.updateStatus('has_light', true);
          // Add duration if specified
          if (item.effect.duration) {
            setTimeout(() => {
              this.updateStatus('has_light', false);
              this.addNotification({
                id: `light-expired-${Date.now()}`,
                type: 'info',
                message: `Your light source has expired.`
              });
            }, item.effect.duration * 1000);
          }
          this.addNotification({
            id: `light-effect-${Date.now()}`,
            type: 'success',
            message: `You can now see in dark areas!`
          });
          break;
        case 'status':
          // Generic status effect
          this.updateStatus(`effect_${item.id}`, item.effect.value);
          break;
      }
    }

    // Special item handling based on ID
    this.handleSpecialItemEffects(item);

    // Remove consumable items after use
    if (item.category === 'consumable') {
      this.removeItemFromInventory(itemId);
    }

    this.emit('itemUsed', itemId);
  }

  /**
   * Handle special effects for specific items
   */
  handleSpecialItemEffects(item: InventoryItem): void {
    // Item-specific logic
    switch (item.id) {
      case 'old_candle':
        if (this.hasItemInInventory('matches')) {
          // Create a lit candle
          this.removeItemFromInventory('old_candle');
          this.addItemToInventory('lit_candle');
          this.addNotification({
            id: `candle-lit-${Date.now()}`,
            type: 'success',
            message: `You lit the candle with your matches.`
          });
        } else {
          this.addNotification({
            id: `need-matches-${Date.now()}`,
            type: 'info',
            message: `You need matches to light this candle.`
          });
        }
        break;
      case 'strange_amulet':
        // Special amulet effect
        this.addNotification({
          id: `amulet-effect-${Date.now()}`,
          type: 'info',
          message: `The amulet grows colder as you hold it.`
        });
        break;
    }
  }

  /**
   * Check if player has an item in inventory
   */
  hasItemInInventory(itemId: string): boolean {
    return this.state.inventory.some(item => item.id === itemId);
  }

  /**
   * Try to combine two items
   */
  combineItems(itemId1: string, itemId2: string): void {
    // This would normally check valid combinations from a data source
    // For now, we'll handle a few hardcoded combinations
    
    // Example: Combine cloth + herbal_remedy to make bandage
    if ((itemId1 === 'cloth' && itemId2 === 'herbal_remedy') || 
        (itemId1 === 'herbal_remedy' && itemId2 === 'cloth')) {
      this.removeItemFromInventory('cloth');
      this.removeItemFromInventory('herbal_remedy');
      this.addItemToInventory('bandage');
      
      this.addNotification({
        id: `combine-success-${Date.now()}`,
        type: 'success',
        message: `You created a Medicinal Bandage!`
      });
      return;
    }
    
    // Example: Combine empty_bottle + well_water to make water_bottle
    if ((itemId1 === 'empty_bottle' && itemId2 === 'well_water') || 
        (itemId1 === 'well_water' && itemId2 === 'empty_bottle')) {
      this.removeItemFromInventory('empty_bottle');
      this.removeItemFromInventory('well_water');
      this.addItemToInventory('water_bottle');
      
      this.addNotification({
        id: `combine-success-${Date.now()}`,
        type: 'success',
        message: `You filled the bottle with water!`
      });
      return;
    }
    
    // Example: Combine broken_handle + metal_blade to make hunting_knife
    if ((itemId1 === 'broken_handle' && itemId2 === 'metal_blade') || 
        (itemId1 === 'metal_blade' && itemId2 === 'broken_handle')) {
      this.removeItemFromInventory('broken_handle');
      this.removeItemFromInventory('metal_blade');
      this.addItemToInventory('hunting_knife');
      
      this.addNotification({
        id: `combine-success-${Date.now()}`,
        type: 'success',
        message: `You crafted a Hunting Knife!`
      });
      return;
    }

    this.addNotification({
      id: `combine-failed-${Date.now()}`,
      type: 'warning',
      message: `These items can't be combined.`
    });
  }

  /**
   * Update player health
   */
  updateHealth(amount: number): void {
    const currentHealth = this.state.status.health;
    const maxHealth = this.state.status.maxHealth;
    
    // Calculate new health value
    let newHealth = currentHealth + amount;
    newHealth = Math.max(0, Math.min(newHealth, maxHealth));
    
    // Update state
    const status = {
      ...this.state.status,
      health: newHealth
    };
    
    this.state = {
      ...this.state,
      status
    };
    
    // Check for death
    if (newHealth <= 0) {
      this.playerDeath();
    }
  }

  /**
   * Update player mana
   */
  updateMana(amount: number): void {
    const currentMana = this.state.status.mana;
    const maxMana = this.state.status.maxMana;
    
    // Calculate new mana value
    let newMana = currentMana + amount;
    newMana = Math.max(0, Math.min(newMana, maxMana));
    
    // Update state
    const status = {
      ...this.state.status,
      mana: newMana
    };
    
    this.state = {
      ...this.state,
      status
    };
  }

  /**
   * Update a status flag
   */
  updateStatus(key: string, value: any): void {
    const status = {
      ...this.state.status,
      [key]: value
    };
    
    this.state = {
      ...this.state,
      status
    };
    
    this.emit('statusChanged', { key, value });
  }

  /**
   * Handle player death
   */
  playerDeath(): void {
    this.addNotification({
      id: `player-death-${Date.now()}`,
      type: 'error',
      message: `You have died. The darkness claims another victim.`
    });
    
    // Could implement respawn logic or game over screen
    this.emit('playerDeath');
  }

  /**
   * Add a notification
   */
  addNotification(notification: GameNotification): void {
    this.notifications.push({
      ...notification,
      duration: notification.duration || 5000  // Default 5 seconds
    });
    
    this.emit('notification', notification);
    
    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration || 5000);
    }
  }

  /**
   * Remove a notification
   */
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.emit('notificationRemoved', id);
  }

  /**
   * Evaluate a condition string
   * This is a simple implementation - a real game might use a more robust system
   */
  evaluateCondition(condition: string): boolean {
    if (!condition || condition === 'true') return true;
    if (condition === 'false') return false;
    
    try {
      // Very simplified condition evaluation - in a real game you would use a more robust parser
      
      // Check for has_item conditions
      if (condition.startsWith('hasItem(')) {
        const itemId = condition.slice(8, -1).replace(/['"]/g, '').trim();
        return this.hasItemInInventory(itemId);
      }
      
      // Check for completed puzzle conditions
      if (condition.startsWith('hasCompletedPuzzle(')) {
        const puzzleId = condition.slice(18, -1).replace(/['"]/g, '').trim();
        return !!this.state.completedPuzzles[puzzleId];
      }
      
      // Check for visited scene conditions
      if (condition.startsWith('hasVisitedScene(')) {
        const sceneId = condition.slice(16, -1).replace(/['"]/g, '').trim();
        return !!this.state.visitedScenes[sceneId];
      }
      
      // Check for status conditions
      if (condition.startsWith('state.status.')) {
        const statusKey = condition.slice(13).split(' ')[0];
        return !!this.state.status[statusKey];
      }
      
      // Fallback to direct evaluation
      // Note: This is not secure and would need to be replaced in a production system
      return Boolean(eval(condition));
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Save the current game state
   */
  saveGame(): string {
    const saveData = JSON.stringify(this.state);
    localStorage.setItem('edens_hollow_save', saveData);
    
    this.addNotification({
      id: `game-saved-${Date.now()}`,
      type: 'success',
      message: `Game saved successfully!`
    });
    
    this.emit('gameSaved');
    return saveData;
  }

  /**
   * Load a saved game state
   */
  loadGame(): boolean {
    const saveData = localStorage.getItem('edens_hollow_save');
    if (!saveData) {
      this.addNotification({
        id: `load-error-${Date.now()}`,
        type: 'error',
        message: `No saved game found!`
      });
      return false;
    }
    
    try {
      const parsedState = JSON.parse(saveData);
      this.state = parsedState;
      
      this.addNotification({
        id: `game-loaded-${Date.now()}`,
        type: 'success',
        message: `Game loaded successfully!`
      });
      
      this.emit('gameLoaded');
      return true;
    } catch (error) {
      console.error('Error loading game:', error);
      this.addNotification({
        id: `load-error-${Date.now()}`,
        type: 'error',
        message: `Error loading saved game!`
      });
      return false;
    }
  }

  /**
   * Register an event listener
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove an event listener
   */
  off(event: string, callback: Function): void {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any): void {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} event handler:`, error);
      }
    });
  }

  /**
   * Create a deep copy of the state
   */
  private cloneState(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state));
  }
}