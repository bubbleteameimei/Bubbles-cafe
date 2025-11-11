import { useCallback, useMemo, useState } from 'react';
import './SocialLoginButtons.css';
import { getApiBaseUrl } from '@/lib/asset-path';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SocialLoginButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setStatus('Starting Google sign-in…');

      // Direct Google OAuth only
      const clientId = (import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        const msg = 'Google login not configured: missing VITE_GOOGLE_CLIENT_ID.';
        setStatus(msg);
        throw new Error(msg);
      }

      const apiBase = getApiBaseUrl();
      const redirectUri =
        (import.meta as any)?.env?.VITE_GOOGLE_REDIRECT_URI ||
        (apiBase ? `${apiBase}/api/auth/callback` : '/api/auth/callback');

      const params = new URLSearchParams({
        client_id: String(clientId),
        redirect_uri: String(redirectUri),
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'consent'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      setStatus('Redirecting to Google…');
      window.location.href = authUrl;
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Google login failed');
      setStatus(err.message);
      if (onError) {
        onError(err);
      } else {
        console.error('[SocialLoginButtons] Google login error:', err);
      }
    }
  }, [onError, onSuccess]);

  const disabled = useMemo(() => {
    const clientId = (import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID;
    return !clientId;
  }, []);

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