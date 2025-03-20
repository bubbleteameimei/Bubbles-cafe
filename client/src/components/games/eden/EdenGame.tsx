import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Bookmark, Settings, Map, Book, Heart } from 'lucide-react';
import { GameEngine } from './GameEngine';
import { GameState, GameSettings, GameSaveData } from './types';
import { gameScenes } from './data/scenes';
import { gameItems } from './data/items';
import { gamePuzzles } from './data/puzzles';
import { gameDialogs } from './data/dialogs';

// Components
import SceneView from './components/SceneView';
import InventoryPanel from './components/InventoryPanel';
import DialogPanel from './components/DialogPanel';
import PuzzlePanel from './components/PuzzlePanel';
import GameMenu from './components/GameMenu';
import NotificationOverlay from './components/NotificationOverlay';
import LoadingScreen from './components/LoadingScreen';

// Default game state
const initialGameState: GameState = {
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

export default function EdenGame() {
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [showInventory, setShowInventory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  
  // Initialize the game engine
  const gameEngine = GameEngine.getInstance({
    scenes: gameScenes,
    items: gameItems,
    puzzles: gamePuzzles,
    dialogs: gameDialogs,
    onStateChange: (newState) => setGameState(newState)
  });
  
  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setLoading(false);
      setEngineReady(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle scene transitions
  const handleSceneTransition = (sceneId: string) => {
    gameEngine.transitionToScene(sceneId);
  };
  
  // Handle inventory item use
  const handleItemUse = (itemId: string) => {
    gameEngine.useItem(itemId);
  };
  
  // Handle dialog response selection
  const handleDialogResponse = (responseIndex: number) => {
    gameEngine.selectDialogResponse(responseIndex);
  };
  
  // Handle puzzle attempt
  const handlePuzzleAttempt = (puzzleId: string, solution: any) => {
    gameEngine.attemptPuzzle(puzzleId, solution);
  };
  
  // Handle scene action
  const handleSceneAction = (actionId: string) => {
    gameEngine.performAction(actionId);
  };
  
  if (loading) {
    return <LoadingScreen isLoading={loading} progress={50} message="Loading Eden's Hollow..." />;
  }
  
  const currentScene = gameScenes[gameState.currentScene];
  
  return (
    <div className="eden-game relative h-screen w-full bg-black text-white overflow-hidden">
      {/* Main Game Screen */}
      <AnimatePresence mode="wait">
        <motion.div
          key={gameState.currentScene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full"
        >
          <SceneView 
            scene={currentScene}
            onExitClick={handleSceneTransition}
            onActionClick={handleSceneAction}
            onCharacterClick={(characterId) => console.log('Character clicked:', characterId)}
            onItemClick={(itemId) => console.log('Item clicked:', itemId)}
            onPuzzleClick={(puzzleId) => console.log('Puzzle clicked:', puzzleId)}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Dialog Panel */}
      {gameState.activeDialog && (
        <DialogPanel
          dialog={gameDialogs[gameState.activeDialog]}
          onResponseSelect={(response) => handleDialogResponse(response.nextDialog ? 0 : 1)}
          isOpen={!!gameState.activeDialog}
          onClose={() => gameEngine.closeDialog()}
        />
      )}
      
      {/* Puzzle Panel */}
      {gameState.currentPuzzle && (
        <PuzzlePanel
          puzzle={gamePuzzles[gameState.currentPuzzle]}
          onSolve={handlePuzzleAttempt}
          onClose={() => gameEngine.closePuzzle()}
          isOpen={!!gameState.currentPuzzle}
          attempts={gameState.puzzleAttempts || 0}
        />
      )}
      
      {/* UI Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-3">
        <button 
          onClick={() => setShowInventory(!showInventory)}
          className="p-3 bg-gray-900/80 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Book size={24} />
        </button>
        <button 
          onClick={() => setShowMap(!showMap)}
          className="p-3 bg-gray-900/80 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Map size={24} />
        </button>
        <button 
          onClick={() => setShowJournal(!showJournal)}
          className="p-3 bg-gray-900/80 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Bookmark size={24} />
        </button>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-gray-900/80 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Settings size={24} />
        </button>
      </div>
      
      {/* Status Bar */}
      <div className="absolute top-4 left-4 flex items-center space-x-4">
        <div className="flex items-center">
          <Heart size={20} className="text-red-500 mr-2" />
          <div className="h-2 w-32 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${gameState.health}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-blue-500 mr-2"></div>
          <div className="h-2 w-32 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${gameState.mana}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Inventory Panel */}
      <InventoryPanel
        items={gameState.inventory.map(id => gameItems[id])}
        onItemUse={(item) => handleItemUse(item.id)}
        onItemSelect={() => {}}
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
      />
      
      {/* Settings Panel */}
      <GameMenu
        onClose={() => setShowSettings(false)}
        onSave={() => gameEngine.saveGame()}
        onLoad={(saveId) => gameEngine.loadGame(saveId)}
        onSettingsChange={(settings) => gameEngine.updateSettings(settings)}
        onQuit={() => window.location.href = '/'}
        isOpen={showSettings}
        savedGames={[]}
        currentState={gameState}
        settings={{
          textSpeed: 'medium',
          volume: 0.7,
          darkMode: true,
          showHints: true,
          language: 'en',
          autoSave: true
        }}
      />
      
      {/* Notification Overlay */}
      <NotificationOverlay 
        notifications={gameState.notifications}
        onDismiss={(id) => gameEngine.dismissNotification(id)}
      />
    </div>
  );
}