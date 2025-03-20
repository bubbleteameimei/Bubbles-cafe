import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sword, 
  Skull, 
  Moon, 
  Castle, 
  BookOpen, 
  Flame, 
  Ghost, 
  Sparkles, 
  Heart, 
  Shield
} from 'lucide-react';
import { GameEngine } from './GameEngine';
import { GameMap } from './GameMap';
import { GameInventory } from './GameInventory';
import { GameDialog } from './GameDialog';
import { GamePuzzle } from './GamePuzzle';
import { GameState } from './types';

export function EdenGame() {
  const [gameState, setGameState] = useState<GameState>({
    currentScene: 'intro',
    inventory: [],
    visitedScenes: new Set(['intro']),
    playerHealth: 100,
    playerMana: 50,
    puzzlesSolved: new Set(),
    gameProgress: 0,
    choices: {},
    characterName: '',
    currentDialog: null,
    activePuzzle: null,
    gameOver: false,
    showMap: false,
    showInventory: false,
  });

  const [textContent, setTextContent] = useState<string[]>([]);
  const [choices, setChoices] = useState<{text: string, nextScene: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [currentDisplayText, setCurrentDisplayText] = useState('');
  const typewriterSpeed = 30; // ms per character
  const gameEngineRef = useRef<GameEngine | null>(null);
  
  useEffect(() => {
    // Initialize the game engine
    gameEngineRef.current = new GameEngine(
      setGameState, 
      setTextContent, 
      setChoices
    );
    
    // Start the game
    gameEngineRef.current.startGame();
    
    return () => {
      // Cleanup
      gameEngineRef.current = null;
    };
  }, []);
  
  useEffect(() => {
    if (textContent.length > 0 && !isTyping) {
      // Start typewriter effect
      setIsTyping(true);
      setTypewriterIndex(0);
      setCurrentDisplayText('');
    }
  }, [textContent]);
  
  useEffect(() => {
    if (!isTyping) return;
    
    const currentText = textContent[0] || '';
    
    if (typewriterIndex < currentText.length) {
      const timer = setTimeout(() => {
        setCurrentDisplayText(prev => prev + currentText[typewriterIndex]);
        setTypewriterIndex(prev => prev + 1);
      }, typewriterSpeed);
      
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [typewriterIndex, isTyping, textContent]);
  
  const handleChoiceClick = (nextScene: string) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.transitionToScene(nextScene);
    }
  };
  
  const handleSkipText = () => {
    if (isTyping) {
      // Skip typewriter and show full text
      setCurrentDisplayText(textContent[0] || '');
      setTypewriterIndex((textContent[0] || '').length);
      setIsTyping(false);
    } else if (textContent.length > 1) {
      // Move to next text block
      setTextContent(prev => prev.slice(1));
      setIsTyping(true);
      setTypewriterIndex(0);
      setCurrentDisplayText('');
    }
  };
  
  const handleOpenInventory = () => {
    setGameState(prev => ({...prev, showInventory: !prev.showInventory}));
  };
  
  const handleOpenMap = () => {
    setGameState(prev => ({...prev, showMap: !prev.showMap}));
  };
  
  const getBgImageClass = () => {
    const { currentScene } = gameState;
    
    if (currentScene.includes('castle')) return 'bg-castle';
    if (currentScene.includes('forest')) return 'bg-forest';
    if (currentScene.includes('dungeon')) return 'bg-dungeon';
    if (currentScene.includes('ritual')) return 'bg-ritual';
    if (currentScene.includes('cliff')) return 'bg-cliff';
    
    // Default background
    return 'bg-dark-fantasy';
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${getBgImageClass()}`}>
      <div className="game-header p-4 bg-black/80 text-white flex justify-between items-center border-b border-amber-900/50">
        <div className="flex items-center gap-2">
          <Sword className="text-red-500" />
          <h1 className="text-2xl font-bold text-amber-50">Eden's Hollow</h1>
        </div>
        <div className="flex gap-3 items-center">
          <div className="health-bar flex items-center gap-1">
            <Heart className="text-red-500" />
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600" 
                style={{width: `${gameState.playerHealth}%`}}
              ></div>
            </div>
          </div>
          <div className="mana-bar flex items-center gap-1">
            <Sparkles className="text-blue-400" />
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{width: `${gameState.playerMana}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="game-content flex-grow flex flex-col lg:flex-row p-4 gap-4">
        <div className="game-main flex-grow">
          <Card className="bg-black/80 text-white border-amber-900/30 min-h-[60vh] flex flex-col p-4">
            <div className="game-text flex-grow overflow-y-auto mb-4 font-serif">
              <p className="leading-relaxed text-lg">
                {currentDisplayText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </div>
            
            <div className="choices-container mt-auto">
              {!isTyping && choices.length > 0 && (
                <div className="choices-grid grid gap-2">
                  <AnimatePresence>
                    {choices.map((choice, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button 
                          variant="outline" 
                          className="w-full text-left justify-start border-amber-900/50 hover:bg-amber-900/20"
                          onClick={() => handleChoiceClick(choice.nextScene)}
                        >
                          {choice.text}
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div className="game-sidebar w-full lg:w-64">
          <div className="sidebar-buttons flex lg:flex-col gap-2">
            <Button
              variant="outline"
              className="flex-1 border-amber-900/50 hover:bg-amber-900/20"
              onClick={handleOpenInventory}
            >
              <BookOpen className="mr-2" /> Inventory
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-amber-900/50 hover:bg-amber-900/20"
              onClick={handleOpenMap}
            >
              <Castle className="mr-2" /> Map
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-amber-900/50 hover:bg-amber-900/20"
              onClick={handleSkipText}
            >
              {isTyping ? 'Skip' : 'Continue'}
            </Button>
          </div>
          
          {/* Status effects section */}
          <Card className="mt-4 bg-black/80 border-amber-900/30 p-2">
            <h3 className="text-amber-50 text-sm font-bold mb-2">Status</h3>
            <div className="status-effects grid grid-cols-2 gap-1">
              {gameState.gameProgress > 20 && (
                <div className="status-effect flex items-center gap-1 text-xs text-amber-200">
                  <Moon className="h-3 w-3" /> Moonbound
                </div>
              )}
              {gameState.inventory.includes('ancient_amulet') && (
                <div className="status-effect flex items-center gap-1 text-xs text-blue-300">
                  <Shield className="h-3 w-3" /> Protected
                </div>
              )}
              {gameState.inventory.includes('ritual_dagger') && (
                <div className="status-effect flex items-center gap-1 text-xs text-red-400">
                  <Flame className="h-3 w-3" /> Blood Magic
                </div>
              )}
              {gameState.puzzlesSolved.has('spirit_binding') && (
                <div className="status-effect flex items-center gap-1 text-xs text-green-300">
                  <Ghost className="h-3 w-3" /> Spirit Bound
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Game overlays */}
      <AnimatePresence>
        {gameState.showInventory && (
          <GameInventory 
            inventory={gameState.inventory}
            onClose={handleOpenInventory}
            gameEngine={gameEngineRef.current}
          />
        )}
        
        {gameState.showMap && (
          <GameMap 
            visitedScenes={gameState.visitedScenes}
            currentScene={gameState.currentScene}
            onClose={handleOpenMap}
            onNavigate={handleChoiceClick}
          />
        )}
        
        {gameState.currentDialog && (
          <GameDialog 
            dialog={gameState.currentDialog}
            onClose={() => setGameState(prev => ({...prev, currentDialog: null}))}
            gameEngine={gameEngineRef.current}
          />
        )}
        
        {gameState.activePuzzle && (
          <GamePuzzle 
            puzzle={gameState.activePuzzle}
            onSolve={(puzzleId) => {
              if (gameEngineRef.current) {
                gameEngineRef.current.solvePuzzle(puzzleId);
              }
            }}
            onClose={() => setGameState(prev => ({...prev, activePuzzle: null}))}
          />
        )}
      </AnimatePresence>
      
      {/* Game over screen */}
      <AnimatePresence>
        {gameState.gameOver && (
          <motion.div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-black text-white border-red-900 p-6 max-w-md mx-auto">
              <div className="text-center">
                <Skull className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-500 mb-2">Darkness Claims You</h2>
                <p className="text-gray-400 mb-6">Your journey has come to a tragic end in Eden's Hollow.</p>
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (gameEngineRef.current) {
                      gameEngineRef.current.restartGame();
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx>{`
        .bg-dark-fantasy {
          background-color: #121212;
          background-image: url('/images/bg-dark-fantasy.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        
        .bg-castle {
          background-color: #121212;
          background-image: url('/images/bg-castle.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        
        .bg-forest {
          background-color: #121212;
          background-image: url('/images/bg-forest.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        
        .bg-dungeon {
          background-color: #121212;
          background-image: url('/images/bg-dungeon.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        
        .bg-ritual {
          background-color: #121212;
          background-image: url('/images/bg-ritual.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        
        .bg-cliff {
          background-color: #121212;
          background-image: url('/images/bg-cliff.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
      `}</style>
    </div>
  );
}