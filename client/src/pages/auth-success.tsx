import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Auth Success Page
 * 
 * This page is a placeholder for backward compatibility.
 * OAuth functionality has been removed but we maintain this page
 * to avoid breaking existing routes or bookmarks.
 * It simply redirects to the home page.
 */
const AuthSuccessPage = () => {
  const [, setLocation] = useLocation();

  // Immediately redirect to home page
  useEffect(() => {
    setLocation('/');
  }, [setLocation]);

  // Simple loading indicator in case redirect takes a moment
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we redirect you to the homepage.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccessPage;