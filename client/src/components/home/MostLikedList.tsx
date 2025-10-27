import React, { useEffect, useMemo, useState } from 'react';
import { Star, Calendar, Clock, Heart, Bone } from 'lucide-react';
import { getReadingTime } from '@/lib/content-analysis';
import { extractEngagingExcerpt } from '@/lib/excerpt-lite';
import { type posts } from '@shared/schema';
import { fetchReactionsBatch, type ReactionTotals } from '@/api/reactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { THEME_CATEGORIES } from '@/lib/themes-lite';
import { THEME_CATEGORIES as SHARED_THEME_CATEGORIES, determineThemeCategory } from '@shared/theme-categories';
import { getStoryThemeOverride } from '@shared/story-theme-overrides';
import { getThemeDefinitionOverride } from '@/shared/theme-definitions';
import { Icon } from '@iconify/react';

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

                  {(() => {
                    const md: any = (featured as any)?.metadata || {};
                    const primaryThemeRaw =
                      md.themeCategory ||
                      determineThemeCategory(String(featured.title || ''), String(featured.content || ''));

                    const override = getStoryThemeOverride(featured.slug as any, featured.title as any);

                    const derivedKey = (() => {
                      const raw = String(primaryThemeRaw || '').trim();
                      if (!raw) return 'HORROR';
                      for (const [key, info] of Object.entries(SHARED_THEME_CATEGORIES as Record<string, any>)) {
                        if (String((info as any)?.label || '').toLowerCase() === raw.toLowerCase()) return key;
                      }
                      return raw.toUpperCase().replace(/\\s+/g, '_');
                    })();

                    const themeKey = override?.key || derivedKey;

                    const defOverride = getThemeDefinitionOverride(themeKey);

                    const baseLabel =
                      override?.label ||
                      defOverride?.label ||
                      (SHARED_THEME_CATEGORIES as any)[derivedKey]?.label ||
                      primaryThemeRaw ||
                      'Horror';

                    const prettyLabel = baseLabel;

                    const chosenIconSlug =
                      override?.icon ||
                      (md && (md as any).themeIcon) ||
                      defOverride?.icon ||
                      (SHARED_THEME_CATEGORIES as any)[derivedKey]?.icon ||
                      'ghost';

                    const isIconify = String(chosenIconSlug).includes(':');
                    const showBone = String(chosenIconSlug).toLowerCase() === 'bone' || themeKey === 'BODY_HORROR';

                    const badgeTint = (() => {
                      switch (themeKey) {
                        case 'DEATH': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
                        case 'BODY_HORROR': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
                        case 'SUPERNATURAL': return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700';
                        case 'PSYCHOLOGICAL': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
                        case 'EXISTENTIAL': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';
                        case 'HORROR': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700';
                        case 'STALKING': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
                        case 'CANNIBALISM': return 'bg-red-200 text-red-900 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
                        case 'PSYCHOPATH': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-700';
                        case 'DOPPELGANGER': return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700';
                        case 'VEHICULAR': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
                        case 'PARASITE': return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700';
                        case 'TECHNOLOGICAL': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700';
                        case 'COSMIC': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
                        case 'UNCANNY': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700';
                        case 'GOTHIC': return 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900/30 dark:text-stone-300 dark:border-stone-700';
                        default: return 'bg-primary/10 text-foreground border-primary/20 dark:bg-primary/10 dark:text-foreground dark:border-primary/20';
                      }
                    })();

                    return (
                      <div className="mt-1">
                        <Badge className={`w-fit text-[12px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                          {isIconify
                            ? (<Icon icon={String(chosenIconSlug)} className="h-3 w-3" />)
                            : (showBone ? <Bone className="h-3 w-3" /> : null)
                          }
                          {prettyLabel}
                        </Badge>
                      </div>
                    );
                  })()}

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

