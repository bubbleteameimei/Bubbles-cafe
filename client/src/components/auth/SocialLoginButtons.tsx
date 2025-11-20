import { useCallback, useMemo, useState, useEffect } from 'react';
import './SocialLoginButtons.css';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SocialLoginButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

interface GoogleConfig {
  clientId: string | null;
  redirectUri: string;
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [googleConfig, setGoogleConfig] = useState<GoogleConfig | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config/public', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setGoogleConfig(data.googleOAuth || { clientId: null, redirectUri: '' });
        }
      } catch (e) {
        console.error('[SocialLoginButtons] Failed to fetch config:', e);
      } finally {
        setConfigLoaded(true);
      }
    };
    fetchConfig();
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setStatus('Starting Google sign-in…');

      if (!googleConfig?.clientId) {
        const msg = 'Google login not configured.';
        setStatus(msg);
        throw new Error(msg);
      }

      const params = new URLSearchParams({
        client_id: googleConfig.clientId,
        redirect_uri: googleConfig.redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'consent',
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
  }, [googleConfig, onError]);

  const disabled = useMemo(() => {
    return !configLoaded || !googleConfig?.clientId;
  }, [configLoaded, googleConfig]);

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
