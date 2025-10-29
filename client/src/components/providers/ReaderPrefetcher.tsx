import { useEffect } from "react";

/**
 * ReaderPrefetcher
 * Light-weight prefetcher: only warm the Reader route chunk on idle.
 * Avoids large data fetches competing with first render.
 */
export function ReaderPrefetcher() {
  useEffect(() => {
    const run = async () => {
      try {
        await import("../../pages/reader");
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