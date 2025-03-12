import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithApple } from "@/lib/social-auth";
import { Apple, LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface SocialLoginButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

const SocialLoginButtons = ({ onSuccess, onError }: SocialLoginButtonsProps) => {
  const [isLoading, setIsLoading] = useState({
    google: false,
    apple: false
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(prev => ({ ...prev, google: true }));
      const user = await signInWithGoogle();
      setIsLoading(prev => ({ ...prev, google: false }));
      if (onSuccess) onSuccess(user);
    } catch (error) {
      setIsLoading(prev => ({ ...prev, google: false }));
      console.error('Google sign-in failed:', error);
      if (onError && error instanceof Error) onError(error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(prev => ({ ...prev, apple: true }));
      const user = await signInWithApple();
      setIsLoading(prev => ({ ...prev, apple: false }));
      if (onSuccess) onSuccess(user);
    } catch (error) {
      setIsLoading(prev => ({ ...prev, apple: false }));
      console.error('Apple sign-in failed:', error);
      if (onError && error instanceof Error) onError(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <Button 
        onClick={handleGoogleSignIn} 
        disabled={isLoading.google}
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
        disabled={isLoading.apple}
        className="w-full flex items-center justify-center bg-black hover:bg-gray-900 text-white"
      >
        {isLoading.apple ? (
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : (
          <Apple className="mr-2 h-5 w-5" />
        )}
        Continue with Apple
      </Button>
    </div>
  );
};

export default SocialLoginButtons;