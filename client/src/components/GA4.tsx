import { useEffect } from 'react';
import { useLocation } from 'wouter';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    GA_MEASUREMENT_ID?: string;
  }
}

/**
 * GA4 lightweight integration.
 * - Reads the measurement ID from Vite env VITE_GA_MEASUREMENT_ID or window.GA_MEASUREMENT_ID
 * - Injects gtag script once
 * - Sends SPA page_view events on route changes (send_page_view disabled on config)
 */
export default function GA4() {
  const [location] = useLocation();

  useEffect(() => {
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
  }, [location]);

  return null;
}