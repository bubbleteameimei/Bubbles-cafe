import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/config/firebase';
import { SiGoogle, SiApple } from 'react-icons/si';
import { Loader2 } from 'lucide-react';
import './SocialLoginButtons.css';
import { User } from 'firebase/auth';

interface SocialUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatar: string | null;
  provider: string;
  token?: string;
}

interface SocialLoginButtonsProps {
  onSuccess: (userData: SocialUser) => void;
  onError: (error: Error) => void;
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const processFirebaseUser = async (user: User, provider: string) => {
    const token = await user.getIdToken();
    return {
      id: user.uid,
      email: user.email,
      fullName: user.displayName,
      avatar: user.photoURL,
      provider,
      token
    };
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        const userData = await processFirebaseUser(result.user, 'google');
        onSuccess(userData);
      }
    } catch (error) {
      
      if (error instanceof Error) {
        onError(error);
      } else {
        onError(new Error('Failed to sign in with Google'));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      // Apple sign-in temporarily disabled - would need additional configuration
      throw new Error('Apple sign-in is not yet configured. Please use Google sign-in or email authentication.');
    } catch (error) {
      
      if (error instanceof Error) {
        onError(error);
      } else {
        onError(new Error('Failed to sign in with Apple'));
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <div className="social-auth-buttons">
      <Button
        variant="outline"
        className="social-button google-button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isAppleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <SiGoogle className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
      
      <Button
        variant="outline"
        className="social-button apple-button"
        onClick={handleAppleSignIn}
        disabled={isGoogleLoading || isAppleLoading}
      >
        {isAppleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <SiApple className="mr-2 h-4 w-4" />
        )}
        Apple
      </Button>
    </div>
  );
}