import { useCallback } from 'react';
import './SocialLoginButtons.css';
import { supabase } from '@/lib/supabase';

interface SocialLoginButtonsProps {
  onSuccess: (userData: any) => void;
  onError: (error: Error) => void;
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const handleGoogleLogin = useCallback(async () => {
    try {
      const redirectTo = `${window.location.origin}/auth-success`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
      if (error) {
        throw new Error(error.message || 'Google login failed');
      }
      // supabase will redirect; we don't call onSuccess here
    } catch (e) {
      onError(e instanceof Error ? e : new Error('Google login failed'));
    }
  }, [onError]);

  return (
    <div className="social-auth-buttons">
      <button className="social-button google-button" type="button" onClick={handleGoogleLogin}>
        Continue with Google
      </button>
    </div>
  );
}