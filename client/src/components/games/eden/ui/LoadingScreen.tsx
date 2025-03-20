import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
  onLoadingComplete?: () => void;
  duration?: number;
}

/**
 * Displays a loading screen with optional message during game transitions
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading,
  message = 'Loading...',
  onLoadingComplete,
  duration = 2000
}) => {
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      setFadeOut(false);
      
      // After specified duration, trigger fade out
      timer = setTimeout(() => {
        setFadeOut(true);
        
        // Once fade out animation completes, call the completion callback
        setTimeout(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        }, 500); // Match with CSS transition duration
      }, duration);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLoading, duration, onLoadingComplete]);
  
  if (!isLoading) {
    return null;
  }
  
  return (
    <div 
      className={`loading-screen ${fadeOut ? 'fade-out' : ''}`} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        transition: 'opacity 0.5s ease-in-out',
        opacity: fadeOut ? 0 : 1
      }}
    >
      <div className="loading-content" style={{
        textAlign: 'center',
        color: '#fff'
      }}>
        {/* Animated loading icon */}
        <div className="loading-icon" style={{
          marginBottom: '20px'
        }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '5px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#ffffff',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        
        {/* Loading message */}
        <div className="loading-message" style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '10px',
          textShadow: '0 0 10px rgba(100, 150, 255, 0.5)'
        }}>
          {message}
        </div>
        
        {/* Loading dots animation */}
        <div className="loading-dots" style={{
          fontSize: '24px',
          height: '24px',
          letterSpacing: '4px'
        }}>
          <span style={{ 
            animation: 'loadingDot 1.4s infinite',
            animationDelay: '0s',
            opacity: 0
          }}>.</span>
          <span style={{ 
            animation: 'loadingDot 1.4s infinite',
            animationDelay: '0.2s',
            opacity: 0
          }}>.</span>
          <span style={{ 
            animation: 'loadingDot 1.4s infinite',
            animationDelay: '0.4s',
            opacity: 0
          }}>.</span>
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes loadingDot {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;