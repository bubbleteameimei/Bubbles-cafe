import { GameState, GameOptions, Item, Scene, Puzzle, Dialog, Notification } from './types';
import { gameScenes } from './data/scenes';

/**
 * Eden's Hollow Game Engine
 * Core class that manages game state and logic
 */
export class GameEngine {
  private static instance: GameEngine;
  private gameState: GameState;
  private scenes: Record<string, Scene>;
  private items: Record<string, Item>;
  private dialogs: Record<string, Dialog>;
  private puzzles: Record<string, Puzzle>;
  private onStateChange?: (state: GameState) => void;
  
  // Private constructor for singleton pattern
  private constructor(options: GameOptions) {
    this.scenes = options.scenes;
    this.items = options.items;
    this.dialogs = options.dialogs;
    this.puzzles = options.puzzles;
    this.onStateChange = options.onStateChange;
    
    // Initialize default game state
    this.gameState = {
      currentScene: options.startScene || 'forest_edge',
      inventory: [],
      health: 100,
      mana: 100,
      puzzleAttempts: 0,
      gameStatus: 'playing',
      playerStatus: {},
      notifications: [],
      unlockedScenes: [options.startScene || 'forest_edge'],
      collectibles: {},
      stats: {
        itemsFound: 0,
        puzzlesSolved: 0,
        secretsDiscovered: 0,
        completionPercentage: 0
      }
    };
  }
  
  /**
   * Get singleton instance or create new one
   */
  public static getInstance(options?: GameOptions): GameEngine {
    if (!GameEngine.instance && options) {
      GameEngine.instance = new GameEngine(options);
    }
    return GameEngine.instance;
  }
  
  /**
   * Get current game state
   */
  public getState(): GameState {
    return this.gameState;
  }
  
  /**
   * Update game state and notify subscribers
   */
  private updateState(newState: Partial<GameState>): void {
    this.gameState = {
      ...this.gameState,
      ...newState
    };
    
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }
  }
  
  /**
   * Transition to a new scene
   */
  public transitionToScene(sceneId: string): void {
    if (!this.scenes[sceneId]) {
      this.addNotification({
        id: 'scene-error',
        message: `Error: Scene "${sceneId}" not found.`,
        type: 'error'
      });
      return;
    }
    
    // Add scene to unlocked scenes
    if (!this.gameState.unlockedScenes.includes(sceneId)) {
      this.updateState({
        unlockedScenes: [...this.gameState.unlockedScenes, sceneId]
      });
    }
    
    // Update current scene
    this.updateState({
      currentScene: sceneId
    });
    
    // Check for scene entrance events
    const scene = this.scenes[sceneId];
    const entranceEvents = scene.events?.filter(event => event.trigger === 'enter');
    
    if (entranceEvents && entranceEvents.length > 0) {
      entranceEvents.forEach(event => {
        // Check if event has conditions and if they're met
        if (event.condition) {
          const conditionsMet = Object.entries(event.condition).every(([key, value]) => {
            return this.gameState.playerStatus[key] === value;
          });
          
          if (!conditionsMet) {
            return;
          }
        }
        
        // Apply event outcome
        if (event.outcome.status) {
          this.updateStatus(event.outcome.status);
        }
        
        if (event.outcome.notification) {
          this.addNotification(event.outcome.notification);
        }
        
        if (event.outcome.dialog) {
          this.startDialog(event.outcome.dialog);
        }
      });
    }
  }
  
  /**
   * Add item to inventory
   */
  public addItem(itemId: string): void {
    if (!this.items[itemId]) {
      console.error(`Item "${itemId}" not found.`);
      return;
    }
    
    this.updateState({
      inventory: [...this.gameState.inventory, itemId],
      stats: {
        ...this.gameState.stats,
        itemsFound: this.gameState.stats.itemsFound + 1
      }
    });
    
    // Notify player about item acquisition
    this.addNotification({
      id: `item-${itemId}`,
      message: `You obtained: ${this.items[itemId].name}`,
      type: 'discovery'
    });
  }
  
  /**
   * Remove item from inventory
   */
  public removeItem(itemId: string): void {
    this.updateState({
      inventory: this.gameState.inventory.filter(id => id !== itemId)
    });
  }
  
  /**
   * Use an item in the current scene
   */
  public useItem(itemId: string): void {
    const item = this.items[itemId];
    
    if (!item) {
      console.error(`Item "${itemId}" not found.`);
      return;
    }
    
    // Check if item is usable
    if (!item.isUsable) {
      this.addNotification({
        id: 'item-not-usable',
        message: `${item.name} cannot be used here.`,
        type: 'info'
      });
      return;
    }
    
    // Apply item effects if any
    if (item.effects) {
      if (item.effects.health) {
        this.updateState({
          health: Math.min(100, this.gameState.health + item.effects.health)
        });
      }
      
      if (item.effects.mana) {
        this.updateState({
          mana: Math.min(100, this.gameState.mana + item.effects.mana)
        });
      }
      
      if (item.effects.status) {
        this.updateStatus(item.effects.status);
      }
    }
    
    // Remove item if it's consumable
    if (item.isConsumable || item.destroyOnUse) {
      this.removeItem(itemId);
    }
    
    // Notify player about item use
    this.addNotification({
      id: `item-used-${itemId}`,
      message: `Used: ${item.name}`,
      type: 'success'
    });
  }
  
  /**
   * Perform an action in the current scene
   */
  public performAction(actionId: string): void {
    const scene = this.scenes[this.gameState.currentScene];
    const action = scene.actions?.find(a => a.id === actionId);
    
    if (!action) {
      console.error(`Action "${actionId}" not found in current scene.`);
      return;
    }
    
    // Apply action outcome
    if (action.outcome.status) {
      this.updateStatus(action.outcome.status);
    }
    
    if (action.outcome.notification) {
      this.addNotification(action.outcome.notification);
    }
    
    if (action.outcome.dialog) {
      this.startDialog(action.outcome.dialog);
    }
    
    if (action.outcome.puzzle) {
      this.startPuzzle(action.outcome.puzzle);
    }
    
    if (action.outcome.item) {
      this.addItem(action.outcome.item);
    }
  }
  
  /**
   * Start a dialog
   */
  public startDialog(dialogId: string): void {
    if (!this.dialogs[dialogId]) {
      console.error(`Dialog "${dialogId}" not found.`);
      return;
    }
    
    this.updateState({
      activeDialog: dialogId,
      dialogIndex: 0
    });
  }
  
  /**
   * Select dialog response
   */
  public selectDialogResponse(responseIndex: number): void {
    const dialog = this.dialogs[this.gameState.activeDialog || ''];
    const dialogSegment = dialog?.content[this.gameState.dialogIndex || 0];
    
    if (!dialog || !dialogSegment || !dialogSegment.responses) {
      this.endDialog();
      return;
    }
    
    const response = dialogSegment.responses[responseIndex];
    
    if (!response) {
      this.endDialog();
      return;
    }
    
    // Apply response outcome
    if (response.outcome) {
      if (response.outcome.status) {
        this.updateStatus(response.outcome.status);
      }
      
      if (response.outcome.notification) {
        this.addNotification(response.outcome.notification);
      }
      
      if (response.outcome.item) {
        this.addItem(response.outcome.item);
      }
      
      if (response.outcome.puzzle) {
        this.startPuzzle(response.outcome.puzzle);
      }
      
      if (response.outcome.scene) {
        this.transitionToScene(response.outcome.scene);
      }
    }
    
    // Move to next dialog segment if specified
    if (response.nextIndex !== undefined) {
      this.updateState({
        dialogIndex: response.nextIndex
      });
    } else {
      this.endDialog();
    }
  }
  
  /**
   * End dialog
   */
  public endDialog(): void {
    this.updateState({
      activeDialog: undefined,
      dialogIndex: undefined
    });
  }
  
  /**
   * Start a puzzle
   */
  public startPuzzle(puzzleId: string): void {
    if (!this.puzzles[puzzleId]) {
      console.error(`Puzzle "${puzzleId}" not found.`);
      return;
    }
    
    this.updateState({
      currentPuzzle: puzzleId,
      puzzleAttempts: 0
    });
  }
  
  /**
   * Attempt to solve a puzzle
   */
  public attemptPuzzle(puzzleId: string, solution: any): void {
    const puzzle = this.puzzles[puzzleId];
    
    if (!puzzle) {
      console.error(`Puzzle "${puzzleId}" not found.`);
      return;
    }
    
    // Compare solution
    let solved = false;
    
    if (puzzle.type === 'combination') {
      // For combination puzzles, compare each input value
      solved = Object.entries(solution).every(([key, value]) => {
        const correctValue = puzzle.solution[key];
        return String(value).toLowerCase() === String(correctValue).toLowerCase();
      });
    } else if (puzzle.type === 'order') {
      // For order puzzles, compare the sequence
      solved = JSON.stringify(solution.order) === JSON.stringify(puzzle.solution);
    } else {
      // For selection puzzles, direct comparison
      solved = solution === puzzle.solution;
    }
    
    if (solved) {
      // Puzzle solved
      this.updateState({
        currentPuzzle: undefined,
        puzzleAttempts: 0,
        stats: {
          ...this.gameState.stats,
          puzzlesSolved: this.gameState.stats.puzzlesSolved + 1
        }
      });
      
      // Apply puzzle reward
      if (puzzle.reward) {
        if (puzzle.reward.status) {
          this.updateStatus(puzzle.reward.status);
        }
        
        if (puzzle.reward.item) {
          this.addItem(puzzle.reward.item);
        }
        
        if (puzzle.reward.notification) {
          this.addNotification(puzzle.reward.notification);
        } else {
          this.addNotification({
            id: `puzzle-solved-${puzzleId}`,
            message: 'Puzzle solved successfully!',
            type: 'success'
          });
        }
      } else {
        this.addNotification({
          id: `puzzle-solved-${puzzleId}`,
          message: 'Puzzle solved successfully!',
          type: 'success'
        });
      }
    } else {
      // Incorrect solution
      const newAttempts = this.gameState.puzzleAttempts + 1;
      
      this.updateState({
        puzzleAttempts: newAttempts
      });
      
      // Check if maximum attempts reached
      if (puzzle.maxAttempts && newAttempts >= puzzle.maxAttempts) {
        this.updateState({
          currentPuzzle: undefined,
          puzzleAttempts: 0
        });
        
        this.addNotification({
          id: `puzzle-failed-${puzzleId}`,
          message: 'Maximum attempts reached. Puzzle failed.',
          type: 'error'
        });
      } else {
        // Show hint if available
        if (puzzle.hints && puzzle.hints.length > 0) {
          const hintIndex = Math.min(newAttempts - 1, puzzle.hints.length - 1);
          
          this.addNotification({
            id: `puzzle-hint-${puzzleId}-${hintIndex}`,
            message: `Hint: ${puzzle.hints[hintIndex]}`,
            type: 'info'
          });
        } else {
          this.addNotification({
            id: `puzzle-incorrect-${puzzleId}`,
            message: 'Incorrect solution. Try again.',
            type: 'warning'
          });
        }
      }
    }
  }
  
  /**
   * Close the current puzzle
   */
  public closePuzzle(): void {
    this.updateState({
      currentPuzzle: undefined,
      puzzleAttempts: 0
    });
  }
  
  /**
   * Add notification
   */
  public addNotification(notification: Notification): void {
    this.updateState({
      notifications: [...this.gameState.notifications, notification]
    });
    
    // Auto-remove notification after timeout
    if (notification.timeout) {
      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, notification.timeout);
    }
  }
  
  /**
   * Dismiss notification
   */
  public dismissNotification(id: string): void {
    this.updateState({
      notifications: this.gameState.notifications.filter(notification => notification.id !== id)
    });
  }
  
  /**
   * Update player status
   */
  private updateStatus(status: Record<string, boolean | number | string>): void {
    this.updateState({
      playerStatus: {
        ...this.gameState.playerStatus,
        ...status
      }
    });
    
    // Recalculate completion percentage
    this.calculateCompletion();
  }
  
  /**
   * Calculate game completion percentage
   */
  private calculateCompletion(): void {
    const totalScenes = Object.keys(this.scenes).length;
    const totalItems = Object.keys(this.items).filter(id => this.items[id].type === 'collectible').length;
    const totalSecrets = 10; // Example number of total secrets
    
    const scenesVisited = this.gameState.unlockedScenes.length;
    const itemsFound = this.gameState.stats.itemsFound;
    const secretsDiscovered = this.gameState.stats.secretsDiscovered;
    
    const sceneCompletion = totalScenes > 0 ? (scenesVisited / totalScenes) * 0.4 : 0;
    const itemCompletion = totalItems > 0 ? (itemsFound / totalItems) * 0.3 : 0;
    const secretCompletion = totalSecrets > 0 ? (secretsDiscovered / totalSecrets) * 0.3 : 0;
    
    const completionPercentage = Math.round((sceneCompletion + itemCompletion + secretCompletion) * 100);
    
    this.updateState({
      stats: {
        ...this.gameState.stats,
        completionPercentage
      }
    });
  }
  
  /**
   * Save game state to localStorage
   */
  public saveGame(): void {
    try {
      const saveData = {
        gameState: this.gameState,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      
      localStorage.setItem('eden_save', JSON.stringify(saveData));
      
      this.addNotification({
        id: 'game-saved',
        message: 'Game saved successfully!',
        type: 'success',
        timeout: 3000
      });
    } catch (error) {
      console.error('Failed to save game:', error);
      
      this.addNotification({
        id: 'game-save-error',
        message: 'Failed to save game.',
        type: 'error'
      });
    }
  }
  
  /**
   * Load game state from localStorage
   */
  public loadGame(): boolean {
    try {
      const saveData = localStorage.getItem('eden_save');
      
      if (!saveData) {
        this.addNotification({
          id: 'no-save',
          message: 'No saved game found.',
          type: 'info'
        });
        return false;
      }
      
      const data = JSON.parse(saveData);
      
      this.updateState(data.gameState);
      
      this.addNotification({
        id: 'game-loaded',
        message: 'Game loaded successfully!',
        type: 'success',
        timeout: 3000
      });
      
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      
      this.addNotification({
        id: 'game-load-error',
        message: 'Failed to load game.',
        type: 'error'
      });
      
      return false;
    }
  }
  
  /**
   * Reset game
   */
  public resetGame(): void {
    GameEngine.instance = new GameEngine({
      scenes: this.scenes,
      items: this.items,
      dialogs: this.dialogs,
      puzzles: this.puzzles,
      onStateChange: this.onStateChange
    });
    
    this.updateState(GameEngine.instance.getState());
    
    this.addNotification({
      id: 'game-reset',
      message: 'Game has been reset.',
      type: 'info',
      timeout: 3000
    });
  }
}