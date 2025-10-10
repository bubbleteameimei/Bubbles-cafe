import { useEffect, useState } from 'react';
import { getPrefersReducedMotion, subscribePrefersReducedMotion } from '../lib/motion';

export function usePrefersReducedMotion(): boolean {
  const [value, setValue] = useState<boolean>(() => getPrefersReducedMotion());

  useEffect(() => {
    return subscribePrefersReducedMotion(setValue);
  }, []);

  return value;
}

export default usePrefersReducedMotion;