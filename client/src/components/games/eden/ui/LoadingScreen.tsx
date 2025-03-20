import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

/**
 * Loading screen shown during game initialization
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <h2 style={{ 
        color: '#ffffff', 
        fontFamily: 'serif',
        fontSize: '32px',
        marginBottom: '30px'
      }}>
        Eden's Hollow
      </h2>
      
      <div className="loading-spinner" style={{
        width: '50px',
        height: '50px',
        border: '5px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 1s ease infinite',
        marginBottom: '20px'
      }}></div>
      
      <p style={{ 
        color: '#aaaaaa', 
        fontFamily: 'sans-serif',
        fontSize: '16px'
      }}>
        {message}
      </p>
      
      <style>
        {`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;