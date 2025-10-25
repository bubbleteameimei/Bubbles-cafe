import React, { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { type posts } from "@shared/schema";
type Post = typeof posts.$inferSelect;
import { useLocation } from "wouter";
import SEO from "@/components/SEO";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Clock, Calendar, Book,
  Award
} from "lucide-react";
const LikeDislike = lazy(() => import("@/components/ui/like-dislike").then(m => ({ default: m.LikeDislike })));
const MostLikedList = lazy(() => import("@/components/home/MostLikedList"));
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

import { getReadingTime, extractEngagingExcerpt } from "@/lib/excerpt-lite";
import { THEME_CATEGORIES } from "@/lib/themes-lite";
import type { WordPressPost } from "@/lib/wordpress-api";
import { fetchWordPressPosts } from "@/lib/wordpress-api";
import { determineThemeCategory as sharedDetermineThemeCategory } from "@shared/theme-categories";



// Lightweight converter from WordPress API post to local Post shape
function wpToPost(post: WordPressPost): Post {
  const title = post?.title?.rendered?.trim() || "Untitled Story";
  const content = post?.content?.rendered || "";
  const slug = post?.slug || `post-${post?.id ?? Date.now()}`;
  const createdAt = post?.date ? new Date(post.date) : new Date();
  return {
    id: post.id ?? Math.floor(Math.random() * 100000),
    title,
    content,
    slug,
    createdAt,
    metadata: {}
  } as unknown as Post;
}

export default function StoriesIndexContent() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular' | 'shortest'>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [carouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!carouselApi) return;
    const update = () => {
      try {
        (carouselApi as any).selectedScrollSnap?.();
      } catch {}
    };
    update();
    (carouselApi as any).on?.("select", update);
    (carouselApi as any).on?.("reInit", update);
    return () => {
      try {
        (carouselApi as any).off?.("select", update);
        (carouselApi as any).off?.("reInit", update);
      } catch {}
    };
  }, [carouselApi]);

  // Navigation function
  const navigateToReader = (slugOrId: string | number) => {
    try {
      const slugStr = String(slugOrId);
      setLocation(`/reader/${encodeURIComponent(slugStr)}`);
    } catch {
      window.location.href = `/reader/${encodeURIComponent(String(slugOrId))}`;
    }
  };

  // Paginated query
  const { data } = useSuspenseInfiniteQuery<
    { posts: Post[]; hasMore: boolean; page: number }
  >({
    queryKey: ["wordpress", "posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const wpResponse = await fetchWordPressPosts({
        page,
        perPage: 100,
      });
      const wpPosts = wpResponse.posts || [];
      const posts = wpPosts.map((post: WordPressPost) => wpToPost(post)) as Post[];
      return {
        posts,
        hasMore: wpPosts.length === 100,
        page,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialPageParam: 1,
  });

  const hasPaginatedPosts = data?.pages && data.pages.length > 0 && data.pages[0]?.posts?.length > 0;

  // Initialize posts array with memoization
  const allPosts: Post[] = useMemo(() => {
    if (hasPaginatedPosts) {
      return data!.pages.flatMap(page => page.posts) as Post[];
    }
    return [] as Post[];
  }, [hasPaginatedPosts, data]);

  const sortedPosts = [...allPosts].sort((a: Post, b: Post) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Available theme categories present in posts
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPosts) {
      const md = (p.metadata || {}) as Record<string, any>;
      if (typeof md.themeCategory === 'string' && md.themeCategory.trim()) {
        set.add(md.themeCategory);
      }
    }
    return Array.from(set);
  }, [allPosts]);

  // Reaction totals map for posts (batch fetched)
  const [reactionTotals, setReactionTotals] = useState<Record<number, import("@/api/reactions").ReactionTotals>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ids = allPosts.map((p: Post) => Number(p.id)).filter((n: number) => Number.isFinite(n));
        if (ids.length === 0) return;
        const { fetchReactionsBatch } = await import("@/api/reactions");
        const totals = await fetchReactionsBatch(ids.slice(0, 150));
        if (!mounted) return;
        const map: Record<number, import("@/api/reactions").ReactionTotals> = {};
        for (const t of totals) map[t.postId] = t;
        setReactionTotals(map);
      } catch {
        // Ignore failures; UI continues with local fallback logic
      }
    })();

    // Listen for reaction updates from LikeDislike
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as import("@/api/reactions").ReactionTotals;
      if (!detail || typeof detail.postId !== 'number') return;
      setReactionTotals((prev: Record<number, import("@/api/reactions").ReactionTotals>) => ({ ...prev, [detail.postId]: detail }));
    };
    window.addEventListener('reaction:updated', onUpdate as EventListener);
    return () => { mounted = false; window.removeEventListener('reaction:updated', onUpdate as EventListener); };
  }, [allPosts]);

  // Filter and sort posts for display
  const filteredPosts = useMemo(() => {
    let list = [...sortedPosts];
    if (categoryFilter !== 'all') {
      list = list.filter(p => {
        const md = (p.metadata || {}) as Record<string, any>;
        return String(md.themeCategory || '').toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    // Stronger fuzzy search with synonyms and keyword boosts
    const q = search.trim().toLowerCase();
    const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const jaccard = (a: string[], b: string[]) => {
      if (!a.length || !b.length) return 0;
      const setA = new Set(a);
      const setB = new Set(b);
      const inter = [...setA].filter(x => setB.has(x)).length;
      const union = new Set([...a, ...b]).size;
      return inter / union;
    };
    const editDistance = (a: string, b: string) => {
      const m = a.length, n = b.length;
      if (!m) return n;
      if (!n) return m;
      const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + cost
          );
        }
      }
      return dp[m][n];
    };

    const synonyms: Record<string, string[]> = {
      ghost: ['spirit','phantom','specter','wraith'],
      curse: ['hex','jinx','spell'],
      witch: ['hag','sorceress'],
      demon: ['fiend','devil'],
      monster: ['creature','beast'],
      blood: ['bleed','bloody'],
      scream: ['yell','shriek'],
      dark: ['night','gloom','black'],
      shadow: ['shade','silhouette'],
      grave: ['tomb','burial'],
      dead: ['deceased','lifeless'],
      fear: ['terror','dread'],
      knife: ['blade','dagger'],
      eyes: ['gaze','stare'],
      footsteps: ['steps','treads'],
      whisper: ['murmur','hiss'],
      door: ['gate','entry'],
      basement: ['cellar'],
      closet: ['wardrobe','cupboard'],
      window: ['pane','glass'],
      bone: ['skeleton'],
      cold: ['chill','freezing'],
      haunted: ['possessed','cursed'],
      night: ['darkness']
    };

    const boostedKeywords = [
      'blood','scream','shadow','dark','fear','dead','grave','curse','witch','ghost','monster',
      'door','basement','closet','window','footsteps','whisper','knife','bone','eyes','cold','haunted','night'
    ];

    const expandWithSynonyms = (tokens: string[]) => {
      const set = new Set(tokens);
      for (const t of tokens) {
        const syns = synonyms[t];
        if (syns) for (const s of syns) set.add(s);
      }
      return Array.from(set);
    };

    const similarityScore = (post: Post, query: string) => {
      if (!query) return 0;
      const qTokens = tokenize(query);
      const qExpanded = expandWithSynonyms(qTokens);

      const title = String(post.title || "");
      const content = String(post.content || "");
      const titleTokens = tokenize(title);
      const contentTokens = tokenize(content).slice(0, 500); // cap for perf

      // Title overlap (expanded) + direct includes
      const jTitle = jaccard(qExpanded, titleTokens);
      let directTitle = 0;
      for (const qt of qExpanded) {
        if (title.toLowerCase().includes(qt)) directTitle += 0.5;
      }

      // Content token overlap (lighter weight)
      const jContent = jaccard(qExpanded, contentTokens) * 0.55;

      // Typo tolerance: nearest word in title (expanded)
      let typoBonus = 0;
      for (const qt of qExpanded) {
        let best = Infinity;
        for (const tt of titleTokens) {
          const d = editDistance(qt, tt);
          if (d < best) best = d;
        }
        if (best <= 2) typoBonus += 0.4;
      }

      // Keyword boosts if title/content contain boosted keywords
      let keywordBoost = 0;
      for (const kw of boostedKeywords) {
        if (titleTokens.includes(kw)) keywordBoost += 0.25;
        if (contentTokens.includes(kw)) keywordBoost += 0.1;
      }

      // Recency and engagement mild bonuses
      const createdAt = new Date(post.createdAt).getTime();
      const ageDays = Math.max(0, (Date.now() - createdAt) / (24 * 60 * 60 * 1000));
      const recency = Math.max(0, 1 - (ageDays / 30)) * 0.18;

      const likes = typeof post.likesCount === 'number' ? post.likesCount : 0;
      const views = post.metadata && (post.metadata as any).pageViews ? Number((post.metadata as any).pageViews) : 0;
      const engagement = Math.min(1, (likes * 0.01) + (views * 0.0005)) * 0.18;

      return (jTitle * 2.2) + directTitle + jContent + typoBonus + keywordBoost + recency + engagement;
    };

    if (q) {
      // Score and sort by similarity; filter minimal matches (stricter to avoid random picks)
      list = list
        .map(p => ({ p, score: similarityScore(p, q) }))
        .filter(x => x.score > 0.32)
        .sort((a, b) => b.score - a.score)
        .map(x => x.p);
    }

    switch (sort) {
      case 'oldest':
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        list.sort((a, b) => {
          const aLikes = typeof a.likesCount === 'number' ? a.likesCount : 0;
          const bLikes = typeof b.likesCount === 'number' ? b.likesCount : 0;
          const aViews = (a.metadata && (a.metadata as any).pageViews) ? Number((a.metadata as any).pageViews) : 0;
          const bViews = (b.metadata && (b.metadata as any).pageViews) ? Number((b.metadata as any).pageViews) : 0;
          return (bLikes * 2 + bViews) - (aLikes * 2 + aViews);
        });
        break;
      case 'shortest':
        list.sort((a, b) => String(a.content || '').length - String(b.content || '').length);
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return list;
  }, [sortedPosts, categoryFilter, search, sort]);

  const currentPosts = filteredPosts;

  // Latest Stories list - always sorted newest->oldest regardless of dropdown, but respects search/category
  const latestPosts = useMemo(() => {
    let list = [...sortedPosts];
    if (categoryFilter !== 'all') {
      list = list.filter(p => {
        const md = (p.metadata || {}) as Record<string, any>;
        return String(md.themeCategory || '').toLowerCase() === categoryFilter.toLowerCase();
      });
    }
    const q = search.trim().toLowerCase();
    if (q) {
      // Reuse similarity scoring from above (inline duplication to avoid refactor)
      const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const jaccard = (a: string[], b: string[]) => {
        if (!a.length || !b.length) return 0;
        const setA = new Set(a);
        const setB = new Set(b);
        const inter = [...setA].filter(x => setB.has(x)).length;
        const union = new Set([...a, ...b]).size;
        return inter / union;
      };
      const editDistance = (a: string, b: string) => {
        const m = a.length, n = b.length;
        if (!m) return n;
        if (!n) return m;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + cost
            );
          }
        }
        return dp[m][n];
      };
      const synonyms: Record<string, string[]> = {
        ghost: ['spirit','phantom','specter','wraith'],
        curse: ['hex','jinx','spell'],
        witch: ['hag','sorceress'],
        demon: ['fiend','devil'],
        monster: ['creature','beast'],
        blood: ['bleed','bloody'],
        scream: ['yell','shriek'],
        dark: ['night','gloom','black'],
        shadow: ['shade','silhouette'],
        grave: ['tomb','burial'],
        dead: ['deceased','lifeless'],
        fear: ['terror','dread'],
        knife: ['blade','dagger'],
        eyes: ['gaze','stare'],
        footsteps: ['steps','treads'],
        whisper: ['murmur','hiss'],
        door: ['gate','entry'],
        basement: ['cellar'],
        closet: ['wardrobe','cupboard'],
        window: ['pane','glass'],
        bone: ['skeleton'],
        cold: ['chill','freezing'],
        haunted: ['possessed','cursed'],
        night: ['darkness']
      };
      const boostedKeywords = [
        'blood','scream','shadow','dark','fear','dead','grave','curse','witch','ghost','monster',
        'door','basement','closet','window','footsteps','whisper','knife','bone','eyes','cold','haunted','night'
      ];
      const expandWithSynonyms = (tokens: string[]) => {
        const set = new Set(tokens);
        for (const t of tokens) {
          const syns = synonyms[t];
          if (syns) for (const s of syns) set.add(s);
        }
        return Array.from(set);
      };
      const similarityScore = (post: Post, query: string) => {
        const qTokens = tokenize(query);
        const qExpanded = expandWithSynonyms(qTokens);
        const title = String(post.title || "");
        const content = String(post.content || "");
        const titleTokens = tokenize(title);
        const contentTokens = tokenize(content).slice(0, 500);
        const jTitle = jaccard(qExpanded, titleTokens);
        let directTitle = 0;
        for (const qt of qExpanded) {
          if (title.toLowerCase().includes(qt)) directTitle += 0.5;
        }
        const jContent = jaccard(qExpanded, contentTokens) * 0.55;
        let typoBonus = 0;
        for (const qt of qExpanded) {
          let best = Infinity;
          for (const tt of titleTokens) {
            const d = editDistance(qt, tt);
            if (d < best) best = d;
          }
          if (best <= 2) typoBonus += 0.4;
        }
        let keywordBoost = 0;
        for (const kw of boostedKeywords) {
          if (titleTokens.includes(kw)) keywordBoost += 0.25;
          if (contentTokens.includes(kw)) keywordBoost += 0.1;
        }
        return (jTitle * 2.2) + directTitle + jContent + typoBonus + keywordBoost;
      };

      list = list
        .map(p => ({ p, score: similarityScore(p, q) }))
        .filter(x => x.score > 0.32)
        .map(x => x.p);
    }

    // Always newest -> oldest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [sortedPosts, categoryFilter, search]);

  const featuredStory = useMemo(() => {
    const all = [...currentPosts];
    if (!all || all.length === 0) return null;

    const q = search.trim().toLowerCase();
    // If searching, pick best match as featured (smooth, accurate) with synonyms/boosts
    if (q) {
      const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const jaccard = (a: string[], b: string[]) => {
        if (!a.length || !b.length) return 0;
        const setA = new Set(a);
        const setB = new Set(b);
        const inter = [...setA].filter(x => setB.has(x)).length;
        const union = new Set([...a, ...b]).size;
        return inter / union;
      };
      const editDistance = (a: string, b: string) => {
        const m = a.length, n = b.length;
        if (!m) return n;
        if (!n) return m;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + cost
            );
          }
        }
        return dp[m][n];
      };
      const synonyms: Record<string, string[]> = {
        ghost: ['spirit','phantom','specter','wraith'],
        curse: ['hex','jinx','spell'],
        witch: ['hag','sorceress'],
        demon: ['fiend','devil'],
        monster: ['creature','beast'],
        blood: ['bleed','bloody'],
        scream: ['yell','shriek'],
        dark: ['night','gloom','black'],
        shadow: ['shade','silhouette'],
        grave: ['tomb','burial'],
        dead: ['deceased','lifeless'],
        fear: ['terror','dread'],
        knife: ['blade','dagger'],
        eyes: ['gaze','stare'],
        footsteps: ['steps','treads'],
        whisper: ['murmur','hiss'],
        door: ['gate','entry'],
        basement: ['cellar'],
        closet: ['wardrobe','cupboard'],
        window: ['pane','glass'],
        bone: ['skeleton'],
        cold: ['chill','freezing'],
        haunted: ['possessed','cursed'],
        night: ['darkness']
      };
      const boostedKeywords = [
        'blood','scream','shadow','dark','fear','dead','grave','curse','witch','ghost','monster',
        'door','basement','closet','window','footsteps','whisper','knife','bone','eyes','cold','haunted','night'
      ];
      const expandWithSynonyms = (tokens: string[]) => {
        const set = new Set(tokens);
        for (const t of tokens) {
          const syns = synonyms[t];
          if (syns) for (const s of syns) set.add(s);
        }
        return Array.from(set);
      };

      const qTokens = tokenize(q);
      const qExpanded = expandWithSynonyms(qTokens);
      const score = (p: Post) => {
        const title = String(p.title || "");
        const content = String(p.content || "");
        const tTok = tokenize(title);
        const cTok = tokenize(content).slice(0, 400);
        const jTitle = jaccard(qExpanded, tTok) * 2.2;
        let directTitle = 0;
        for (const qt of qExpanded) if (title.toLowerCase().includes(qt)) directTitle += 0.5;
        const jContent = jaccard(qExpanded, cTok) * 0.55;
        let typoBonus = 0;
        for (const qt of qExpanded) {
          let best = Infinity;
          for (const tt of tTok) {
            const d = editDistance(qt, tt);
            if (d < best) best = d;
          }
          if (best <= 2) typoBonus += 0.4;
        }
        let keywordBoost = 0;
        for (const kw of boostedKeywords) {
          if (tTok.includes(kw)) keywordBoost += 0.25;
          if (cTok.includes(kw)) keywordBoost += 0.1;
        }
        return jTitle + directTitle + jContent + typoBonus + keywordBoost;
      };

      const scoredBySearch = all
        .map(p => ({ p, s: score(p) }))
        .sort((a, b) => b.s - a.s)
        .map(x => x.p);

      return scoredBySearch[0] || all[0];
    }

    // Otherwise, pick by engagement/recency
    const sortedByEngagement = all.sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      const sevenDaysInMs = 7 * dayInMs;
      const aRecency = Math.max(0, Math.min(1, 1 - ((now - aDate) / sevenDaysInMs)));
      const bRecency = Math.max(0, Math.min(1, 1 - ((now - bDate) / sevenDaysInMs)));
      const aLikes = typeof a.likesCount === 'number' ? a.likesCount : 0;
      const bLikes = typeof b.likesCount === 'number' ? b.likesCount : 0;
      const aDislikes = typeof a.dislikesCount === 'number' ? a.dislikesCount : 0;
      const bDislikes = typeof b.dislikesCount === 'number' ? b.dislikesCount : 0;
      const aViews = a.metadata && typeof a.metadata === 'object' && 
        'pageViews' in (a.metadata as Record<string, unknown>) ?
        Number((a.metadata as Record<string, unknown>).pageViews || 0) : 0;
      const bViews = b.metadata && typeof b.metadata === 'object' && 
        'pageViews' in (b.metadata as Record<string, unknown>) ?
        Number((b.metadata as Record<string, unknown>).pageViews || 0) : 0;
      const aReadTime = a.metadata && typeof a.metadata === 'object' && 
        'averageReadTime' in (a.metadata as Record<string, unknown>) ?
        Number((a.metadata as Record<string, unknown>).averageReadTime || 0) : 0;
      const bReadTime = b.metadata && typeof b.metadata === 'object' && 
        'averageReadTime' in (b.metadata as Record<string, unknown>) ?
        Number((b.metadata as Record<string, unknown>).averageReadTime || 0) : 0;
      const aHasTheme = a.metadata && typeof a.metadata === 'object' && 
        'themeCategory' in (a.metadata as Record<string, unknown>) ? 5 : 0;
      const bHasTheme = b.metadata && typeof b.metadata === 'object' && 
        'themeCategory' in (b.metadata as Record<string, unknown>) ? 5 : 0;

      const aScore = (aLikes * 3) + 
                     aViews + 
                     (aReadTime * 0.5) - 
                     (aDislikes * 0.5) +
                     (aRecency * 15) + 
                     aHasTheme;

      const bScore = (bLikes * 3) + 
                     bViews + 
                     (bReadTime * 0.5) - 
                     (bDislikes * 0.5) +
                     (bRecency * 15) + 
                     bHasTheme;

      return bScore - aScore;
    });

    return sortedByEngagement[0];
  }, [currentPosts, search]);

  if (!hasPaginatedPosts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center overflow-x-hidden">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Unable to load stories</h2>
          <p className="text-muted-foreground">Please try again later</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden overflow-y-auto">
        {/* Canonical for stories index */}
        <SEO
          title="Stories"
          description="Browse dark, psychological, and gothic fiction stories at Bubble’s Cafe."
          canonical="/stories"
          type="website"
        />
        <div className="w-full pb-12 pt-0 flex-1 mx-0 px-4 sm:px-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-4 px-2 sm:px-4">
            {/* Story index controls: search only; sort moved into the featured story card */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Input
                  placeholder="Search stories..."
                  className="pl-3 pr-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">⏎</span>
              </div>
            </div>
          </div>

          {/* Featured row */}
          {(featuredStory && currentPosts.length > 0) && (
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-decorative">Featured Story</h2>
                      </div>
                      <div className="flex items-center">
                        <Select
                          value={sort}
                          onValueChange={(value: string) =>
                            setSort(value as 'newest' | 'oldest' | 'popular' | 'shortest')
                          }
                        >
                          <SelectTrigger className="w-28 h-7 text-[11px]" aria-label="Sort stories">
                            <SelectValue placeholder="Sort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="popular">Popular</SelectItem>
                            <SelectItem value="shortest">Shortest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <button className="text-left text-lg font-castoro hover:text-primary line-clamp-2" onClick={() => navigateToReader(featuredStory.slug || featuredStory.id)}>
                      {featuredStory.title}
                    </button>
                    <p className="text-sm text-muted-foreground leading-6 mt-2 line-clamp-3 font-sans" style={{ fontFamily: "'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
                      {extractEngagingExcerpt(featuredStory.content, 220)}
                    </p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <time>{new Date(featuredStory.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getReadingTime(featuredStory.content)}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => navigateToReader(featuredStory.slug || featuredStory.id)} className="h-9 px-4 transition-transform active:scale-95">
                        Read story
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-xl border border-border/60 bg-card/80 shadow-sm">
                  <CardContent className="p-4">
                    <Suspense fallback={<div className="h-24" />}>
                      <MostLikedList posts={sortedPosts} onNavigate={navigateToReader} />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-3 mt-2">
            <h1 className="text-3xl md:text-4xl font-decorative">Latest Stories</h1>
            <div className="text-sm text-muted-foreground">{latestPosts.length} stories</div>
          </div>
          {/* Optional category filter if categories exist */}
          {availableCategories.length > 0 && (
            <div className="mb-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat.replace(/_/g,' ').toLowerCase().replace(/^./, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Stories Grid */}
          {latestPosts.length === 0 ? (
            <div
              className="text-center py-8 sm:py-10 md:py-12 border-2 border-dashed rounded-lg bg-card/50 px-3 sm:px-4"
            >
              <div className="w-full">
                <Book className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-primary/40 mb-3 sm:mb-4 mt-3 sm:mt-4" />
                
                {/* Popular right now mini carousel */}
                <div className="mb-5">
                  <div className="text-left sm:text-center mb-2 text-xs font-medium text-muted-foreground">
                    Popular right now
                  </div>
                  <Carousel opts={{ align: "start" }}>
                    <CarouselContent>
                      {(() => {
                        const popular = [...sortedPosts]
                          .map(p => {
                            const totals = reactionTotals[p.id];
                            const likesTotal = totals?.totals?.likes ?? (((p as any).baselineLikes || 0) + (p.likesCount || 0));
                            const views = p.metadata && (p.metadata as any).pageViews ? Number((p.metadata as any).pageViews) : 0;
                            return { p, score: (Number(likesTotal) * 2) + views };
                          })
                          .sort((a, b) => b.score - a.score)
                          .slice(0, 8)
                          .map(x => x.p);
                        return popular.map(pop => (
                          <CarouselItem key={pop.id} className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <Card className="rounded-lg border border-border/50 bg-card/70 hover:bg-card transition">
                              <CardContent className="p-3">
                                <button
                                  className="text-left text-sm font-medium line-clamp-2 hover:text-primary"
                                  onClick={() => navigateToReader(pop.slug || pop.id)}
                                >
                                  {pop.title}
                                </button>
                                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <time>{new Date(pop.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{getReadingTime(pop.content)}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        ));
                      })()}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
                
                {search.trim() ? (
                  <>
                    <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3 leading-relaxed px-2">
                      Did you mean…
                    </p>
                    {/* Alternative keyword chips from synonyms to aid discovery */}
                    <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
                      {(() => {
                        const q = search.trim().toLowerCase();
                        const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
                        const tokens = tokenize(q);
                        const synonyms: Record<string, string[]> = {
                          ghost: ['spirit','phantom','specter','wraith'],
                          curse: ['hex','jinx','spell'],
                          witch: ['hag','sorceress'],
                          demon: ['fiend','devil'],
                          monster: ['creature','beast'],
                          blood: ['bleed','bloody'],
                          scream: ['yell','shriek'],
                          dark: ['night','gloom','black'],
                          shadow: ['shade','silhouette'],
                          grave: ['tomb','burial'],
                          dead: ['deceased','lifeless'],
                          fear: ['terror','dread'],
                          knife: ['blade','dagger'],
                          eyes: ['gaze','stare'],
                          footsteps: ['steps','treads'],
                          whisper: ['murmur','hiss'],
                          door: ['gate','entry'],
                          basement: ['cellar'],
                          closet: ['wardrobe','cupboard'],
                          window: ['pane','glass'],
                          bone: ['skeleton'],
                          cold: ['chill','freezing'],
                          haunted: ['possessed','cursed'],
                          night: ['darkness']
                        };
                        const suggestions = new Set<string>();
                        for (const t of tokens) {
                          const syns = synonyms[t];
                          if (syns) syns.forEach(s => suggestions.add(s));
                        }
                        const chips = Array.from(suggestions).slice(0, 8);
                        return chips.length ? chips.map(k => (
                          <Button
                            key={k}
                            variant="outline"
                            size="sm"
                            className="px-2 py-0.5 text-xs"
                            onClick={() => setSearch(k)}
                          >
                            {k}
                          </Button>
                        )) : null;
                      })()}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5">
                      {(() => {
                        // Build suggestions from all posts using the same scoring as filteredPosts
                        const q = search.trim().toLowerCase();
                        const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
                        const jaccard = (a: string[], b: string[]) => {
                          if (!a.length || !b.length) return 0;
                          const setA = new Set(a);
                          const setB = new Set(b);
                          const inter = [...setA].filter(x => setB.has(x)).length;
                          const union = new Set([...a, ...b]).size;
                          return inter / union;
                        };
                        const editDistance = (a: string, b: string) => {
                          const m = a.length, n = b.length;
                          if (!m) return n;
                          if (!n) return m;
                          const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
                          for (let i = 0; i <= m; i++) dp[i][0] = i;
                          for (let j = 0; j <= n; j++) dp[0][j] = j;
                          for (let i = 1; i <= m; i++) {
                            for (let j = 1; j <= n; j++) {
                              const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                              dp[i][j] = Math.min(
                                dp[i - 1][j] + 1,
                                dp[i][j - 1] + 1,
                                dp[i - 1][j - 1] + cost
                              );
                            }
                          }
                          return dp[m][n];
                        };
                        const qTokens = tokenize(q);
                        const score = (p: Post) => {
                          const title = String(p.title || "");
                          const content = String(p.content || "");
                          const tTok = tokenize(title);
                          const cTok = tokenize(content).slice(0, 300);
                          const jTitle = jaccard(qTokens, tTok) * 2.2;
                          let directTitle = 0;
                          for (const qt of qTokens) if (title.toLowerCase().includes(qt)) directTitle += 0.6;
                          const jContent = jaccard(qTokens, cTok) * 0.6;
                          let typoBonus = 0;
                          for (const qt of qTokens) {
                            let best = Infinity;
                            for (const tt of tTok) {
                              const d = editDistance(qt, tt);
                              if (d < best) best = d;
                            }
                            if (best <= 2) typoBonus += 0.5;
                          }
                          return jTitle + directTitle + jContent + typoBonus;
                        };
                        const suggestions = [...sortedPosts]
                          .map(p => ({ p, s: score(p) }))
                          .filter(x => x.s > 0.12)
                          .sort((a, b) => b.s - a.s)
                          .slice(0, 4)
                          .map(x => x.p);

                        return suggestions.length ? suggestions.map(s => (
                          <Button
                            key={s.id}
                            variant="outline"
                            size="sm"
                            className="px-3 py-1 text-xs"
                            onClick={() => navigateToReader(s.slug || s.id)}
                          >
                            {s.title}
                          </Button>
                        )) : (
                          <span className="text-sm text-muted-foreground">No close matches found.</span>
                        );
                      })()}
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed px-2">
                      Or check out some of our most popular stories instead.
                    </p>
                  </>
                ) : (
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed px-2">
                    Explore popular stories below.
                  </p>
                )}
                
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {latestPosts.map((post: Post) => {
                
                const metadata = post.metadata || {};
                // Prefer metadata theme; otherwise detect from title/content for WordPress API posts
                let themeCategory = "";
                if (typeof metadata === 'object' && metadata !== null && 
                  'themeCategory' in (metadata as Record<string, unknown)) {
                  themeCategory = String((metadata as Record<string, unknown>).themeCategory || "");
                } else {
                  try {
                    // Use sharedDetermineThemeCategory to derive a sensible theme label
                    const derived = sharedDetermineThemeCategory(String(post.title || ''), String(post.content || ''));
                    themeCategory = String(derived || '');
                  } catch {}
                }
                const themeInfo = themeCategory ? THEME_CATEGORIES[themeCategory as keyof typeof THEME_CATEGORIES] : null;
                let displayName = '';
                if (themeCategory) {
                  displayName = themeCategory.charAt(0) + themeCategory.slice(1).toLowerCase().replace(/_/g, ' ');
                }

                return (
                  <article
                    key={post.id}
                    className="group story-card-container relative"
                  >
                    <Card
                      onClick={() => navigateToReader(post.slug || post.id)}
                      className="h-full overflow-hidden rounded-xl border border-border/60 bg-card/80 hover:bg-card transition duration-200 ease-out hover:-translate-y-0.5 shadow-sm hover:shadow-md ring-1 ring-transparent hover:ring-primary/20 cursor-pointer"
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle
                            className="text-lg font-semibold tracking-tight group-hover:text-primary"
                          >
                            {post.title}
                          </CardTitle>
                          <div className="text-[11px] sm:text-xs text-muted-foreground space-y-1 whitespace-nowrap">
                            <div className="flex items-center gap-1 justify-end">
                              <Calendar className="h-3 w-3" />
                              <time>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <Clock className="h-3 w-3" />
                              <span>{getReadingTime(post.content)}</span>
                            </div>
                          </div>
                        </div>
                        {themeCategory && (
                          <div className="mt-2">
                            <Badge className="w-fit text-[12px] sm:text-sm font-medium tracking-wide px-2 py-0.5 flex items-center gap-1">
                              <Book className="h-3 w-3" />
                              {displayName}
                            </Badge>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="px-4 pt-0 pb-3">
                        <p className="text-sm text-muted-foreground leading-6 line-clamp-3 font-sans" style={{ fontFamily: "'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
                          {extractEngagingExcerpt(post.content, 200)}
                        </p>
                      </CardContent>
                      <CardFooter className="px-4 pb-4 pt-3 mt-auto border-t border-border/50">
                        <div className="w-full flex items-center justify-between">
                          {post && post.id && (
                            <Suspense fallback={<div className="text-xs text-muted-foreground">…</div>}>
                              <LikeDislike 
                                key={`like-${post.id}`} 
                                postId={post.id}
                                slug={post.slug}
                                source="wp"
                                variant="index"
                                initialTotals={reactionTotals[post.id] || null}
                                onLike={() => {}}
                                onUpdate={(likes: number, _dislikes: number) => {}}
                              />
                            </Suspense>
                          )}
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); navigateToReader(post.slug || post.id); }}
                            className="h-9 px-4 transition-transform active:scale-95"
                          >
                            Read story
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}