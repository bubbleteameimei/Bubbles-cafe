import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, X } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { READING_PROGRESS_PREFIX, RESUME_KEY } from "@/hooks/reader/use-reader-progress-persistence";

type PostSummary = { id: number; slug: string; title?: string | { rendered: string } };

const MIN_PCT = 5;
const MAX_PCT = 95; // past this the story is effectively finished
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function plainTitle(title: PostSummary["title"]): string {
  const raw = !title ? "" : typeof title === "string" ? title : title.rendered || "";
  try {
    const div = document.createElement("div");
    div.innerHTML = raw;
    return (div.textContent || "").trim() || "Your story";
  } catch {
    return raw || "Your story";
  }
}

/** Most recently read, unfinished story saved by the reader (ignores old/foreign formats). */
function findLatestUnfinished(): { slug: string; percent: number } | null {
  try {
    let best: { slug: string; percent: number; ts: number } | null = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (!key.startsWith(READING_PROGRESS_PREFIX)) continue;
      let parsed: any;
      try {
        parsed = JSON.parse(localStorage.getItem(key) || "null");
      } catch {
        continue;
      }
      // Older builds stored bare numbers or no timestamp; those made the wrong story look
      // "most recent", so they're ignored.
      const ts = Number(parsed?.timestamp);
      const pct = Number(parsed?.percentRead);
      if (!Number.isFinite(ts) || !Number.isFinite(pct)) continue;
      if (Date.now() - ts > MAX_AGE_MS || pct < MIN_PCT || pct > MAX_PCT) continue;
      const slug = key.slice(READING_PROGRESS_PREFIX.length);
      if (slug && (!best || ts > best.ts)) best = { slug, percent: Math.round(pct), ts };
    }
    return best ? { slug: best.slug, percent: best.percent } : null;
  } catch {
    return null;
  }
}

/**
 * "Continue reading" card, shown at the top of the story index when there's a story the
 * visitor started but didn't finish. It used to float translucent in the bottom corner,
 * pick the wrong story, count comments/footer in the percentage, and reopen the story at
 * the top; now Continue returns to the saved spot.
 */
export default function ContinueReadingBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const latest = useMemo(findLatestUnfinished, []);
  const slug = latest?.slug;

  const { data: post } = useQuery({
    queryKey: ["/api/posts/slug", slug],
    enabled: Boolean(slug) && !dismissed,
    queryFn: () => apiRequest<PostSummary>(`/api/posts/slug/${encodeURIComponent(slug as string)}`),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: serverProgress } = useQuery({
    queryKey: ["/api/reading-progress", slug],
    enabled: Boolean(slug) && !dismissed && isAuthenticated,
    queryFn: async () => {
      try {
        return await apiRequest<any>(`/api/reading-progress/${encodeURIComponent(slug as string)}`);
      } catch {
        return null;
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  // Render nothing until the story is confirmed to exist, so the card never appears
  // with a placeholder title and then changes.
  if (!latest || !slug || dismissed || !post) return null;

  const serverPct = Number(serverProgress?.progress?.percentCompleted || 0);
  const pct = Math.min(MAX_PCT, Math.max(latest.percent, Number.isFinite(serverPct) ? serverPct : 0));

  const forget = () => {
    try {
      localStorage.removeItem(`${READING_PROGRESS_PREFIX}${slug}`);
    } catch {}
    setDismissed(true);
  };

  return (
    <section
      aria-label="Continue reading"
      className="mx-auto mt-4 w-full rounded-xl border border-primary/30 bg-card p-4 shadow-sm sm:mt-6"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Continue reading</p>
              <p className="truncate text-base font-semibold">{plainTitle(post.title)}</p>
            </div>
            <button
              type="button"
              aria-label="Hide"
              className="rounded-md p-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={pct} className="h-1.5 flex-1" />
            <span className="text-xs tabular-nums text-muted-foreground">{pct}% read</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                try {
                  sessionStorage.setItem(RESUME_KEY, JSON.stringify({ slug, percent: pct }));
                } catch {}
                setLocation(`/reader/${encodeURIComponent(slug)}`);
              }}
            >
              Continue
            </Button>
            <Button size="sm" variant="ghost" onClick={forget}>
              Start over
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
