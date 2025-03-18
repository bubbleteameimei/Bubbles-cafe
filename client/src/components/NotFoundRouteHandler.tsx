import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { hideGlobalLoading } from '@/utils/global-loading-manager';

/**
 * NotFoundRouteHandler
 * 
 * A dedicated component for handling 404 routes to ensure consistent hook ordering.
 * This component is used as the catch-all route in App.tsx.
 */
const NotFoundRouteHandler: React.FC = () => {
  const [_, setLocation] = useLocation();
  
  // Use effect for navigation to error page
  useEffect(() => {
    // Hide any loading indicators
    hideGlobalLoading();
    
    // Navigate to the 404 error page
    setLocation('/errors/404');
    
    return () => {
      hideGlobalLoading();
    };
  }, [setLocation]);
  
  // Return null while redirecting 
  // (using null instead of empty fragment is more semantically correct for a component that renders nothing)
  return null;
};

export default NotFoundRouteHandler;