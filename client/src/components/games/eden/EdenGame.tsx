import React, { useState, useEffect } from 'react';
import { GameEngine } from './GameEngine';
import { GameState, Scene, Item, Puzzle } from './types';
import { gameItems } from './data/items';
import { gamePuzzles } from './data/puzzles';

// Import UI components
import SceneView from './ui/SceneView';
import InventoryPanel from './ui/InventoryPanel';
import DialogBox from './ui/DialogBox';
import PuzzleInterface from './ui/PuzzleInterface';
import GameControls from './ui/GameControls';
import NotificationSystem from './ui/NotificationSystem';
import LoadingScreen from './ui/LoadingScreen';

// Mock data for initial testing
const mockScenes: Record<string, Scene> = {
  forest_edge: {
    id: 'forest_edge',
    title: 'Forest Edge',
    description: 'The edge of a dense, misty forest. A dirt path leads toward a village in the distance.',
    backgroundImage: 'forest_edge.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_entrance',
        name: 'To Village',
        target: 'village_entrance',
        destination: 'Village Entrance',
        position: 'east'
      }
    ],
    actions: [
      {
        id: 'look_around',
        name: 'Look Around',
        outcome: {
          notification: {
            id: 'forest-look',
            message: 'You scan the dense trees. Something feels off about this place...',
            type: 'info'
          }
        }
      }
    ]
  },
  village_entrance: {
    id: 'village_entrance',
    title: 'Village Entrance',
    description: 'A weathered sign reads "Eden\'s Hollow". The village looks abandoned, with dilapidated buildings.',
    backgroundImage: 'village_entrance.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_forest_edge',
        name: 'Back to Forest',
        target: 'forest_edge',
        destination: 'Forest Edge',
        position: 'west'
      },
      {
        id: 'to_village_square',
        name: 'Village Square',
        target: 'village_square',
        destination: 'Village Square',
        position: 'north'
      }
    ]
  },
  village_square: {
    id: 'village_square',
    title: 'Village Square',
    description: 'The central square is empty and eerily quiet. A broken fountain stands in the center.',
    backgroundImage: 'village_square.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_entrance',
        name: 'Village Entrance',
        target: 'village_entrance',
        destination: 'Village Entrance',
        position: 'south'
      },
      {
        id: 'to_church_exterior',
        name: 'To Church',
        target: 'church_exterior',
        destination: 'Church',
        position: 'east'
      },
      {
        id: 'to_clock_tower',
        name: 'To Clock Tower',
        target: 'clock_tower',
        destination: 'Clock Tower',
        position: 'north'
      }
    ]
  },
  church_exterior: {
    id: 'church_exterior',
    title: 'Church Exterior',
    description: 'An old stone church with boarded windows and a heavy oak door. The steeple is missing its cross.',
    backgroundImage: 'church_exterior.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_square',
        name: 'To Village Square',
        target: 'village_square',
        destination: 'Village Square',
        position: 'west'
      },
      {
        id: 'to_church_interior',
        name: 'Enter Church',
        target: 'church_interior',
        destination: 'Church Interior',
        position: 'north'
      }
    ]
  },
  church_interior: {
    id: 'church_interior',
    title: 'Church Interior',
    description: 'Rows of broken pews face an altar. Strange symbols are carved into the stone walls.',
    backgroundImage: 'church_interior.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_church_exterior',
        name: 'Exit Church',
        target: 'church_exterior',
        destination: 'Church Exterior',
        position: 'south'
      }
    ],
    actions: [
      {
        id: 'examine_altar',
        name: 'Examine Altar',
        outcome: {
          notification: {
            id: 'altar-examine',
            message: 'The altar has five symbols arranged in a circle: a Moon, Star, Sun, Tree, and Flame.',
            type: 'info'
          },
          puzzle: 'altar_puzzle'
        }
      }
    ]
  },
  clock_tower: {
    id: 'clock_tower',
    title: 'Clock Tower',
    description: 'The village clock tower. Its hands are frozen at 3:17.',
    backgroundImage: 'clock_tower.jpg',
    time: 'dusk',
    exits: [
      {
        id: 'to_village_square',
        name: 'To Village Square',
        target: 'village_square',
        destination: 'Village Square',
        position: 'south'
      }
    ],
    actions: [
      {
        id: 'check_mechanism',
        name: 'Check Mechanism',
        outcome: {
          notification: {
            id: 'clock-check',
            message: 'The clock mechanism appears to be intact. Perhaps it can be restarted...',
            type: 'info'
          },
          puzzle: 'clock_puzzle'
        }
      }
    ]
  }
};

/**
 * Main Eden's Hollow Game Component
 */
const EdenGame: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  
  // Initialize game engine
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Simulate loading delay
        setTimeout(() => {
          const engine = GameEngine.getInstance({
            scenes: mockScenes,
            items: gameItems,
            dialogs: {},
            puzzles: gamePuzzles,
            onStateChange: (newState) => {
              setGameState(newState);
            }
          });
          
          setGameEngine(engine);
          setGameState(engine.getState());
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };
    
    initializeGame();
  }, []);
  
  // Handle scene transitions
  const handleExitClick = (exitId: string) => {
    if (!gameEngine || !gameState) return;
    
    const currentScene = mockScenes[gameState.currentScene];
    const exit = currentScene.exits.find(e => e.id === exitId);
    
    if (exit) {
      gameEngine.transitionToScene(exit.target);
    }
  };
  
  // Handle action clicks
  const handleActionClick = (actionId: string) => {
    if (!gameEngine) return;
    gameEngine.performAction(actionId);
  };
  
  // Handle puzzle attempts
  const handlePuzzleAttempt = (solution: any) => {
    if (!gameEngine || !gameState || !gameState.currentPuzzle) return;
    gameEngine.attemptPuzzle(gameState.currentPuzzle, solution);
  };
  
  // Handle dialog responses
  const handleDialogResponse = (responseIndex: number) => {
    if (!gameEngine) return;
    gameEngine.selectDialogResponse(responseIndex);
  };
  
  // Handle item use
  const handleItemUse = (itemId: string) => {
    if (!gameEngine) return;
    gameEngine.useItem(itemId);
  };
  
  // Handle notification dismissal
  const handleDismissNotification = (id: string) => {
    if (!gameEngine) return;
    gameEngine.dismissNotification(id);
  };
  
  // Handle save game
  const handleSaveGame = () => {
    if (!gameEngine) return;
    gameEngine.saveGame();
  };
  
  // Display loading screen while initializing
  if (loading || !gameState) {
    return <LoadingScreen message="Entering Eden's Hollow..." />;
  }
  
  // Get current scene data
  const currentScene = mockScenes[gameState.currentScene];
  
  // Get inventory items
  const inventoryItems = gameState.inventory
    .map(itemId => gameItems[itemId])
    .filter(item => item !== undefined) as Item[];
  
  // Get current puzzle if any
  const currentPuzzle = gameState.currentPuzzle 
    ? gamePuzzles[gameState.currentPuzzle] 
    : undefined;
  
  return (
    <div className="eden-game" style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      backgroundColor: '#000',
      overflow: 'hidden'
    }}>
      {/* Main scene view */}
      <SceneView 
        scene={currentScene}
        onExitClick={handleExitClick}
        onItemClick={() => {}} // Not implemented in this simplified version
        onCharacterClick={() => {}} // Not implemented in this simplified version
        onActionClick={handleActionClick}
      />
      
      {/* Game controls */}
      <GameControls 
        health={gameState.health}
        mana={gameState.mana}
        onInventoryToggle={() => setShowInventory(!showInventory)}
        onSettingsToggle={() => {}} // Not implemented in this simplified version
        onSaveGame={handleSaveGame}
      />
      
      {/* Inventory panel */}
      <InventoryPanel 
        items={inventoryItems}
        onItemUse={handleItemUse}
        onInventoryClose={() => setShowInventory(false)}
        isOpen={showInventory}
      />
      
      {/* Active dialog if any */}
      {gameState.activeDialog && gameState.dialogIndex !== undefined && (
        <DialogBox 
          dialog={{id: 'test-dialog', content: [{speaker: 'Test', text: 'Test dialog', responses: []}]}}
          dialogIndex={0}
          onResponse={handleDialogResponse}
        />
      )}
      
      {/* Active puzzle if any */}
      {currentPuzzle && (
        <PuzzleInterface 
          puzzle={currentPuzzle}
          attempts={gameState.puzzleAttempts}
          onAttempt={handlePuzzleAttempt}
          onClose={() => gameEngine?.closePuzzle()}
        />
      )}
      
      {/* Notification system */}
      <NotificationSystem 
        notifications={gameState.notifications}
        onDismiss={handleDismissNotification}
      />
    </div>
  );
};

export default EdenGame;