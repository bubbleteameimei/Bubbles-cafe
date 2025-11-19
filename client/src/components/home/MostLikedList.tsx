import React, { useEffect, useMemo, useState } from 'react';
import { Star, Calendar, Clock, Heart, Bone, Ghost, Skull, Brain, Pill, Cpu, Dna, Umbrella, Footprints, CloudRain, Castle, Bug, Radiation, UserMinus2, UserPlus, Anchor, AlertTriangle, Building, Worm, Cloud, CloudFog, Flame, Eye, Hourglass, ForkKnife, Cat, Moon, Dog, Radio, MoonStar, Box, Car, FlaskConical, Trees } from 'lucide-react';
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
import { getBadgeTint } from '@/lib/theme-badges';

type Post = typeof posts.$inferSelect;

interface MostLikedListProps {
  posts: Post[];
  onNavigate: (slugOrId: string | number) => void;
  totalsMap?: Record<number, ReactionTotals>;
  renderMetaBySlug?: Record<string, { themeKey?: string; themeLabel?: string; themeIcon?: string }>;
}

const MostLikedListComponent: React.FC<MostLikedListProps> = ({ posts, onNavigate, totalsMap: totalsFromParent, renderMetaBySlug }) => {
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

  const baselineLikesForPost = (_p: Post): number => {
    return 0;
  };

  const sortedByLikes = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return [] as Post[];
    return [...posts].sort((a, b) => {
      const ta = (totalsFromParent?.[a.id]?.totals?.likes ?? totalsMap[a.id]?.totals?.likes) ?? 0;
      const tb = (totalsFromParent?.[b.id]?.totals?.likes ?? totalsMap[b.id]?.totals?.likes) ?? 0;
      return Number(tb) - Number(ta);
    });
  }, [posts, totalsMap, totalsFromParent]);

  // Ensure we always have up to 4 items; if not enough liked data, backfill with recent posts
  const topLiked = useMemo(() => {
    const primary = sortedByLikes.slice(0, 3);
    if (primary.length >= 3) return primary;
    const need = 3 - primary.length;
    const haveIds = new Set(primary.map(p => p.id));
    const recent = [...posts]
      .filter(p => !haveIds.has(p.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, need);
    return [...primary, ...recent];
  }, [sortedByLikes, posts]);

  // Lucide mapping only
  const getThemeIconFor = (themeKeyStr: string, iconSlugStr: string) => {
    const slug = String(iconSlugStr || '').toLowerCase();
    switch (slug) {
      case 'skull': return Skull;
      case 'brain': return Brain;
      case 'pill': return Pill;
      case 'cpu': return Cpu;
      case 'dna': return Dna;
      case 'ghost': return Ghost;
      case 'umbrella': return Umbrella;
      case 'footprints': return Footprints;
      case 'cloud-rain':
      case 'cloudrain': return CloudRain;
      case 'castle': return Castle;
      case 'bug': return Bug;
      case 'radiation': return Radiation;
      case 'user-minus2':
      case 'userminus2': return UserMinus2;
      case 'user-plus':
      case 'userplus': return UserPlus;
      case 'anchor': return Anchor;
      case 'alert-triangle':
      case 'alerttriangle': return AlertTriangle;
      case 'building': return Building;
      case 'worm': return Worm;
      case 'cloud': return Cloud;
      case 'cloud-fog':
      case 'cloudfog': return CloudFog;
      case 'flame': return Flame;
      case 'eye': return Eye;
      case 'hourglass': return Hourglass;
      case 'knife': return ForkKnife;
      case 'utensils':
      case 'fork-knife':
      case 'forkknife': return ForkKnife;
      case 'cat': return Cat;
      case 'moon': return Moon;
      case 'dog': return Dog;
      case 'radio': return Radio;
      case 'moon-star':
      case 'moonstar': return MoonStar;
      case 'box': return Box;
      case 'car': return Car;
      case 'alien': return Moon;
      case 'flask': return FlaskConical;
      case 'trees':
      case 'tree': return Trees;
      case 'bone': return Bone;
    }
    switch (String(themeKeyStr || '').toUpperCase()) {
      case 'TECHNOLOGICAL': return Cpu;
      case 'PSYCHOLOGICAL': return Brain;
      case 'SUPERNATURAL': return Ghost;
      case 'UNCANNY': return Eye;
      case 'EXISTENTIAL': return Hourglass;
      case 'DOPPELGANGER': return UserPlus;
      case 'CANNIBALISM': return ForkKnife;
      case 'SLASHER': return Skull;
      case 'MONSTER': return Cat;
      case 'ZOMBIE': return Footprints;
      case 'VAMPIRE': return Moon;
      case 'WEREWOLF': return Dog;
      case 'PARANORMAL': return Radio;
      case 'DREAM_HORROR': return MoonStar;
      case 'CURSED_OBJECT': return Box;
      case 'TIME_HORROR': return Clock;
      case 'APOCALYPTIC': return Radiation;
      case 'SCIENCE_HORROR': return FlaskConical;
      case 'BODY_HORROR': return Bone;
      case 'FOLK_HORROR': return Trees;
      case 'GOTHIC': return Castle;
      case 'COSMIC': return Moon;
      case 'VEHICULAR': return Car;
      default: return Ghost;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">Most Liked</h3>
      </div>

      {topLiked.length === 0 ? (
        <div className="text-sm text-muted-foreground">No liked stories yet.</div>
      ) : (
        <div className="relative">
          <div
            className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-3 sm:scroll-px-4 [-webkit-overflow-scrolling:touch]"
            aria-label="Most liked stories"
          >
            {topLiked.map((featured) => (
              <div key={featured.id} className="snap-start min-w-[260px] sm:min-w-[300px] md:min-w-[320px]">
                <Card className="rounded-lg border border-border/50 bg-card/70 hover:bg-card transition">
                  <CardContent className="p-3">
                    <a
                      href={`/reader/${encodeURIComponent(String(featured.slug || featured.id))}`}
                      onClick={(e) => { e.preventDefault(); onNavigate(featured.slug || featured.id); }}
                      className="block group outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
                      aria-label={`Open ${featured.title}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-left text-sm font-medium line-clamp-2 hover:text-primary"
                            title={featured.title}
                          >
                            {featured.title}
                          </h4>
                          {(() => {
                            const md: any = (featured as any)?.metadata || {};
                            const serverKey = renderMetaBySlug?.[String(featured.slug || '')]?.themeKey;
                            const primaryThemeRaw =
                              md.themeCategory ||
                              (serverKey ? serverKey : undefined) ||
                              determineThemeCategory(String(featured.title || ''), String(featured.content || ''));

                            const override = getStoryThemeOverride(featured.slug as any, featured.title as any);

                            const derivedKey = (() => {
                              const raw = String(primaryThemeRaw || '').trim();
                              if (!raw) return 'HORROR';
                              for (const [key, info] of Object.entries(SHARED_THEME_CATEGORIES as Record<string, any>)) {
                                if (String((info as any)?.label || '').toLowerCase() === raw.toLowerCase()) return key;
                              }
                              return raw.toUpperCase().replace(/\s+/g, '_');
                            })();

                            const themeKey = override?.key || (serverKey ? String(serverKey).toUpperCase() : undefined) || derivedKey;

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

                            const badgeTint = getBadgeTint(themeKey);
                            const ThemeIconCmp: any = getThemeIconFor(themeKey, chosenIconSlug);

                            return (
                              <div className="mt-1">
                                <Badge className={`w-fit text-[12px] font-medium tracking-wide px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border whitespace-nowrap ${badgeTint}`}>
                                  {ThemeIconCmp ? <ThemeIconCmp className="h-3.5 w-3.5" /> : null}
                                  {prettyLabel}
                                </Badge>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground space-y-1 whitespace-nowrap">
                          <div className="flex items-center gap-1 justify-end">
                            <Calendar className="h-3 w-3" />
                            <time>{new Date(featured.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                          </div>
                          <div className="flex items-center gap-1 justify-end" title={`~${String(featured.content || '').split(/\s+/).length} words`}>
                            <Clock className="h-3 w-3" />
                            <span>{getReadingTime(featured.content)}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[13px] text-muted-foreground leading-5 mt-1 line-clamp-1">
                        {extractEngagingExcerpt(featured.content, 100)}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Heart className="h-4 w-4 text-rose-500" />
                            {Number((totalsFromParent?.[featured.id]?.totals?.likes ?? totalsMap[featured.id]?.totals?.likes) ?? 0)}
                          </span>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
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

