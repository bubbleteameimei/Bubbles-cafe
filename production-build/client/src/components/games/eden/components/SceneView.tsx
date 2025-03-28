import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { Scene, Character, ItemPlacement, PuzzleReference } from '../types';

interface SceneViewProps {
  scene: Scene;
  onExitClick: (exitId: string) => void;
  onActionClick: (actionId: string) => void;
  onCharacterClick: (characterId: string) => void;
  onItemClick: (itemId: string) => void;
  onPuzzleClick: (puzzleId: string) => void;
}

export default function SceneView({ scene, onExitClick, onActionClick, onCharacterClick, onItemClick, onPuzzleClick }: SceneViewProps) {
  if (!scene) return <div className="h-full w-full bg-black flex items-center justify-center">Scene not found</div>;

  return (
    <div className="scene-view relative h-full w-full">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat bg-cover transition-opacity duration-1000"
        style={{ backgroundImage: `url(${scene.backgroundImage})` }}
      />
      
      {/* Ambient Overlay for mood */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${getAmbientOverlay(scene.time || 'day')}`}
      />
      
      {/* Scene Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-16 left-1/2 transform -translate-x-1/2 text-2xl font-serif text-white bg-black/50 px-4 py-2 rounded-lg"
      >
        {scene.title}
      </motion.div>
      
      {/* Scene Description */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-5/6 max-w-2xl bg-black/70 p-4 rounded-lg text-white"
      >
        <p className="text-lg">{scene.description}</p>
      </motion.div>
      
      {/* Navigation Exits */}
      {scene.exits && scene.exits.map((exit, index) => (
        <motion.button
          key={exit.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + (index * 0.1) }}
          onClick={() => onExitClick(exit.target)}
          className={`absolute ${getExitPosition(exit.position)} flex items-center justify-center p-3 hover:bg-white/20 rounded-full transition-colors text-white`}
          title={exit.name}
        >
          {getExitIcon(exit.position)}
          <span className="absolute whitespace-nowrap bg-black/80 px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {exit.name}
          </span>
        </motion.button>
      ))}
      
      {/* Interactive Characters */}
      {scene.characters && scene.characters.map((character) => (
        <motion.button
          key={character.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => onCharacterClick(character.id)}
          className={`absolute ${getCharacterPosition(character.position)} flex flex-col items-center group`}
        >
          <div className="w-24 h-32 overflow-hidden rounded-lg shadow-lg relative">
            <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="mt-2 px-2 py-1 bg-black/70 rounded text-white text-sm">
            {character.name}
          </span>
        </motion.button>
      ))}
      
      {/* Interactive Items */}
      {scene.items && scene.items.map((item) => (
        !item.isHidden && (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            onClick={() => onItemClick(item.id)}
            className={`absolute ${getItemPosition(item.position)} flex items-center justify-center p-1 rounded-full hover:bg-yellow-400/30 transition-all group`}
          >
            <div className="w-10 h-10 overflow-hidden rounded-full border-2 border-yellow-400/50 group-hover:border-yellow-400 transition-colors">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-yellow-400">?</div>
              )}
            </div>
            <span className="absolute whitespace-nowrap -bottom-8 bg-black/80 px-2 py-1 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {item.name}
            </span>
          </motion.button>
        )
      ))}
      
      {/* Puzzles */}
      {scene.puzzles && scene.puzzles.map((puzzle) => (
        <motion.button
          key={puzzle.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={() => onPuzzleClick(puzzle.id)}
          className={`absolute ${getPuzzlePosition(puzzle.position)} p-3 bg-purple-800/50 hover:bg-purple-700/70 rounded-lg shadow-lg transition-colors group`}
        >
          <span className="text-white font-medium">{puzzle.name}</span>
          <div className="absolute w-full left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/80 p-2 rounded text-white text-sm">
              {puzzle.description || "Investigate this puzzle"}
            </div>
          </div>
        </motion.button>
      ))}
      
      {/* Scene Actions */}
      {scene.actions && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-2">
          {scene.actions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
              onClick={() => onActionClick(action.id)}
              className="px-4 py-2 bg-gray-900/80 hover:bg-gray-800 text-white rounded-lg flex items-center transition-colors"
            >
              {action.name}
              <ChevronRight size={16} className="ml-2" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions for positioning elements
function getExitPosition(position: string): string {
  switch (position) {
    case 'north': return 'top-8 left-1/2 transform -translate-x-1/2';
    case 'south': return 'bottom-8 left-1/2 transform -translate-x-1/2';
    case 'east': return 'right-8 top-1/2 transform -translate-y-1/2';
    case 'west': return 'left-8 top-1/2 transform -translate-y-1/2';
    case 'northeast': return 'top-8 right-8';
    case 'northwest': return 'top-8 left-8';
    case 'southeast': return 'bottom-8 right-8';
    case 'southwest': return 'bottom-8 left-8';
    default: return 'bottom-8 left-1/2 transform -translate-x-1/2';
  }
}

function getExitIcon(position: string) {
  switch (position) {
    case 'north': return <ArrowLeft className="rotate-90" size={24} />;
    case 'south': return <ArrowLeft className="-rotate-90" size={24} />;
    case 'east': return <ArrowRight size={24} />;
    case 'west': return <ArrowLeft size={24} />;
    case 'northeast': return <ArrowRight className="rotate-45" size={24} />;
    case 'northwest': return <ArrowLeft className="rotate-45" size={24} />;
    case 'southeast': return <ArrowRight className="-rotate-45" size={24} />;
    case 'southwest': return <ArrowLeft className="-rotate-45" size={24} />;
    default: return <ChevronRight size={24} />;
  }
}

function getCharacterPosition(position: string): string {
  // This would need custom positioning based on scene design
  switch (position) {
    case 'center': return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    case 'left': return 'top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2';
    case 'right': return 'top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2';
    case 'foreground': return 'bottom-32 left-1/2 transform -translate-x-1/2';
    case 'background': return 'top-32 left-1/2 transform -translate-x-1/2';
    default: return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
  }
}

function getItemPosition(position: string): string {
  // Custom positioning for items
  const positions: {[key: string]: string} = {
    'top-left': 'top-24 left-16',
    'top-right': 'top-24 right-16',
    'bottom-left': 'bottom-32 left-16',
    'bottom-right': 'bottom-32 right-16',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };
  
  return positions[position] || 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
}

function getPuzzlePosition(position: string): string {
  // Custom positioning for puzzles
  const positions: {[key: string]: string} = {
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'altar': 'top-1/3 left-1/2 transform -translate-x-1/2',
    'door': 'bottom-1/4 left-1/2 transform -translate-x-1/2',
    'wall': 'top-1/3 right-1/4',
    'table': 'bottom-1/3 left-1/3',
  };
  
  return positions[position] || 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
}

function getAmbientOverlay(time: string): string {
  switch (time) {
    case 'dawn': return 'from-orange-900/30 to-yellow-800/10';
    case 'day': return 'from-blue-900/0 to-blue-800/0';
    case 'dusk': return 'from-purple-900/30 to-pink-800/20';
    case 'night': return 'from-blue-950/50 to-gray-900/30';
    default: return 'from-transparent to-transparent';
  }
}