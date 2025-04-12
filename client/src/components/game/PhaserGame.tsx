/**
 * Eden's Hollow PhaserGame Component
 * 
 * This component initializes and manages the Phaser game instance.
 * It creates the game canvas and connects the React state to the Phaser scenes.
 */

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import UIScene from './scenes/UIScene';
import { GameState, Passage, Choice, Story } from '../../types/game';

interface PhaserGameProps {
  gameState: GameState;
  currentStory: Story | null;
  currentPassage: Passage | null;
  showLowSanityEffects: boolean;
  containerWidth: number;
  containerHeight: number;
  onChoiceSelected: (choice: Choice) => void;
}

const PhaserGame: React.FC<PhaserGameProps> = ({
  gameState,
  currentStory,
  currentPassage,
  showLowSanityEffects,
  containerWidth,
  containerHeight,
  onChoiceSelected
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize Phaser game on component mount
  useEffect(() => {
    if (!gameContainerRef.current) return;
    
    // Game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: containerWidth,
      height: containerHeight,
      parent: gameContainerRef.current,
      backgroundColor: '#000000',
      scene: [
        new MainScene({
          gameState,
          currentPassage
        }),
        new UIScene({
          gameState,
          currentPassage,
          onChoiceSelected
        })
      ],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      }
    };
    
    // Create new game instance
    gameRef.current = new Phaser.Game(config);
    
    // Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);
  
  // Update game state when props change
  useEffect(() => {
    if (!gameRef.current) return;
    
    // Get scene instances
    const mainScene = gameRef.current.scene.getScene('MainScene') as MainScene;
    const uiScene = gameRef.current.scene.getScene('UIScene') as UIScene;
    
    // Update scene states
    if (mainScene) {
      mainScene.updateGameState(gameState, currentPassage);
    }
    
    if (uiScene) {
      uiScene.updateGameState(gameState, currentPassage);
    }
    
  }, [gameState, currentPassage, showLowSanityEffects]);
  
  return (
    <div 
      ref={gameContainerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: 'black'
      }} 
    />
  );
};

export default PhaserGame;