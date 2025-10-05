import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

/**
 * Lightweight prefetcher that warms the React Query cache with
 * the most common post lists so navigation feels instant.
 */
export function PostsPrefetcher() {
  useEffect(() => {
    let cancelled = false;

    const prefetch = async () => {
      try {
        // Prefetch latest posts list
        await queryClient.prefetchQuery({
          queryKey: ["/api/posts", "list", { limit: 100 }],
          queryFn: async () => {
            const res = await fetch("/api/posts?limit=100");
            if (!res.ok) throw new Error("Failed to prefetch posts");
            return res.json();
          },
          staleTime: 5 * 60 * 1000,
        });

        if (cancelled) return;

        // Prefetch community posts list
        await queryClient.prefetchQuery({
          queryKey: ["/api/posts/community", "list", { limit: 50 }],
          queryFn: async () => {
            const res = await fetch("/api/posts/community?limit=50");
            if (!res.ok) throw new Error("Failed to prefetch community posts");
            return res.json();
          },
          staleTime: 5 * 60 * 1000,
        });
      } catch {
        // Silent fail - prefetch is best-effort
      }
    };

    // Defer slightly to avoid competing with critical render
    const id = setTimeout(prefetch, 800);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);

  return null;
}

export default PostsPrefetcher;