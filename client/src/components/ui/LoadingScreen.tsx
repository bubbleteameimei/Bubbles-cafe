import { memo, useEffect, useState } from "react";

const LETTERS = ["L", "O", "A", "D", "I", "N", "G"];

interface LoadingScreenProps {
  /**
   * "page" (default): covers the page area below the navbar, so the menu stays usable
   * while a page loads. "inline": fills its container (e.g. a section loading in place).
   */
  variant?: "page" | "inline";
  /** Screen-reader text. */
  label?: string;
  /** Wait this long before appearing, so fast loads never flash a loader. */
  delayMs?: number;
}

/**
 * Site-wide loading animation: the letters of LOADING blur in and out in sequence.
 *
 * Based on the owner's design, with: theme colours (the original hard-coded white text
 * vanished in light mode), the missing `blur` keyframes defined (in index.css), a short
 * delay so quick navigations don't flash, the navbar left uncovered, and a gentle pulse
 * instead of blurring for people who prefer reduced motion.
 */
export const LoadingScreen = memo(function LoadingScreen({
  variant = "page",
  label = "Loading content, please wait…",
  delayMs = 200,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  const position =
    variant === "page"
      ? "fixed inset-x-0 bottom-0 top-[var(--navbar-height,56px)] z-40 bg-background"
      : "w-full min-h-[50vh]";

  return (
    <div
      className={`${position} flex flex-col items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-busy="true"
    >
      <div className="loading-letters" aria-hidden="true">
        {LETTERS.map((letter, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.2}s` }}>
            {letter}
          </span>
        ))}
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {label}
      </div>
    </div>
  );
});

export default LoadingScreen;
