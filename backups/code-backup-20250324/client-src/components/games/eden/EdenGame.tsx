import React, { useState, useEffect, useCallback, useRef } from 'react';
import SceneView from './ui/SceneView';
import DialogBox from './ui/DialogBox';
import InventoryPanel from './ui/InventoryPanel';
import StatusBar from './ui/StatusBar';
import NotificationSystem from './ui/NotificationSystem';
import PuzzleInterface from './ui/PuzzleInterface';
import { 
  EdenGameProps, 
  GameState, 
  Scene, 
  Dialog, 
  DialogChoice, 
  Hotspot, 
  Exit, 
  SceneItem, 
  InventoryItem, 
  Puzzle, 
  GameNotification,
  GameEngineConfig
} from './types';

// Import GameEngine instance
import { gameEngine } from './GameEngine';

/**
 * EdenGame - Main game component that integrates all UI components with the game engine
 */
const EdenGame: React.FC<EdenGameProps> = ({ onExit }) => {
  // Game state reference from the engine
  const [gameState, setGameState] = useState<GameState>({
    player: {
      health: 100,
      maxHealth: 100,
      mana: 80,
      maxMana: 100,
      sanity: 90,
      maxSanity: 100,
      level: 1,
      experience: 0
    },
    inventory: [],
    currentScene: 'village_entrance',
    visitedScenes: ['village_entrance'],
    flags: {},
    gameTime: 0,
    activeEffects: [],
    isGameOver: false,
    hintsDisabled: false
  });
  
  // UI state
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  // Temporary mock scene data (in a real game, this would come from the game engine)
  const [currentScene, setCurrentScene] = useState<Scene>({
    id: 'village_entrance',
    name: 'Village Entrance',
    description: 'The fog-shrouded entrance to Eden\'s Hollow. Ancient stone pillars mark the boundary.',
    backgroundImage: '/assets/scenes/village-entrance.jpg',
    lighting: 'dim',
    hotspots: [
      {
        id: 'village_sign',
        x: 65,
        y: 35,
        width: 10,
        height: 15,
        tooltip: 'Read Sign',
        description: 'A weathered wooden sign with faded lettering. "Eden\'s Hollow - Where Peace Finds You"',
        dialogId: 'read_village_sign'
      },
      {
        id: 'strange_statue',
        x: 30,
        y: 40,
        width: 8,
        height: 20,
        tooltip: 'Examine Statue',
        description: 'A moss-covered statue of a robed figure with its face worn away by time.'
      }
    ],
    exits: [
      {
        id: 'to_village_square',
        x: 45,
        y: 50,
        width: 15,
        height: 15,
        targetScene: 'village_square',
        tooltip: 'Enter Village'
      },
      {
        id: 'to_forest_path',
        x: 10,
        y: 60,
        width: 15,
        height: 10,
        targetScene: 'forest_path',
        tooltip: 'Forest Path',
        locked: true,
        lockType: 'item',
        requiredItem: 'old_key',
        lockedMessage: 'The gate to the forest path is locked with a heavy iron padlock.'
      }
    ],
    items: [
      {
        id: 'entrance_coin',
        itemId: 'ancient_coin',
        x: 75,
        y: 75,
        width: 5,
        height: 5,
        tooltip: 'Take Ancient Coin',
        visualCue: true
      }
    ],
    entryDialog: 'village_entrance_first_visit'
  });
  
  // Dialog state
  const [currentDialog, setCurrentDialog] = useState<Dialog | null>(null);
  
  // Puzzle state
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  
  // Initialize the game engine
  useEffect(() => {
    // Configure and initialize the game engine
    const initGame = async () => {
      try {
        setLoading(true);
        
        // Define engine configuration
        const config: GameEngineConfig = {
          initialScene: 'village_entrance',
          showIntro: true,
          enableHints: true,
          enableAutoSave: true,
          saveInterval: 5, // minutes
          debugMode: false,
          difficultyLevel: 'normal'
        };
        
        // Register state change callback to update our component state
        gameEngine.onStateChange((newState) => {
          setGameState(newState);
        });
        
        // Register dialog callback
        gameEngine.onDialogStart((dialog) => {
          setCurrentDialog(dialog);
        });
        
        // Initialize the engine
        await gameEngine.initialize(config);
        
        // Set the game as initialized
        setInitialized(true);
        setLoading(false);
        
        // Show welcome notification
        addNotification({
          id: 'welcome',
          type: 'info',
          title: 'Welcome to Eden\'s Hollow',
          message: 'Explore the village, find items, and uncover its dark secrets.',
          duration: 8000
        });
      } catch (error) {
        console.error('Failed to initialize game engine:', error);
        setLoading(false);
        
        // Display error notification
        addNotification({
          id: 'error',
          type: 'error',
          title: 'Game Error',
          message: 'Failed to initialize the game. Please try again.',
          duration: 5000
        });
      }
    };
    
    // Start initialization
    initGame();
    
    // Cleanup when component unmounts
    return () => {
      // Unregister callbacks
      gameEngine.clearStateChangeCallbacks();
      gameEngine.clearDialogCallbacks();
    };
  }, []);
  
  // --- Game Logic Functions ---
  
  // Handle hotspot interaction
  const handleHotspotInteract = useCallback((hotspotId: string) => {
    // Find the hotspot in the current scene
    const hotspot = currentScene.hotspots?.find(h => h.id === hotspotId);
    
    if (!hotspot) return;
    
    try {
      if (initialized && hotspot.dialogId) {
        // Use game engine to start dialog
        gameEngine.startDialog(hotspot.dialogId);
      } else if (hotspot.dialogId) {
        // Fallback to local dialog handling
        setCurrentDialog({
          id: hotspot.dialogId,
          type: 'narration',
          text: hotspot.description || 'You examine the object closely.',
          choices: []
        });
      } else if (hotspot.puzzleId && initialized) {
        // Start puzzle using game engine
        gameEngine.startPuzzle(hotspot.puzzleId);
      } else if (hotspot.description) {
        // Show notification with description
        addNotification({
          id: `hotspot_${hotspotId}`,
          type: 'info',
          message: hotspot.description,
          duration: 5000
        });
      }
      
      // Apply any interaction effects if defined
      if (hotspot.interactionEffects && initialized) {
        hotspot.interactionEffects.forEach(effect => {
          // In a full implementation, this would trigger effects via game engine
          // gameEngine.applyGameEffect(effect);
          console.log('Applying effect:', effect);
        });
      }
    } catch (error) {
      console.error('Error interacting with hotspot:', error);
      
      addNotification({
        id: 'hotspot_error',
        type: 'error',
        title: 'Error',
        message: 'Failed to interact with this object.',
        duration: 5000
      });
    }
  }, [currentScene, initialized]);
  
  // Handle exit selection
  const handleExitSelect = useCallback((exitId: string) => {
    // Find the exit in the current scene
    const exit = currentScene.exits?.find(e => e.id === exitId);
    
    if (!exit) return;
    
    // Check if exit is locked
    if (exit.locked) {
      // Check inventory for key items
      const hasRequiredItem = gameState.inventory.some(
        item => item.id === exit.requiredItem
      );
      
      if (!hasRequiredItem && exit.lockedMessage) {
        addNotification({
          id: `exit_locked_${exitId}`,
          type: 'warning',
          message: exit.lockedMessage,
          duration: 5000
        });
        return;
      }
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Use the game engine to change the scene
      if (initialized) {
        gameEngine.changeScene(exit.targetScene);
      } else {
        // Fallback if engine not initialized yet
        setTimeout(() => {
          setGameState(prevState => ({
            ...prevState,
            currentScene: exit.targetScene,
            visitedScenes: [...prevState.visitedScenes, exit.targetScene]
          }));
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error changing scene:', error);
      setLoading(false);
      
      addNotification({
        id: 'scene_change_error',
        type: 'error',
        title: 'Error',
        message: 'Failed to change scene. Please try again.',
        duration: 5000
      });
    }
  }, [currentScene, gameState.inventory, initialized]);
  
  // Handle item pickup
  const handleItemTake = useCallback((itemId: string) => {
    // Find the item in the current scene
    const sceneItem = currentScene.items?.find(i => i.id === itemId);
    
    if (!sceneItem) return;
    
    try {
      if (initialized) {
        // In a real implementation, this would use gameEngine.addInventoryItem(sceneItem.itemId)
        // For now, we'll update our local state and then synchronize with the engine
        
        // Create temporary item (this should come from game data in full implementation)
        const item: InventoryItem = {
          id: sceneItem.itemId,
          name: 'Ancient Coin',
          description: 'A weathered gold coin with strange symbols. It feels unnaturally cold to the touch.',
          type: 'quest',
          imageUrl: '/assets/items/ancient-coin.png'
        };
        
        // Update local state
        setGameState(prevState => ({
          ...prevState,
          inventory: [...prevState.inventory, { ...item, discoveredAt: prevState.gameTime }]
        }));
        
        // Remove item from scene
        setCurrentScene(prev => ({
          ...prev,
          items: prev.items?.filter(i => i.id !== itemId)
        }));
        
        // Trigger game engine save (in a real implementation)
        setTimeout(() => {
          if (initialized) {
            gameEngine.saveProgress().catch(error => {
              console.error('Error saving progress after item pickup:', error);
            });
          }
        }, 100);
        
        // Show notification
        addNotification({
          id: `item_pickup_${itemId}`,
          type: 'success',
          message: `Picked up ${item.name}`,
          duration: 3000
        });
      } else {
        // Fallback without game engine
        const item: InventoryItem = {
          id: sceneItem.itemId,
          name: 'Ancient Coin',
          description: 'A weathered gold coin with strange symbols. It feels unnaturally cold to the touch.',
          type: 'quest',
          imageUrl: '/assets/items/ancient-coin.png'
        };
        
        setGameState(prevState => ({
          ...prevState,
          inventory: [...prevState.inventory, { ...item, discoveredAt: prevState.gameTime }]
        }));
        
        setCurrentScene(prev => ({
          ...prev,
          items: prev.items?.filter(i => i.id !== itemId)
        }));
        
        addNotification({
          id: `item_pickup_${itemId}`,
          type: 'success',
          message: `Picked up ${item.name}`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error picking up item:', error);
      
      addNotification({
        id: 'item_pickup_error',
        type: 'error',
        title: 'Error',
        message: 'Failed to pick up item. Please try again.',
        duration: 5000
      });
    }
  }, [currentScene, initialized]);
  
  // Handle inventory item use
  const handleItemUse = useCallback((itemId: string) => {
    // Find the item in inventory
    const item = gameState.inventory.find(i => i.id === itemId);
    
    if (!item) return;
    
    // In a real game, this would be handled by the game engine
    addNotification({
      id: `item_use_${itemId}`,
      type: 'info',
      message: `You tried to use ${item.name} but nothing happened.`,
      duration: 3000
    });
  }, [gameState.inventory]);
  
  // Handle item inspection
  const handleItemInspect = useCallback((itemId: string) => {
    // Find the item in inventory
    const item = gameState.inventory.find(i => i.id === itemId);
    
    if (!item) return;
    
    // In a real game, this might trigger a dialog or detailed view
    addNotification({
      id: `item_inspect_${itemId}`,
      type: 'info',
      message: item.description,
      duration: 5000
    });
  }, [gameState.inventory]);
  
  // Handle item combination
  const handleItemCombine = useCallback((itemId1: string, itemId2: string) => {
    // In a real game, this would check if the items can be combined and create a new item
    addNotification({
      id: `item_combine_${itemId1}_${itemId2}`,
      type: 'info',
      message: 'These items cannot be combined.',
      duration: 3000
    });
  }, []);
  
  // Handle dialog choice selection
  const handleDialogChoice = useCallback((choice: DialogChoice) => {
    // In a real game, this would be handled by the game engine
    // For now, just close the dialog
    setCurrentDialog(null);
  }, []);
  
  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setCurrentDialog(null);
  }, []);
  
  // Handle puzzle solve
  const handlePuzzleSolve = useCallback(() => {
    // In a real game, this would be handled by the game engine
    setCurrentPuzzle(null);
    
    addNotification({
      id: 'puzzle_solved',
      type: 'success',
      message: 'Puzzle solved!',
      duration: 3000
    });
  }, []);
  
  // Handle puzzle close
  const handlePuzzleClose = useCallback(() => {
    setCurrentPuzzle(null);
  }, []);
  
  // Handle puzzle hint
  const handlePuzzleHint = useCallback(() => {
    // In a real game, this would provide a hint specific to the puzzle
    addNotification({
      id: 'puzzle_hint',
      type: 'info',
      message: 'Look for patterns in the symbols.',
      duration: 4000
    });
  }, []);
  
  // Utility to add notifications
  const addNotification = (notification: GameNotification) => {
    setNotifications(prev => [...prev, { ...notification, timestamp: Date.now() }]);
    
    // Auto-remove notification after its duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, notification.duration);
    }
  };
  
  // Handle notification close
  const handleNotificationClose = (notification: GameNotification) => {
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };
  
  // Handle game exit
  const handleExitGame = () => {
    if (onExit) onExit();
  };
  
  // Show the inventory panel
  const openInventory = () => {
    setShowInventory(true);
  };
  
  // Close the inventory panel
  const closeInventory = () => {
    setShowInventory(false);
  };
  
  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }
  
  // Game over screen
  if (gameState.isGameOver) {
    return (
      <div className="game-over-screen">
        <h2>Game Over</h2>
        <p>{gameState.gameOverReason || 'Your journey has come to an end.'}</p>
        <button onClick={handleExitGame}>Return to Menu</button>
      </div>
    );
  }
  
  return (
    <div className="eden-game">
      {/* Game UI */}
      <div className="game-interface">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="game-menu-button" onClick={() => setShowMenu(!showMenu)}>
            Menu
          </div>
          <div className="game-title">Eden's Hollow</div>
          <div className="inventory-button" onClick={openInventory}>
            Inventory ({gameState.inventory.length})
          </div>
        </div>
        
        {/* Game menu dropdown */}
        {showMenu && (
          <div className="game-menu">
            <div className="menu-option" onClick={() => setShowMenu(false)}>Continue</div>
            <div className="menu-option" onClick={() => {
              if (initialized) {
                setLoading(true);
                gameEngine.saveProgress()
                  .then((success) => {
                    setLoading(false);
                    if (success) {
                      addNotification({
                        id: 'game_saved',
                        type: 'success',
                        message: 'Game saved successfully',
                        duration: 3000
                      });
                    } else {
                      addNotification({
                        id: 'save_error',
                        type: 'warning',
                        message: 'Unable to save game progress.',
                        duration: 3000
                      });
                    }
                  })
                  .catch((error: unknown) => {
                    console.error('Error saving game:', error);
                    setLoading(false);
                    
                    if ((error as any)?.message?.includes('Unauthorized')) {
                      addNotification({
                        id: 'auth_required',
                        type: 'warning',
                        title: 'Login Required',
                        message: 'You need to login to save or load games.',
                        duration: 5000
                      });
                    } else {
                      addNotification({
                        id: 'save_error',
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to save game. Please try again.',
                        duration: 5000
                      });
                    }
                  });
              }
              setShowMenu(false);
            }}>Save Game</div>
            <div className="menu-option" onClick={() => {
              if (initialized) {
                setLoading(true);
                gameEngine.loadProgress()
                  .then((success) => {
                    setLoading(false);
                    if (success) {
                      addNotification({
                        id: 'game_loaded',
                        type: 'success',
                        message: 'Game loaded successfully',
                        duration: 3000
                      });
                    } else {
                      addNotification({
                        id: 'load_error',
                        type: 'info',
                        message: 'No saved game found. Starting new game.',
                        duration: 3000
                      });
                    }
                  })
                  .catch((error: unknown) => {
                    console.error('Error loading game:', error);
                    setLoading(false);
                    
                    if ((error as any)?.message?.includes('Unauthorized')) {
                      addNotification({
                        id: 'auth_required',
                        type: 'warning',
                        title: 'Login Required',
                        message: 'You need to login to save or load games.',
                        duration: 5000
                      });
                    } else {
                      addNotification({
                        id: 'load_error',
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to load game. Please try again.',
                        duration: 5000
                      });
                    }
                  });
              }
              setShowMenu(false);
            }}>Load Game</div>
            <div className="menu-option" onClick={() => {
              // Settings would open a separate dialog with game settings
              setShowMenu(false);
              addNotification({
                id: 'settings',
                type: 'info',
                message: 'Settings menu is not implemented yet.',
                duration: 3000
              });
            }}>Settings</div>
            <div className="menu-option exit-option" onClick={handleExitGame}>Exit Game</div>
          </div>
        )}
        
        {/* Scene View */}
        <div className="scene-container">
          <SceneView 
            scene={currentScene}
            onHotspotInteract={handleHotspotInteract}
            onExitSelect={handleExitSelect}
            onItemTake={handleItemTake}
            visitedExits={gameState.visitedScenes}
            inventoryItems={gameState.inventory}
          />
        </div>
        
        {/* Status Bar */}
        <div className="status-bar-container">
          <StatusBar 
            health={gameState.player.health}
            maxHealth={gameState.player.maxHealth}
            mana={gameState.player.mana}
            maxMana={gameState.player.maxMana}
            sanity={gameState.player.sanity}
            maxSanity={gameState.player.maxSanity}
          />
        </div>
      </div>
      
      {/* Overlays */}
      
      {/* Dialog Box */}
      {currentDialog && (
        <DialogBox 
          text={currentDialog.text}
          choices={currentDialog.choices}
          onClose={handleDialogClose}
          onChoiceSelect={handleDialogChoice}
          characterName={currentDialog.character}
          characterImage={currentDialog.characterImage}
          position={currentDialog.position || 'bottom'}
        />
      )}
      
      {/* Inventory Panel */}
      {showInventory && (
        <InventoryPanel 
          inventory={gameState.inventory}
          onItemUse={handleItemUse}
          onItemInspect={handleItemInspect}
          onItemCombine={handleItemCombine}
          onClose={closeInventory}
        />
      )}
      
      {/* Puzzle Interface */}
      {currentPuzzle && (
        <PuzzleInterface
          puzzle={currentPuzzle}
          onSolve={handlePuzzleSolve}
          onClose={handlePuzzleClose}
          onHint={handlePuzzleHint}
          isOpen={!!currentPuzzle}
        />
      )}
      
      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onNotificationClose={handleNotificationClose}
        position="top-right"
      />
      
      <style>{`
        .eden-game {
          width: 100%;
          height: 100vh;
          position: relative;
          overflow: hidden;
          background-color: #000;
          display: flex;
          flex-direction: column;
        }
        
        .game-interface {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(20, 20, 30, 0.8);
          padding: 10px 20px;
          border-bottom: 1px solid rgba(100, 100, 150, 0.4);
          z-index: 10;
        }
        
        .game-title {
          font-family: 'Times New Roman', serif;
          font-size: 20px;
          color: #c0c0e0;
          text-align: center;
        }
        
        .game-menu-button, .inventory-button {
          padding: 6px 12px;
          background-color: rgba(40, 40, 60, 0.8);
          color: #e0e0e0;
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Times New Roman', serif;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .game-menu-button:hover, .inventory-button:hover {
          background-color: rgba(60, 60, 90, 0.8);
        }
        
        .game-menu {
          position: absolute;
          top: 50px;
          left: 20px;
          background-color: rgba(30, 30, 40, 0.95);
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 4px;
          width: 200px;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
        
        .menu-option {
          padding: 12px 15px;
          color: #e0e0e0;
          cursor: pointer;
          border-bottom: 1px solid rgba(100, 100, 150, 0.2);
          transition: background-color 0.2s ease;
        }
        
        .menu-option:hover {
          background-color: rgba(60, 60, 90, 0.5);
        }
        
        .exit-option {
          color: #e08080;
        }
        
        .scene-container {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        
        .status-bar-container {
          padding: 10px 20px;
          background-color: rgba(20, 20, 30, 0.8);
          border-top: 1px solid rgba(100, 100, 150, 0.4);
        }
        
        .loading-screen {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #0f0f17;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(100, 100, 150, 0.3);
          border-top: 4px solid #c0c0e0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        .loading-text {
          color: #c0c0e0;
          font-family: 'Times New Roman', serif;
          font-size: 18px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .game-over-screen {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(20, 10, 15, 0.95);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 100;
          color: #e0e0e0;
          font-family: 'Times New Roman', serif;
        }
        
        .game-over-screen h2 {
          font-size: 36px;
          margin-bottom: 20px;
          color: #e08080;
        }
        
        .game-over-screen p {
          font-size: 18px;
          margin-bottom: 30px;
          max-width: 80%;
          text-align: center;
          line-height: 1.5;
        }
        
        .game-over-screen button {
          padding: 12px 24px;
          background-color: #39304a;
          color: #e0e0e0;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Times New Roman', serif;
        }
        
        .game-over-screen button:hover {
          background-color: #4a3f5e;
        }
      `}</style>
    </div>
  );
};

export default EdenGame;