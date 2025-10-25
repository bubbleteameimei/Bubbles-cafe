import React, { useEffect, useMemo, useState } from 'react';
import { Star, Calendar, Clock, Heart } from 'lucide-react';
import { getReadingTime } from '@/lib/content-analysis';
import { type posts } from '@shared/schema';
import { fetchReactionsBatch, type ReactionTotals } from '@/api/reactions';

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

  const topLiked = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return [] as Post[];
    return [...posts]
      .sort((a, b) => {
        const ta = totalsMap[a.id]?.totals?.likes ?? ((a as any).baselineLikes || 0) + (a.likesCount || 0);
        const tb = totalsMap[b.id]?.totals?.likes ?? ((b as any).baselineLikes || 0) + (b.likesCount || 0);
        return Number(tb) - Number(ta);
      })
      .slice(0, 6);
  }, [posts, totalsMap]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">Most Liked</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topLiked.map((p) => {
          const totals = totalsMap[p.id];
          const likesDisplay = totals?.totals?.likes ?? (((p as any).baselineLikes || 0) + (p.likesCount || 0));
          return (
            <article
              key={p.id}
              className="group rounded-lg border border-border/60 bg-card/70 hover:bg-card transition hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              <a
                href={`/reader/${encodeURIComponent(String(p.slug || p.id))}`}
                onClick={(e) => { e.preventDefault(); onNavigate(p.slug || p.id); }}
                className="block p-3 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
                aria-label={`Open ${p.title}`}
              >
                <div
                  className="text-left text-sm font-medium group-hover:text-primary line-clamp-2"
                  title={p.title}
                >
                  {p.title}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3 text-rose-500" />
                      {Number(likesDisplay)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getReadingTime(p.content)}
                    </span>
                  </div>
                  <div className="hidden sm:inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <time>{new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
                  </div>
                </div>
              </a>
            </article>
          );
        })}
        {topLiked.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No liked stories yet.
          </div>
        )}
      </div>
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

