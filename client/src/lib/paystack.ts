export function getStaticPaystackLink(): string {
  // Default to the original hard-coded link if no env override is provided.
  const fallback = 'https://paystack.com/pay/z7fmj9rge1';

  try {
    const envAny: any = (import.meta as any)?.env || {};
    const fromVite = envAny.VITE_PAYSTACK_LINK as string | undefined;

    if (typeof fromVite === 'string' && fromVite.trim()) {
      return fromVite.trim();
    }
  } catch {
    // Ignore env/runtime access issues and fall back to default
  }

  return fallback;
}

/**
 * Resolve the Paystack link, preferring a Vite build-time override and
 * falling back to the Worker /api/config/public response when available.
 */
export async function resolvePaystackLink(): Promise<string> {
  const fallback = getStaticPaystackLink();

  // If we already have an explicit override, use it without a network call.
  if (fallback !== 'https://paystack.com/pay/z7fmj9rge1') {
    return fallback;
  }

  try {
    const res = await fetch('/api/config/public', { credentials: 'include' });
    if (!res.ok) return fallback;

    const data: any = await res.json().catch(() => null);
    const fromConfig =
      data?.payments?.paystack?.link ||
      data?.paystackLink ||
      data?.paystack?.link ||
      data?.payments?.paystackLink;

    if (typeof fromConfig === 'string' && fromConfig.trim()) {
      return fromConfig.trim();
    }
  } catch {
    // Silent: just fall back
  }

  return fallback;
}