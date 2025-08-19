import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type posts } from "@shared/schema";

type Post = typeof posts.$inferSelect;
import { useLocation } from "wouter";
import { useMemo, useState, useEffect } from "react";
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, ChevronRight, Clock, Calendar, Book,
  TrendingUp, Star, Award
} from "lucide-react";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";


import { getReadingTime, extractHorrorExcerpt, THEME_CATEGORIES } from "@/lib/content-analysis";
import { convertWordPressPost, type WordPressPost, fetchAllWordPressPosts } from "@/services/wordpress";
import { fetchWordPressPosts } from "@/lib/wordpress-api";

interface WordPressResponse {
  posts: Post[];
  hasMore: boolean;
  page: number;
  totalPages?: number;
  total?: number;
}

export default function IndexView() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular' | 'shortest'>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const slideTitles = ["Featured Story", "Newest", "Most Liked"] as const;

  useEffect(() => {
    if (!carouselApi) return;
    const update = () => setActiveSlide(carouselApi.selectedScrollSnap());
    update();
    carouselApi.on("select", update);
    carouselApi.on("reInit", update);
    return () => {
      try {
        (carouselApi as any).off?.("select", update);
        (carouselApi as any).off?.("reInit", update);
      } catch {}
    };
  }, [carouselApi]);
  
  // Navigation functions
  const navigateToReader = (slugOrId: string | number) => {
    console.log('[Index] Navigating to reader:', {
      slugOrId
    });

    try {
      // Clear any existing index first
      sessionStorage.removeItem('selectedStoryIndex');
      // Save a direct slug for the reader to fetch just one story
      sessionStorage.setItem('selectedPostSlug', String(slugOrId));
      // Set the new index
      // Kept for backward compatibility
      // sessionStorage.setItem('selectedStoryIndex', index.toString());
      console.log('[Index] Story index set successfully');
      setLocation('/reader');
    } catch (error) {
      console.error('[Index] Error setting story index:', error);
      // Attempt recovery by clearing storage and using a default
      try {
        sessionStorage.clear();
        sessionStorage.setItem('selectedPostSlug', String(slugOrId));
        setLocation('/reader');
      } catch (retryError) {
        console.error('[Index] Recovery attempt failed:', retryError);
      }
    }
  };
  
  // Query to fetch all WordPress posts for better display
  const allPostsQuery = useQuery({
    queryKey: ["wordpress", "all-posts"],
    queryFn: async () => {
      console.log('[Index] Fetching all WordPress posts');
      try {
        const wpPosts = await fetchAllWordPressPosts();
        console.log(`[Index] Received ${wpPosts.length} total posts`);
        const posts = wpPosts.map((post: WordPressPost) => convertWordPressPost(post)) as Post[];
        return posts;
      } catch (error) {
        console.error('[Index] Error fetching all posts:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
  
  // Fallback to infinite query with pagination if the all posts query fails
  const {
    data,
    isLoading: isPaginatedLoading,
    error: paginatedError,
  } = useInfiniteQuery<WordPressResponse>({
    queryKey: ["wordpress", "posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      console.log('[Index] Fetching posts page:', page);
      // Modified to fetch more posts per page
      const wpResponse = await fetchWordPressPosts({ 
        page, 
        perPage: 100 // Increased to get more posts at once
      });
      const wpPosts = wpResponse.posts || [];
      console.log('[Index] Received posts:', wpPosts.length);
      // Use proper type for the post parameter
      const posts = wpPosts.map((post: WordPressPost) => convertWordPressPost(post)) as Post[];
      return {
        posts,
        hasMore: wpPosts.length === 100, // If we got the full amount, there might be more
        page
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialPageParam: 1,
    enabled: !allPostsQuery.data || allPostsQuery.data.length === 0 // Only enable if allPostsQuery failed
  });

  // Determine which data source to use
  const isLoading = allPostsQuery.isLoading || isPaginatedLoading;
  const error = allPostsQuery.error || paginatedError;
  
  // Always declare these variables regardless of loading state
  const hasAllPosts = allPostsQuery.data && allPostsQuery.data.length > 0;
  const hasPaginatedPosts = data?.pages && data.pages.length > 0 && data.pages[0]?.posts?.length > 0;
  
  // Initialize posts array - will be populated below if data is available
  let allPosts: Post[] = [];
  if (hasAllPosts) {
    allPosts = allPostsQuery.data;
  } else if (hasPaginatedPosts) {
    allPosts = data.pages.flatMap(page => page.posts);
  }
  
  // Always initialize these variables, even if they're empty
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
    // Category filter
    if (categoryFilter !== 'all') {
      list = list.filter(p => {
        const md = (p.metadata || {}) as Record<string, any>;
        return String(md.themeCategory || '').toLowerCase() === categoryFilter.toLowerCase();
      });
    }
    // Search filter (title + content)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => {
        const title = String(p.title || '').toLowerCase();
        const content = String(p.content || '').toLowerCase();
        return title.includes(q) || content.includes(q);
      });
    }
    // Sorting
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

  // Use filtered posts for display
  const currentPosts = filteredPosts;
  
  // Find a featured story using actual metrics - likes, views, and performance data
  // Always call useMemo, even if currentPosts is empty
  const featuredStory = useMemo(() => {
    if (!currentPosts || currentPosts.length === 0) return null;
    
    console.log('\n\n========== FEATURED STORY SELECTION ==========');
    console.log(`%c[Index] Selecting featured story from ${currentPosts.length} posts`, 'color: green; font-weight: bold');
    
    // Debug all posts - check if metrics are actually available
    console.log('%c[Index] Posts metrics debug:', 'color: blue; font-weight: bold');
    currentPosts.forEach(post => {
      // Check for direct metrics in post object
      const hasLikes = typeof post.likesCount === 'number';
      const hasDislikes = typeof post.dislikesCount === 'number';
      
      // Check for metadata
      const metadata = post.metadata && typeof post.metadata === 'object' ? post.metadata : {};
      const views = metadata && 'pageViews' in (metadata as Record<string, unknown>) ? 
        Number((metadata as Record<string, unknown>).pageViews || 0) : 0;
      
      // Include title ID for validation
      console.log(`Post "${post.title}" (ID: ${post.id}):`, {
        likesCount: hasLikes ? post.likesCount : 'undefined',
        dislikesCount: hasDislikes ? post.dislikesCount : 'undefined',
        pageViews: views,
        hasMetadata: !!post.metadata,
        createdAt: post.createdAt
      });
    });
    
    // Modified scoring system that considers recency as a major factor
    const sortedByEngagement = [...currentPosts].sort((a, b) => {
      // Get creation dates for recency
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      
      // Calculate recency score - newer posts get higher scores
      // Posts in the last 7 days get the most recency bonus
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      const sevenDaysInMs = 7 * dayInMs;
      
      // Calculate recency as a 0-1 value (1 being most recent)
      const aRecency = Math.max(0, Math.min(1, 1 - ((now - aDate) / sevenDaysInMs)));
      const bRecency = Math.max(0, Math.min(1, 1 - ((now - bDate) / sevenDaysInMs)));
      
      // Primary metrics: direct from database when available
      // Get likesCount directly from the post object (from DB)
      const aLikes = typeof a.likesCount === 'number' ? a.likesCount : 0;
      const bLikes = typeof b.likesCount === 'number' ? b.likesCount : 0;
      
      // Get dislikesCount directly from the post object (from DB)
      const aDislikes = typeof a.dislikesCount === 'number' ? a.dislikesCount : 0;
      const bDislikes = typeof b.dislikesCount === 'number' ? b.dislikesCount : 0;
      
      // Secondary metrics: from metadata
      // Get page views from metadata if available
      const aViews = a.metadata && typeof a.metadata === 'object' && 
        'pageViews' in (a.metadata as Record<string, unknown>) ?
        Number((a.metadata as Record<string, unknown>).pageViews || 0) : 0;
      
      const bViews = b.metadata && typeof b.metadata === 'object' && 
        'pageViews' in (b.metadata as Record<string, unknown>) ?
        Number((b.metadata as Record<string, unknown>).pageViews || 0) : 0;
      
      // Get reading time metrics if available
      const aReadTime = a.metadata && typeof a.metadata === 'object' && 
        'averageReadTime' in (a.metadata as Record<string, unknown>) ?
        Number((a.metadata as Record<string, unknown>).averageReadTime || 0) : 0;
      
      const bReadTime = b.metadata && typeof b.metadata === 'object' && 
        'averageReadTime' in (b.metadata as Record<string, unknown>) ?
        Number((b.metadata as Record<string, unknown>).averageReadTime || 0) : 0;
      
      // Assign points for having a theme category
      const aHasTheme = a.metadata && typeof a.metadata === 'object' && 
        'themeCategory' in (a.metadata as Record<string, unknown>) ? 5 : 0;
      
      const bHasTheme = b.metadata && typeof b.metadata === 'object' && 
        'themeCategory' in (b.metadata as Record<string, unknown>) ? 5 : 0;
      
      // Calculate engagement score with weighted factors:
      // - Likes have highest weight (positive engagement)
      // - Views are important but secondary
      // - Reading time indicates content quality
      // - Dislikes have a smaller negative effect (still indicates engagement)
      // - Recency is now a major factor - multiply by up to 15 points for very recent posts
      // - Theme is now directly included in the scoring formula
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
      
      // Comparison for debugging
      if (a.id === 1 || a.id === 3) {
        console.log(`\n%cCOMPARISON: "${a.title}" vs other stories`, 'color: red; font-weight: bold');
        console.log(`Score for "${a.title}" (ID: ${a.id}): ${aScore.toFixed(2)}`, {
          likes: aLikes,
          views: aViews,
          recency: aRecency.toFixed(2),
          hasTheme: aHasTheme > 0,
          finalScore: aScore.toFixed(2)
        });
      }
      
      return bScore - aScore; // Sort in descending order
    });
    
    // Always log the top 5 posts for debugging
    console.log('\n%c[Index] Top 5 posts by score:', 'color: blue; font-weight: bold');
    sortedByEngagement.slice(0, 5).forEach((post, index) => {
      const likes = typeof post.likesCount === 'number' ? post.likesCount : 0;
      const views = post.metadata && typeof post.metadata === 'object' && 
        'pageViews' in (post.metadata as Record<string, unknown>) ?
        Number((post.metadata as Record<string, unknown>).pageViews || 0) : 0;
        
      console.log(`#${index + 1}: "${post.title}" (ID: ${post.id}) - ${likes} likes, ${views} views`);
    });
    
    // Check if we have at least 5 posts
    if (sortedByEngagement.length >= 5) {
      // Avoid always using the first post - pick from top 5 stories to add variety
      // Use a different post ID modulo 5 each day to rotate featured story daily
      const dayOfYear = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
      const rotationIndex = dayOfYear % 5; // 0-4 based on day of year
      
      console.log(`\n%c[Index] Using rotation index ${rotationIndex} based on day of year ${dayOfYear}`, 'color: purple');
      console.log('%c[Index] Featured story selected:', 'color: green; font-weight: bold', {
        id: sortedByEngagement[rotationIndex].id,
        title: sortedByEngagement[rotationIndex].title,
        likes: sortedByEngagement[rotationIndex].likesCount,
        views: sortedByEngagement[rotationIndex].metadata && 
               typeof sortedByEngagement[rotationIndex].metadata === 'object' && 
               'pageViews' in (sortedByEngagement[rotationIndex].metadata as Record<string, unknown>) ? 
               (sortedByEngagement[rotationIndex].metadata as Record<string, unknown>).pageViews : 0
      });
      console.log('=============================================\n\n');
      
      return sortedByEngagement[rotationIndex];
    }
    
    // If we have fewer than 5 posts, just use the highest ranked one
    console.log('[Index] Featured story selected (fewer than 5 posts):', {
      id: sortedByEngagement[0].id,
      title: sortedByEngagement[0].title
    });
    console.log('=============================================\n\n');
    
    return sortedByEngagement[0];
  }, [currentPosts]);
  
  // Handle loading state locally without global loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading stories...</p>
        </div>
      </div>
    );
  }
  
  if (!hasAllPosts && !hasPaginatedPosts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center overflow-x-hidden">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Unable to load stories</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Please try again later"}</p>
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
      <div className="w-full pb-12 pt-6 flex-1 mx-0 px-4 sm:px-6 flex flex-col">
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

        {/* Featured row (carousel removed) */}
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
                    {extractHorrorExcerpt(featuredStory.content, 220)}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <time>{format(new Date(featuredStory.createdAt), 'MMM d, yyyy')}</time>
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
              {/* Most liked list */}
              <Card className="rounded-xl border border-border/60 bg-card/80 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Most Liked</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[...sortedPosts].sort((a,b) => (b.likesCount||0)-(a.likesCount||0)).slice(0,4).map((p) => (
                      <div key={p.id} className="flex flex-col">
                        <button className="text-left text-sm font-medium hover:text-primary line-clamp-1" onClick={() => navigateToReader(p.slug || p.id)}>{p.title}</button>
                        <div className="text-[11px] text-muted-foreground">❤️ {(p.likesCount||0)} • {getReadingTime(p.content)}</div>
                      </div>
                    ))}
                  </div>
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
            {currentPosts.map((post: Post, index: number) => {
              // Extract all data processing outside the render function
              // Add extra debug logging
              console.log(`[Excerpt Debug] Processing post: ${post.title} (ID: ${post.id})`);
              console.log(`[Excerpt Debug] Content length: ${post.content.length} characters`);
              const excerpt = extractHorrorExcerpt(post.content);
              console.log(`[Excerpt Debug] Generated horror excerpt: "${excerpt.substring(0, 50)}..."`);
              
              const globalIndex = index; // Since we're not paginating, index is the global index
              const metadata = post.metadata || {};
              
              // Process metadata safely
              let themeCategory = "";
              if (typeof metadata === 'object' && metadata !== null && 
                'themeCategory' in (metadata as Record<string, unknown>)) {
                themeCategory = String((metadata as Record<string, unknown>).themeCategory || "");
              }
              
              // Get theme info
              const themeInfo = themeCategory ? THEME_CATEGORIES[themeCategory as keyof typeof THEME_CATEGORIES] : null;
              
              // Format display name
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
                            <time>{format(new Date(post.createdAt), 'MMM d, yyyy')}</time>
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
                          <LikeDislike 
                            key={`like-${post.id}`} 
                            postId={post.id} 
                            variant="index"
                            onLike={() => console.log('Liked on index')}
                            onUpdate={(likes, dislikes) => console.log('Index stats updated', { likes, dislikes })}
                          />
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