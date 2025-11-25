import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import CreepyTextGlitch from '@/components/errors/CreepyTextGlitch';

interface ReaderHorrorOverlayState {
  showHorrorMessage: boolean;
  horrorMessageText: string;
  triggerRapidNavigation: () => void;
  handleOverlayClose: () => void;
}

/**
 * Encapsulates the horror easter-egg overlay and its navigation heuristics.
 *
 * This preserves the existing behaviour (including sessionStorage keys and
 * time-based gating) while keeping the reader page component itself smaller.
 */
export function useReaderHorrorOverlay(): ReaderHorrorOverlayState {
  const [showHorrorMessage, setShowHorrorMessage] = useState(false);
  const [horrorMessageText, setHorrorMessageText] = useState('Are you avoiding something?');

  const skipCountRef = useRef(0);
  const lastNavigationTimeRef = useRef<number>(Date.now());

  const { toast } = useToast();

  // Restore rapid navigation counters across remounts.
  useEffect(() => {
    try {
      const savedSkip = parseInt(sessionStorage.getItem('reader_skip_count') || '0', 10);
      if (Number.isFinite(savedSkip)) {
        skipCountRef.current = savedSkip;
      }
      const savedLast = parseInt(sessionStorage.getItem('reader_last_nav_time') || '0', 10);
      if (Number.isFinite(savedLast) && savedLast > 0) {
        lastNavigationTimeRef.current = savedLast;
      }
    } catch {
      // ignore – overlay is non-critical
    }
  }, []);

  // Restore overlay state if it was active recently.
  useEffect(() => {
    try {
      const active = sessionStorage.getItem('reader_horror_active') === '1';
      const expiry = parseInt(sessionStorage.getItem('reader_horror_expiry_ts') || '0', 10);
      const msg = sessionStorage.getItem('reader_horror_message') || '';
      const now = Date.now();

      if (active && Number.isFinite(expiry) && expiry > now) {
        setHorrorMessageText(msg || 'I SEE YOU SKIPPING!!!');
        setShowHorrorMessage(true);

        const remaining = expiry - now;
        window.setTimeout(() => {
          setShowHorrorMessage(false);
          try {
            sessionStorage.removeItem('reader_horror_active');
            sessionStorage.removeItem('reader_horror_message');
            sessionStorage.removeItem('reader_horror_expiry_ts');
          } catch {
            // ignore
          }
        }, remaining);
      } else {
        sessionStorage.removeItem('reader_horror_active');
        sessionStorage.removeItem('reader_horror_message');
        sessionStorage.removeItem('reader_horror_expiry_ts');
      }
    } catch {
      // ignore – overlay is non-critical
    }
  }, []);

  const resetOverlayState = () => {
    setShowHorrorMessage(false);
    skipCountRef.current = 0;
    try {
      sessionStorage.setItem('reader_skip_count', '0');
      sessionStorage.removeItem('reader_horror_active');
      sessionStorage.removeItem('reader_horror_message');
      sessionStorage.removeItem('reader_horror_expiry_ts');
    } catch {
      // ignore
    }
  };

  const handleOverlayClose = () => {
    resetOverlayState();
  };

  const triggerRapidNavigation = () => {
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTimeRef.current;

    // Check if rapid navigation (less than 1.5 seconds between skips).
    if (timeSinceLastNavigation < 1500) {
      skipCountRef.current += 1;
      try {
        sessionStorage.setItem('reader_skip_count', String(skipCountRef.current));
      } catch {
        // ignore
      }

      // After 3 rapid skips, show the horror Easter egg.
      if (skipCountRef.current >= 3 && !showHorrorMessage) {
        if (import.meta.env?.DEV) {
          // eslint-disable-next-line no-console
          console.log('[ReaderHorror] Easter egg triggered after rapid navigation');
        }

        const message = 'I SEE YOU SKIPPING!!!';
        setHorrorMessageText(message);
        setShowHorrorMessage(true);

        // Persist overlay state so it survives remounts.
        try {
          sessionStorage.setItem('reader_horror_active', '1');
          sessionStorage.setItem('reader_horror_message', message);
          sessionStorage.setItem('reader_horror_expiry_ts', String(now + 9000));
        } catch {
          // ignore
        }

        // Toast with the same creepy effect as before.
        toast({
          title: 'NOTICE',
          description: <CreepyTextGlitch text={message} intensityFactor={8} />,
          variant: 'destructive',
          duration: 9000,
        });

        // Reset after showing – match the toast duration.
        window.setTimeout(() => {
          resetOverlayState();
        }, 9000);
      }
    } else {
      // If navigation slows down, gradually reduce the skip count.
      skipCountRef.current = Math.max(0, skipCountRef.current - 1);
      try {
        sessionStorage.setItem('reader_skip_count', String(skipCountRef.current));
      } catch {
        // ignore
      }
    }

    // Always update last navigation time.
    lastNavigationTimeRef.current = now;
    try {
      sessionStorage.setItem('reader_last_nav_time', String(now));
    } catch {
      // ignore
    }
  };

  return {
    showHorrorMessage,
    horrorMessageText,
    triggerRapidNavigation,
    handleOverlayClose,
  };
}

export default useReaderHorrorOverlay;