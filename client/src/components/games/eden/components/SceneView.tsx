import React from 'react';
import { GameScene } from '../types';
import { motion } from 'framer-motion';

interface SceneViewProps {
  scene: GameScene;
  onExitClick: (destination: string) => void;
  onCharacterClick: (characterId: string) => void;
  onItemClick: (itemId: string) => void;
  onActionClick: (action: string) => void;
  onPuzzleClick: (puzzleId: string) => void;
}

export const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onExitClick,
  onCharacterClick,
  onItemClick,
  onActionClick,
  onPuzzleClick
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Scene Image */}
      <div className="relative h-1/3 md:h-2/5 overflow-hidden rounded-lg">
        <img 
          src={scene.image} 
          alt={scene.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/70"></div>
        <h1 className="absolute bottom-3 left-4 text-2xl font-serif text-white">{scene.title}</h1>
      </div>
      
      {/* Scene Description */}
      <motion.div 
        className="mt-4 px-4 prose prose-sm max-w-none prose-stone dark:prose-invert"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {scene.description.map((paragraph, i) => (
          <p key={i} className="my-2">{paragraph}</p>
        ))}
      </motion.div>
      
      {/* Interactive Elements */}
      <div className="mt-auto p-4">
        {/* Characters */}
        {scene.characters && scene.characters.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">People</h3>
            <div className="flex flex-wrap gap-2">
              {scene.characters.map(character => (
                <button
                  key={character.id}
                  onClick={() => onCharacterClick(character.id)}
                  className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-xs font-medium"
                >
                  {character.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Items */}
        {scene.items && scene.items.filter(item => !item.hidden).length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Items</h3>
            <div className="flex flex-wrap gap-2">
              {scene.items.filter(item => !item.hidden).map(item => (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-medium"
                >
                  {item.id}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        {scene.actions && scene.actions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {scene.actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => onActionClick(action.action)}
                  className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Puzzles */}
        {scene.puzzles && scene.puzzles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Puzzles</h3>
            <div className="flex flex-wrap gap-2">
              {scene.puzzles.map(puzzle => (
                <button
                  key={puzzle.id}
                  onClick={() => onPuzzleClick(puzzle.id)}
                  className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-medium"
                >
                  {puzzle.type.charAt(0).toUpperCase() + puzzle.type.slice(1)} Puzzle
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Exits */}
        {scene.exits && scene.exits.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Paths</h3>
            <div className="flex flex-wrap gap-2">
              {scene.exits.map((exit, idx) => (
                <button
                  key={idx}
                  onClick={() => onExitClick(exit.destination)}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium"
                >
                  {exit.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneView;