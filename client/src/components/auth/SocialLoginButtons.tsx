import { useEffect, useRef, useState } from 'react';
import './SocialLoginButtons.css';

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

/**
 * Decode a JWT (base64url) payload without verification.
 * Used to extract email, sub, name, and picture from Google's id_token.
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const handleCredentialResponse = (response: any) => {
      try {
        const idToken = response?.credential as string | undefined;
        if (!idToken) {
          throw new Error('Missing credential from Google');
        }
        const claims = decodeJwtPayload(idToken);
        const email =
          (claims?.email as string | undefined) ||
          (claims?.emails?.[0] as string | undefined) ||
          null;
        const socialId = (claims?.sub as string | undefined) || '';
        const name = (claims?.name as string | undefined) || null;
        const photoURL = (claims?.picture as string | undefined) || null;

        const userData: SocialUser = {
          id: socialId,
          email,
          name,
          photoURL,
          provider: 'google',
          token: idToken
        };
        onSuccess(userData);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to process Google credential');
        onError(err);
      }
    };

    const tryInit = () => {
      const google = (window as any).google;
      if (!google || !google.accounts || !google.accounts.id) {
        return false;
      }

      // Read client_id from the g_id_onload element if available, else fallback to provided ID
      const setupEl = document.getElementById('g_id_onload') as HTMLDivElement | null;
      const clientId = setupEl?.dataset?.clientId || '507042442187-17u8iqde1aeogo405iskul1t5dbr1kos.apps.googleusercontent.com';

      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
      });

      if (containerRef.current) {
        google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rect',
          width: 260
        });
      }
      return true;
    };

    if (!initialized) {
      // Attempt immediate initialization
      const ok = tryInit();
      if (ok) {
        setInitialized(true);
      } else {
        // Poll for GIS script readiness up to ~2 seconds
        let attempts = 0;
        const interval = setInterval(() => {
          if (cancelled) {
            clearInterval(interval);
            return;
          }
          attempts += 1;
          const ok2 = tryInit();
          if (ok2) {
            setInitialized(true);
            clearInterval(interval);
          } else if (attempts > 20) {
            clearInterval(interval);
            onError(new Error('Google Identity Services failed to initialize'));
          }
        }, 100);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [initialized, onSuccess, onError]);

  return (
    <div className="social-auth-buttons">
      <div ref={containerRef} />
    </div>
  );
}