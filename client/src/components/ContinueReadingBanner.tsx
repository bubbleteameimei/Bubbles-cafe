import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, X } from "lucide-react";
import { Link } from "wouter";

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

  const latest = useMemo(() => {
    try {
      const entries: Array<{ slug: string; pos: SavedPosition }> = [];
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("readerGentleScroll_")) {
          const slug = key.replace("readerGentleScroll_", "");
          if (!slug) continue;
          const json = localStorage.getItem(key);
          if (!json) continue;
          const pos = JSON.parse(json) as SavedPosition;
          entries.push({ slug, pos });
        }
      }
      if (entries.length === 0) return null;
      // Pick most recent
      entries.sort((a, b) => b.pos.timestamp - a.pos.timestamp);
      const top = entries[0];
      // Only show if they read at least a little
      const pct = Math.round(top.pos.percentRead || 0);
      if (pct < 3 && top.pos.scrollY < 150) return null;
      return top;
    } catch {
      return null;
    }
  }, []);

  const slug = latest?.slug;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/posts/slug", slug],
    enabled: Boolean(slug) && !dismissed,
    queryFn: async () => {
      const res = await fetch(`/api/posts/slug/${encodeURIComponent(slug as string)}`);
      if (!res.ok) throw new Error("Failed to load post");
      return (await res.json()) as PostSummary;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Don't render without valid data
  if (!slug || dismissed) return null;

  const pct = Math.round(latest?.pos.percentRead || 0);
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
              Continue from {pct}% read
            </div>
            <div className="mt-2">
              <Progress value={pct} className="h-1.5" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Link href={`/reader/${encodeURIComponent(slug)}`}>
                <Button size="sm" className="gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Continue
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  try {
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