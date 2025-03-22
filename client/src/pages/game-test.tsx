/**
 * Test page for Eden's Hollow game
 * This is a simple test page to ensure the game component loads correctly
 */

import React from 'react';
import GameContainer from '../components/GameContainer';
import { Link } from 'wouter';

export default function GameTestPage() {
  return (
    <div className="game-test-page">
      <header className="test-header">
        <h1>Eden's Hollow Game Test Page</h1>
        <p>This page tests the integration of the Phaser game in our React application</p>
        <nav>
          <Link href="/">
            <a className="home-link">Back to Home</a>
          </Link>
        </nav>
      </header>

      <main className="game-test-container">
        <div className="game-wrapper">
          <h2>Game Container</h2>
          <GameContainer 
            width="800px"
            height="600px"
            autoStart={true}
          />
        </div>
        
        <div className="test-controls">
          <h3>Test Controls</h3>
          <ul>
            <li>
              <strong>Arrow Keys:</strong> Move character
            </li>
            <li>
              <strong>Space:</strong> Interact with objects
            </li>
            <li>
              <strong>Z/X:</strong> Zoom in/out
            </li>
          </ul>
          
          <div className="test-notes">
            <h3>Development Notes</h3>
            <p>
              The game is loading assets from <code>/public/assets/</code> including:
            </p>
            <ul>
              <li>Tileset (environment/tileset.svg)</li>
              <li>Map data (environment/map.json)</li>
              <li>Player sprite (characters/player.svg)</li>
              <li>Item sprites (items/*.svg)</li>
            </ul>
          </div>
        </div>
      </main>

      <style>{`
        .game-test-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .test-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }

        .test-header h1 {
          margin-top: 0;
          color: #333;
        }

        .home-link {
          display: inline-block;
          padding: 0.5rem 1rem;
          background-color: #333;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 1rem;
        }

        .home-link:hover {
          background-color: #555;
        }

        .game-test-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .game-test-container {
            grid-template-columns: 2fr 1fr;
          }
        }

        .game-wrapper {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .game-wrapper h2 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #333;
        }

        .test-controls {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .test-controls h3 {
          margin-top: 0;
          color: #333;
        }

        .test-controls ul {
          padding-left: 1.5rem;
          line-height: 1.6;
        }

        .test-notes {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
        }

        code {
          background-color: #eee;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}