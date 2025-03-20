import React, { useState, useEffect } from 'react';

export interface LoadingScreenProps {
  message: string;
  isLoading: boolean;
  onComplete?: () => void;
  duration?: number;
}

/**
 * Atmospheric loading screen with fog and particle effects
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  isLoading,
  onComplete,
  duration = 3000
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [particleCount] = useState<number>(20);
  
  // Generate random particles for the background effect
  const particles = Array.from({ length: particleCount }, (_, index) => ({
    id: `particle-${index}`,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    opacity: Math.random() * 0.8 + 0.2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 2
  }));
  
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    
    if (isLoading) {
      // Reset progress when loading starts
      setProgress(0);
      setShowContent(false);
      
      // Simulate loading progress
      const step = 100 / (duration / 100); // Progress every 100ms
      
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + step;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 100);
      
      // Show content with a slight delay for better UX
      timerId = setTimeout(() => {
        setShowContent(true);
      }, 800);
      
      // Call onComplete after duration
      timerId = setTimeout(() => {
        clearInterval(progressInterval);
        if (onComplete) onComplete();
      }, duration);
    }
    
    return () => {
      clearTimeout(timerId);
      clearInterval(progressInterval);
    };
  }, [isLoading, duration, onComplete]);
  
  if (!isLoading) return null;
  
  return (
    <div 
      className="loading-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0a0f',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Fog overlay */}
      <div 
        className="fog-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/assets/effects/fog.png)',
          backgroundSize: 'cover',
          opacity: 0.3,
          animation: 'drift 30s linear infinite',
          zIndex: 2
        }}
      />
      
      {/* Particles for atmosphere */}
      <div 
        className="particle-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      >
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              position: 'absolute',
              top: `${particle.y}%`,
              left: `${particle.x}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: '50%',
              backgroundColor: '#b3a7de',
              opacity: particle.opacity,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              zIndex: 2
            }}
          />
        ))}
      </div>
      
      {/* Vignette effect */}
      <div 
        className="vignette"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          boxShadow: 'inset 0 0 150px 60px rgba(0, 0, 0, 0.8)',
          zIndex: 3
        }}
      />
      
      {/* Content container with fade-in animation */}
      <div 
        className={`content-container ${showContent ? 'visible' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
          fontFamily: 'serif',
          textAlign: 'center',
          padding: '20px'
        }}
      >
        <h2 
          style={{
            color: '#d0c0e9',
            fontSize: '2rem',
            marginBottom: '20px',
            textShadow: '0 0 10px rgba(208, 192, 233, 0.5)',
            fontWeight: 'normal'
          }}
        >
          Eden's Hollow
        </h2>
        
        <p 
          style={{
            color: '#a395c7',
            fontSize: '1.1rem',
            maxWidth: '80%',
            marginBottom: '30px',
            lineHeight: 1.6,
            textShadow: '0 0 8px rgba(163, 149, 199, 0.3)'
          }}
        >
          {message}
        </p>
        
        {/* Progress bar */}
        <div 
          className="progress-container"
          style={{
            width: '250px',
            height: '3px',
            backgroundColor: 'rgba(128, 116, 159, 0.3)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div 
            className="progress-bar"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#a395c7',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 8px rgba(163, 149, 199, 0.7)'
            }}
          />
        </div>
        
        {/* Loading text */}
        <div 
          className="loading-text"
          style={{
            color: '#8e82b4',
            fontSize: '0.8rem',
            marginTop: '15px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          Loading
          <span className="dot" style={{ animation: 'pulse 1s infinite 0.2s' }}>.</span>
          <span className="dot" style={{ animation: 'pulse 1s infinite 0.4s' }}>.</span>
          <span className="dot" style={{ animation: 'pulse 1s infinite 0.6s' }}>.</span>
        </div>
      </div>
      
      {/* Animation styles */}
      <style>
        {`
          @keyframes drift {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-15px) translateX(10px); }
            50% { transform: translateY(-25px) translateX(-10px); }
            75% { transform: translateY(-15px) translateX(5px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;