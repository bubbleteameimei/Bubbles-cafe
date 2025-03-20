import React, { useState, useEffect, useRef } from 'react';
import { EdenGameProps, GameState } from './types';
import GameEngine from './GameEngine';
import SceneView from './ui/SceneView';
import DialogBox from './ui/DialogBox';
import InventoryPanel from './ui/InventoryPanel';
import StatusBar from './ui/StatusBar';
import PuzzleInterface from './ui/PuzzleInterface';
import NotificationSystem from './ui/NotificationSystem';

// Import game data
import scenes from './data/scenes';
import dialogs from './data/dialogs';
import items from './data/items';
import puzzles from './data/puzzles';

/**
 * EdenGame - Main game component that integrates all game elements
 */
const EdenGame: React.FC<EdenGameProps> = ({ onExit }) => {
  // Initialize game engine
  const gameEngine = useRef<GameEngine>(new GameEngine(scenes, dialogs, items, puzzles));
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(gameEngine.current.getState());
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showGameMenu, setShowGameMenu] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<{ message: string; type: string } | null>(null);
  const [lastFrameTime, setLastFrameTime] = useState<number>(Date.now());
  
  // Game loop animation frame reference
  const animationFrameRef = useRef<number | null>(null);
  
  // Set up game loop and event listeners
  useEffect(() => {
    // Subscribe to game state changes
    const unsubscribe = gameEngine.current.subscribe(newState => {
      setGameState(newState);
    });
    
    // Set up game loop
    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastFrameTime;
      
      // Update game state (run game logic)
      gameEngine.current.update(deltaTime);
      
      // Save current time for next frame calculation
      setLastFrameTime(currentTime);
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Start game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    // Handle escape key press for inventory/menu toggling
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showGameMenu) {
          setShowGameMenu(false);
        } else if (showInventory) {
          setShowInventory(false);
        } else if (!gameState.currentDialog && !gameState.activePuzzleId) {
          setShowGameMenu(true);
        }
      } else if (e.key === 'i' || e.key === 'I') {
        if (!gameState.currentDialog && !gameState.activePuzzleId && !showGameMenu) {
          setShowInventory(prev => !prev);
        }
      }
    };
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyPress);
    
    // Clean up on unmount
    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyPress);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [lastFrameTime, showInventory, showGameMenu, gameState.currentDialog, gameState.activePuzzleId]);
  
  // Save game state before user exits or closes window
  useEffect(() => {
    const handleBeforeUnload = () => {
      gameEngine.current.saveGame();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Handle hotspot interaction in scene
  const handleHotspotInteract = (hotspotId: string) => {
    gameEngine.current.interactWithHotspot(hotspotId);
  };
  
  // Handle exit selection in scene
  const handleExitSelect = (exitId: string) => {
    const scene = gameEngine.current.getCurrentScene();
    const exit = scene.exits?.find(e => e.id === exitId);
    
    if (exit && !exit.locked) {
      gameEngine.current.navigateToScene(exit.targetSceneId);
    } else if (exit?.locked && exit.lockedMessage) {
      showNotification(exit.lockedMessage, 'warning');
    }
  };
  
  // Handle item collection in scene
  const handleItemTake = (itemId: string) => {
    const scene = gameEngine.current.getCurrentScene();
    const sceneItem = scene.items?.find(i => i.id === itemId);
    
    if (sceneItem) {
      const success = gameEngine.current.addItemToInventory(sceneItem.itemId);
      if (success) {
        // Hide the item from the scene
        gameEngine.current.interactWithHotspot(itemId);
      }
    }
  };
  
  // Handle dialog advancement
  const handleDialogAdvance = () => {
    gameEngine.current.advanceDialog();
  };
  
  // Handle dialog choice selection
  const handleDialogChoice = (choiceIndex: number) => {
    gameEngine.current.advanceDialog(choiceIndex);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    gameEngine.current.endDialog();
  };
  
  // Handle item use from inventory
  const handleItemUse = (itemId: string) => {
    gameEngine.current.useItem(itemId);
    setShowInventory(false);
  };
  
  // Handle item inspection
  const handleItemInspect = (itemId: string) => {
    const item = gameState.inventory.find(i => i.id === itemId);
    if (item) {
      showNotification(item.description, 'info');
    }
  };
  
  // Handle item combination
  const handleItemCombine = (itemId1: string, itemId2: string) => {
    // If implementing item combination, add the logic here
    showNotification("Item combination not implemented yet", "info");
  };
  
  // Show notification
  const showNotification = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setActiveNotification({ message, type });
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setActiveNotification(null);
  };
  
  // Handle puzzle solving
  const handlePuzzleSolve = () => {
    gameEngine.current.solvePuzzle();
  };
  
  // Handle puzzle cancellation
  const handlePuzzleClose = () => {
    gameEngine.current.cancelPuzzle();
  };
  
  // Handle hint request for puzzle
  const handlePuzzleHint = () => {
    const puzzle = gameEngine.current.getActivePuzzle();
    if (puzzle && puzzle.hints && puzzle.hints.length > 0) {
      showNotification(puzzle.hints[0], 'info');
    }
  };
  
  // Get current scene
  const currentScene = gameEngine.current.getCurrentScene();
  
  return (
    <div className="eden-game">
      {/* Main Scene View */}
      <SceneView 
        scene={currentScene}
        onHotspotInteract={handleHotspotInteract}
        onExitSelect={handleExitSelect}
        onItemTake={handleItemTake}
      />
      
      {/* Status Bar */}
      <StatusBar
        health={gameState.player.health}
        maxHealth={gameState.player.maxHealth}
        mana={gameState.player.mana}
        maxMana={gameState.player.maxMana}
        sanity={gameState.player.sanity}
        maxSanity={gameState.player.maxSanity}
      />
      
      {/* Dialog Box */}
      {gameState.currentDialog && (
        <DialogBox
          dialog={gameState.currentDialog}
          onAdvance={handleDialogAdvance}
          onChoiceSelect={handleDialogChoice}
          onClose={handleDialogClose}
        />
      )}
      
      {/* Inventory Panel */}
      {showInventory && (
        <InventoryPanel
          inventory={gameState.inventory}
          onItemUse={handleItemUse}
          onItemInspect={handleItemInspect}
          onItemCombine={handleItemCombine}
          onClose={() => setShowInventory(false)}
        />
      )}
      
      {/* Active Puzzle */}
      {gameState.activePuzzleId && gameEngine.current.getActivePuzzle() && (
        <PuzzleInterface
          puzzle={gameEngine.current.getActivePuzzle()!}
          onSolve={handlePuzzleSolve}
          onClose={handlePuzzleClose}
          onHint={handlePuzzleHint}
        />
      )}
      
      {/* Notification System */}
      {activeNotification && (
        <NotificationSystem
          message={activeNotification.message}
          type={activeNotification.type as 'info' | 'warning' | 'error' | 'success'}
          onClose={handleNotificationClose}
          duration={5000}
        />
      )}
      
      {/* Controls */}
      <div className="game-controls">
        <button 
          className="control-button inventory-button"
          onClick={() => setShowInventory(prev => !prev)}
        >
          Inventory
        </button>
        
        <button 
          className="control-button menu-button"
          onClick={() => setShowGameMenu(prev => !prev)}
        >
          Menu
        </button>
      </div>
      
      {/* Game Menu */}
      {showGameMenu && (
        <div className="game-menu-overlay">
          <div className="game-menu">
            <h2>Game Menu</h2>
            <button onClick={() => gameEngine.current.saveGame()}>Save Game</button>
            <button onClick={() => {
              const loadedState = gameEngine.current.loadGame();
              if (loadedState) {
                setGameState(loadedState);
                showNotification("Game loaded successfully", "success");
              } else {
                showNotification("No saved game found", "warning");
              }
              setShowGameMenu(false);
            }}>Load Game</button>
            <button onClick={() => {
              // Settings would be implemented here
              showNotification("Settings are not implemented yet", "info");
            }}>Settings</button>
            <button onClick={() => {
              gameEngine.current.saveGame();
              onExit && onExit();
            }}>Exit Game</button>
            <button onClick={() => setShowGameMenu(false)}>Resume</button>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="game-over-screen">
          <h1>Game Over</h1>
          <p>
            {gameState.gameOverReason === 'death' && "You have died..."}
            {gameState.gameOverReason === 'insanity' && "Your mind has been lost to the darkness..."}
            {gameState.gameOverReason === 'victory' && "You have escaped Eden's Hollow!"}
          </p>
          <div className="game-over-buttons">
            <button onClick={() => {
              gameEngine.current.deleteSave();
              gameEngine.current.navigateToScene('village_entrance');
            }}>
              Start Over
            </button>
            <button onClick={() => {
              onExit && onExit();
            }}>
              Exit Game
            </button>
          </div>
        </div>
      )}
      
      <style>
        {`
          .eden-game {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            font-family: 'Times New Roman', serif;
            background-color: #000;
            color: #fff;
          }
          
          .game-controls {
            position: fixed;
            bottom: 20px;
            left: 20px;
            display: flex;
            gap: 10px;
            z-index: 600;
          }
          
          .control-button {
            padding: 10px 20px;
            background-color: rgba(30, 30, 40, 0.7);
            color: white;
            border: 1px solid rgba(100, 100, 150, 0.5);
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s;
          }
          
          .control-button:hover {
            background-color: rgba(40, 40, 60, 0.9);
            border-color: rgba(120, 120, 180, 0.7);
          }
          
          .game-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 900;
          }
          
          .game-menu {
            background-color: rgba(20, 20, 30, 0.9);
            padding: 30px;
            border-radius: 8px;
            border: 1px solid rgba(100, 100, 150, 0.5);
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            gap: 15px;
            min-width: 300px;
          }
          
          .game-menu h2 {
            color: #b3a380;
            font-size: 28px;
            margin: 0 0 20px 0;
            text-align: center;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
          }
          
          .game-menu button {
            padding: 12px;
            background-color: rgba(40, 40, 60, 0.8);
            color: white;
            border: 1px solid rgba(100, 100, 150, 0.5);
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: 16px;
            transition: all 0.2s;
          }
          
          .game-menu button:hover {
            background-color: rgba(60, 60, 90, 0.9);
            border-color: rgba(120, 120, 180, 0.7);
          }
          
          .game-over-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          
          .game-over-screen h1 {
            color: #d93240;
            font-size: 48px;
            margin-bottom: 20px;
            text-shadow: 0 0 10px rgba(217, 50, 64, 0.5);
          }
          
          .game-over-screen p {
            color: #fff;
            font-size: 24px;
            margin-bottom: 40px;
            max-width: 80%;
            text-align: center;
            line-height: 1.5;
          }
          
          .game-over-buttons {
            display: flex;
            gap: 20px;
          }
          
          .game-over-buttons button {
            padding: 12px 24px;
            background-color: rgba(60, 60, 80, 0.8);
            color: white;
            border: 1px solid rgba(120, 120, 160, 0.5);
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: 18px;
            transition: all 0.2s;
          }
          
          .game-over-buttons button:hover {
            background-color: rgba(80, 80, 100, 0.9);
            border-color: rgba(150, 150, 200, 0.7);
          }
          
          @media (max-width: 768px) {
            .game-controls {
              bottom: 10px;
              left: 10px;
            }
            
            .control-button {
              padding: 8px 16px;
              font-size: 14px;
            }
            
            .game-menu {
              padding: 20px;
              min-width: 250px;
            }
            
            .game-menu h2 {
              font-size: 24px;
              margin-bottom: 15px;
            }
            
            .game-menu button {
              padding: 10px;
              font-size: 14px;
            }
            
            .game-over-screen h1 {
              font-size: 36px;
            }
            
            .game-over-screen p {
              font-size: 18px;
            }
            
            .game-over-buttons button {
              padding: 10px 20px;
              font-size: 16px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EdenGame;