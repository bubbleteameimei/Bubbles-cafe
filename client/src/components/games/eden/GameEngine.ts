import { 
  GameState, 
  Scene, 
  Item, 
  Dialog, 
  Puzzle,
  Notification 
} from './types';

/**
 * Configuration options for initializing the Game Engine
 */
interface GameEngineConfig {
  scenes: Record<string, Scene>;
  items: Record<string, Item>;
  dialogs: Record<string, Dialog>;
  puzzles: Record<string, Puzzle>;
  onStateChange: (state: GameState) => void;
}

/**
 * Eden's Hollow Game Engine
 * Manages game state and handles all game logic
 */
export class GameEngine {
  private static instance: GameEngine;
  private gameState: GameState;
  private scenes: Record<string, Scene>;
  private items: Record<string, Item>;
  private dialogs: Record<string, Dialog>;
  private puzzles: Record<string, Puzzle>;
  private onStateChange: (state: GameState) => void;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(config: GameEngineConfig) {
    this.scenes = config.scenes;
    this.items = config.items;
    this.dialogs = config.dialogs;
    this.puzzles = config.puzzles;
    this.onStateChange = config.onStateChange;

    // Initialize default game state
    this.gameState = {
      currentScene: 'forest_edge', // Starting scene
      inventory: [],
      health: 100,
      mana: 100,
      status: {},
      notifications: [],
      visitedScenes: ['forest_edge'],
      puzzleAttempts: 0
    };
  }

  /**
   * Get singleton instance of the game engine
   */
  public static getInstance(config?: GameEngineConfig): GameEngine {
    if (!GameEngine.instance && config) {
      GameEngine.instance = new GameEngine(config);
    }
    return GameEngine.instance;
  }

  /**
   * Get current game state (for debugging)
   */
  public getState(): GameState {
    return {...this.gameState};
  }

  /**
   * For debugging - expose internal state
   */
  public debugState(): GameState {
    return this.gameState;
  }

  /**
   * Update game state and notify listeners
   */
  public updateState(partialState: Partial<GameState>): void {
    this.gameState = {
      ...this.gameState,
      ...partialState
    };
    this.onStateChange(this.gameState);
  }

  /**
   * Add a notification to the game
   */
  public addNotification(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
    const notification: Notification = {
      id: `notify-${Date.now()}`,
      message,
      type
    };
    
    this.updateState({
      notifications: [...this.gameState.notifications, notification]
    });
  }

  /**
   * Dismiss a notification
   */
  public dismissNotification(id: string): void {
    this.updateState({
      notifications: this.gameState.notifications.filter(n => n.id !== id)
    });
  }

  /**
   * Transition to a new scene
   */
  public transitionToScene(sceneId: string): void {
    const targetScene = this.scenes[sceneId];
    
    if (!targetScene) {
      this.addNotification(`Scene not found: ${sceneId}`, 'error');
      return;
    }

    // Track visited scenes
    const visitedScenes = this.gameState.visitedScenes.includes(sceneId)
      ? this.gameState.visitedScenes
      : [...this.gameState.visitedScenes, sceneId];

    // Update state with new scene
    this.updateState({
      currentScene: sceneId,
      visitedScenes,
      // Clear any active dialog or puzzle when changing scenes
      activeDialog: undefined,
      dialogIndex: undefined,
      currentPuzzle: undefined
    });

    // Notify player of scene transition
    this.addNotification(`Entered ${targetScene.title}`, 'info');
  }

  /**
   * Perform an action in the current scene
   */
  public performAction(actionId: string): void {
    const currentScene = this.scenes[this.gameState.currentScene];
    if (!currentScene || !currentScene.actions) {
      return;
    }

    const action = currentScene.actions.find(a => a.id === actionId);
    if (!action) {
      return;
    }

    // Check if action has requirements
    if (action.requiredItem && !this.gameState.inventory.includes(action.requiredItem)) {
      this.addNotification(`You need ${this.items[action.requiredItem].name} for this action.`, 'warning');
      return;
    }

    if (action.requiredStatus) {
      const hasRequiredStatus = Object.entries(action.requiredStatus).every(
        ([key, value]) => this.gameState.status[key] === value
      );
      
      if (!hasRequiredStatus) {
        this.addNotification(`You can't do that yet.`, 'warning');
        return;
      }
    }

    // Process action outcome
    const outcome = action.outcome;
    if (!outcome) return;

    // Handle item addition
    if (outcome.addItem && !this.gameState.inventory.includes(outcome.addItem)) {
      this.updateState({
        inventory: [...this.gameState.inventory, outcome.addItem]
      });
    }

    // Handle status changes
    if (outcome.status) {
      this.updateState({
        status: { ...this.gameState.status, ...outcome.status }
      });
    }

    // Handle notifications
    if (outcome.notification) {
      this.addNotification(outcome.notification.message, outcome.notification.type as any);
    }

    // Handle dialog triggers
    if (outcome.dialog) {
      this.startDialog(outcome.dialog);
    }

    // Handle puzzle triggers
    if (outcome.puzzle) {
      this.startPuzzle(outcome.puzzle);
    }
  }

  /**
   * Use an item from inventory
   */
  public useItem(itemId: string): void {
    const item = this.items[itemId];
    
    if (!item) {
      this.addNotification('Item not found.', 'error');
      return;
    }

    if (!item.isUsable) {
      this.addNotification(`You can't use the ${item.name} right now.`, 'info');
      return;
    }

    // Process item use effect
    if (item.useEffect) {
      // Apply health effect
      if (item.useEffect.health) {
        const newHealth = Math.min(100, Math.max(0, this.gameState.health + item.useEffect.health));
        this.updateState({ health: newHealth });
        
        if (item.useEffect.health > 0) {
          this.addNotification(`You gained ${item.useEffect.health} health.`, 'success');
        } else {
          this.addNotification(`You lost ${Math.abs(item.useEffect.health)} health.`, 'warning');
        }
      }

      // Apply mana/energy effect
      if (item.useEffect.mana) {
        const newMana = Math.min(100, Math.max(0, this.gameState.mana + item.useEffect.mana));
        this.updateState({ mana: newMana });
        
        if (item.useEffect.mana > 0) {
          this.addNotification(`You gained ${item.useEffect.mana} energy.`, 'success');
        } else {
          this.addNotification(`You lost ${Math.abs(item.useEffect.mana)} energy.`, 'warning');
        }
      }

      // Apply status effects
      if (item.useEffect.status) {
        this.updateState({
          status: { ...this.gameState.status, ...item.useEffect.status }
        });
      }

      // Show notification
      if (item.useEffect.message) {
        this.addNotification(item.useEffect.message, 'info');
      }
    }

    // Remove consumable items after use
    if (item.isConsumable) {
      this.updateState({
        inventory: this.gameState.inventory.filter(i => i !== itemId)
      });
    }
  }

  /**
   * Start a dialog interaction
   */
  public startDialog(dialogId: string): void {
    const dialog = this.dialogs[dialogId];
    
    if (!dialog) {
      this.addNotification('Dialog not found.', 'error');
      return;
    }

    this.updateState({
      activeDialog: dialogId,
      dialogIndex: 0
    });
  }

  /**
   * Select a dialog response option
   */
  public selectDialogResponse(responseIndex: number): void {
    if (!this.gameState.activeDialog || this.gameState.dialogIndex === undefined) {
      return;
    }

    const dialog = this.dialogs[this.gameState.activeDialog];
    if (!dialog) return;

    const currentContent = dialog.content[this.gameState.dialogIndex];
    if (!currentContent || !currentContent.responses) return;

    const selectedResponse = currentContent.responses[responseIndex];
    if (!selectedResponse) return;

    // Check if response has requirements
    if (selectedResponse.requiredItem && !this.gameState.inventory.includes(selectedResponse.requiredItem)) {
      this.addNotification(`You need ${this.items[selectedResponse.requiredItem].name} for this response.`, 'warning');
      return;
    }

    if (selectedResponse.requiredStatus) {
      const hasRequiredStatus = Object.entries(selectedResponse.requiredStatus).every(
        ([key, value]) => this.gameState.status[key] === value
      );
      
      if (!hasRequiredStatus) {
        this.addNotification(`That response is not available yet.`, 'warning');
        return;
      }
    }

    // If response leads to another dialog part
    if (selectedResponse.nextDialog) {
      if (selectedResponse.nextDialog === '') {
        // End the dialog
        this.endDialog();
      } else if (this.dialogs[selectedResponse.nextDialog]) {
        // Start the next dialog
        this.startDialog(selectedResponse.nextDialog);
      } else {
        // Move to next content in the same dialog
        const nextIndex = this.gameState.dialogIndex + 1;
        if (nextIndex < dialog.content.length) {
          this.updateState({
            dialogIndex: nextIndex
          });
        } else {
          this.endDialog();
        }
      }
    } else {
      // End the dialog if no next dialog specified
      this.endDialog();
    }
  }

  /**
   * End the current dialog
   */
  private endDialog(): void {
    const dialogId = this.gameState.activeDialog;
    
    // Clear active dialog
    this.updateState({
      activeDialog: undefined,
      dialogIndex: undefined
    });

    // Execute onEnd callback if present
    if (dialogId && this.dialogs[dialogId].onEnd) {
      this.dialogs[dialogId].onEnd(this);
    }
  }

  /**
   * Start a puzzle interaction
   */
  public startPuzzle(puzzleId: string): void {
    const puzzle = this.puzzles[puzzleId];
    
    if (!puzzle) {
      this.addNotification('Puzzle not found.', 'error');
      return;
    }

    // Reset puzzle attempts counter
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
      return;
    }

    // Increment attempts counter
    this.updateState({
      puzzleAttempts: this.gameState.puzzleAttempts + 1
    });

    // Check if solution is correct
    if (puzzle.checkSolution && puzzle.checkSolution(solution, this.gameState)) {
      // Puzzle solved!
      this.addNotification('Puzzle solved!', 'success');
      
      // Apply puzzle rewards/effects
      if (puzzle.onSolve) {
        puzzle.onSolve(this);
      }
      
      // Clear the active puzzle
      this.updateState({
        currentPuzzle: undefined
      });
    } else {
      // Puzzle failed
      this.addNotification('That solution is incorrect. Try again.', 'warning');
      
      // Check if max attempts reached
      if (puzzle.maxAttempts && this.gameState.puzzleAttempts >= puzzle.maxAttempts) {
        this.addNotification('You\'ve reached the maximum number of attempts.', 'error');
        
        // Apply penalty if any
        if (puzzle.onFail) {
          puzzle.onFail(this);
        }
        
        // Clear the active puzzle
        this.updateState({
          currentPuzzle: undefined
        });
      }
    }
  }

  /**
   * Close the active puzzle without solving
   */
  public closePuzzle(): void {
    this.updateState({
      currentPuzzle: undefined
    });
  }

  /**
   * Save the current game state
   */
  public saveGame(): void {
    try {
      const saveData = {
        ...this.gameState,
        saveDate: new Date().toISOString()
      };
      
      localStorage.setItem('edensHollowSave', JSON.stringify(saveData));
      this.addNotification('Game saved successfully.', 'success');
    } catch (error) {
      console.error('Failed to save game:', error);
      this.addNotification('Failed to save game.', 'error');
    }
  }

  /**
   * Load a saved game
   */
  public loadGame(saveId: string): void {
    try {
      // In this implementation we only have one save slot
      const savedData = localStorage.getItem('edensHollowSave');
      
      if (!savedData) {
        this.addNotification('No saved game found.', 'warning');
        return;
      }
      
      const parsedData = JSON.parse(savedData);
      this.updateState(parsedData);
      this.addNotification('Game loaded successfully.', 'success');
    } catch (error) {
      console.error('Failed to load game:', error);
      this.addNotification('Failed to load game.', 'error');
    }
  }
}