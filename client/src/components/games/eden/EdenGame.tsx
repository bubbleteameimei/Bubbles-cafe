import React, { useState, useEffect, useCallback } from 'react';
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
  GameNotification 
} from './types';

// Import GameEngine instance
// import { gameEngine } from './GameEngine';

/**
 * EdenGame - Main game component that integrates all UI components with the game engine
 */
const EdenGame: React.FC<EdenGameProps> = ({ onExit }) => {
  // Game state
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
  
  // Load mock data
  useEffect(() => {
    // In a real game, this would be loaded from data files
    setLoading(false);
    
    // Show welcome notification
    addNotification({
      id: 'welcome',
      type: 'info',
      title: 'Welcome to Eden\'s Hollow',
      message: 'Explore the village, find items, and uncover its dark secrets.',
      duration: 8000
    });
    
    // Simulate entry dialog after slight delay
    setTimeout(() => {
      // In a real game, this would come from the game engine based on scene
      setCurrentDialog({
        id: 'village_entrance_first_visit',
        type: 'narration',
        text: 'The fog hangs thick as you approach the entrance to Eden\'s Hollow. The air is unnaturally still, and the silence is broken only by the occasional distant crow. Something about this place feels... wrong.',
        choices: []
      });
    }, 1000);
  }, []);
  
  // --- Game Logic Functions ---
  
  // Handle hotspot interaction
  const handleHotspotInteract = useCallback((hotspotId: string) => {
    // Find the hotspot in the current scene
    const hotspot = currentScene.hotspots?.find(h => h.id === hotspotId);
    
    if (!hotspot) return;
    
    if (hotspot.dialogId) {
      // In a real game, this would fetch the dialog from the game engine
      // For now, show a mock dialog
      setCurrentDialog({
        id: hotspot.dialogId,
        type: 'narration',
        text: hotspot.description || 'You examine the object closely.',
        choices: []
      });
    } else if (hotspot.description) {
      // Show a notification with the description
      addNotification({
        id: `hotspot_${hotspotId}`,
        type: 'info',
        message: hotspot.description,
        duration: 5000
      });
    }
  }, [currentScene]);
  
  // Handle exit selection
  const handleExitSelect = useCallback((exitId: string) => {
    // Find the exit in the current scene
    const exit = currentScene.exits?.find(e => e.id === exitId);
    
    if (!exit) return;
    
    // Check if exit is locked
    if (exit.locked) {
      // In a real game, we would check inventory for key items
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
    
    // In a real game, this would trigger a scene change via the game engine
    // Mock a loading state
    setLoading(true);
    
    // Simulate scene loading
    setTimeout(() => {
      // For demo purposes, just change back to the same scene
      // In a real game, this would load the target scene
      setGameState(prev => ({
        ...prev,
        currentScene: exit.targetScene || prev.currentScene,
        visitedScenes: [...prev.visitedScenes, exit.targetScene]
      }));
      setLoading(false);
      
      // Update visited exits
      // In a real game, the game engine would track this
    }, 1000);
  }, [currentScene, gameState.inventory]);
  
  // Handle item pickup
  const handleItemTake = useCallback((itemId: string) => {
    // Find the item in the current scene
    const sceneItem = currentScene.items?.find(i => i.id === itemId);
    
    if (!sceneItem) return;
    
    // In a real game, this would come from a data store based on the itemId
    const item: InventoryItem = {
      id: sceneItem.itemId,
      name: 'Ancient Coin',
      description: 'A weathered gold coin with strange symbols. It feels unnaturally cold to the touch.',
      type: 'quest',
      imageUrl: '/assets/items/ancient-coin.png'
    };
    
    // Add to inventory
    setGameState(prev => ({
      ...prev,
      inventory: [...prev.inventory, { ...item, discoveredAt: prev.gameTime }]
    }));
    
    // Remove item from scene (in a real game, this would be handled by the game engine)
    setCurrentScene(prev => ({
      ...prev,
      items: prev.items?.filter(i => i.id !== itemId)
    }));
    
    // Show notification
    addNotification({
      id: `item_pickup_${itemId}`,
      type: 'success',
      message: `Picked up ${item.name}`,
      duration: 3000
    });
  }, [currentScene]);
  
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
            <div className="menu-option">Save Game</div>
            <div className="menu-option">Load Game</div>
            <div className="menu-option">Settings</div>
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