import React, { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { createPortal } from 'react-dom';
import '@/styles/eyeball-loader.css';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scroll-lock';

interface SimplifiedErrorPageProps {
  statusCode: number;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
}

/**
 * SimplifiedErrorPage
 * 
 * A consistent error page component that can be used anywhere in the application
 * without causing hook ordering issues.
 * Renders via a portal to the document.body to avoid clipping/stacking issues.
 */
const SimplifiedErrorPage: React.FC<SimplifiedErrorPageProps> = ({
  statusCode,
  title,
  message,
  actionText = 'Go Home',
  actionLink = '/'
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const firstActionRef = useRef<HTMLAnchorElement | null>(null);

  // Mark body so global layout can hide non-error-only elements like the footer
  useEffect(() => {
    document.body.classList.add('error-page-active');
    // Lock scroll while overlay is visible (standardized to avoid layout shifts)
    lockBodyScroll('error-page');

    // Focus the primary action for accessibility
    const id = requestAnimationFrame(() => {
      try {
        firstActionRef.current?.focus();
      } catch {}
    });

    return () => {
      document.body.classList.remove('error-page-active');
      unlockBodyScroll('error-page');
      cancelAnimationFrame(id);
    };
  }, []);

  // Basic focus trapping within the overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const root = overlayRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);

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

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex flex-col items-center justify-center text-center bg-background/95 backdrop-blur-sm z-[1200]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-title"
      aria-describedby="error-description"
    >
      <div className="space-y-4 px-4">
        {/* Animated eyeball loader */}
        <div className="flex justify-center mb-6">
          <div className="eyeball-loader" aria-hidden="true"></div>
        </div>

        <div className="text-9xl font-creepster text-red-600">{statusCode}</div>
        <h1 id="error-title" className="text-4xl font-specialElite tracking-tighter sm:text-5xl">
          {title}
        </h1>
        <p id="error-description" className="text-muted-foreground max-w-[42rem] leading-normal sm:text-xl sm:leading-8">
          {message}
        </p>
        <div className="mt-8">
          <Link
            href={actionLink}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            ref={firstActionRef as any}
          >
            {actionText}
          </Link>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(overlay, document.body) : overlay;
};

export default SimplifiedErrorPage;