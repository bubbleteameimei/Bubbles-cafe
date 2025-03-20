/**
 * Eden's Hollow Game Engine
 * Core logic for handling game state, transitions, and game mechanics
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  GameState, 
  GameScene, 
  PuzzleData, 
  DialogData, 
  InventoryItem 
} from './types';

// Game Engine Configuration
interface GameEngineConfig {
  scenes: Record<string, GameScene>;
  items: Record<string, InventoryItem>;
  puzzles: Record<string, PuzzleData>;
  dialogs: Record<string, DialogData>;
  onStateChange: (state: GameState) => void;
}

/**
 * Game Engine (Singleton)
 * Central controller for all game mechanics and state management
 */
export class GameEngine {
  private static instance: GameEngine;
  private state: GameState;
  private scenes: Record<string, GameScene>;
  private items: Record<string, InventoryItem>;
  private puzzles: Record<string, PuzzleData>;
  private dialogs: Record<string, DialogData>;
  private onStateChange: (state: GameState) => void;
  
  private constructor(config: GameEngineConfig) {
    // Initial game state
    this.state = {
      currentScene: 'forest_edge',
      inventory: [],
      status: {},
      time: 'dusk',
      visitedScenes: ['forest_edge'],
      solvedPuzzles: [],
      health: 100,
      mana: 100,
      dialogHistory: [],
      notifications: []
    };
    
    this.scenes = config.scenes;
    this.items = config.items;
    this.puzzles = config.puzzles;
    this.dialogs = config.dialogs;
    this.onStateChange = config.onStateChange;
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(config?: GameEngineConfig): GameEngine {
    if (!GameEngine.instance && config) {
      GameEngine.instance = new GameEngine(config);
    }
    return GameEngine.instance;
  }
  
  /**
   * Update state and notify listeners
   */
  private updateState(updater: (state: GameState) => GameState): void {
    this.state = updater(this.state);
    this.onStateChange(this.state);
  }
  
  /**
   * Add notification to the game state
   */
  private addNotification(message: string, type: 'info' | 'warning' | 'success' | 'danger' = 'info'): void {
    this.updateState(state => ({
      ...state,
      notifications: [
        ...state.notifications,
        {
          id: uuidv4(),
          message,
          type,
          duration: 5000
        }
      ]
    }));
    
    // Auto-remove notification after duration
    setTimeout(() => {
      this.updateState(state => ({
        ...state,
        notifications: state.notifications.slice(1)
      }));
    }, 5000);
  }
  
  /**
   * Check if a requirement is met
   */
  public checkRequirement(requirement: any): boolean {
    if (!requirement) return true;
    
    if (requirement.item) {
      return this.state.inventory.includes(requirement.item);
    }
    
    if (requirement.status) {
      return Object.entries(requirement.status).every(
        ([key, value]) => this.state.status[key] === value
      );
    }
    
    if (requirement.time) {
      return this.state.time === requirement.time;
    }
    
    if (requirement.puzzle) {
      return this.state.solvedPuzzles.includes(requirement.puzzle);
    }
    
    return false;
  }
  
  /**
   * Transition to a new scene
   */
  public transitionToScene(sceneId: string): void {
    // Check if scene exists
    if (!this.scenes[sceneId]) {
      this.addNotification(`Error: Scene '${sceneId}' not found.`, 'danger');
      return;
    }
    
    // Check if any exit leads to this scene from current scene
    const currentScene = this.scenes[this.state.currentScene];
    const validExit = currentScene.exits.find(exit => 
      exit.destination === sceneId && this.checkRequirement(exit.requirement)
    );
    
    if (!validExit) {
      this.addNotification("You cannot go there right now.", 'warning');
      return;
    }
    
    // Update state with new scene
    this.updateState(state => ({
      ...state,
      previousScene: state.currentScene,
      currentScene: sceneId,
      visitedScenes: state.visitedScenes.includes(sceneId) 
        ? state.visitedScenes 
        : [...state.visitedScenes, sceneId],
      activeDialog: undefined,
      activeCharacter: undefined
    }));
    
    // Check for auto-discovery in the new scene
    this.checkForDiscovery();
    
    // Check for auto-collectible items
    this.checkForItems();
    
    // Check for puzzles
    this.checkForPuzzles();
    
    // Notify player of scene transition
    this.addNotification(`Entered: ${this.scenes[sceneId].title}`, 'info');
  }
  
  /**
   * Use an inventory item
   */
  public useItem(itemId: string): void {
    if (!this.state.inventory.includes(itemId)) {
      this.addNotification("You don't have that item.", 'warning');
      return;
    }
    
    const item = this.items[itemId];
    
    // Handle different item use actions
    switch (item.useAction) {
      case 'heal':
        this.updateState(state => ({
          ...state,
          health: Math.min(100, state.health + 25)
        }));
        this.addNotification(`Used ${item.name} to restore health.`, 'success');
        break;
        
      case 'restore_mana':
        this.updateState(state => ({
          ...state,
          mana: Math.min(100, state.mana + 25)
        }));
        this.addNotification(`Used ${item.name} to restore mana.`, 'success');
        break;
        
      case 'unlock':
        // Check current scene for unlockable objects
        const currentScene = this.scenes[this.state.currentScene];
        // This would be implemented based on scene-specific unlockable objects
        this.addNotification(`Used ${item.name}, but nothing happened here.`, 'info');
        break;
        
      case 'activate':
        // Activate special item effects
        if (itemId === 'ghostlight_lantern') {
          this.updateState(state => ({
            ...state,
            status: {
              ...state.status,
              lantern_active: true
            }
          }));
          this.addNotification(`Activated the ${item.name}. Hidden things may now be revealed.`, 'success');
          // Check for newly visible entities
          this.checkForDiscovery();
        } else {
          this.addNotification(`Activated ${item.name}.`, 'info');
        }
        break;
        
      case 'read':
        if (itemId === 'ancient_tome') {
          this.addNotification(`You read from the ${item.name}. The strange symbols swim before your eyes, slowly resolving into meaning.`, 'info');
          this.updateState(state => ({
            ...state,
            status: {
              ...state.status,
              read_tome: true
            },
            health: state.health - 5 // Reading causes minor psychic damage
          }));
        } else {
          this.addNotification(`You read the ${item.name}.`, 'info');
        }
        break;
        
      default:
        this.addNotification(`You examine the ${item.name} but aren't sure how to use it here.`, 'info');
    }
  }
  
  /**
   * Start a dialog with a character
   */
  public startDialog(characterId: string): void {
    const currentScene = this.scenes[this.state.currentScene];
    const character = currentScene.characters.find(c => c.id === characterId);
    
    if (!character || !character.dialog) {
      this.addNotification("This character has nothing to say.", 'warning');
      return;
    }
    
    this.updateState(state => ({
      ...state,
      activeDialog: character.dialog,
      activeCharacter: characterId
    }));
  }
  
  /**
   * Select a dialog response
   */
  public selectDialogResponse(responseIndex: number): void {
    if (!this.state.activeDialog) return;
    
    const dialog = this.dialogs[this.state.activeDialog];
    if (!dialog || !dialog.responses || responseIndex >= dialog.responses.length) {
      this.addNotification("Invalid dialog response.", 'danger');
      return;
    }
    
    const response = dialog.responses[responseIndex];
    
    // Add to dialog history
    this.updateState(state => ({
      ...state,
      dialogHistory: [
        ...state.dialogHistory,
        {
          character: dialog.character.name,
          text: response.text,
          timestamp: new Date().toISOString()
        }
      ]
    }));
    
    // Handle response action
    if (response.action === 'leave') {
      // End dialog
      this.updateState(state => ({
        ...state,
        activeDialog: undefined,
        activeCharacter: undefined
      }));
      return;
    }
    
    // Handle response outcome
    if (response.outcome) {
      switch (response.outcome.type) {
        case 'item':
          this.addItemToInventory(response.outcome.value);
          if (response.outcome.message) {
            this.addNotification(response.outcome.message, 'success');
          }
          break;
        case 'status':
          this.updateState(state => ({
            ...state,
            status: {
              ...state.status,
              ...response.outcome.value
            }
          }));
          if (response.outcome.message) {
            this.addNotification(response.outcome.message, 'info');
          }
          break;
        case 'scene':
          this.transitionToScene(response.outcome.value);
          return;
        case 'puzzle':
          // Start a puzzle
          this.startPuzzle(response.outcome.value);
          return;
      }
    }
    
    // Move to next dialog if specified
    if (response.nextDialog) {
      this.updateState(state => ({
        ...state,
        activeDialog: response.nextDialog
      }));
    } else {
      // End dialog if no next dialog
      this.updateState(state => ({
        ...state,
        activeDialog: undefined,
        activeCharacter: undefined
      }));
    }
  }
  
  /**
   * Start a puzzle
   */
  private startPuzzle(puzzleId: string): void {
    if (!this.puzzles[puzzleId]) {
      this.addNotification(`Error: Puzzle '${puzzleId}' not found.`, 'danger');
      return;
    }
    
    this.updateState(state => ({
      ...state,
      currentPuzzle: puzzleId,
      puzzleAttempts: 0
    }));
  }
  
  /**
   * Attempt to solve a puzzle
   */
  public attemptPuzzle(puzzleId: string, solution: any): void {
    const puzzle = this.puzzles[puzzleId];
    if (!puzzle) {
      this.addNotification(`Error: Puzzle '${puzzleId}' not found.`, 'danger');
      return;
    }
    
    // Increment attempts counter
    this.updateState(state => ({
      ...state,
      puzzleAttempts: (state.puzzleAttempts || 0) + 1
    }));
    
    // Check solution based on puzzle type
    let solved = false;
    
    switch (puzzle.type) {
      case 'riddle':
        // For riddles, solution is a string answer
        const correctAnswer = puzzle.data.answer.toLowerCase();
        const providedAnswer = (solution as string).toLowerCase();
        solved = correctAnswer === providedAnswer || 
                (puzzle.data.alternateAnswers && 
                 puzzle.data.alternateAnswers.map(a => a.toLowerCase()).includes(providedAnswer));
        break;
        
      case 'pattern':
        // For patterns, solution is an array of indices
        solved = JSON.stringify(puzzle.data.correctPattern) === JSON.stringify(solution);
        break;
        
      case 'combination':
        // For combinations, solution is an array of values
        solved = JSON.stringify(puzzle.data.combination) === JSON.stringify(solution);
        break;
        
      case 'runes':
        // For runes, solution is an array of selected rune symbols
        solved = JSON.stringify(puzzle.data.correctSequence) === JSON.stringify(solution);
        break;
        
      case 'sacrifice':
        // For sacrifice puzzles, solution is an array of selected item ids
        const selectedItems = (solution as string[])
          .map(id => puzzle.data.items.find(item => item.id === id))
          .filter(Boolean);
        
        const totalValue = selectedItems.reduce((sum, item) => sum + item.value, 0);
        solved = totalValue === puzzle.data.targetValue && 
                 selectedItems.length <= puzzle.data.maxSelections;
        break;
    }
    
    if (solved) {
      // Puzzle completed successfully
      this.addNotification(`You solved the ${puzzle.title}!`, 'success');
      
      // Update puzzle in state as solved
      this.updateState(state => ({
        ...state,
        currentPuzzle: undefined,
        puzzleAttempts: 0,
        solvedPuzzles: [...state.solvedPuzzles, puzzleId]
      }));
      
      // Check for newly available paths or items
      this.checkForDiscovery();
      this.checkForItems();
    } else {
      // Puzzle failed
      if (puzzle.data.maxAttempts && this.state.puzzleAttempts >= puzzle.data.maxAttempts) {
        // Max attempts reached
        this.addNotification(`You failed to solve the ${puzzle.title}. It can no longer be attempted.`, 'danger');
        this.updateState(state => ({
          ...state,
          currentPuzzle: undefined,
          puzzleAttempts: 0,
          health: state.health - 10 // Penalty for failing a puzzle
        }));
      } else {
        // Can try again
        this.addNotification(`Your solution to the ${puzzle.title} was incorrect. Try again.`, 'warning');
      }
    }
  }
  
  /**
   * Perform a scene action
   */
  public performAction(actionId: string): void {
    const currentScene = this.scenes[this.state.currentScene];
    const action = currentScene.actions?.find(a => a.action === actionId);
    
    if (!action) {
      this.addNotification("This action is not available.", 'warning');
      return;
    }
    
    // Display action result
    this.addNotification(action.result, 'info');
    
    // Apply action outcomes
    if (action.outcomes && action.outcomes.length > 0) {
      action.outcomes.forEach(outcome => {
        switch (outcome.type) {
          case 'item':
            this.addItemToInventory(outcome.value);
            if (outcome.message) {
              this.addNotification(outcome.message, 'success');
            }
            break;
          case 'status':
            this.updateState(state => ({
              ...state,
              status: {
                ...state.status,
                ...outcome.value
              }
            }));
            break;
          case 'health':
            this.updateState(state => ({
              ...state,
              health: Math.max(0, Math.min(100, state.health + outcome.value))
            }));
            if (outcome.message) {
              this.addNotification(outcome.message, outcome.value > 0 ? 'success' : 'danger');
            }
            break;
          case 'mana':
            this.updateState(state => ({
              ...state,
              mana: Math.max(0, Math.min(100, state.mana + outcome.value))
            }));
            if (outcome.message) {
              this.addNotification(outcome.message, outcome.value > 0 ? 'success' : 'warning');
            }
            break;
        }
      });
    }
    
    // Check for discoveries or new items after action
    this.checkForDiscovery();
    this.checkForItems();
  }
  
  /**
   * Check for discoveries in the current scene
   */
  private checkForDiscovery(): void {
    const currentScene = this.scenes[this.state.currentScene];
    
    if (currentScene.discovery && 
        this.checkRequirement(currentScene.discovery.requires) && 
        !this.state.status[`discovered_${currentScene.id}`]) {
      
      // Add discovery to status
      this.updateState(state => ({
        ...state,
        status: {
          ...state.status,
          [`discovered_${currentScene.id}`]: true
        }
      }));
      
      // Notify player
      this.addNotification(currentScene.discovery.text, 'info');
    }
  }
  
  /**
   * Check for items that can be collected in current scene
   */
  private checkForItems(): void {
    const currentScene = this.scenes[this.state.currentScene];
    
    currentScene.items.forEach(itemPlacement => {
      // If item is not hidden and requirement is met, add to inventory
      if (!itemPlacement.hidden && 
          this.checkRequirement(itemPlacement.requirement) &&
          !this.state.inventory.includes(itemPlacement.id) &&
          !this.state.status[`collected_${itemPlacement.id}`]) {
        
        this.addItemToInventory(itemPlacement.id);
        this.addNotification(`You found ${this.items[itemPlacement.id].name}!`, 'success');
      }
    });
  }
  
  /**
   * Check for puzzles in the current scene
   */
  private checkForPuzzles(): void {
    const currentScene = this.scenes[this.state.currentScene];
    
    if (currentScene.puzzles && currentScene.puzzles.length > 0) {
      currentScene.puzzles.forEach(puzzlePlacement => {
        // If puzzle isn't already solved, present it
        if (!this.state.solvedPuzzles.includes(puzzlePlacement.id) &&
            !this.state.status[`failed_${puzzlePlacement.id}`]) {
          this.addNotification(puzzlePlacement.introduction, 'info');
          this.startPuzzle(puzzlePlacement.id);
        }
      });
    }
  }
  
  /**
   * Add an item to the player's inventory
   */
  private addItemToInventory(itemId: string): void {
    if (!this.items[itemId]) {
      console.error(`Error: Item '${itemId}' not found.`);
      return;
    }
    
    this.updateState(state => ({
      ...state,
      inventory: [...state.inventory, itemId],
      status: {
        ...state.status,
        [`collected_${itemId}`]: true
      }
    }));
  }
  
  /**
   * Save game to local storage
   */
  public saveGame(): void {
    try {
      const saveData = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        gameState: this.state,
        playTime: 0 // Would track play time in real implementation
      };
      
      localStorage.setItem('edens_hollow_save', JSON.stringify(saveData));
      this.addNotification("Game saved successfully.", 'success');
    } catch (error) {
      console.error("Error saving game:", error);
      this.addNotification("Failed to save game.", 'danger');
    }
  }
  
  /**
   * Load game from local storage
   */
  public loadGame(): void {
    try {
      const saveData = localStorage.getItem('edens_hollow_save');
      if (saveData) {
        const { gameState } = JSON.parse(saveData);
        this.updateState(() => gameState);
        this.addNotification("Game loaded successfully.", 'success');
      } else {
        this.addNotification("No saved game found.", 'warning');
      }
    } catch (error) {
      console.error("Error loading game:", error);
      this.addNotification("Failed to load game.", 'danger');
    }
  }
  
  /**
   * Change the time of day
   */
  public changeTimeOfDay(newTime: 'dawn' | 'day' | 'dusk' | 'night'): void {
    this.updateState(state => ({
      ...state,
      time: newTime
    }));
    
    this.addNotification(`Time passes. It is now ${newTime}.`, 'info');
    
    // Check for time-dependent discoveries
    this.checkForDiscovery();
  }
}