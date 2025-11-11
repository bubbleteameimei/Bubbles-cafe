import { useCallback, useMemo } from 'react';
import './SocialLoginButtons.css';
import { supabase } from '@/lib/supabase';
import { getApiBaseUrl } from '@/lib/asset-path';

interface SocialLoginButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const supabaseConfigured = useMemo(() => {
    try {
      const url = (import.meta as any)?.env?.VITE_SUPABASE_URL;
      const key = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY;
      return Boolean(url && key);
    } catch {
      return false;
    }
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    try {
      if (supabaseConfigured) {
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
        return;
      }

      // Fallback: initiate direct Google OAuth code flow when Supabase is not configured
      const clientId = (import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID;
      const apiBase = getApiBaseUrl();
      const redirectUri =
        (import.meta as any)?.env?.VITE_GOOGLE_REDIRECT_URI ||
        (apiBase ? `${apiBase}/api/auth/callback` : '/api/auth/callback');

      if (!clientId) {
        throw new Error('Google login is not configured');
      }

      const params = new URLSearchParams({
        client_id: String(clientId),
        redirect_uri: String(redirectUri),
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'consent'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      window.location.href = authUrl;
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Google login failed');
      if (onError) {
        onError(err);
      } else {
        console.error('[SocialLoginButtons] Google login error:', err);
        alert(err.message);
      }
    }
  }, [supabaseConfigured, onError, onSuccess]);

  const disabled = useMemo(() => {
    // Disable button only if neither Supabase nor Google OAuth is configured
    const clientId = (import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID;
    return !supabaseConfigured && !clientId;
  }, [supabaseConfigured]);

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
    </div>
  );
}