import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

/**
 * Utility to decode a JWT (base64url) payload without verification.
 * Used to extract email, sub, name, and picture from Google's id_token.
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Extract CSRF token from cookie to satisfy backend CSRF protection.
 */
function getCsrfTokenFromCookie(): string {
  try {
    return document.cookie.replace(
      /(?:(?:^|.*;\s*)XSRF-TOKEN\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
  } catch {
    return "";
  }
}

export default function AuthCallbackPage() {
  const [, navigate] = useLocation();
  const { checkAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);

        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const idToken = url.searchParams.get("id_token");
        const accessToken = url.searchParams.get("access_token");

        // Show debug info only in development
        if (import.meta.env?.DEV) {
          console.log("[AuthCallback] Params:", { code, idToken, accessToken });
        }

        // Prefer using id_token (contains user claims)
        if (idToken) {
          const claims = decodeJwtPayload(idToken);
          if (!claims) {
            throw new Error("Invalid ID token received from Google.");
          }

          const email =
            (claims.email as string | undefined) ||
            (claims.emails?.[0] as string | undefined);
          const socialId = claims.sub as string | undefined;
          const username =
            (claims.name as string | undefined) ||
            (email ? email.split("@")[0] : undefined);
          const photoURL = claims.picture as string | undefined;

          if (!email || !socialId) {
            throw new Error(
              "Missing required user info in ID token (email/sub)."
            );
          }

          const csrfToken = getCsrfTokenFromCookie();
          const resp = await fetch("/api/auth/social-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
            },
            credentials: "include",
            body: JSON.stringify({
              provider: "google",
              email,
              socialId,
              username,
              photoURL,
              token: idToken,
            }),
          });

          if (!resp.ok) {
            let msg = `Social login failed (status ${resp.status})`;
            try {
              const data = await resp.json();
              msg = data?.message || data?.error || msg;
            } catch {}
            throw new Error(msg);
          }

          // Update auth state and redirect to home
          await checkAuth().catch(() => {});
          navigate("/", { replace: true });
          return;
        }

        // Fallback: if only authorization code is present, send it to backend (if supported)
        if (code) {
          const csrfToken = getCsrfTokenFromCookie();
          const resp = await fetch("/api/auth/social-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
            },
            credentials: "include",
            body: JSON.stringify({
              provider: "google",
              token: code,
              grantType: "authorization_code",
            }),
          });

          if (!resp.ok) {
            let msg =
              "Authorization code received, but backend verification is not configured.";
            try {
              const data = await resp.json();
              msg = data?.message || data?.error || msg;
            } catch {}
            throw new Error(msg);
          }

          await checkAuth().catch(() => {});
          navigate("/", { replace: true });
          return;
        }

        // No recognizable token
        throw new Error(
          "No authorization code or ID token found in the URL. Please try signing in again."
        );
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Authentication failed.";
        setError(message);
        if (import.meta.env?.DEV) {
          console.error("[AuthCallback] Error:", e);
        }
      }
    };

    run();
  }, [navigate, checkAuth]);

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <div className="flex flex-col items-center text-center space-y-4">
        {!error ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Signing you in…</p>
          </>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>Sign-in Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}