import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameNotification, Scene, Dialog, Puzzle, GameResults } from './types';
import GameEngine from './GameEngine';

// UI Components
import SceneView from './ui/SceneView';
import DialogBox from './ui/DialogBox';
import InventoryPanel from './ui/InventoryPanel';
import StatusBar from './ui/StatusBar';
import NotificationSystem from './ui/NotificationSystem';
import PuzzleInterface from './ui/PuzzleInterface';

/**
 * Eden's Hollow - Main Game Component
 * 
 * This component orchestrates all the game elements and manages the game state
 * through the GameEngine.
 */
const EdenGame: React.FC = () => {
  // Initialize game engine
  const gameEngine = useRef<GameEngine>(new GameEngine());
  
  // State for current game elements
  const [gameState, setGameState] = useState<GameState>(gameEngine.current.getState());
  const [currentScene, setCurrentScene] = useState<Scene>(gameEngine.current.getCurrentScene());
  const [activeDialog, setActiveDialog] = useState<Dialog | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  
  // Set up event listeners when component mounts
  useEffect(() => {
    const engine = gameEngine.current;
    
    // Scene change handler
    const handleSceneChanged = (scene: Scene) => {
      setCurrentScene(scene);
      setGameState(engine.getState());
    };
    
    // Dialog handlers
    const handleDialogOpened = (dialog: Dialog) => {
      setActiveDialog(dialog);
      setGameState(engine.getState());
    };
    
    const handleDialogClosed = () => {
      setActiveDialog(null);
      setGameState(engine.getState());
    };
    
    const handleDialogAdvanced = () => {
      setGameState(engine.getState());
    };
    
    // Puzzle handlers
    const handlePuzzleStarted = (puzzle: Puzzle) => {
      setActivePuzzle(puzzle);
      setGameState(engine.getState());
    };
    
    const handlePuzzleSolved = () => {
      setActivePuzzle(null);
      setGameState(engine.getState());
    };
    
    const handlePuzzleCancelled = () => {
      setActivePuzzle(null);
      setGameState(engine.getState());
    };
    
    // State change handlers
    const handleInventoryChanged = () => {
      setGameState(engine.getState());
    };
    
    const handleNotificationShown = () => {
      setGameState(engine.getState());
    };
    
    const handleNotificationDismissed = () => {
      setGameState(engine.getState());
    };
    
    // Game completion handler
    const handleGameCompleted = (results: GameResults) => {
      console.log('Game completed with results:', results);
      // Display end screen, trigger completion callback, etc.
    };
    
    // Register event listeners
    engine.addEventListener('sceneChanged', handleSceneChanged);
    engine.addEventListener('dialogOpened', handleDialogOpened);
    engine.addEventListener('dialogClosed', handleDialogClosed);
    engine.addEventListener('dialogAdvanced', handleDialogAdvanced);
    engine.addEventListener('puzzleStarted', handlePuzzleStarted);
    engine.addEventListener('puzzleSolved', handlePuzzleSolved);
    engine.addEventListener('puzzleCancelled', handlePuzzleCancelled);
    engine.addEventListener('inventoryChanged', handleInventoryChanged);
    engine.addEventListener('notificationShown', handleNotificationShown);
    engine.addEventListener('notificationDismissed', handleNotificationDismissed);
    engine.addEventListener('gameCompleted', handleGameCompleted);
    
    // Clean up event listeners on unmount
    return () => {
      engine.removeEventListener('sceneChanged', handleSceneChanged);
      engine.removeEventListener('dialogOpened', handleDialogOpened);
      engine.removeEventListener('dialogClosed', handleDialogClosed);
      engine.removeEventListener('dialogAdvanced', handleDialogAdvanced);
      engine.removeEventListener('puzzleStarted', handlePuzzleStarted);
      engine.removeEventListener('puzzleSolved', handlePuzzleSolved);
      engine.removeEventListener('puzzleCancelled', handlePuzzleCancelled);
      engine.removeEventListener('inventoryChanged', handleInventoryChanged);
      engine.removeEventListener('notificationShown', handleNotificationShown);
      engine.removeEventListener('notificationDismissed', handleNotificationDismissed);
      engine.removeEventListener('gameCompleted', handleGameCompleted);
    };
  }, []);
  
  // Save game state when component unmounts or before page reloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('eden_game_save', JSON.stringify(gameEngine.current.saveGame()));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Handle hotspot interaction
  const handleHotspotInteract = (hotspotId: string) => {
    gameEngine.current.interactWithHotspot(hotspotId);
  };
  
  // Handle exit selection
  const handleExitSelect = (exitId: string) => {
    gameEngine.current.useExit(exitId);
  };
  
  // Handle item pickup
  const handleItemTake = (itemPlacementId: string) => {
    gameEngine.current.takeItem(itemPlacementId);
  };
  
  // Handle dialog response selection
  const handleDialogSelect = (responseIndex: number) => {
    gameEngine.current.selectDialogResponse(responseIndex);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    gameEngine.current.endDialog();
  };
  
  // Handle inventory item selection
  const handleItemSelect = (itemId: string) => {
    // This is just a selection, no direct action yet
    console.log('Selected item:', itemId);
  };
  
  // Handle inventory item use
  const handleItemUse = (itemId: string) => {
    gameEngine.current.useItem(itemId);
  };
  
  // Handle inventory item examination
  const handleItemExamine = (itemId: string) => {
    gameEngine.current.examineItem(itemId);
  };
  
  // Handle inventory item combination
  const handleItemCombine = (itemId1: string, itemId2: string) => {
    gameEngine.current.combineItems(itemId1, itemId2);
  };
  
  // Handle notification dismissal
  const handleNotificationDismiss = (notificationId: string) => {
    gameEngine.current.dismissNotification(notificationId);
  };
  
  // Handle notification action
  const handleNotificationAction = (notificationId: string) => {
    const notification = gameState.notifications.find(n => n.id === notificationId);
    if (notification && notification.action) {
      gameEngine.current.dismissNotification(notificationId);
      // Process the action's event
      gameEngine.current.processEvents([notification.action.event]);
    }
  };
  
  // Handle puzzle solution
  const handlePuzzleSolve = () => {
    gameEngine.current.solvePuzzle();
  };
  
  // Handle puzzle cancellation
  const handlePuzzleCancel = () => {
    gameEngine.current.cancelPuzzle();
  };
  
  // Handle puzzle hint request
  const handlePuzzleHint = () => {
    // You could implement a hint system here
    console.log('Hint requested for puzzle');
  };
  
  return (
    <div className="eden-game">
      {/* Scene View - Main game visual area */}
      <SceneView 
        scene={currentScene}
        onHotspotInteract={handleHotspotInteract}
        onExitSelect={handleExitSelect}
        onItemTake={handleItemTake}
      />
      
      {/* Status Bar - Player stats */}
      <StatusBar 
        health={gameState.player.health}
        maxHealth={gameState.player.maxHealth}
        mana={gameState.player.mana}
        maxMana={gameState.player.maxMana}
      />
      
      {/* Dialog Box - Character conversations */}
      {activeDialog && (
        <DialogBox 
          dialog={activeDialog}
          currentIndex={gameState.dialogLineIndex}
          onSelect={handleDialogSelect}
          onClose={handleDialogClose}
        />
      )}
      
      {/* Puzzle Interface - Game puzzles */}
      {activePuzzle && (
        <PuzzleInterface 
          puzzle={activePuzzle}
          onSolve={handlePuzzleSolve}
          onClose={handlePuzzleCancel}
          onHint={handlePuzzleHint}
        />
      )}
      
      {/* Inventory Panel - Item management */}
      <InventoryPanel 
        inventory={gameState.inventory}
        onItemSelect={handleItemSelect}
        onItemUse={handleItemUse}
        onItemExamine={handleItemExamine}
        onItemCombine={handleItemCombine}
      />
      
      {/* Notification System - Game alerts */}
      <NotificationSystem 
        notifications={gameState.notifications}
        onDismiss={handleNotificationDismiss}
        onAction={handleNotificationAction}
      />
      
      <style jsx>
        {`
          .eden-game {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background-color: #000;
            color: #fff;
            font-family: 'Georgia', serif;
          }
        `}
      </style>
    </div>
  );
};

export default EdenGame;