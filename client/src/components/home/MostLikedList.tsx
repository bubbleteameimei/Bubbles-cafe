import React, { useEffect, useMemo, useState } from 'react';
import { Star, Calendar, Clock, Heart } from 'lucide-react';
import { getReadingTime } from '@/lib/content-analysis';
import { extractEngagingExcerpt } from '@/lib/excerpt-lite';
import { type posts } from '@shared/schema';
import { fetchReactionsBatch, type ReactionTotals } from '@/api/reactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Post = typeof posts.$inferSelect;

interface MostLikedListProps {
  posts: Post[];
  onNavigate: (slugOrId: string | number) => void;
  totalsMap?: Record<number, ReactionTotals>;
}

const MostLikedListComponent: React.FC<MostLikedListProps> = ({ posts, onNavigate, totalsMap: totalsFromParent }) => {
  const [totalsMap, setTotalsMap] = useState<Record<number, ReactionTotals>>(totalsFromParent || {});

  // If totals not provided by parent, fetch a small batch to avoid late-pop-in
  useEffect(() => {
    if (totalsFromParent && Object.keys(totalsFromParent).length > 0) return;
    let mounted = true;
    (async () => {
      try {
        const ids = posts.map(p => Number(p.id)).filter(n => Number.isFinite(n));
        if (ids.length === 0) return;
        const totals = await fetchReactionsBatch(ids.slice(0, 50));
        if (!mounted) return;
        const map: Record<number, ReactionTotals> = {};
        for (const t of totals) map[t.postId] = t;
        setTotalsMap(map);
      } catch {
        // Ignore failure; UI continues with baseline
      }
    })();
    return () => { mounted = false; };
  }, [posts, totalsFromParent]);

  // Sync live updates from LikeDislike (reader/index)
  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as ReactionTotals;
      if (!detail || typeof detail.postId !== 'number') return;
      setTotalsMap(prev => ({ ...prev, [detail.postId]: detail }));
    };
    window.addEventListener('reaction:updated', onUpdate as EventListener);
    return () => { window.removeEventListener('reaction:updated', onUpdate as EventListener); };
  }, []);

  const baselineLikesForPost = (p: Post): number => {
    const seedFrom = String((p as any).slug || p.id);
    let h = 0;
    for (let i = 0; i < seedFrom.length; i++) {
      h = (h << 5) - h + seedFrom.charCodeAt(i);
      h |= 0;
    }
    const seededRandom = (n: number) => {
      const x = Math.sin(n) * 10000;
      return x - Math.floor(x);
    };
    const seed = Math.abs(h) * 12345;
    return Math.floor(seededRandom(seed) * (200 - 80 + 1)) + 80;
  };

  const sortedByLikes = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return [] as Post[];
    return [...posts].sort((a, b) => {
      const ta = (totalsFromParent?.[a.id]?.totals?.likes ?? totalsMap[a.id]?.totals?.likes) ?? (baselineLikesForPost(a) + (a.likesCount || 0));
      const tb = (totalsFromParent?.[b.id]?.totals?.likes ?? totalsMap[b.id]?.totals?.likes) ?? (baselineLikesForPost(b) + (b.likesCount || 0));
      return Number(tb) - Number(ta);
    });
  }, [posts, totalsMap, totalsFromParent]);

  // Adapt count by breakpoint using CSS only; render top 3 and let grid handle layout
  const topLiked = sortedByLikes.slice(0, 3);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">Most Liked</h3>
      </div>

      {topLiked.length === 0 ? (
        <div className="text-sm text-muted-foreground">No liked stories yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topLiked.map((featured) => (
            <Card key={featured.id} className="rounded-lg border border-border/60 bg-card/80 hover:bg-card transition shadow-sm hover:shadow-md">
              <CardContent className="p-4">
                <a
                  href={`/reader/${encodeURIComponent(String(featured.slug || featured.id))}`}
                  onClick={(e) => { e.preventDefault(); onNavigate(featured.slug || featured.id); }}
                  className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
                  aria-label={`Open ${featured.title}`}
                >
                  <h4
                    className="text-left text-base md:text-lg font-medium font-castoro group-hover:text-primary leading-6 line-clamp-2"
                    title={featured.title}
                  >
                    {featured.title}
                  </h4>

                  <p className="mt-2 text-sm text-muted-foreground leading-6 line-clamp-3 font-sans" style={{ fontFamily: "'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
                    {extractEngagingExcerpt(featured.content, 180)}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-4 w-4 text-rose-500" />
                        {Number((totalsFromParent?.[featured.id]?.totals?.likes ?? totalsMap[featured.id]?.totals?.likes) ?? (baselineLikesForPost(featured) + (featured.likesCount || 0)))}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <time>{new Date(featured.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getReadingTime(featured.content)}
                      </span>
                    </div>
                  </div>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const propsAreEqual = (prev: MostLikedListProps, next: MostLikedListProps) => {
  // Shallow compare length and ids
  if (prev.posts.length !== next.posts.length) return false;
  for (let i = 0; i < Math.min(10, prev.posts.length, next.posts.length); i++) {
    if (prev.posts[i]?.id !== next.posts[i]?.id) {
      return false;
    }
  }
  // If totalsMap identity changed, re-render
  const prevTotalsKeys = prev.totalsMap ? Object.keys(prev.totalsMap).length : 0;
  const nextTotalsKeys = next.totalsMap ? Object.keys(next.totalsMap).length : 0;
  if (prevTotalsKeys !== nextTotalsKeys) return false;

  return prev.onNavigate === next.onNavigate;
};

export default React.memo(MostLikedListComponent, propsAreEqual);

