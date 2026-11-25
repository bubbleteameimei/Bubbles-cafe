import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase, initSupabase } from "@/lib/supabase";
import { AUTH_RETURN_KEY } from "@/components/auth/SocialLoginButtons";

type Step = "session" | "server" | "slow" | "done";

const STEP_TEXT: Record<Step, string> = {
  session: "Signing you in…",
  server: "Finishing sign-in…",
  slow: "Waking up the server, this can take up to a minute…",
  done: "Signed in! Taking you back…",
};

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => {
        window.clearTimeout(t);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(t);
        reject(e);
      },
    );
  });
}

/**
 * Google sign-in lands here (/auth/callback#access_token=…).
 *
 * The tokens are read from the URL immediately, so nothing that happens later (the
 * library clearing the URL, a reload, a slow start) can lose them; the session is set
 * explicitly if the library didn't pick it up. Every step shows progress, a slow API
 * (Render waking up) gets a message, and any failure shows an error with "Try again"
 * instead of silently leaving the visitor signed out.
 */
export default function AuthCallbackPage() {
  const [, navigate] = useLocation();
  const { checkAuth } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("session");
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  // Capture the URL fragment before anything can clear it.
  const [params] = useState(() => {
    const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const hash = new URLSearchParams(raw);
    const query = new URLSearchParams(window.location.search);
    return {
      accessToken: hash.get("access_token"),
      refreshToken: hash.get("refresh_token"),
      error: hash.get("error_description") || query.get("error_description") || hash.get("error") || query.get("error"),
    };
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      try {
        if (params.error) throw new Error(params.error.replace(/\+/g, " "));

        if (!(await initSupabase())) throw new Error("Sign-in is unavailable right now. Please try again shortly.");

        let { data } = await withTimeout<any>(
          supabase.auth.getSession(),
          15000,
          "Google sign-in took too long to complete.",
        );
        let session = data?.session ?? null;
        if (!session && params.accessToken && params.refreshToken) {
          const res = await withTimeout<any>(
            supabase.auth.setSession({ access_token: params.accessToken, refresh_token: params.refreshToken }),
            15000,
            "Google sign-in took too long to complete.",
          );
          if (res.error) throw res.error;
          session = res.data.session;
        }
        const accessToken = session?.access_token;
        if (!accessToken) throw new Error("Google didn't return a sign-in session. Please try again.");

        // Create the site profile on the API (it may need a moment to wake up).
        setStep("server");
        const slowTimer = window.setTimeout(() => setStep("slow"), 4000);
        const login = async () => {
          const resp = await fetch("/api/auth/supabase/login", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            credentials: "include",
            body: JSON.stringify({ access_token: accessToken }),
          });
          if (!resp.ok) {
            let msg = `Sign-in failed (status ${resp.status}).`;
            try {
              const json = await resp.json();
              msg = json?.message || json?.error || msg;
            } catch {}
            throw new Error(msg);
          }
          return resp.json().catch(() => ({}));
        };
        let body: any;
        try {
          body = await withTimeout(login(), 70000, "The server didn't respond. Please try again.");
        } catch (first) {
          // One retry covers a server that was still starting up.
          body = await withTimeout(login(), 70000, first instanceof Error ? first.message : "Sign-in failed.").catch(
            () => {
              throw first;
            },
          );
        } finally {
          window.clearTimeout(slowTimer);
        }

        await checkAuth().catch(() => {});
        setStep("done");
        const name = body?.user?.fullName || body?.user?.username || body?.user?.email;
        toast({ title: "Signed in", description: name ? `Welcome, ${name}.` : "You're now signed in." });

        let returnTo = "/";
        try {
          returnTo = sessionStorage.getItem(AUTH_RETURN_KEY) || "/";
          sessionStorage.removeItem(AUTH_RETURN_KEY);
        } catch {}
        if (!returnTo.startsWith("/") || returnTo.startsWith("/auth")) returnTo = "/";
        navigate(returnTo, { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign-in failed. Please try again.");
      }
    };
    void run();
  }, [params, navigate, checkAuth, toast]);

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <div className="flex flex-col items-center text-center space-y-4">
        {!error ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {STEP_TEXT[step]}
            </p>
          </>
        ) : (
          <>
            <Alert variant="destructive" className="text-left">
              <AlertTitle>Couldn't sign you in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/auth", { replace: true })}>Try again</Button>
              <Button variant="outline" onClick={() => navigate("/", { replace: true })}>
                Back to home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
