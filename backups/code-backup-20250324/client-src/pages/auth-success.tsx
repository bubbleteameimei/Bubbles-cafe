import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/queryClient';

/**
 * Auth Success Page
 * 
 * This page is shown after successful authentication via OAuth
 * from the backend in cross-domain deployments. It verifies the session
 * and redirects to the home page.
 */
const AuthSuccessPage = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check if the user is authenticated after the OAuth redirect
        // In this case we just need to verify the current auth status
        await apiRequest('/api/auth/status');
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to verify authentication:', err);
        setError('Failed to verify authentication. Please try again.');
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    // Once we confirm authentication, redirect to home page
    if (!isLoading && isAuthenticated && user) {
      toast.success(`Welcome back, ${user.fullName || user.username}!`);
      setLocation('/');
    } else if (!isLoading && !isAuthenticated && !error) {
      // If not authenticated and no error, set an error
      setError('Authentication failed. Please try again.');
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          {isLoading ? (
            <>
              <div className="mb-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Verifying your login...</h2>
              <p className="text-gray-600 dark:text-gray-300">Please wait while we confirm your authentication.</p>
            </>
          ) : error ? (
            <>
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => setLocation('/auth')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Return to Login
              </button>
            </>
          ) : (
            <>
              <div className="text-green-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Login Successful!</h2>
              <p className="text-gray-600 dark:text-gray-300">Redirecting you to the homepage...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthSuccessPage;