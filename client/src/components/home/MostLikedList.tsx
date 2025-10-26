import React, { useEffect, useMemo, useState } from 'react';
import { Star, Calendar, Clock, Heart } from 'lucide-react';
import { getReadingTime } from '@/lib/content-analysis';
import { extractEngagingExcerpt } from '@/lib/excerpt-lite';
import { type posts } from '@shared/schema';
import { fetchReactionsBatch, type ReactionTotals } from '@/api/reactions';
import { Button } from '@/components/ui/button';

type Post = typeof posts.$inferSelect;

interface MostLikedListProps {
  posts: Post[];
  onNavigate: (slugOrId: string | number) => void;
}

const MostLikedListComponent: React.FC<MostLikedListProps> = ({ posts, onNavigate }) => {
  const [totalsMap, setTotalsMap] = useState<Record<number, ReactionTotals>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ids = posts.map(p => Number(p.id)).filter(n => Number.isFinite(n));
        if (ids.length === 0) return;
        const totals = await fetchReactionsBatch(ids.slice(0, 100));
        if (!mounted) return;
        const map: Record<number, ReactionTotals> = {};
        for (const t of totals) {
          map[t.postId] = t;
        }
        setTotalsMap(map);
      } catch {
        // Ignore failure; UI continues with zeros
      }
    })();
    return () => { mounted = false; };
  }, [posts]);

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

  const topLiked = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return [] as Post[];
    return [...posts]
      .sort((a, b) => {
        const ta = totalsMap[a.id]?.totals?.likes ?? (baselineLikesForPost(a) + (a.likesCount || 0));
        const tb = totalsMap[b.id]?.totals?.likes ?? (baselineLikesForPost(b) + (b.likesCount || 0));
        return Number(tb) - Number(ta);
      })
      .slice(0, 1);
  }, [posts, totalsMap]);

  const featured = topLiked[0];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">Most Liked</h3>
      </div>

      {!featured ? (
        <div className="text-sm text-muted-foreground">No liked stories yet.</div>
      ) : (
        <article
          key={featured.id}
          className="group rounded-xl border border-border/60 bg-card/80 hover:bg-card transition hover:-translate-y-0.5 shadow-sm hover:shadow-md ring-1 ring-primary/10"
        >
          <a
            href={`/reader/${encodeURIComponent(String(featured.slug || featured.id))}`}
            onClick={(e) => { e.preventDefault(); onNavigate(featured.slug || featured.id); }}
            className="block p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
            aria-label={`Open ${featured.title}`}
          >
            <div className="flex items-start justify-between gap-3">
              <h4
                className="text-left text-lg font-medium font-castoro group-hover:text-primary leading-6 line-clamp-2"
                title={featured.title}
              >
                {featured.title}
              </h4>
              <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                <div className="flex items-center gap-1 justify-end">
                  <Calendar className="h-3 w-3" />
                  <time>{new Date(featured.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                </div>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{getReadingTime(featured.content)}</span>
                </div>
              </div>
            </div>

            <p className="mt-2 text-sm text-muted-foreground leading-6 line-clamp-3 font-sans" style={{ fontFamily: "'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
              {extractEngagingExcerpt(featured.content, 220)}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-4 w-4 text-rose-500" />
                  {Number(totalsMap[featured.id]?.totals?.likes ?? (baselineLikesForPost(featured) + (featured.likesCount || 0)))}
                </span>
              </div>
              <Button size="sm" className="h-9 px-4" onClick={(e) => { e.preventDefault(); onNavigate(featured.slug || featured.id); }}>
                Read story
                <Clock className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </a>
        </article>
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
  return prev.onNavigate === next.onNavigate;
};

export default React.memo(MostLikedListComponent, propsAreEqual);

