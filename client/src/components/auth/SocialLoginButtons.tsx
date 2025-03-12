import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithApple } from "@/lib/social-auth";
import { auth } from "@/lib/firebase";
import { Apple, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the type for social user data returned from Firebase
export type SocialUserData = {
  id: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  provider: string;
};

interface SocialLoginButtonsProps {
  onSuccess?: (userData: SocialUserData) => void;
  onError?: (error: Error) => void;
}

/**
 * Parses Firebase error codes into user-friendly messages
 */
const getReadableErrorMessage = (error: any): string => {
  // If error is a Firebase error
  if (error && error.code) {
    switch(error.code) {
      case 'auth/cancelled-popup-request':
        return 'The authentication popup was closed before completion.';
      case 'auth/popup-blocked':
        return 'The authentication popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/popup-closed-by-user':
        return 'The authentication popup was closed before completion.';
      case 'auth/internal-error':
        return 'Authentication service encountered an error. This may be due to missing API credentials.';
      case 'auth/network-request-failed':
        return 'A network error occurred. Please check your connection and try again.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact the administrator.';
      case 'auth/invalid-api-key':
        return 'The Firebase API key is invalid. Social login cannot function.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for Firebase authentication.';
      default:
        return `Authentication error: ${error.message || error.code}`;
    }
  }
  
  // For non-Firebase errors or unknown structures
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred during sign-in.';
};

const SocialLoginButtons = ({ onSuccess, onError }: SocialLoginButtonsProps) => {
  const [isLoading, setIsLoading] = useState({
    google: false,
    apple: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Clear error when user attempts to sign in again
  const clearError = () => setError(null);

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      setIsLoading(prev => ({ ...prev, google: true }));
      
      // Check if Firebase auth is initialized
      if (!auth) {
        throw new Error('Firebase authentication is not initialized. Please check API credentials.');
      }
      
      const user = await signInWithGoogle();
      setIsLoading(prev => ({ ...prev, google: false }));
      if (onSuccess && user) onSuccess(user);
    } catch (error) {
      setIsLoading(prev => ({ ...prev, google: false }));
      console.error('Google Sign-In Error:', error);
      
      // Get readable error message
      const errorMessage = getReadableErrorMessage(error);
      setError(errorMessage);
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  const handleAppleSignIn = async () => {
    clearError();
    try {
      setIsLoading(prev => ({ ...prev, apple: true }));
      
      // Check if Firebase auth is initialized
      if (!auth) {
        throw new Error('Firebase authentication is not initialized. Please check API credentials.');
      }
      
      const user = await signInWithApple();
      setIsLoading(prev => ({ ...prev, apple: false }));
      if (onSuccess && user) onSuccess(user);
    } catch (error) {
      setIsLoading(prev => ({ ...prev, apple: false }));
      console.error('Apple Sign-In Error:', error);
      
      // Get readable error message
      const errorMessage = getReadableErrorMessage(error);
      setError(errorMessage);
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleGoogleSignIn} 
        disabled={isLoading.google || isLoading.apple}
        className="w-full flex items-center justify-center bg-white hover:bg-gray-100 text-black border border-gray-300"
        type="button"
      >
        {isLoading.google ? (
          <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : (
          <FcGoogle className="mr-2 h-5 w-5" />
        )}
        Continue with Google
      </Button>
      
      <Button 
        onClick={handleAppleSignIn} 
        disabled={isLoading.apple || isLoading.google}
        className="w-full flex items-center justify-center bg-black hover:bg-gray-900 text-white"
        type="button"
      >
        {isLoading.apple ? (
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : (
          <Apple className="mr-2 h-5 w-5" />
        )}
        Continue with Apple
      </Button>
      
      <p className="text-xs text-center text-muted-foreground mt-2">
        By continuing with social sign-in, you agree to our Terms of Service and Privacy Policy.
      </p>
      
      {/* Show a note about Firebase credentials if there's an internal error */}
      {error && error.includes('missing API credentials') && (
        <div className="mt-2 text-xs text-amber-600 p-2 bg-amber-50 rounded-md border border-amber-200">
          <p className="font-medium">Configuration Required</p>
          <p>Firebase credentials are required for social login. Please add VITE_FIREBASE_API_KEY and related environment variables.</p>
        </div>
      )}
    </div>
  );
};

export default SocialLoginButtons;