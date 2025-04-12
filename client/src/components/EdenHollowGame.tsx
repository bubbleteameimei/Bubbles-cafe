/**
 * Eden's Hollow Game Component
 * 
 * This component renders the Eden's Hollow game using the GameContainer component.
 * The game provides an interactive horror narrative experience with branching choices.
 */

import React from 'react';
import GameContainer from './game/GameContainer';

interface EdenHollowGameProps {
  className?: string;
}

export function EdenHollowGame({ className = '' }: EdenHollowGameProps) {
  return (
    <div className={`eden-hollow-game-container ${className}`}>
      <GameContainer />
    </div>
  );
}

export default EdenHollowGame;