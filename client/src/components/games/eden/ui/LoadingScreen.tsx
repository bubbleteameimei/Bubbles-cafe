import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  onComplete?: () => void;
  theme?: 'dark' | 'light';
  hasAnimation?: boolean;
}

/**
 * Displays loading screen with progress bar and animated effects
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading,
  message = 'Loading...',
  progress = 0,
  onComplete,
  theme = 'dark',
  hasAnimation = true,
}) => {
  const [fadeOut, setFadeOut] = useState<boolean>(false);
  const [dots, setDots] = useState<string>('');
  const [internalProgress, setInternalProgress] = useState<number>(progress);
  
  // Update internal progress when prop changes
  useEffect(() => {
    setInternalProgress(progress);
  }, [progress]);
  
  // Auto-advance progress slightly for better UX
  useEffect(() => {
    if (!isLoading || internalProgress >= 100) return;
    
    const timer = setTimeout(() => {
      // Slowly advance progress up to 90% max to give impression of loading
      if (internalProgress < 90) {
        setInternalProgress(prev => Math.min(prev + Math.random() * 2, 90));
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [isLoading, internalProgress]);
  
  // Handle loading animation dots
  useEffect(() => {
    if (!isLoading) return;
    
    const dotTimer = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    
    return () => clearInterval(dotTimer);
  }, [isLoading]);
  
  // Handle fade out animation when loading is complete
  useEffect(() => {
    if (isLoading || internalProgress < 100) return;
    
    setFadeOut(true);
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 800); // Match with CSS transition duration
    
    return () => clearTimeout(timer);
  }, [isLoading, internalProgress, onComplete]);
  
  // If not loading and already faded out, don't render
  if (!isLoading && fadeOut) {
    return null;
  }
  
  // Theme-based styles
  const backgroundColor = theme === 'dark' ? 'rgba(13, 10, 20, 0.97)' : 'rgba(240, 238, 245, 0.97)';
  const textColor = theme === 'dark' ? '#e0d0ff' : '#33274b';
  const progressBarBackground = theme === 'dark' ? 'rgba(60, 45, 80, 0.5)' : 'rgba(210, 200, 230, 0.7)';
  const progressBarFill = theme === 'dark' ? 'rgba(120, 90, 180, 0.9)' : 'rgba(100, 80, 160, 0.9)';
  
  return (
    <div
      className="loading-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: backgroundColor,
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 800ms ease-out',
        zIndex: 1000,
      }}
    >
      {/* Fog/mist animation (conditionally rendered) */}
      {hasAnimation && theme === 'dark' && (
        <div
          className="fog-animation"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        >
          {/* Fog layers */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                bottom: `-${10 * i}%`,
                left: 0,
                width: '200%',
                height: '100%',
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 10%, transparent 60%)',
                backgroundSize: `${20 + i * 15}% ${5 + i * 10}%`,
                animation: `fog-move-${i} ${30 + i * 10}s linear infinite`,
                opacity: 0.2 - i * 0.02,
                transform: `translateX(${i % 2 === 0 ? 0 : '-30%'})`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Light particles (conditionally rendered) */}
      {hasAnimation && (
        <div
          className="light-particles"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            opacity: theme === 'dark' ? 0.3 : 0.15,
            pointerEvents: 'none',
          }}
        >
          {/* Generate random particles */}
          {[...Array(30)].map((_, i) => {
            const size = Math.random() * 4 + 1;
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const duration = Math.random() * 10 + 15;
            const delay = Math.random() * 5;
            
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: `${top}%`,
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  backgroundColor: theme === 'dark' ? 'rgba(220, 210, 255, 0.6)' : 'rgba(120, 100, 190, 0.4)',
                  boxShadow: theme === 'dark' 
                    ? `0 0 ${size * 2}px rgba(180, 160, 255, 0.6)` 
                    : `0 0 ${size * 2}px rgba(120, 100, 190, 0.3)`,
                  animation: `float-particle ${duration}s ease-in-out ${delay}s infinite`,
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Game Logo */}
      <div
        className="game-logo"
        style={{
          marginBottom: '40px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            color: textColor,
            textShadow: theme === 'dark' 
              ? '0 0 10px rgba(140, 120, 200, 0.6), 0 0 20px rgba(100, 80, 160, 0.3)'
              : '0 0 10px rgba(100, 80, 160, 0.3)',
            fontFamily: 'serif',
            letterSpacing: '3px',
            marginBottom: '10px',
          }}
        >
          EDEN'S HOLLOW
        </h1>
        <div
          style={{
            fontSize: '1.1rem',
            color: textColor,
            opacity: 0.8,
            fontFamily: 'serif',
            letterSpacing: '1px',
          }}
        >
          A tale of darkness and redemption
        </div>
      </div>
      
      {/* Loading Message */}
      <div
        className="loading-message"
        style={{
          marginBottom: '25px',
          fontSize: '1.1rem',
          color: textColor,
          fontFamily: 'serif',
          maxWidth: '80%',
          textAlign: 'center',
          minHeight: '2em',
        }}
      >
        {message}{dots}
      </div>
      
      {/* Progress Bar */}
      <div
        className="progress-container"
        style={{
          width: '300px',
          height: '6px',
          backgroundColor: progressBarBackground,
          borderRadius: '3px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="progress-fill"
          style={{
            height: '100%',
            width: `${internalProgress}%`,
            backgroundColor: progressBarFill,
            borderRadius: '3px',
            transition: 'width 0.3s ease-in-out',
            position: 'relative',
          }}
        />
        {/* Progress glow effect */}
        {hasAnimation && (
          <div
            className="progress-glow"
            style={{
              position: 'absolute',
              top: 0,
              left: `calc(${internalProgress}% - 10px)`,
              width: '20px',
              height: '100%',
              background: `radial-gradient(ellipse at center, ${progressBarFill} 0%, transparent 80%)`,
              opacity: 0.8,
              filter: 'blur(3px)',
              display: internalProgress > 5 ? 'block' : 'none',
            }}
          />
        )}
      </div>
      
      {/* Progress Percentage */}
      <div
        style={{
          marginTop: '10px',
          fontSize: '0.9rem',
          color: textColor,
          opacity: 0.7,
          fontFamily: 'serif',
        }}
      >
        {Math.round(internalProgress)}%
      </div>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes fog-move-0 {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes fog-move-1 {
            0% { transform: translateX(-30%); }
            100% { transform: translateX(20%); }
          }
          @keyframes fog-move-2 {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes fog-move-3 {
            0% { transform: translateX(-30%); }
            100% { transform: translateX(20%); }
          }
          @keyframes fog-move-4 {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          
          @keyframes float-particle {
            0%, 100% {
              transform: translate(0, 0);
              opacity: 0.3;
            }
            25% {
              transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
              opacity: 0.9;
            }
            50% {
              transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 100 - 50}px);
              opacity: 0.5;
            }
            75% {
              transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 200 - 100}px);
              opacity: 0.7;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;