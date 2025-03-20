import React, { useState, useEffect, useCallback } from 'react';
import { EdenGameProps, Scene, Dialog, Puzzle, Notification, InventoryItem } from './types';
import { GameEngine } from './GameEngine';

// UI Components
import SceneView from './ui/SceneView';
import DialogBox from './ui/DialogBox';
import StatusBar from './ui/StatusBar';
import InventoryPanel from './ui/InventoryPanel';
import NotificationSystem from './ui/NotificationSystem';
import PuzzleInterface from './ui/PuzzleInterface';

// Game data
import scenesData from './data/scenes';
import itemsData from './data/items';
import dialogsData from './data/dialogs';
import puzzlesData from './data/puzzles';

/**
 * EdenGame Component
 * Main component for the Eden's Hollow game
 */
const EdenGame: React.FC<EdenGameProps> = ({
  initialState,
  onGameSave,
  onGameComplete
}) => {
  // Initialize game engine and data
  const [gameEngine] = useState(() => new GameEngine(
    scenesData,
    dialogsData,
    puzzlesData,
    itemsData,
    initialState
  ));
  
  // Game state
  const [currentScene, setCurrentScene] = useState<Scene>(gameEngine.getCurrentScene());
  const [health, setHealth] = useState(gameEngine.state.status.health);
  const [maxHealth, setMaxHealth] = useState(gameEngine.state.status.maxHealth);
  const [mana, setMana] = useState(gameEngine.state.status.mana);
  const [maxMana, setMaxMana] = useState(gameEngine.state.status.maxMana);
  const [gameTime, setGameTime] = useState(gameEngine.state.gameTime);
  const [fogLevel, setFogLevel] = useState(gameEngine.state.fogLevel);
  const [inventory, setInventory] = useState<InventoryItem[]>(gameEngine.state.inventory);
  
  // UI state
  const [activeDialog, setActiveDialog] = useState<Dialog | null>(null);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [ending, setEnding] = useState<string | null>(null);
  
  // Handle scene changes
  useEffect(() => {
    const handleSceneChange = (scene: Scene) => {
      setCurrentScene(scene);
    };
    
    gameEngine.addEventListener('sceneChanged', handleSceneChange);
    
    return () => {
      gameEngine.removeEventListener('sceneChanged', handleSceneChange);
    };
  }, [gameEngine]);
  
  // Handle status changes
  useEffect(() => {
    const handleStatusChange = (status: any) => {
      setHealth(status.health);
      setMaxHealth(status.maxHealth);
      setMana(status.mana);
      setMaxMana(status.maxMana);
    };
    
    gameEngine.addEventListener('statusChanged', handleStatusChange);
    
    return () => {
      gameEngine.removeEventListener('statusChanged', handleStatusChange);
    };
  }, [gameEngine]);
  
  // Handle inventory changes
  useEffect(() => {
    const handleInventoryChange = (updatedInventory: InventoryItem[]) => {
      setInventory([...updatedInventory]);
    };
    
    gameEngine.addEventListener('inventoryChanged', handleInventoryChange);
    
    return () => {
      gameEngine.removeEventListener('inventoryChanged', handleInventoryChange);
    };
  }, [gameEngine]);
  
  // Handle time changes
  useEffect(() => {
    const handleTimeChange = (time: number) => {
      setGameTime(time);
    };
    
    gameEngine.addEventListener('timeChanged', handleTimeChange);
    
    return () => {
      gameEngine.removeEventListener('timeChanged', handleTimeChange);
    };
  }, [gameEngine]);
  
  // Handle fog changes
  useEffect(() => {
    const handleFogChange = (level: number) => {
      setFogLevel(level);
    };
    
    gameEngine.addEventListener('fogChanged', handleFogChange);
    
    return () => {
      gameEngine.removeEventListener('fogChanged', handleFogChange);
    };
  }, [gameEngine]);
  
  // Handle dialog events
  useEffect(() => {
    const handleDialogStart = (data: { dialog: Dialog, initialIndex: number }) => {
      setActiveDialog(data.dialog);
      setDialogIndex(data.initialIndex);
    };
    
    const handleDialogEnd = () => {
      setActiveDialog(null);
      setDialogIndex(0);
    };
    
    gameEngine.addEventListener('dialogStarted', handleDialogStart);
    gameEngine.addEventListener('dialogEnded', handleDialogEnd);
    
    return () => {
      gameEngine.removeEventListener('dialogStarted', handleDialogStart);
      gameEngine.removeEventListener('dialogEnded', handleDialogEnd);
    };
  }, [gameEngine]);
  
  // Handle puzzle events
  useEffect(() => {
    const handlePuzzleStart = (puzzle: Puzzle) => {
      setActivePuzzle(puzzle);
    };
    
    const handlePuzzleSolved = () => {
      setActivePuzzle(null);
    };
    
    const handlePuzzleCancel = () => {
      setActivePuzzle(null);
    };
    
    gameEngine.addEventListener('puzzleStarted', handlePuzzleStart);
    gameEngine.addEventListener('puzzleSolved', handlePuzzleSolved);
    gameEngine.addEventListener('puzzleCancelled', handlePuzzleCancel);
    
    return () => {
      gameEngine.removeEventListener('puzzleStarted', handlePuzzleStart);
      gameEngine.removeEventListener('puzzleSolved', handlePuzzleSolved);
      gameEngine.removeEventListener('puzzleCancelled', handlePuzzleCancel);
    };
  }, [gameEngine]);
  
  // Handle notifications
  useEffect(() => {
    const handleNotificationAdded = (notification: Notification) => {
      setNotifications(prevNotifications => [...prevNotifications, notification]);
    };
    
    const handleNotificationDismissed = (id: string) => {
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== id)
      );
    };
    
    gameEngine.addEventListener('notificationAdded', handleNotificationAdded);
    gameEngine.addEventListener('notificationDismissed', handleNotificationDismissed);
    
    return () => {
      gameEngine.removeEventListener('notificationAdded', handleNotificationAdded);
      gameEngine.removeEventListener('notificationDismissed', handleNotificationDismissed);
    };
  }, [gameEngine]);
  
  // Handle game completion
  useEffect(() => {
    const handleGameComplete = (endingId: string) => {
      setIsGameOver(true);
      setEnding(endingId);
      
      if (onGameComplete) {
        onGameComplete(endingId);
      }
    };
    
    gameEngine.addEventListener('gameComplete', handleGameComplete);
    
    return () => {
      gameEngine.removeEventListener('gameComplete', handleGameComplete);
    };
  }, [gameEngine, onGameComplete]);
  
  // Auto-save game state periodically
  useEffect(() => {
    if (!onGameSave) return;
    
    const saveInterval = setInterval(() => {
      const savedState = gameEngine.saveGame();
      onGameSave(savedState);
    }, 30000); // Save every 30 seconds
    
    return () => {
      clearInterval(saveInterval);
    };
  }, [gameEngine, onGameSave]);
  
  // Callback handlers for scene interactions
  const handleHotspotInteract = useCallback((hotspotId: string) => {
    gameEngine.interactWithHotspot(hotspotId);
  }, [gameEngine]);
  
  const handleExitSelect = useCallback((exitId: string) => {
    gameEngine.useExit(exitId);
  }, [gameEngine]);
  
  const handleItemTake = useCallback((itemPlacementId: string) => {
    gameEngine.takeItem(itemPlacementId);
  }, [gameEngine]);
  
  // Callback handlers for dialog interactions
  const handleDialogSelect = useCallback((responseIndex: number) => {
    gameEngine.selectDialogResponse(responseIndex);
    
    if (activeDialog?.content[dialogIndex]?.responses) {
      const nextIndex = activeDialog.content[dialogIndex].responses?.[responseIndex]?.nextIndex;
      
      if (nextIndex !== undefined) {
        setDialogIndex(nextIndex);
      } else {
        gameEngine.endDialog();
      }
    }
  }, [gameEngine, activeDialog, dialogIndex]);
  
  const handleDialogClose = useCallback(() => {
    gameEngine.endDialog();
  }, [gameEngine]);
  
  // Callback handlers for inventory interactions
  const handleItemSelect = useCallback((itemId: string) => {
    // Simply selection, doesn't need game engine interaction
  }, []);
  
  const handleItemUse = useCallback((itemId: string) => {
    gameEngine.useItem(itemId);
  }, [gameEngine]);
  
  const handleItemExamine = useCallback((itemId: string) => {
    gameEngine.examineItem(itemId);
  }, [gameEngine]);
  
  const handleItemCombine = useCallback((itemId1: string, itemId2: string) => {
    gameEngine.combineItems(itemId1, itemId2);
  }, [gameEngine]);
  
  // Callback handlers for notification interactions
  const handleNotificationDismiss = useCallback((id: string) => {
    gameEngine.dismissNotification(id);
  }, [gameEngine]);
  
  const handleNotificationAction = useCallback((id: string) => {
    // Custom actions would go here
    // For now, just dismiss the notification
    gameEngine.dismissNotification(id);
  }, [gameEngine]);
  
  // Callback handlers for puzzle interactions
  const handlePuzzleSolve = useCallback(() => {
    gameEngine.solvePuzzle();
  }, [gameEngine]);
  
  const handlePuzzleClose = useCallback(() => {
    gameEngine.cancelPuzzle();
  }, [gameEngine]);
  
  const handlePuzzleHint = useCallback(() => {
    // Could trigger additional gameplay effects
  }, []);
  
  // Game over screen
  if (isGameOver) {
    return (
      <div className="game-over-screen">
        <h1>The End</h1>
        <h2>{ending === 'good' ? 'You escaped Eden\'s Hollow!' : 'The darkness claimed you...'}</h2>
        <p>Thank you for playing.</p>
      </div>
    );
  }

  return (
    <div className="eden-game">
      {/* Main scene view */}
      <SceneView 
        scene={currentScene}
        gameState={gameEngine.state}
        onHotspotInteract={handleHotspotInteract}
        onExitSelect={handleExitSelect}
        onItemTake={handleItemTake}
      />
      
      {/* Dialog overlay */}
      {activeDialog && (
        <DialogBox 
          dialog={activeDialog}
          currentIndex={dialogIndex}
          onSelect={handleDialogSelect}
          onClose={handleDialogClose}
        />
      )}
      
      {/* Puzzle overlay */}
      {activePuzzle && (
        <PuzzleInterface 
          puzzle={activePuzzle}
          onSolve={handlePuzzleSolve}
          onClose={handlePuzzleClose}
          onHint={handlePuzzleHint}
        />
      )}
      
      {/* Status bar */}
      <StatusBar 
        health={health}
        maxHealth={maxHealth}
        mana={mana}
        maxMana={maxMana}
        gameTime={gameTime}
        fogLevel={fogLevel}
      />
      
      {/* Inventory panel */}
      <InventoryPanel 
        inventory={inventory}
        onItemSelect={handleItemSelect}
        onItemUse={handleItemUse}
        onItemExamine={handleItemExamine}
        onItemCombine={handleItemCombine}
      />
      
      {/* Notification system */}
      <NotificationSystem 
        notifications={notifications}
        onDismiss={handleNotificationDismiss}
        onAction={handleNotificationAction}
      />
      
      <style jsx>{`
        .eden-game {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          font-family: 'Goudy Old Style', serif;
        }
        
        .game-over-screen {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.9);
          color: #fff;
          text-align: center;
          z-index: 2000;
        }
        
        .game-over-screen h1 {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .game-over-screen h2 {
          font-size: 32px;
          margin-bottom: 40px;
        }
        
        .game-over-screen p {
          font-size: 18px;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default EdenGame;