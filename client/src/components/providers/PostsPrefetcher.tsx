import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

/**
 * Lightweight prefetcher that warms the React Query cache with
 * small post lists so navigation feels instant without heavy network usage.
 */
export function PostsPrefetcher() {
  useEffect(() => {
    let cancelled = false;

    const prefetch = async () => {
      try {
        // Prefetch a small latest posts list
        await queryClient.prefetchQuery({
          queryKey: ["/api/posts", "list", { limit: 20 }],
          queryFn: async () => {
            const res = await fetch("/api/posts?limit=20");
            if (!res.ok) throw new Error("Failed to prefetch posts");
            return res.json();
          },
          staleTime: 3 * 60 * 1000,
        });

        if (cancelled) return;

        // Prefetch a small community posts list
        await queryClient.prefetchQuery({
          queryKey: ["/api/posts/community", "list", { limit: 20 }],
          queryFn: async () => {
            const res = await fetch("/api/posts/community?limit=20");
            if (!res.ok) throw new Error("Failed to prefetch community posts");
            return res.json();
          },
          staleTime: 3 * 60 * 1000,
        });
      } catch {
        // Silent fail - prefetch is best-effort
      }
    };

    // Defer more to avoid competing with critical render
    const id = setTimeout(prefetch, 1500);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);

  return null;
}

export default PostsPrefetcher;