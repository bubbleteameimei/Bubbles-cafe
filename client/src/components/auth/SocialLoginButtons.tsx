import { useCallback, useMemo, useState } from 'react';
import './SocialLoginButtons.css';
import { initSupabase, supabase } from '@/lib/supabase';

interface SocialLoginButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLaunching(true);

      const ready = await initSupabase();
      if (!ready) {
        const msg =
          'Supabase is not configured for Google sign-in. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
        const err = new Error(msg);
        if (onError) onError(err);
        if (import.meta.env?.DEV) {
          console.error('[SocialLoginButtons] Supabase init failed for Google OAuth');
        }
        return;
      }

      const redirectTo =
        typeof window !== 'undefined' && window.location?.origin
          ? `${window.location.origin}/auth/callback`
          : undefined;

      if (import.meta.env?.DEV) {
        console.log('[SocialLoginButtons] Launching Supabase Google OAuth', {
          redirectTo,
        });
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // Supabase will redirect the browser; normally we don't render anything else here.
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Google login failed');
      if (onError) {
        onError(err);
      } else {
        console.error('[SocialLoginButtons] Google login error:', err);
      }
    } finally {
      setIsLaunching(false);
    }
  }, [onError]);

  const disabled = useMemo(() => {
    return isLaunching;
  }, [isLaunching]);

  return (
    <div className="social-auth-buttons">
      <button
        className="social-button google-button"
        type="button"
        onClick={handleGoogleLogin}
        disabled={disabled}
        title={disabled ? 'Google login is not configured' : undefined}
      >
        <img
          src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
          alt=""
          width={18}
          height={18}
          style={{ marginRight: 8 }}
        />
        Sign in with Google
      </button>
      {status && (
        <div className="mt-2">
          <Alert variant={status.toLowerCase().includes('error') ? 'destructive' : 'default'}>
            <AlertTitle>Google Sign-in</AlertTitle>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
