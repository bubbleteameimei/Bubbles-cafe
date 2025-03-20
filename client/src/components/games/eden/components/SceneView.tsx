import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Eye, HandMetal } from 'lucide-react';
import { GameScene } from '../types';

interface SceneViewProps {
  scene: GameScene;
  onExitClick: (destinationId: string) => void;
  onActionClick: (actionId: string) => void;
  onCharacterClick: (characterId: string) => void;
  onItemClick: (itemId: string) => void;
  onPuzzleClick: (puzzleId: string) => void;
}

const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onExitClick,
  onActionClick,
  onCharacterClick,
  onItemClick,
  onPuzzleClick
}) => {
  if (!scene) return <div className="text-red-500">Scene not found</div>;
  
  return (
    <div className="relative h-full w-full">
      {/* Scene Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${scene.backgroundImage || '/images/scenes/default-scene.jpg'})` 
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Scene Content */}
      <div className="relative z-10 h-full flex flex-col p-6">
        <div className="flex-grow">
          <h1 className="text-3xl font-serif mb-2 text-amber-100">{scene.title}</h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-amber max-w-prose mb-8"
          >
            <p>{scene.description}</p>
          </motion.div>
          
          {/* Interactive Elements */}
          <div className="mt-8">
            {/* Characters */}
            {scene.characters && scene.characters.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-serif mb-2 text-amber-200">Characters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scene.characters.map(character => (
                    <motion.button
                      key={character.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center px-4 py-2 bg-gray-900/60 rounded-md hover:bg-gray-800/80 text-left"
                      onClick={() => onCharacterClick(character.id)}
                    >
                      <div className="mr-3">
                        {character.icon || <Eye size={20} className="text-amber-400" />}
                      </div>
                      <div>
                        <div className="font-medium">{character.name}</div>
                        <div className="text-sm text-gray-300">{character.shortDescription}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Items */}
            {scene.items && scene.items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-serif mb-2 text-amber-200">Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scene.items.map(item => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center px-4 py-2 bg-gray-900/60 rounded-md hover:bg-gray-800/80 text-left"
                      onClick={() => onItemClick(item.id)}
                    >
                      <div className="mr-3">
                        {item.icon || <HandMetal size={20} className="text-amber-400" />}
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-300">{item.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions */}
            {scene.actions && scene.actions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-serif mb-2 text-amber-200">Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scene.actions.map(action => (
                    <motion.button
                      key={action.action}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center px-4 py-2 bg-gray-900/60 rounded-md hover:bg-gray-800/80 text-left"
                      onClick={() => onActionClick(action.action)}
                    >
                      <div className="font-medium">{action.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Exits/Navigation */}
        <div className="mt-auto">
          <h3 className="text-xl font-serif mb-2 text-amber-200">Exits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {scene.exits.map(exit => (
              <motion.button
                key={exit.destination}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center px-4 py-2 bg-gray-800/60 rounded-md hover:bg-gray-700/80 group"
                onClick={() => onExitClick(exit.destination)}
              >
                <div className="mr-3">
                  <ChevronRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-medium">{exit.name}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneView;