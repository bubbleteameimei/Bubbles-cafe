import React, { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type posts } from "@shared/schema";
type Post = typeof posts.$inferSelect;
import { useLocation } from "wouter";

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
import { type CarouselApi } from "@/components/ui/carousel";

import { getReadingTime, extractExcerpt } from "@/lib/excerpt-lite";
import { THEME_CATEGORIES } from "@/lib/themes-lite";
import type { WordPressPost } from "@/lib/wordpress-api";
import { fetchWordPressPosts } from "@/lib/wordpress-api";



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

  // Navigation functions
  const navigateToReader = (slugOrId: string | number) => {
    try {
      sessionStorage.removeItem('selectedStoryIndex');
      sessionStorage.setItem('selectedPostSlug', String(slugOrId));
      setLocation('/reader');
    } catch (error) {
      try {
        sessionStorage.clear();
        sessionStorage.setItem('selectedPostSlug', String(slugOrId));
        setLocation('/reader');
      } catch {}
    }
  };

  // Paginated query
  const {
    data,
  } = useInfiniteQuery<{ posts: Post[]; hasMore: boolean; page: number; }>({
    queryKey: ["wordpress", "posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const wpResponse = await fetchWordPressPosts({ 
        page, 
        perPage: 100
      });
      const wpPosts = wpResponse.posts || [];
      const posts = wpPosts.map((post: WordPressPost) => wpToPost(post)) as Post[];
      return {
        posts,
        hasMore: wpPosts.length === 100,
        page
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialPageParam: 1,
    suspense: true
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

  // Filter and sort posts for display
  const filteredPosts = useMemo(() => {
    let list = [...sortedPosts];
    if (categoryFilter !== 'all') {
      list = list.filter(p => {
        const md = (p.metadata || {}) as Record<string, any>;
        return String(md.themeCategory || '').toLowerCase() === categoryFilter.toLowerCase();
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => {
        const title = String(p.title || '').toLowerCase();
        const content = String(p.content || '').toLowerCase();
        return title.includes(q) || content.includes(q);
      });
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

  const featuredStory = useMemo(() => {
    if (!currentPosts || currentPosts.length === 0) return null;
    const sortedByEngagement = [...currentPosts].sort((a, b) => {
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

    if (sortedByEngagement.length >= 5) {
      const dayOfYear = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
      const rotationIndex = dayOfYear % 5;
      return sortedByEngagement[rotationIndex];
    }

    return sortedByEngagement[0];
  }, [currentPosts]);

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
        <div className="w-full pb-12 pt-0 flex-1 mx-0 px-4 sm:px-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-4 px-2 sm:px-4">
            {/* Story index controls: search and filters */}
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
              <Select
                value={sort}
                onValueChange={(value: string) =>
                  setSort(value as 'newest' | 'oldest' | 'popular' | 'shortest')
                }
              >
                <SelectTrigger className="w-36" aria-label="Sort stories (changes story cards)" title="Sort stories (changes story cards)">
                  <SelectValue placeholder="Sort by (updates story cards)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="shortest">Shortest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured row */}
          {(featuredStory && currentPosts.length > 0) && (
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-primary" />
                      <h2 className="text-lg font-decorative">Featured Story</h2>
                    </div>
                    <button className="text-left text-lg font-castoro hover:text-primary line-clamp-2" onClick={() => navigateToReader(featuredStory.slug || featuredStory.id)}>
                      {featuredStory.title}
                    </button>
                    <p className="text-sm text-muted-foreground leading-6 mt-2 line-clamp-3 font-serif">
                      {extractExcerpt(featuredStory.content, 220)}
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
            <div className="text-sm text-muted-foreground">{filteredPosts.length} stories</div>
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
          {currentPosts.length === 0 ? (
            <div
              className="text-center py-8 sm:py-10 md:py-12 border-2 border-dashed rounded-lg bg-card/50 px-3 sm:px-4"
            >
              <div className="w-full">
                <Book className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-primary/40 mb-3 sm:mb-4 mt-3 sm:mt-4" />
                <h3 className="text-lg sm:text-xl font-decorative mb-2 sm:mb-3">No Stories Found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed px-2">
                  No stories are available at the moment. Check back soon or try refreshing the page.
                </p>
                <Button 
                  variant="default"
                  onClick={() => window.location.reload()}
                  className="shadow-sm text-sm sm:text-base h-9 sm:h-10"
                >
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {currentPosts.map((post: Post) => {
                const excerpt = extractExcerpt(post.content);
                const metadata = post.metadata || {};
                let themeCategory = "";
                if (typeof metadata === 'object' && metadata !== null && 
                  'themeCategory' in (metadata as Record<string, unknown>)) {
                  themeCategory = String((metadata as Record<string, unknown>).themeCategory || "");
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
                        {themeCategory && themeInfo && (
                          <div className="mt-2">
                            <Badge className="w-fit text-[11px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1">
                              <Book className="h-3 w-3" />
                              {displayName}
                            </Badge>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="px-4 pt-0 pb-3">
                        <p className="text-sm text-muted-foreground leading-6 line-clamp-3 font-serif">
                          {excerpt}
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
                                onLike={() => {}}
                                onUpdate={() => {}}
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