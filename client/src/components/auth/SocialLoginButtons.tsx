import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/firebase';
import { SiGoogle } from 'react-icons/si';
import { Loader2 } from 'lucide-react';
import './SocialLoginButtons.css';
import { User } from 'firebase/auth';

interface SocialUser {
  id: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  provider: string;
  token?: string;
}

interface SocialLoginButtonsProps {
  onSuccess: (userData: SocialUser) => void;
  onError: (error: Error) => void;
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const processFirebaseUser = async (user: User, provider: string) => {
    const token = await user.getIdToken();
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      provider,
      token
    };
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const userCredential = await signInWithGoogle();
      if (userCredential) {
        const userData = await processFirebaseUser(userCredential, 'google');
        onSuccess(userData);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error instanceof Error) {
        onError(error);
      } else {
        onError(new Error('Failed to sign in with Google'));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="social-auth-buttons">
      <Button
        variant="outline"
        className="social-button google-button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <SiGoogle className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
      
      {/* Apple auth removed */}
    </div>
  );
}