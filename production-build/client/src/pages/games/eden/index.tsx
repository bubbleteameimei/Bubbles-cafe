import React, { useState } from 'react';
import { Link } from 'wouter';
import EdenGame from '../../../components/games/eden/EdenGame';

/**
 * Eden's Hollow Game Page
 * An immersive dark fantasy adventure set in a haunted village
 */
const EdenGamePage: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  
  const startGame = () => {
    setGameStarted(true);
  };
  
  const exitGame = () => {
    setGameStarted(false);
  };
  
  if (gameStarted) {
    return <EdenGame onExit={exitGame} />;
  }
  
  return (
    <div className="eden-game-container">
      <div className="game-intro">
        <h1>Eden's Hollow</h1>
        <p className="tagline">A dark fantasy adventure in a haunted village</p>
        
        <div className="game-description">
          <p>
            Welcome to Eden's Hollow, a once-thriving village now shrouded in mystery and darkness.
            As a wandering scholar drawn to rumors of strange occurrences, you arrive to find the
            village eerily quiet, with only a few inhabitants remaining.
          </p>
          
          <p>
            Explore the abandoned streets, discover hidden secrets, and unravel the dark history
            that led to the village's downfall. But beware - not everything is as it seems,
            and the shadows hold ancient horrors waiting to be awakened.
          </p>
          
          <div className="game-features">
            <h3>Features:</h3>
            <ul>
              <li>Immersive dark fantasy setting with atmospheric visuals</li>
              <li>Challenging puzzles that test your wit and observation</li>
              <li>Branching dialog system with meaningful choices</li>
              <li>Inventory management with item combinations</li>
              <li>Multiple endings based on your decisions</li>
            </ul>
          </div>
        </div>
        
        <div className="game-controls">
          <h3>Controls:</h3>
          <ul>
            <li><strong>Mouse</strong> - Click to interact with objects and characters</li>
            <li><strong>Space</strong> - Skip dialog text animation</li>
            <li><strong>ESC</strong> - Open menu / Exit current interaction</li>
          </ul>
        </div>
        
        <div className="start-options">
          <button className="start-game-button" onClick={startGame}>
            Begin Your Journey
          </button>
          
          <Link href="/" className="back-link">
            Return to Home
          </Link>
        </div>
      </div>
      
      <style>{`
        .eden-game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          background-color: #0f0f17;
          color: #e0e0e0;
          font-family: 'Times New Roman', serif;
          background-image: url('/assets/eden-hollow-bg.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          position: relative;
        }
        
        .eden-game-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(15, 15, 23, 0.6) 0%, rgba(5, 5, 15, 0.95) 100%);
          z-index: 0;
        }
        
        .game-intro {
          max-width: 800px;
          width: 100%;
          background-color: rgba(20, 20, 30, 0.8);
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid rgba(100, 100, 150, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          position: relative;
          z-index: 1;
        }
        
        h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          color: #c0c0e0;
          text-align: center;
          text-shadow: 0 0 10px rgba(80, 80, 150, 0.5);
        }
        
        .tagline {
          text-align: center;
          font-style: italic;
          color: #a0a0c0;
          margin-bottom: 2rem;
          font-size: 1.2rem;
        }
        
        .game-description {
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .game-description p {
          margin-bottom: 1rem;
        }
        
        .game-features {
          margin: 2rem 0;
          padding: 1rem;
          background-color: rgba(30, 30, 40, 0.7);
          border-radius: 6px;
        }
        
        .game-features h3, .game-controls h3 {
          color: #b0b0d0;
          margin-bottom: 0.75rem;
          font-size: 1.3rem;
        }
        
        .game-features ul, .game-controls ul {
          padding-left: 1.5rem;
        }
        
        .game-features li, .game-controls li {
          margin-bottom: 0.5rem;
          list-style-type: disc;
        }
        
        .game-controls {
          margin-bottom: 2rem;
          padding: 1rem;
          background-color: rgba(30, 30, 40, 0.7);
          border-radius: 6px;
        }
        
        .start-options {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .start-game-button {
          padding: 1rem 2rem;
          font-size: 1.2rem;
          background-color: #39304a;
          color: #e0e0e0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          font-family: 'Times New Roman', serif;
        }
        
        .start-game-button:hover {
          background-color: #4a3f5e;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        .back-link {
          color: #a0a0c0;
          text-decoration: none;
          font-size: 1rem;
          transition: color 0.2s ease;
        }
        
        .back-link:hover {
          color: #c0c0e0;
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .eden-game-container {
            padding: 1rem;
          }
          
          .game-intro {
            padding: 1.5rem;
          }
          
          h1 {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EdenGamePage;