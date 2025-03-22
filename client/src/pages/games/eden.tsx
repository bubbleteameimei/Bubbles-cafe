/**
 * Eden's Hollow Game Page
 * This is now a redirect to our new PixelEngine implementation
 */

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function EdenGameRedirect() {
  const [, setLocation] = useLocation();
  
  // Automatically redirect to the new implementation
  useEffect(() => {
    // Redirect to the new game implementation
    console.log("Redirecting to the new PixelEngine implementation...");
    setLocation("/eden-game-new");
  }, [setLocation]);
  
  // Show loading indicator while redirecting
  return (
    <div className="eden-game-redirect" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#121212',
      color: '#eaeaea'
    }}>
      <h2>Redirecting to Eden's Hollow...</h2>
      <div style={{
        marginTop: '20px',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#32CD32',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }}></div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}