import React, { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';

/**
 * IntroLoader
 * Shows the Megrim intro loading screen once per session on first visit,
 * for a minimum of 2.5 seconds to complete an animation cycle.
 */
const INTRO_MIN_MS = 2500;

const IntroLoader: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const alreadyShown = sessionStorage.getItem('intro_shown');
      if (alreadyShown === 'true') {
        return;
      }
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        try {
          sessionStorage.setItem('intro_shown', 'true');
        } catch {}
      }, INTRO_MIN_MS);
      return () => clearTimeout(t);
    } catch {
      // If sessionStorage fails, still show intro briefly
      setVisible(true);
      const t = setTimeout(() => setVisible(false), INTRO_MIN_MS);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;
  return <LoadingScreen />;
};

export default IntroLoader;