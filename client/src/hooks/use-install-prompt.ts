import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/**
 * useInstallPrompt
 * Captures Chrome's `beforeinstallprompt` and exposes a function to trigger the install UI.
 * iOS does not support this event; the hook will report `isInstallable=false` there.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      // Clear prompt after user interaction
      setDeferredPrompt(null);
      setInstallable(false);
      return choice.outcome === "accepted";
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  return { isInstallable, install, deferredPrompt };
}