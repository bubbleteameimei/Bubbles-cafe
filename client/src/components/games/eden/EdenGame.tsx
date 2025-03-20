import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameEngine } from './GameEngine';
import { GameState, Scene, Dialog, Puzzle, Notification, Item } from './types';
import { SceneView } from './ui/SceneView';
import { DialogBox } from './ui/DialogBox';
import { StatusBar } from './ui/StatusBar';
import { NotificationSystem } from './ui/NotificationSystem';

export interface EdenGameProps {
  onExit?: () => void;
}

export const EdenGame: React.FC<EdenGameProps> = ({ onExit }) => {
  // Initialize game engine with start scene
  const [engine] = useState(() => new GameEngine({ startScene: 'village_entrance' }));
  const [gameState, setGameState] = useState<GameState>(engine.getState());
  const [showInventory, setShowInventory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Subscribe to game state changes
  useEffect(() => {
    const handleStateChange = (state: GameState) => {
      setGameState({ ...state });
    };
    
    engine.addListener(handleStateChange);
    return () => engine.removeListener(handleStateChange);
  }, [engine]);
  
  // Get current scene
  const currentScene = engine.getScene(gameState.currentSceneId);
  
  // Get active dialog if any
  const activeDialog = gameState.activeDialogId 
    ? engine.getDialog(gameState.activeDialogId) 
    : null;
  
  // Get active puzzle if any
  const activePuzzle = gameState.currentPuzzleId 
    ? engine.getPuzzle(gameState.currentPuzzleId) 
    : null;
  
  // Handle interactions with scene elements
  const handleInteract = (elementId: string, actionType: string) => {
    engine.interactWithElement(elementId, actionType);
  };
  
  // Handle exit clicks
  const handleExitClick = (exitId: string) => {
    engine.tryExit(exitId);
  };
  
  // Handle dialog responses
  const handleDialogResponse = (responseIndex: number) => {
    engine.dispatch({ type: 'ADVANCE_DIALOG', responseIndex });
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    engine.dispatch({ type: 'END_DIALOG' });
  };
  
  // Handle notifications dismiss
  const handleNotificationDismiss = (id: string) => {
    engine.dispatch({ type: 'CLEAR_NOTIFICATION', id });
  };
  
  // Handle puzzle solution submission
  const handlePuzzleSolution = (solution: string[]) => {
    engine.dispatch({ type: 'SUBMIT_PUZZLE_SOLUTION', solution });
  };
  
  // Handle puzzle close
  const handlePuzzleClose = () => {
    engine.dispatch({ type: 'END_PUZZLE', success: false });
  };
  
  // Toggle inventory
  const toggleInventory = () => {
    setShowInventory(prev => !prev);
    if (showMap) setShowMap(false);
  };
  
  // Toggle map
  const toggleMap = () => {
    setShowMap(prev => !prev);
    if (showInventory) setShowInventory(false);
  };
  
  // Handle item use from inventory
  const handleItemUse = (itemId: string) => {
    engine.dispatch({ type: 'USE_ITEM', itemId, targetId: '' });
  };
  
  // Handle item drop/discard
  const handleItemDiscard = (itemId: string) => {
    if (confirm('Are you sure you want to discard this item?')) {
      engine.dispatch({ type: 'REMOVE_ITEM', itemId });
    }
  };
  
  // Handle item info view
  const handleItemInfo = (itemId: string) => {
    const item = engine.getItem(itemId);
    if (item) {
      engine.dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: uuidv4(),
          type: 'info',
          message: item.description,
          duration: 5000,
          autoDismiss: true
        }
      });
    }
  };
  
  // Handle exit game
  const handleExitGame = () => {
    if (onExit) onExit();
  };
  
  return (
    <div className="eden-game">
      {/* Main Game View */}
      <div className="game-container">
        {/* Scene View */}
        {currentScene && (
          <SceneView 
            scene={currentScene}
            onInteract={handleInteract}
            onExitClick={handleExitClick}
          />
        )}
        
        {/* Status Bar */}
        <StatusBar 
          health={gameState.health}
          maxHealth={gameState.maxHealth}
          mana={gameState.mana}
          maxMana={gameState.maxMana}
          onInventoryClick={toggleInventory}
          onMapClick={toggleMap}
        />
      </div>
      
      {/* Dialog Box */}
      {activeDialog && (
        <DialogBox 
          dialog={activeDialog}
          dialogIndex={gameState.dialogIndex}
          onResponseClick={handleDialogResponse}
          onClose={handleDialogClose}
        />
      )}
      
      {/* Notification System */}
      <NotificationSystem 
        notifications={gameState.notificationQueue}
        onDismiss={handleNotificationDismiss}
      />
      
      {/* Inventory Panel */}
      {showInventory && (
        <div className="inventory-panel">
          <div className="inventory-header">
            <h2>Inventory</h2>
            <button 
              className="close-button"
              onClick={toggleInventory}
            >
              ×
            </button>
          </div>
          
          {gameState.inventory.items.length === 0 ? (
            <div className="empty-inventory">
              Your inventory is empty.
            </div>
          ) : (
            <div className="inventory-grid">
              {gameState.inventory.items.map(item => (
                <div key={item.id} className="inventory-item">
                  <div className="item-icon">
                    <img src={item.icon} alt={item.name} />
                    {item.quantity > 1 && (
                      <span className="item-quantity">{item.quantity}</span>
                    )}
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <div className="item-actions">
                      {item.usable && (
                        <button 
                          className="item-action use-action"
                          onClick={() => handleItemUse(item.id)}
                        >
                          Use
                        </button>
                      )}
                      <button 
                        className="item-action info-action"
                        onClick={() => handleItemInfo(item.id)}
                      >
                        Info
                      </button>
                      <button 
                        className="item-action discard-action"
                        onClick={() => handleItemDiscard(item.id)}
                      >
                        Drop
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Map View */}
      {showMap && (
        <div className="map-panel">
          <div className="map-header">
            <h2>Map</h2>
            <button 
              className="close-button"
              onClick={toggleMap}
            >
              ×
            </button>
          </div>
          
          <div className="map-content">
            <p className="map-placeholder">
              You found a map of Eden's Hollow.
              Visited locations will be marked here.
            </p>
            <div className="visited-locations">
              <h3>Visited Locations:</h3>
              <ul>
                {Array.from(gameState.visitedScenes).map(sceneId => {
                  const scene = engine.getScene(sceneId);
                  return scene ? (
                    <li key={sceneId}>{scene.title}</li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Exit Game Button */}
      <button 
        className="exit-game-button"
        onClick={handleExitGame}
      >
        Exit Game
      </button>
      
      <style jsx>{`
        .eden-game {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100vh;
          position: relative;
          background-color: #1a1a1a;
          color: #eee;
          font-family: 'Inter', sans-serif;
        }
        
        .game-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .inventory-panel, .map-panel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(20, 20, 25, 0.95);
          border: 2px solid #8a5c41;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          z-index: 100;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
          animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .inventory-header, .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background-color: rgba(30, 30, 35, 0.8);
          border-bottom: 1px solid #8a5c41;
        }
        
        .inventory-header h2, .map-header h2 {
          margin: 0;
          color: #f1d7c5;
          font-size: 20px;
        }
        
        .close-button {
          background: none;
          border: none;
          color: #f1d7c5;
          font-size: 24px;
          cursor: pointer;
          padding: 0 5px;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        
        .close-button:hover {
          opacity: 1;
        }
        
        .empty-inventory {
          padding: 30px;
          text-align: center;
          color: #aaa;
        }
        
        .inventory-grid {
          padding: 15px;
          overflow-y: auto;
          max-height: 60vh;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 15px;
        }
        
        .inventory-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          background-color: rgba(40, 40, 45, 0.7);
          border-radius: 5px;
          border: 1px solid #6a4331;
          transition: transform 0.2s;
        }
        
        .inventory-item:hover {
          transform: translateY(-2px);
          border-color: #8a5c41;
        }
        
        .item-icon {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 5px;
          overflow: hidden;
          background-color: rgba(20, 20, 25, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .item-icon img {
          max-width: 100%;
          max-height: 100%;
        }
        
        .item-quantity {
          position: absolute;
          bottom: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 12px;
          padding: 1px 4px;
          border-top-left-radius: 3px;
        }
        
        .item-details {
          width: 100%;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .item-details h3 {
          margin: 0 0 5px;
          font-size: 14px;
          text-align: center;
          color: #f1d7c5;
        }
        
        .item-actions {
          display: flex;
          gap: 5px;
          justify-content: center;
          width: 100%;
        }
        
        .item-action {
          background-color: rgba(60, 40, 30, 0.6);
          border: 1px solid #6a4331;
          color: #ddd;
          font-size: 10px;
          padding: 2px 5px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .item-action:hover {
          background-color: rgba(80, 50, 30, 0.7);
          border-color: #8a5c41;
        }
        
        .use-action {
          background-color: rgba(20, 60, 30, 0.7);
        }
        
        .info-action {
          background-color: rgba(30, 40, 60, 0.7);
        }
        
        .discard-action {
          background-color: rgba(60, 30, 30, 0.7);
        }
        
        .map-content {
          padding: 15px;
          overflow-y: auto;
          max-height: 60vh;
        }
        
        .map-placeholder {
          margin-bottom: 20px;
          font-style: italic;
          color: #ccc;
        }
        
        .visited-locations h3 {
          font-size: 16px;
          margin: 0 0 10px;
          color: #f1d7c5;
        }
        
        .visited-locations ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .visited-locations li {
          padding: 5px 0;
          border-bottom: 1px solid rgba(138, 92, 65, 0.3);
        }
        
        .exit-game-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(60, 30, 30, 0.7);
          border: 1px solid #8a5c41;
          color: #f1d7c5;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          z-index: 10;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .exit-game-button:hover {
          background-color: rgba(80, 40, 40, 0.8);
          border-color: #a47755;
        }
      `}</style>
    </div>
  );
};