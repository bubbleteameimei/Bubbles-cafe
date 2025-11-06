import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCookieConsent } from '@/hooks/use-cookie-consent';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    GA_MEASUREMENT_ID?: string;
  }
}

/**
 * GA4 integration that respects cookie consent (analytics category).
 * - Injects GA only when analytics consent is granted.
 * - Cleans up on unmount or when consent is revoked.
 */
export default function GA4() {
  const [location] = useLocation();
  const { cookiePreferences } = useCookieConsent();
  const analyticsAllowed = !!cookiePreferences.analytics;

  useEffect(() => {
    if (!analyticsAllowed) {
      return;
    }

    const id =
      (import.meta as any)?.env?.VITE_GA_MEASUREMENT_ID ||
      (typeof window !== 'undefined' ? window.GA_MEASUREMENT_ID : undefined);

    if (!id || typeof document === 'undefined') return;

    // Avoid double-injecting
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    if (!document.querySelector('script[data-ga4="loader"]')) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      s.setAttribute('data-ga4', 'loader');
      document.head.appendChild(s);

      const script = document.createElement('script');
      script.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${id}', { send_page_view: false });
      `;
      document.head.appendChild(script);
    }

    // Send SPA page_view on route change
    const sendPageView = () => {
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'page_view', {
            page_path: location || window.location.pathname,
            page_location: window.location.href,
            page_title: document.title,
          });
        }
      } catch {}
    };

    // Initial page_view after script injection
    const ric = (window as any)?.requestIdleCallback as any;
    if (typeof ric === 'function') {
      ric(() => sendPageView(), { timeout: 1500 });
    } else {
      setTimeout(sendPageView, 300);
    }

    // Cleanup when consent is revoked or component unmounts
    return () => {
      try {
        // Best-effort: neutralize gtag and datalayer
        if (typeof window !== 'undefined') {
          window.gtag = undefined;
          if (Array.isArray(window.dataLayer)) {
            window.dataLayer.length = 0;
          }
        }
        // Remove GA loader script to avoid future network calls
        const loader = document.querySelector('script[data-ga4="loader"]');
        if (loader?.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      } catch {}
    };
  }, [analyticsAllowed, location]);

  // Do not render or inject anything if analytics is not allowed
  if (!analyticsAllowed) return null;

  return null;
}