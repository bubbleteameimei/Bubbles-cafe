import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * NotFoundRouteHandler
 * 
 * A dedicated component for handling 404 routes to ensure consistent hook ordering.
 * This component is used as the catch-all route in App.tsx.
 * 
 * Note: All loading-related code has been removed from this component.
 */
const NotFoundRouteHandler: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [_, setLocation] = useLocation();
  
  // Use effect for navigation to error page
  useEffect(() => {
    // Navigate to the 404 error page (or just render children)
    if (!children) {
      setLocation('/errors/404');
    }
  }, [setLocation, children]);
  
  // If children are provided, render them directly
  if (children) {
    return <>{children}</>;
  }

  // Otherwise return null while redirecting 
  return null;
};

export default NotFoundRouteHandler;