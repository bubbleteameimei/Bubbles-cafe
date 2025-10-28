import { useEffect } from "react";
import { fetchWordPressPosts } from "@/lib/wordpress-api";

/**
 * LinkPrefetchObserver
 * Prefetch route chunks and data when links to Reader/Stories enter the viewport.
 * Helps first navigation feel instant without overfetching.
 */
export function LinkPrefetchObserver() {
  useEffect(() => {
    const seen = new Set<string>();

    const prefetchForHref = async (href: string) => {
      if (seen.has(href)) return;
      seen.add(href);

      try {
        if (href.startsWith("/reader") || href.startsWith("/story") || href.startsWith("/community-story")) {
          // Warm the Reader route chunk
          await import("../../pages/reader");
          // Warm WordPress posts list (includes content)
          await fetchWordPressPosts({
            perPage: 100,
            includeContent: true,
            skipCache: false,
            maxRetries: 0,
          });
        } else if (href.startsWith("/stories")) {
          // Warm the Stories route chunk and common list data
          await import("../../pages/index");
          // Warm the posts listing via server API for index page feel
          try {
            await fetch("/api/posts?limit=100", { credentials: "include" }).catch(() => {});
          } catch {}
        }
      } catch {
        // Silent: prefetch is best-effort
      }
    };

    const handleEntries: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLAnchorElement;
          const href = el.getAttribute("href") || "";
          if (!href) continue;
          // Schedule prefetch after first paint
          requestAnimationFrame(() => {
            prefetchForHref(href);
          });
        }
      }
    };

    const observer = new IntersectionObserver(handleEntries, {
      root: null,
      rootMargin: "120px",
      threshold: 0.01,
    });

    const scan = () => {
      try {
        const anchors = Array.from(
          document.querySelectorAll<HTMLAnchorElement>(
            'a[href^="/reader"], a[href^="/story"], a[href^="/community-story"], a[href^="/stories"]'
          )
        );
        anchors.forEach((a) => observer.observe(a));
      } catch {
        // no-op
      }
    };

    // Initial scan and rescan on DOM changes
    scan();
    const mo = new MutationObserver(() => {
      scan();
    });
    try {
      mo.observe(document.body, { childList: true, subtree: true });
    } catch {}

    return () => {
      try {
        observer.disconnect();
      } catch {}
      try {
        mo.disconnect();
      } catch {}
    };
  }, []);

  return null;
}

export default LinkPrefetchObserver;