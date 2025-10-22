import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { createPortal } from "react-dom";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

export function CookieConsent() {
  // Use our enhanced cookie consent hook
  const { showConsentBanner, acceptAll, acceptEssentialOnly } = useCookieConsent();

  // Return null if the banner shouldn't be shown
  if (!showConsentBanner) return null;

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const acceptBtnRef = useRef<HTMLButtonElement | null>(null);

  // Lock body scroll and handle focus when shown
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    const id = requestAnimationFrame(() => {
      try {
        acceptBtnRef.current?.focus();
      } catch {}
    });
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      cancelAnimationFrame(id);
    };
  }, []);

  // Basic focus trap within the overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = overlayRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (active === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Handle accepting all cookies (3 month expiry)
  const handleAccept = () => {
    acceptAll();
  };

  // Handle accepting only essential cookies (1 week expiry)
  const handleDecline = () => {
    acceptEssentialOnly();
  };

  const overlay = (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="fixed inset-0 z-[1300] bg-black/60 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-[320px] w-full mx-auto bg-card rounded-lg shadow-xl border border-border/50 p-6 space-y-4">
        <div className="flex justify-center relative">
          <svg
            className="w-[50px] h-[50px] transition-all duration-300 hover:rotate-12 hover:scale-110"
            viewBox="0 0 122.88 122.25"
            aria-hidden="true"
          >
            <path
              d="M101.77,49.38c2.09,3.1,4.37,5.11,6.86,5.78c2.45,0.66,5.32,0.06,8.7-2.01c1.36-0.84,3.14-0.41,3.97,0.95c0.28,0.46,0.42,0.96,0.43,1.47c0.13,1.4,0.21,2.82,0.24,4.26c0.03,1.46,0.02,2.91-0.05,4.35h0v0c0,0.13-0.01,0.26-0.03,0.38c-0.91,16.72-8.47,31.51-20,41.93c-11.55,10.44-27.06,16.49-43.82,15.69v0.01h0c-0.13,0-0.26-0.01-0.38-0.03c-16.72-0.91-31.51-8.47-41.93-20C5.31,90.61-0.73,75.1,0.07,58.34H0.07v0c0-0.13,0.01-0.26,0.03-0.38C1,41.22,8.81,26.35,20.57,15.87C32.34,5.37,48.09-0.73,64.85,0.07V0.07h0c1.6,0,2.89,1.29,2.89,2.89c0,0.4-0.08,0.78-0.23,1.12c-1.17,3.81-1.25,7.34-0.27,10.14c0.89,2.54,2.7,4.51,5.41,5.52c1.44,0.54,2.2,2.1,1.74,3.55l0.01,0c-1.83,5.89-1.87,11.08-0.52,15.26c0.82,2.53,2.14,4.69,3.88,6.4c1.74,1.72,3.9,3,6.39,3.78c4.04,1.26,8.94,1.18,14.31-0.55C99.73,47.78,101.08,48.3,101.77,49.38L101.77,49.38z"
              className="fill-[#C4A484]"
            />
            <circle cx="45" cy="25" r="6" className="fill-[#3D1C02]" />
            <circle cx="92" cy="42" r="5" className="fill-[#3D1C02]" />
            <circle cx="35" cy="68" r="7" className="fill-[#3D1C02]" />
            <circle cx="73" cy="55" r="4" className="fill-[#3D1C02]" />
            <circle cx="58" cy="82" r="5" className="fill-[#3D1C02]" />
            <circle cx="25" cy="45" r="4" className="fill-[#3D1C02]" />
            <circle cx="82" cy="75" r="3" className="fill-[#3D1C02]" />
          </svg>
        </div>

        <div className="text-center space-y-2">
          <h2 id="cookie-consent-title" className="text-xl font-bold text-foreground">We use cookies</h2>
          <p id="cookie-consent-description" className="text-sm text-muted-foreground">
            This website uses cookies to enhance your experience. By continuing to use this site, you agree to our{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              privacy policy
            </Link>.
          </p>
          <p className="text-xs text-muted-foreground/80">
            Accept: won't show for 3 months • Decline: won't show for 1 week
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            ref={acceptBtnRef}
            onClick={handleAccept}
            className={cn(
              "px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium",
              "transition-all duration-300 hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            )}
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className={cn(
              "px-6 py-2 rounded-full bg-muted text-muted-foreground font-medium",
              "transition-all duration-300 hover:bg-muted/80 hover:scale-105 hover:shadow-lg"
            )}
          >
            Decline
          </button>
        </div>
      </div>
    </motion.div>
  );

  return typeof document !== "undefined" ? createPortal(overlay, document.body) : overlay;
}