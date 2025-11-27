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
 * Resolve the Paystack link.
 *
 * This implementation is intentionally simple: it just returns the static
 * Paystack link (optionally overridden at build time via Vite env).
 * No network calls or dynamic config are used.
 */
export async function resolvePaystackLink(): Promise<string> {
  return getStaticPaystackLink();
}