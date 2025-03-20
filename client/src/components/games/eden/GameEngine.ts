import { v4 as uuidv4 } from 'uuid';
import {
  GameOptions,
  GameState,
  GameAction,
  Inventory,
  Item,
  Scene,
  Dialog,
  Puzzle,
  Notification,
  PlayerStats
} from './types';
import items from './data/items';
import scenes from './data/scenes';
import dialogs from './data/dialogs';
import puzzles from './data/puzzles';

export class GameEngine {
  private state: GameState;
  private options: GameOptions;
  private listeners: ((state: GameState) => void)[] = [];
  
  constructor(options: GameOptions = {}) {
    this.options = options;
    
    // Create inventory interface
    const inventoryItems: Item[] = [];
    const inventory: Inventory = {
      items: inventoryItems,
      get: (id: string) => inventoryItems.find(item => item.id === id),
      add: (item: Item) => {
        const existingItem = this.state.inventory.get(item.id);
        if (existingItem) {
          existingItem.quantity += item.quantity;
          this.notifyListeners();
          return true;
        } else {
          inventoryItems.push(item);
          this.notifyListeners();
          return true;
        }
      },
      remove: (id: string) => {
        const index = inventoryItems.findIndex(item => item.id === id);
        if (index >= 0) {
          inventoryItems.splice(index, 1);
          this.notifyListeners();
          return true;
        }
        return false;
      },
      has: (id: string) => !!inventoryItems.find(item => item.id === id),
      filter: (predicate) => inventoryItems.filter(item => predicate(item.id)),
      map: (callback) => inventoryItems.map(item => callback(item.id, item))
    };
    
    // Create player stats
    const playerStats: PlayerStats = {
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      level: 1,
      experience: 0,
      status: []
    };
    
    // Initialize game state
    this.state = {
      currentSceneId: options.startScene || 'village_entrance',
      previousSceneId: null,
      inventory,
      score: {},
      status: { first_visit: false },
      player: playerStats,
      visitedScenes: new Set<string>(),
      activeDialogId: null,
      dialogIndex: 0,
      currentPuzzleId: null,
      notificationQueue: [],
      lastAction: null,
      health: 100,
      maxHealth: 100,
      mana: 75,
      maxMana: 100
    };
    
    // Add options change listener if provided
    if (options.onStateChange) {
      this.addListener(options.onStateChange);
    }
  }
  
  // Add a listener for state changes
  public addListener(listener: (state: GameState) => void): void {
    this.listeners.push(listener);
  }
  
  // Remove a listener
  public removeListener(listener: (state: GameState) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }
  
  // Notify all listeners of state changes
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
  
  // Get the current game state
  public getState(): GameState {
    return this.state;
  }
  
  // Get a scene by ID
  public getScene(sceneId: string): Scene | undefined {
    return scenes[sceneId];
  }
  
  // Get the current scene
  public getCurrentScene(): Scene | undefined {
    return this.getScene(this.state.currentSceneId);
  }
  
  // Get a dialog by ID
  public getDialog(dialogId: string): Dialog | undefined {
    return dialogs[dialogId];
  }
  
  // Get a puzzle by ID
  public getPuzzle(puzzleId: string): Puzzle | undefined {
    return puzzles[puzzleId];
  }
  
  // Get an item by ID
  public getItem(itemId: string): Item | undefined {
    return items[itemId];
  }
  
  // Dispatch an action to update the game state
  public dispatch(action: GameAction): void {
    switch (action.type) {
      case 'MOVE_TO_SCENE':
        this.moveToScene(action.sceneId);
        break;
      case 'ADD_ITEM':
        this.addItem(action.item);
        break;
      case 'REMOVE_ITEM':
        this.removeItem(action.itemId);
        break;
      case 'USE_ITEM':
        this.useItem(action.itemId, action.targetId);
        break;
      case 'UPDATE_STATUS':
        this.updateStatus(action.status);
        break;
      case 'ADD_SCORE':
        this.addScore(action.key, action.value);
        break;
      case 'START_DIALOG':
        this.startDialog(action.dialogId);
        break;
      case 'ADVANCE_DIALOG':
        this.advanceDialog(action.responseIndex);
        break;
      case 'END_DIALOG':
        this.endDialog();
        break;
      case 'START_PUZZLE':
        this.startPuzzle(action.puzzleId);
        break;
      case 'SUBMIT_PUZZLE_SOLUTION':
        this.submitPuzzleSolution(action.solution);
        break;
      case 'END_PUZZLE':
        this.endPuzzle(action.success);
        break;
      case 'ADD_NOTIFICATION':
        this.addNotification(action.notification);
        break;
      case 'CLEAR_NOTIFICATION':
        this.clearNotification(action.id);
        break;
      case 'UPDATE_HEALTH':
        this.updateHealth(action.value);
        break;
      case 'UPDATE_MANA':
        this.updateMana(action.value);
        break;
      case 'UPDATE_STATE':
        this.updateState(action.partialState);
        break;
      default:
        console.warn('Unknown action type:', (action as any).type);
    }
  }
  
  // Update a part of the game state
  private updateState(partialState: Partial<GameState>): void {
    this.state = { ...this.state, ...partialState };
    this.notifyListeners();
  }
  
  // Move to a new scene
  private moveToScene(sceneId: string): void {
    const targetScene = this.getScene(sceneId);
    if (!targetScene) {
      console.error(`Scene ${sceneId} not found`);
      return;
    }
    
    // Update state
    this.state.previousSceneId = this.state.currentSceneId;
    this.state.currentSceneId = sceneId;
    this.state.visitedScenes.add(sceneId);
    
    // Process scene events on entry
    if (targetScene.events) {
      for (const event of targetScene.events) {
        if (event.trigger === 'entry') {
          // Check if conditions are met
          if (event.condition) {
            if (event.condition.requiredItems && 
                !event.condition.requiredItems.every(itemId => this.state.inventory.has(itemId))) {
              continue;
            }
            
            if (event.condition.requiredStatus) {
              let conditionsMet = true;
              for (const [key, value] of Object.entries(event.condition.requiredStatus)) {
                if (this.state.status[key] !== value) {
                  conditionsMet = false;
                  break;
                }
              }
              if (!conditionsMet) continue;
            }
          }
          
          // Process event outcome
          const outcome = event.outcome;
          if (outcome.message) {
            // TODO: Display message
          }
          
          if (outcome.dialog) {
            this.startDialog(outcome.dialog);
          }
          
          if (outcome.item) {
            const item = this.getItem(outcome.item);
            if (item) {
              this.addItem(item);
            }
          }
          
          if (outcome.status) {
            this.updateStatus(outcome.status);
          }
          
          if (outcome.notification) {
            this.addNotification(outcome.notification);
          }
          
          if (outcome.puzzle) {
            this.startPuzzle(outcome.puzzle);
          }
        }
      }
    }
    
    this.notifyListeners();
  }
  
  // Add an item to inventory
  private addItem(item: Item): void {
    this.state.inventory.add(item);
    this.notifyListeners();
  }
  
  // Remove an item from inventory
  private removeItem(itemId: string): void {
    this.state.inventory.remove(itemId);
    this.notifyListeners();
  }
  
  // Use an item (possibly on a target)
  private useItem(itemId: string, targetId?: string): void {
    const item = this.state.inventory.get(itemId);
    if (!item) return;
    
    // Handle item effects
    if (item.effects) {
      for (const effect of item.effects) {
        if (effect.type === 'health') {
          if (typeof effect.value === 'number') {
            this.updateHealth(effect.value);
          }
        } else if (effect.type === 'mana') {
          if (typeof effect.value === 'number') {
            this.updateMana(effect.value);
          }
        } else if (effect.type === 'status' && typeof effect.value === 'object') {
          this.updateStatus(effect.value as Record<string, boolean>);
        }
      }
    }
    
    // Remove consumable items after use
    if (item.isConsumable) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeItem(itemId);
      }
    }
    
    this.notifyListeners();
  }
  
  // Update game status flags
  private updateStatus(status: Record<string, boolean>): void {
    this.state.status = { ...this.state.status, ...status };
    this.notifyListeners();
  }
  
  // Add to score
  private addScore(key: string, value: number): void {
    this.state.score[key] = (this.state.score[key] || 0) + value;
    this.notifyListeners();
  }
  
  // Start a dialog
  private startDialog(dialogId: string): void {
    const dialog = this.getDialog(dialogId);
    if (!dialog) {
      console.error(`Dialog ${dialogId} not found`);
      return;
    }
    
    this.state.activeDialogId = dialogId;
    this.state.dialogIndex = 0;
    this.notifyListeners();
  }
  
  // Advance dialog to next segment or process response
  private advanceDialog(responseIndex?: number): void {
    if (!this.state.activeDialogId) return;
    
    const dialog = this.getDialog(this.state.activeDialogId);
    if (!dialog) return;
    
    const currentSegment = dialog.content[this.state.dialogIndex];
    if (!currentSegment) {
      this.endDialog();
      return;
    }
    
    // If a response was selected and it has an outcome, process it
    if (responseIndex !== undefined && 
        currentSegment.responses && 
        currentSegment.responses[responseIndex]) {
      
      const response = currentSegment.responses[responseIndex];
      
      // Process response outcome if any
      if (response.outcome) {
        if (response.outcome.status) {
          this.updateStatus(response.outcome.status);
        }
        
        if (response.outcome.item) {
          const item = this.getItem(response.outcome.item);
          if (item) {
            this.addItem(item);
          }
        }
        
        if (response.outcome.notification) {
          this.addNotification(response.outcome.notification);
        }
        
        if (response.outcome.puzzle) {
          this.startPuzzle(response.outcome.puzzle);
        }
      }
      
      // Move to the next dialog segment based on response
      this.state.dialogIndex = response.nextIndex;
    } else {
      // If no response index provided, just go to the next segment
      this.state.dialogIndex++;
    }
    
    // Check if we've reached the end of the dialog
    if (this.state.dialogIndex >= dialog.content.length) {
      this.endDialog();
    } else {
      this.notifyListeners();
    }
  }
  
  // End the current dialog
  private endDialog(): void {
    this.state.activeDialogId = null;
    this.state.dialogIndex = 0;
    this.notifyListeners();
  }
  
  // Start a puzzle
  private startPuzzle(puzzleId: string): void {
    const puzzle = this.getPuzzle(puzzleId);
    if (!puzzle) {
      console.error(`Puzzle ${puzzleId} not found`);
      return;
    }
    
    this.state.currentPuzzleId = puzzleId;
    this.notifyListeners();
  }
  
  // Submit a solution to the current puzzle
  private submitPuzzleSolution(solution: string[]): void {
    if (!this.state.currentPuzzleId) return;
    
    const puzzle = this.getPuzzle(this.state.currentPuzzleId);
    if (!puzzle) return;
    
    // Check if solution is correct
    const isCorrect = solution.length === puzzle.solution.length &&
                      solution.every((val, index) => {
                        // Allow for multiple correct solutions
                        if (Array.isArray(puzzle.solution[index])) {
                          return (puzzle.solution[index] as string[]).includes(val);
                        }
                        return val === puzzle.solution[index];
                      });
    
    if (isCorrect) {
      // Process puzzle reward
      if (puzzle.reward) {
        if (puzzle.reward.item) {
          const item = this.getItem(puzzle.reward.item);
          if (item) {
            this.addItem(item);
          }
        }
        
        if (puzzle.reward.status) {
          this.updateStatus(puzzle.reward.status);
        }
        
        if (puzzle.reward.notification) {
          this.addNotification(puzzle.reward.notification);
        }
      }
      
      this.endPuzzle(true);
    } else {
      // Handle incorrect solution
      this.addNotification({
        id: uuidv4(),
        type: 'error',
        message: 'That solution doesn\'t seem to work. Try again.',
        duration: 3000,
        autoDismiss: true
      });
      
      this.notifyListeners();
    }
  }
  
  // End the current puzzle
  private endPuzzle(success: boolean): void {
    this.state.currentPuzzleId = null;
    
    if (success) {
      this.addNotification({
        id: uuidv4(),
        type: 'success',
        message: 'Puzzle solved successfully!',
        duration: 3000,
        autoDismiss: true
      });
    }
    
    this.notifyListeners();
  }
  
  // Add a notification to the queue
  private addNotification(notification: Notification): void {
    // Ensure notification has an ID
    if (!notification.id) {
      notification.id = uuidv4();
    }
    
    this.state.notificationQueue = [...this.state.notificationQueue, notification];
    this.notifyListeners();
  }
  
  // Clear a notification from the queue
  private clearNotification(id: string): void {
    this.state.notificationQueue = this.state.notificationQueue.filter(n => n.id !== id);
    this.notifyListeners();
  }
  
  // Update player health
  private updateHealth(value: number): void {
    this.state.health = Math.max(0, Math.min(this.state.maxHealth, this.state.health + value));
    this.notifyListeners();
  }
  
  // Update player mana
  private updateMana(value: number): void {
    this.state.mana = Math.max(0, Math.min(this.state.maxMana, this.state.mana + value));
    this.notifyListeners();
  }
  
  // Interact with a scene element
  public interactWithElement(elementId: string, actionType: string): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;
    
    const element = currentScene.interactiveElements.find(el => el.id === elementId);
    if (!element) return;
    
    const action = element.actions.find(a => a.type === actionType);
    if (!action) return;
    
    // Check if any required items or status conditions are needed
    if (action.requiredItems && !action.requiredItems.every(itemId => this.state.inventory.has(itemId))) {
      this.addNotification({
        id: uuidv4(),
        type: 'warning',
        message: 'You need specific items to do that.',
        duration: 3000,
        autoDismiss: true
      });
      return;
    }
    
    if (action.requiredStatus) {
      for (const [key, value] of Object.entries(action.requiredStatus)) {
        if (this.state.status[key] !== value) {
          this.addNotification({
            id: uuidv4(),
            type: 'warning',
            message: 'You can\'t do that right now.',
            duration: 3000,
            autoDismiss: true
          });
          return;
        }
      }
    }
    
    // Process the action result
    const result = action.result;
    
    if (result.message) {
      this.addNotification({
        id: uuidv4(),
        type: 'info',
        message: result.message,
        duration: 5000,
        autoDismiss: true
      });
    }
    
    if (result.item) {
      const item = this.getItem(result.item);
      if (item) {
        this.addItem(item);
      }
    }
    
    if (result.dialog) {
      this.startDialog(result.dialog);
    }
    
    if (result.puzzle) {
      this.startPuzzle(result.puzzle);
    }
    
    if (result.status) {
      this.updateStatus(result.status);
    }
    
    if (result.removeItem) {
      this.removeItem(result.removeItem);
    }
    
    if (result.notification) {
      this.addNotification(result.notification);
    }
    
    this.notifyListeners();
  }
  
  // Try to exit the current scene through a specific exit
  public tryExit(exitId: string): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;
    
    const exit = currentScene.exits.find(e => e.id === exitId);
    if (!exit) return;
    
    // Check for required items to use this exit
    if (exit.requiredItems && !exit.requiredItems.every(itemId => this.state.inventory.has(itemId))) {
      this.addNotification({
        id: uuidv4(),
        type: 'warning',
        message: exit.lockedMessage || 'You can\'t go that way yet.',
        duration: 3000,
        autoDismiss: true
      });
      return;
    }
    
    // Check for required status conditions
    if (exit.requiredStatus) {
      for (const [key, value] of Object.entries(exit.requiredStatus)) {
        if (this.state.status[key] !== value) {
          this.addNotification({
            id: uuidv4(),
            type: 'warning',
            message: exit.lockedMessage || 'You can\'t go that way yet.',
            duration: 3000,
            autoDismiss: true
          });
          return;
        }
      }
    }
    
    // Move to the target scene
    this.moveToScene(exit.targetScene);
  }
}