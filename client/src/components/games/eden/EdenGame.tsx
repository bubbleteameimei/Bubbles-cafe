import React, { useEffect, useReducer, useState } from 'react';
import { GameState, Scene, Notification, Inventory, Dialog, Puzzle } from './types';
import { GameEngine } from './GameEngine';
import items from './data/items';
import puzzles from './data/puzzles';
import scenes from './data/scenes';
import { SceneView } from './ui/SceneView';
import { DialogBox } from './ui/DialogBox';
import { NotificationSystem } from './ui/NotificationSystem';
import { InventoryPanel } from './ui/InventoryPanel';
import { PuzzleInterface } from './ui/PuzzleInterface';
import { LoadingScreen } from './ui/LoadingScreen';
import { StatusBar } from './ui/StatusBar';

const gameEngine = new GameEngine({ initialScene: 'village_entrance' });

// Initial game state
const initialState: GameState = {
  currentSceneId: 'village_entrance',
  previousSceneId: null,
  inventory: {
    items: [],
    get: () => undefined,
    add: () => false,
    remove: () => false,
    has: () => false,
    filter: () => [],
    map: () => []
  },
  score: {},
  status: {},
  player: {
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    level: 1,
    experience: 0,
    status: []
  },
  visitedScenes: new Set<string>(),
  activeDialogId: null,
  dialogIndex: 0,
  currentPuzzleId: null,
  notificationQueue: [],
  lastAction: null,
  health: 100,
  maxHealth: 100,
  mana: 100,
  maxMana: 100
};

// Reducer function for game state
function gameReducer(state: GameState, action: any): GameState {
  return gameEngine.handleAction(state, action);
}

// Main game component
const EdenGame: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Entering Eden\'s Hollow...');

  // Initialize the game
  useEffect(() => {
    // Simulate loading time for atmosphere
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    // Cleanup
    return () => clearTimeout(timer);
  }, []);

  // Get the current scene
  const currentScene: Scene = scenes[state.currentSceneId];

  // Handle scene transitions
  const handleExitClick = (exitId: string) => {
    const exit = currentScene.exits.find(e => e.id === exitId);
    if (exit) {
      setIsLoading(true);
      setLoadingMessage(`Traveling to ${exit.name}...`);
      
      // Simulating travel time
      setTimeout(() => {
        dispatch({ type: 'MOVE_TO_SCENE', sceneId: exit.targetScene });
        setIsLoading(false);
      }, 1500);
    }
  };

  // Handle puzzle solutions
  const handlePuzzleSolution = (solution: string[]) => {
    if (state.currentPuzzleId) {
      const puzzle = puzzles[state.currentPuzzleId];
      dispatch({ type: 'SUBMIT_PUZZLE_SOLUTION', solution });
    }
  };

  // Handle inventory item use
  const handleItemClick = (itemId: string) => {
    // TODO: Implement context-sensitive item usage
    console.log(`Item clicked: ${itemId}`);
  };

  // Handle character interactions
  const handleCharacterClick = () => {
    // TODO: Implement character interaction logic
    console.log('Character clicked');
  };

  // Handle scene feature interaction
  const handleActionClick = (actionId: string) => {
    dispatch({ type: 'INTERACT', actionId });
  };

  // Handle dialog response selection
  const handleDialogResponse = (responseIndex: number) => {
    dispatch({ type: 'ADVANCE_DIALOG', responseIndex });
  };

  // Handle notification dismissal
  const handleNotificationDismiss = (id: string) => {
    dispatch({ type: 'CLEAR_NOTIFICATION', id });
  };

  // Update the page title based on the current scene
  useEffect(() => {
    document.title = `Eden's Hollow - ${currentScene?.name || 'Loading...'}`;
  }, [state.currentSceneId]);

  if (isLoading) {
    return <LoadingScreen message={loadingMessage} isLoading={true} />;
  }

  return (
    <div className="game-container">
      {/* Main scene view */}
      {currentScene && (
        <SceneView 
          scene={currentScene} 
          onFeatureClick={(featureId: string) => console.log(`Feature clicked: ${featureId}`)}
          onExitClick={handleExitClick}
          onActionClick={handleActionClick}
        />
      )}
      
      {/* Status bar */}
      <StatusBar 
        health={state.health} 
        maxHealth={state.maxHealth}
        mana={state.mana}
        maxMana={state.maxMana}
        onInventoryClick={() => setIsInventoryOpen(!isInventoryOpen)}
      />
      
      {/* Inventory panel */}
      <InventoryPanel 
        inventory={state.inventory} 
        onItemClick={handleItemClick} 
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />
      
      {/* Dialog box */}
      {state.activeDialogId && state.dialogIndex >= 0 && (
        <DialogBox 
          dialog={scenes[state.activeDialogId] as unknown as Dialog} 
          currentIndex={state.dialogIndex}
          onResponseClick={handleDialogResponse}
          onClose={() => dispatch({ type: 'END_DIALOG' })}
        />
      )}
      
      {/* Puzzle interface */}
      {state.currentPuzzleId && (
        <PuzzleInterface 
          puzzle={puzzles[state.currentPuzzleId]} 
          onSubmit={handlePuzzleSolution}
          onClose={() => dispatch({ type: 'END_PUZZLE', success: false })}
        />
      )}
      
      {/* Notification system */}
      <NotificationSystem 
        notifications={state.notificationQueue} 
        onDismiss={handleNotificationDismiss} 
      />
    </div>
  );
};

export default EdenGame;