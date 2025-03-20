import React from 'react';
import EdenGame from '../../../components/games/eden/EdenGame';

/**
 * Eden's Hollow Game Page
 */
const EdenGamePage: React.FC = () => {
  return (
    <div className="eden-game-page" style={{
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <EdenGame />
    </div>
  );
};

export default EdenGamePage;