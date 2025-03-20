import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import EdenGame from '../../../components/games/eden/EdenGame';

/**
 * Eden's Hollow Game Page
 * This page component loads and displays the Eden's Hollow game
 */
const EdenHollowPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate a loading screen for the game assets
  useEffect(() => {
    // Simulating asset loading with timeout
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Handle exit from the game
  const handleGameExit = () => {
    setLocation('/'); // Navigate back to home page
  };

  if (isLoading) {
    return (
      <div className="eden-loading-screen">
        <div className="loading-content">
          <h1>Eden's Hollow</h1>
          <p>A Dark Fantasy Adventure</p>
          <div className="loading-indicator">
            <div className="loading-bar"></div>
          </div>
          <p className="loading-text">Loading the cursed village...</p>
        </div>
        
        <style jsx>{`
          .eden-loading-screen {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #0a0a12;
            background-image: 
              radial-gradient(circle at 10% 20%, rgba(80, 40, 40, 0.4) 0%, transparent 30%),
              radial-gradient(circle at 90% 80%, rgba(40, 40, 80, 0.4) 0%, transparent 30%);
            color: #e0e0e0;
            font-family: 'Times New Roman', serif;
          }
          
          .loading-content {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
          }
          
          h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            color: #d93240;
            text-shadow: 0 0 10px rgba(217, 50, 64, 0.5);
            letter-spacing: 2px;
          }
          
          p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            color: #a0a0a0;
          }
          
          .loading-indicator {
            width: 100%;
            height: 6px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 1rem;
          }
          
          .loading-bar {
            height: 100%;
            width: 0%;
            background-color: #d93240;
            border-radius: 3px;
            animation: loading 2s ease-in-out forwards;
          }
          
          .loading-text {
            font-style: italic;
            font-size: 0.9rem;
            opacity: 0.7;
          }
          
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="eden-page">
      <EdenGame onExit={handleGameExit} />
      
      <style jsx>{`
        .eden-page {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default EdenHollowPage;