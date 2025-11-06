import { useCallback } from 'react';
import './SocialLoginButtons.css';
import { supabase } from '@/lib/supabase';

interface SocialLoginButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const handleGoogleLogin = useCallback(async () => {
    try {
      const redirectTo = `${window.location.origin}/auth/success`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
      if (error) {
        throw new Error(error.message || 'Google login failed');
      }
      // Supabase will perform a full redirect to /auth/success; no client onSuccess callback needed
      void onSuccess; // keep param referenced to avoid unused var lint if present
    } catch (e) {
      if (onError) {
        onError(e instanceof Error ? e : new Error('Google login failed'));
      } else {
        // Fallback logging when no handler is provided
        console.error('[SocialLoginButtons] Google login error:', e);
      }
    }
  }, [onError, onSuccess]);

  return (
    <div className="social-auth-buttons">
      <button className="social-button google-button" type="button" onClick={handleGoogleLogin}>
        <img
          src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
          alt=""
          width={18}
          height={18}
          style={{ marginRight: 8 }}
        />
        Sign in with Google
      </button>
    </div>
  );
}