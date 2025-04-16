import React, { useEffect } from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

/**
 * 404 Error Page
 * 
 * A simplified 404 page that doesn't use hooks that could cause ordering issues.
 * This component can be safely rendered at any point in the component tree.
 */
const NotFoundPage: React.FC = () => {
  // Set page title and meta description
  useEffect(() => {
    document.title = "404 - LOST IN THE VOID | Horror Stories";
    
    // Find the description meta tag, or create one if it doesn't exist
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', "The page you're seeking has vanished into the darkness. Perhaps it was just a figment of your imagination, or something more sinister...");
    
    return () => {
      document.title = "Horror Stories";
    };
  }, []);
  
  return (
    <SimplifiedErrorPage 
      statusCode={404}
      title="LOST IN THE VOID"
      message="The page you're seeking has vanished into the darkness. Perhaps it was just a figment of your imagination, or something more sinister..."
      actionText="ESCAPE"
      actionLink="/"
    />
  );
};

export default NotFoundPage;