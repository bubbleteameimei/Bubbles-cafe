import { useEffect, useState } from 'react';
import { getEffectiveReducedMotion, subscribeReducedMotion, applyReducedMotionClass } from '../lib/motion';

export function usePrefersReducedMotion(): boolean {
  // Motion ON by default (false), but respect system/user preferences
  const [value, setValue] = useState<boolean>(() => getEffectiveReducedMotion());

  useEffect(() => {
    // Keep internal state and html.reduce-motion class in sync
    applyReducedMotionClass(value);
  }, [value]);

  useEffect(() => {
    return subscribeReducedMotion((v) => {
      setValue(v);
      // Class is applied via the effect above
    });
  }, []);

  return value;
}

export default usePrefersReducedMotion;