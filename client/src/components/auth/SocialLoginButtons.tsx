import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { initSupabase, supabase } from '@/lib/supabase';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/** Where to send the visitor after sign-in (read by /auth/callback). */
export const AUTH_RETURN_KEY = 'auth:returnTo';
/** Last page visited that isn't a sign-in page (kept by RouteScrollManager). */
export const LAST_PAGE_KEY = 'nav:lastPage';

export default function SocialLoginButtons({ onError }: SocialLoginButtonsProps) {
  const [isLaunching, setIsLaunching] = useState(false);

  // Load the sign-in library as soon as the sign-in page opens, so tapping the button
  // responds immediately instead of waiting for a download first.
  useEffect(() => {
    void initSupabase();
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setIsLaunching(true);
    try {
      const ready = await initSupabase();
      if (!ready) throw new Error('Google sign-in is unavailable right now. Please try again shortly.');

      // Remember where the visitor was, so the callback can bring them back there.
      try {
        sessionStorage.setItem(AUTH_RETURN_KEY, sessionStorage.getItem(LAST_PAGE_KEY) || '/');
      } catch {}

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
      // The browser is now leaving for Google; keep the button in its busy state.
    } catch (e) {
      setIsLaunching(false);
      const err = e instanceof Error ? e : new Error('Google sign-in failed');
      if (onError) onError(err);
      else console.error('[SocialLoginButtons] Google login error:', err);
    }
  }, [onError]);

  return (
    <div className="social-auth-buttons">
      <button
        className="social-button google-button"
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLaunching}
        aria-busy={isLaunching}
      >
        {isLaunching ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin" style={{ marginRight: 8 }} aria-hidden="true" />
        ) : (
          <img
            src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
            alt=""
            width={18}
            height={18}
            style={{ marginRight: 8 }}
          />
        )}
        {isLaunching ? 'Redirecting to Google…' : 'Sign in with Google'}
      </button>
    </div>
  );
}
