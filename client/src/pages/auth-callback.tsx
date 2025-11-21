import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [, navigate] = useLocation();
  const { checkAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        const { data } = await supabase.auth.getSession();
        const access_token = data.session?.access_token;
        if (!access_token) {
          throw new Error("No session found from OAuth provider.");
        }
        const resp = await fetch("/api/auth/supabase/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          credentials: "include",
          body: JSON.stringify({ access_token }),
        });
        if (!resp.ok) {
          let msg = `Login failed (status ${resp.status})`;
          try {
            const json = await resp.json();
            msg = json?.message || json?.error || msg;
          } catch {}
          throw new Error(msg);
        }
        await checkAuth().catch(() => {});
        // Bookmark migration is now handled via localStorage on the bookmarks page.
        navigate("/", { replace: true });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Authentication failed.";
        setError(message);
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