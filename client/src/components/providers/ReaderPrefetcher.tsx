import { useEffect } from "react";
import { fetchWordPressPosts } from "@/lib/wordpress-api";

/**
 * ReaderPrefetcher
 * Warm the WordPress posts (with content) in the background so the Reader opens instantly.
 * Uses the wordpress-api localStorage cache, so subsequent Reader queries reuse the result.
 */
export function ReaderPrefetcher() {
  useEffect(() => {
    const run = async () => {
      try {
        // Match the Reader’s typical initial query shape
        await fetchWordPressPosts({
          perPage: 100,
          includeContent: true,
          skipCache: false,
          maxRetries: 0,
        });
      } catch {
        // Best-effort only
      }
    };

    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout?: number }) => void)
      | undefined;

    if (typeof ric === "function") {
      ric(() => run(), { timeout: 2000 });
    } else {
      // Slight delay to avoid competing with initial paint
      setTimeout(run, 1200);
    }
  }, []);

  return null;
}

export default ReaderPrefetcher;