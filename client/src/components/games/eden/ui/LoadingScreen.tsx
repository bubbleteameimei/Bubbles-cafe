import React, { useEffect, useState } from 'react';

export interface LoadingScreenProps {
  message: string;
  isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, isLoading }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [particleCount] = useState(20);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
  }>>([]);
  
  // Generate particles for background effect
  useEffect(() => {
    if (!isLoading) return;
    
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 1 + 0.5,
      });
    }
    setParticles(newParticles);
    
    // Animate particles
    const intervalId = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          y: (particle.y + particle.speed) % 100,
          opacity: Math.sin((Date.now() + particle.id * 100) / 1000) * 0.3 + 0.4
        }))
      );
    }, 50);
    
    return () => clearInterval(intervalId);
  }, [isLoading, particleCount]);
  
  // Handle fade out animation
  useEffect(() => {
    if (!isLoading) {
      setFadeOut(true);
    } else {
      setFadeOut(false);
    }
  }, [isLoading]);

  // If not loading and fade-out animation is complete, don't render
  if (!isLoading && fadeOut) {
    return null;
  }
  
  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-fog"></div>
      
      {/* Floating particles */}
      {particles.map(particle => (
        <div 
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity
          }}
        ></div>
      ))}
      
      <div className="loading-content">
        <div className="loading-icon">
          <div className="loading-spinner"></div>
        </div>
        <div className="loading-message">{message}</div>
      </div>
      
      <style jsx>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #0a0a10;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 1;
          transition: opacity 1s ease;
        }
        
        .loading-screen.fade-out {
          opacity: 0;
          pointer-events: none;
        }
        
        .loading-fog {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url('https://i.imgur.com/RdQwrU0.png') repeat;
          background-size: cover;
          opacity: 0.3;
          animation: fogMove 40s infinite linear;
        }
        
        .loading-content {
          position: relative;
          z-index: 2;
          text-align: center;
        }
        
        .loading-icon {
          margin-bottom: 30px;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 3px solid transparent;
          border-top-color: #8a5c41;
          border-right-color: #6a4331;
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }
        
        .loading-spinner::before,
        .loading-spinner::after {
          content: '';
          position: absolute;
          border-radius: 50%;
        }
        
        .loading-spinner::before {
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          border: 3px solid transparent;
          border-top-color: #b17d5d;
          animation: spin 3s linear infinite;
        }
        
        .loading-spinner::after {
          top: 15px;
          left: 15px;
          right: 15px;
          bottom: 15px;
          border: 3px solid transparent;
          border-top-color: #cba68c;
          animation: spin 1.75s linear infinite;
        }
        
        .loading-message {
          color: #f1d7c5;
          font-family: 'Cinzel', serif;
          font-size: 24px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          max-width: 80%;
          animation: pulse 2s infinite;
        }
        
        .particle {
          position: absolute;
          background-color: #f1d7c5;
          border-radius: 50%;
          pointer-events: none;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes fogMove {
          0% { background-position: 0 0; }
          100% { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
};