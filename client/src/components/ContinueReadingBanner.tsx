import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, X } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

type SavedPosition = {
  scrollY: number;
  timestamp: number;
  percentRead?: number;
};

type PostSummary = {
  id: number;
  slug: string;
  title?: string | { rendered: string };
  content?: string | { rendered: string };
};

function parseTitle(title: PostSummary["title"]): string {
  if (!title) return "Story";
  if (typeof title === "string") return title;
  return title.rendered || "Story";
}

function sanitize(html: string) {
  try {
    const div = document.createElement("div");
    div.innerHTML = html;
    // Strip tags for banner
    return (div.textContent || div.innerText || "").trim();
  } catch {
    return html;
  }
}

export default function ContinueReadingBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [, setLocation] = useLocation();

  const latest = useMemo(() => {
    try {
      const entries: Array<{ slug: string; pos: SavedPosition }> = [];

      for (const key of Object.keys(localStorage)) {
        if (!key.startsWith("readingProgress_")) continue;

        const slug = key.replace("readingProgress_", "");
        if (!slug) continue;

        const raw = localStorage.getItem(key);
        if (!raw) continue;

        let percentRead = 0;
        let scrollY = 0;
        let timestamp = 0;

        try {
          const parsed = JSON.parse(raw) as {
            slug?: string;
            scrollPosition?: number;
            percentRead?: number;
            progress?: number;
            lastRead?: string;
            timestamp?: number;
          };

          const rawPct =
            typeof parsed.percentRead === "number"
              ? parsed.percentRead
              : typeof parsed.progress === "number"
              ? parsed.progress
              : 0;

          percentRead = Number.isFinite(rawPct) ? rawPct : 0;

          const rawScroll =
            typeof parsed.scrollPosition === "number" ? parsed.scrollPosition : 0;
          scrollY = Number.isFinite(rawScroll) ? rawScroll : 0;

          if (typeof parsed.timestamp === "number" && Number.isFinite(parsed.timestamp)) {
            timestamp = parsed.timestamp;
          } else if (parsed.lastRead) {
            const t = Date.parse(parsed.lastRead);
            if (Number.isFinite(t)) {
              timestamp = t;
            }
          }
        } catch {
          // Fallback: value might just be a percentage string
          const pct = Number(raw);
          percentRead = Number.isFinite(pct) ? pct : 0;
          scrollY = 0;
          timestamp = Date.now();
        }

        if (!timestamp || !Number.isFinite(timestamp)) {
          timestamp = Date.now();
        }

        entries.push({ slug, pos: { scrollY, timestamp, percentRead } });
      }

      if (entries.length === 0) return null;

      // Pick most recent
      entries.sort((a, b) => b.pos.timestamp - a.pos.timestamp);
      const top = entries[0];

      const pct = Math.round(top.pos.percentRead || 0);
      // Only show if they actually read a bit
      if (pct < 3) return null;

      return top;
    } catch {
      return null;
    }
  }, []);

  const slug = latest?.slug;

  // Load post title by slug
  const { data } = useQuery({
    queryKey: ["/api/posts/slug", slug],
    enabled: Boolean(slug) && !dismissed,
    queryFn: async () => {
      if (!slug) throw new Error("Missing slug");
      return await apiRequest<PostSummary>(`/api/posts/slug/${encodeURIComponent(slug as string)}`);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Load server reading progress if available for authenticated users
  const { data: serverProgress } = useQuery({
    queryKey: ["/api/reading-progress", slug],
    enabled: Boolean(slug) && !dismissed,
    queryFn: async () => {
      if (!slug) return null;
      try {
        return await apiRequest<any>(`/api/reading-progress/${encodeURIComponent(slug as string)}`);
      } catch {
        return null;
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  // Don't render without valid data
  if (!slug || dismissed) return null;

  const localPct = Math.round(latest?.pos.percentRead || 0);
  const serverPct = Number(serverProgress?.progress?.percentCompleted || 0);
  const pct = Math.max(localPct, serverPct); // prefer higher of local/server

  if (!Number.isFinite(pct) || pct <= 0) return null;

  const title = data ? parseTitle(data.title) : "Continue Reading";
  const safeTitle = sanitize(title);

  return (
    <div className="fixed bottom-4 right-4 z-[60] max-w-sm w-[92vw] sm:w-96 pointer-events-auto">
      <Card className="p-3 sm:p-4 shadow-lg border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 hidden sm:block">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold truncate">{safeTitle}</div>
              <button
                aria-label="Dismiss"
                className="p-1 rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">
              Continue from {Math.round(pct)}% read
            </div>
            <div className="mt-2">
              <Progress value={Math.round(pct)} className="h-1.5" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setLocation(`/reader/${encodeURIComponent(slug)}`)}
              >
                <BookOpen className="h-4 w-4" />
                Continue
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  try {
                    localStorage.removeItem(`readingProgress_${slug}`);
                    localStorage.removeItem(`readerGentleScroll_${slug}`);
                  } catch {}
                  setDismissed(true);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}