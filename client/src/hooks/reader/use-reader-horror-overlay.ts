import { useEffect, useRef, useState, createElement } from 'react';
import { useToast } from '@/hooks/use-toast';
import CreepyTextGlitch from '@/components/errors/CreepyTextGlitch';
import { safeSessionStorageGet, safeSessionStorageSet, safeSessionStorageRemove } from '@/utils/safe';

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
    const savedSkip = parseInt(safeSessionStorageGet('reader_skip_count') || '0', 10);
    if (Number.isFinite(savedSkip)) {
      skipCountRef.current = savedSkip;
    }
    const savedLast = parseInt(safeSessionStorageGet('reader_last_nav_time') || '0', 10);
    if (Number.isFinite(savedLast) && savedLast > 0) {
      lastNavigationTimeRef.current = savedLast;
    }
  }, []);

  // Restore overlay state if it was active recently.
  useEffect(() => {
    const active = safeSessionStorageGet('reader_horror_active') === '1';
    const expiry = parseInt(safeSessionStorageGet('reader_horror_expiry_ts') || '0', 10);
    const msg = safeSessionStorageGet('reader_horror_message') || '';
    const now = Date.now();

    if (active && Number.isFinite(expiry) && expiry > now) {
      setHorrorMessageText(msg || 'I SEE YOU SKIPPING!!!');
      setShowHorrorMessage(true);

      const remaining = expiry - now;
      window.setTimeout(() => {
        setShowHorrorMessage(false);
        safeSessionStorageRemove('reader_horror_active');
        safeSessionStorageRemove('reader_horror_message');
        safeSessionStorageRemove('reader_horror_expiry_ts');
      }, remaining);
    } else {
      safeSessionStorageRemove('reader_horror_active');
      safeSessionStorageRemove('reader_horror_message');
      safeSessionStorageRemove('reader_horror_expiry_ts');
    }
  }, []);

  const resetOverlayState = () => {
    setShowHorrorMessage(false);
    skipCountRef.current = 0;
    safeSessionStorageSet('reader_skip_count', '0');
    safeSessionStorageRemove('reader_horror_active');
    safeSessionStorageRemove('reader_horror_message');
    safeSessionStorageRemove('reader_horror_expiry_ts');
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
      safeSessionStorageSet('reader_skip_count', String(skipCountRef.current));

      // After 3 rapid skips, show the horror Easter egg.
      if (skipCountRef.current >= 3 && !showHorrorMessage) {
        if (import.meta.env?.DEV) {
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
          description: createElement(CreepyTextGlitch, { text: message, intensityFactor: 8 }),
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
      safeSessionStorageSet('reader_skip_count', String(skipCountRef.current));
    }

    // Always update last navigation time.
    lastNavigationTimeRef.current = now;
    safeSessionStorageSet('reader_last_nav_time', String(now));
  };

  return {
    showHorrorMessage,
    horrorMessageText,
    triggerRapidNavigation,
    handleOverlayClose,
  };
}

export default useReaderHorrorOverlay;