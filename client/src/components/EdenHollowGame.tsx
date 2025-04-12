/**
 * Eden's Hollow Game Component
 * 
 * This component serves as the entry point for the game.
 * It wraps the GameContainer with appropriate styling and page layout.
 */

import React from 'react';
import GameContainer from './game/GameContainer';

interface EdenHollowGameProps {
  className?: string;
  defaultStory?: string;
}

const EdenHollowGame: React.FC<EdenHollowGameProps> = ({
  className = '',
  defaultStory
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <div className="w-full h-full">
        <GameContainer 
          className="rounded-lg shadow-xl overflow-hidden"
          defaultStory={defaultStory}
        />
      </div>
    </div>
  );
};

export default EdenHollowGame;