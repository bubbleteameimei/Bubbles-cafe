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
      const debug: Record<string, any> = {};
      try {
        const res = await fetch('/api/config/public', { credentials: 'include' });
        let next: GoogleConfig = { clientId: null, redirectUri: '' };

        if (res.ok) {
          const data = await res.json();
          debug.serverConfig = data;
          const fromServer = (data && data.googleOAuth) as GoogleConfig | undefined;
          if (fromServer && (fromServer.clientId || fromServer.redirectUri)) {
            next = {
              clientId: fromServer.clientId,
              redirectUri: fromServer.redirectUri,
            };
          }
        } else {
          debug.serverStatus = res.status;
        }

        // Fallback to Vite-provided env config when server config is missing/partial
        try {
          const envAny: any = (import.meta as any)?.env || {};
          const viteClientId = envAny.VITE_GOOGLE_CLIENT_ID as string | undefined;
          const viteRedirectUri = envAny.VITE_GOOGLE_LOGIN_URI as string | undefined;
          debug.viteEnv = {
            VITE_GOOGLE_CLIENT_ID: viteClientId ? '[set]' : undefined,
            VITE_GOOGLE_LOGIN_URI: viteRedirectUri ? viteRedirectUri : undefined,
          };

          if (!next.clientId && typeof viteClientId === 'string' && viteClientId.trim()) {
            next.clientId = viteClientId.trim();
          }

          if (!next.redirectUri) {
            if (typeof viteRedirectUri === 'string' && viteRedirectUri.trim()) {
              next.redirectUri = viteRedirectUri.trim();
            } else if (typeof window !== 'undefined' && window.location?.origin) {
              next.redirectUri = `${window.location.origin}/api/auth/callback`;
            }
          }
        } catch (envErr) {
          debug.envError = envErr instanceof Error ? envErr.message : String(envErr);
        }

        debug.finalConfig = next;
        if (import.meta.env?.DEV) {
          console.log('[SocialLoginButtons] Google OAuth config resolved:', debug);
        }
        setGoogleConfig(next);
      } catch (e) {
        console.error('[SocialLoginButtons] Failed to fetch config:', e);
        // Last-resort: try to build config purely from Vite env
        try {
          const envAny: any = (import.meta as any)?.env || {};
          const viteClientId = envAny.VITE_GOOGLE_CLIENT_ID as string | undefined;
          const viteRedirectUri = envAny.VITE_GOOGLE_LOGIN_URI as string | undefined;
          const fallback: GoogleConfig = {
            clientId: viteClientId && viteClientId.trim() ? viteClientId.trim() : null,
            redirectUri:
              (viteRedirectUri && viteRedirectUri.trim()) ||
              (typeof window !== 'undefined' && window.location?.origin
                ? `${window.location.origin}/api/auth/callback`
                : ''),
          };
          if (import.meta.env?.DEV) {
            console.log('[SocialLoginButtons] Using fallback Vite-only config:', {
              hasClientId: !!fallback.clientId,
              redirectUri: fallback.redirectUri,
            });
          }
          setGoogleConfig(fallback);
        } catch (envFallbackErr) {
          console.error(
            '[SocialLoginButtons] Failed to build fallback Google config from Vite env:',
            envFallbackErr,
          );
          // keep googleConfig as null
        }
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
