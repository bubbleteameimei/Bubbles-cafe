import React from 'react';
import { EdenGame } from '../../../components/games/eden/EdenGame';
import { useLocation } from 'wouter';

const EdenGamePage: React.FC = () => {
  const [_, setLocation] = useLocation();

  const handleExitGame = () => {
    setLocation('/games');
  };

  return (
    <div className="eden-game-page">
      <EdenGame onExit={handleExitGame} />
      
      <style jsx>{`
        .eden-game-page {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          position: relative;
          background-color: #000;
        }
      `}</style>
    </div>
  );
};

export default EdenGamePage;