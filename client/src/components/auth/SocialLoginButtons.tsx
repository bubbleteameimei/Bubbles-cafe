import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithApple } from "@/lib/social-auth";
import { auth } from "@/lib/firebase";
import { Apple, AlertCircle, LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SocialLoginButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

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
      
      // Check if Firebase auth is properly initialized
      if (!window.firebase?.auth && typeof auth === 'undefined') {
        throw new Error('Firebase authentication is not properly initialized. This may be due to missing API credentials.');
      }
      
      const user = await signInWithGoogle();
      setIsLoading(prev => ({ ...prev, google: false }));
      if (onSuccess) onSuccess(user);
    } catch (error) {
      setIsLoading(prev => ({ ...prev, google: false }));
      console.error('Google sign-in failed:', error);
      
      // Display friendly error message to user
      if (error instanceof Error) {
        // Handle specific Firebase errors
        if (error.message.includes('internal-error') || 
            error.message.includes('auth/internal-error')) {
          setError('Authentication service is unavailable. This may be due to missing API credentials or network restrictions.');
        } else {
          setError(error.message);
        }
        if (onError) onError(error);
      } else {
        setError('An unexpected error occurred during sign-in');
      }
    }
  };

  const handleAppleSignIn = async () => {
    clearError();
    try {
      setIsLoading(prev => ({ ...prev, apple: true }));
      
      // Check if Firebase auth is properly initialized
      if (!window.firebase?.auth && typeof auth === 'undefined') {
        throw new Error('Firebase authentication is not properly initialized. This may be due to missing API credentials.');
      }
      
      const user = await signInWithApple();
      setIsLoading(prev => ({ ...prev, apple: false }));
      if (onSuccess) onSuccess(user);
    } catch (error) {
      setIsLoading(prev => ({ ...prev, apple: false }));
      console.error('Apple sign-in failed:', error);
      
      // Display friendly error message to user
      if (error instanceof Error) {
        // Handle specific Firebase errors
        if (error.message.includes('internal-error') || 
            error.message.includes('auth/internal-error')) {
          setError('Authentication service is unavailable. This may be due to missing API credentials or network restrictions.');
        } else if (error.message.includes('operation-not-allowed') || 
                  error.message.includes('auth/operation-not-allowed')) {
          setError('Apple Sign-In is not enabled in the Firebase console. Please contact the administrator.');
        } else {
          setError(error.message);
        }
        if (onError) onError(error);
      } else {
        setError('An unexpected error occurred during sign-in');
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
    </div>
  );
};

export default SocialLoginButtons;