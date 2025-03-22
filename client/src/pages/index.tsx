import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useMemo } from "react";
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, ChevronRight, Clock, Calendar, Book, Loader2,
  TrendingUp, Star, Award
} from "lucide-react";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Badge } from "@/components/ui/badge";
import Mist from "@/components/effects/mist";

import { getReadingTime, getExcerpt, THEME_CATEGORIES } from "@/lib/content-analysis";
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
  
  // Navigation functions
  const navigateToReader = (index: number) => {
    console.log('[Index] Navigating to reader:', {
      index
    });

    try {
      // Clear any existing index first
      sessionStorage.removeItem('selectedStoryIndex');
      // Set the new index
      sessionStorage.setItem('selectedStoryIndex', index.toString());
      console.log('[Index] Story index set successfully');
      setLocation('/reader');
    } catch (error) {
      console.error('[Index] Error setting story index:', error);
      // Attempt recovery by clearing storage and using a default
      try {
        sessionStorage.clear();
        sessionStorage.setItem('selectedStoryIndex', '0');
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPaginatedLoading,
    error: paginatedError,
    refetch
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
  
  // Display all posts instead of paginating
  const currentPosts = sortedPosts;
  
  // Find a featured story using actual metrics - likes, views, and performance data
  // Always call useMemo, even if currentPosts is empty
  const featuredStory = useMemo(() => {
    if (!currentPosts || currentPosts.length === 0) return null;
    
    // Sort posts by engagement metrics (likes and views)
    // This uses actual database metrics from the posts table
    const sortedByEngagement = [...currentPosts].sort((a, b) => {
      // Get likes count from metadata if available
      const aLikes = a.metadata && typeof a.metadata === 'object' && 
        'likesCount' in (a.metadata as Record<string, unknown>) ?
        Number((a.metadata as Record<string, unknown>).likesCount || 0) : 0;
      
      const bLikes = b.metadata && typeof b.metadata === 'object' && 
        'likesCount' in (b.metadata as Record<string, unknown>) ?
        Number((b.metadata as Record<string, unknown>).likesCount || 0) : 0;
      
      // Get page views from metadata if available
      const aViews = a.metadata && typeof a.metadata === 'object' && 
        'pageViews' in (a.metadata as Record<string, unknown>) ?
        Number((a.metadata as Record<string, unknown>).pageViews || 0) : 0;
      
      const bViews = b.metadata && typeof b.metadata === 'object' && 
        'pageViews' in (b.metadata as Record<string, unknown>) ?
        Number((b.metadata as Record<string, unknown>).pageViews || 0) : 0;
      
      // Calculate engagement score (likes + views)
      const aScore = aLikes * 2 + aViews;
      const bScore = bLikes * 2 + bViews;
      
      return bScore - aScore; // Sort in descending order
    });
    
    // Take the top post with theme category if possible
    const topWithTheme = sortedByEngagement.find(post => {
      if (!post.metadata) return false;
      const metadata = post.metadata as Record<string, unknown>;
      return 'themeCategory' in metadata && metadata.themeCategory;
    });
    
    // Return the post with highest engagement and theme, or just the highest engagement
    return topWithTheme || sortedByEngagement[0];
  }, [currentPosts]);
  
  // Now handle conditional renders after all hooks have been called
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <h2 className="text-xl font-semibold text-foreground">Loading stories...</h2>
        </div>
      </div>
    );
  }
  
  if (!hasAllPosts && !hasPaginatedPosts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen w-full bg-background">
      <Mist className="opacity-30" />
      <div className="container pb-20 pt-4">
        <motion.div
          className="flex justify-end items-center mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="hover:bg-primary/20 transition-colors"
          >
            Back to Home
          </Button>
        </motion.div>
        
        {/* Featured Story */}
        {featuredStory && (
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-decorative">Featured Story</h2>
            </div>
            
            <Card className="hover:shadow-lg transition-all duration-500 overflow-hidden border-[1.5px] hover:border-primary/50 bg-card/60 backdrop-blur-sm">
              <div className="md:flex">
                <div className="md:w-2/3 p-5">
                  <div className="flex flex-col h-full">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <CardTitle
                          className="text-2xl group-hover:text-primary transition-colors cursor-pointer font-castoro mb-3"
                          onClick={() => navigateToReader(currentPosts.findIndex(p => p.id === featuredStory.id))}
                        >
                          {featuredStory.title}
                        </CardTitle>
                      </div>
                      
                      {/* Theme badge for featured story */}
                      {featuredStory.metadata && typeof featuredStory.metadata === 'object' && 
                       featuredStory.metadata !== null && 
                       'themeCategory' in (featuredStory.metadata as Record<string, unknown>) && 
                       (featuredStory.metadata as Record<string, unknown>).themeCategory ? (
                        <div className="mb-4">
                          <Badge 
                            variant="default"
                            className="text-xs font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 w-fit"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {typeof (featuredStory.metadata as Record<string, unknown>).themeCategory === 'string' 
                              ? ((featuredStory.metadata as Record<string, unknown>).themeCategory as string).charAt(0) + 
                                ((featuredStory.metadata as Record<string, unknown>).themeCategory as string).slice(1).toLowerCase().replace(/_/g, ' ')
                              : 'Featured'}
                          </Badge>
                        </div>
                      ) : null}
                      
                      <p className="text-base text-muted-foreground leading-relaxed mb-5 line-clamp-4 font-cormorant">
                        {getExcerpt(featuredStory.content, 300)}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap justify-between items-center mt-auto">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 md:mb-0">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <time>{format(new Date(featuredStory.createdAt), 'MMMM d, yyyy')}</time>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getReadingTime(featuredStory.content)}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => navigateToReader(currentPosts.findIndex(p => p.id === featuredStory.id))}
                        className="shadow-md hover:shadow-lg transition-all text-sm ml-auto"
                      >
                        Read Featured Story <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="hidden md:block md:w-1/3 bg-card/80 p-5 border-l">
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium mb-3 font-castoro">Why We Featured This</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This story was selected based on reader engagement and popularity metrics. 
                        It represents some of the best content on our platform.
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between">
                        {featuredStory && <LikeDislike postId={featuredStory.id} size="lg" />}
                        <TrendingUp className="h-5 w-5 text-primary/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Latest Stories Heading - Below Featured Story */}
        <motion.div
          className="flex justify-center items-center mb-6 mt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-4xl font-decorative whitespace-nowrap">Latest Stories</h1>
        </motion.div>

        {/* Stories Grid */}
        {currentPosts.length === 0 ? (
          <motion.div
            className="text-center py-12 border-2 border-dashed rounded-lg bg-card/50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="max-w-md mx-auto">
              <Book className="h-16 w-16 mx-auto text-primary/40 mb-4 mt-4" />
              <h3 className="text-xl font-decorative mb-3">No Stories Found</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                No stories are available at the moment. Check back soon or try refreshing the page.
              </p>
              <Button 
                variant="default"
                onClick={() => refetch()}
                className="shadow-sm"
              >
                Refresh
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {currentPosts.map((post: Post, index: number) => {
              // Extract all data processing outside the render function
              const excerpt = getExcerpt(post.content);
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
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group story-card-container"
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="h-full hover:shadow-md transition-all duration-300 overflow-hidden border-[1.5px] hover:border-primary/30">
                    {themeCategory && themeInfo && (
                      <div className="h-1.5 bg-primary w-full"></div>
                    )}
                    <CardHeader className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-start gap-3">
                          <CardTitle
                            className="text-lg group-hover:text-primary transition-colors cursor-pointer font-castoro story-card-title"
                            onClick={() => navigateToReader(globalIndex)}
                          >
                            {post.title}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground space-y-1 whitespace-nowrap">
                            <div className="flex items-center gap-1 justify-end">
                              <Calendar className="h-3 w-3" />
                              <time>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</time>
                            </div>
                            <div className="flex items-center gap-1 justify-end read-time">
                              <Clock className="h-3 w-3" />
                              <span>{getReadingTime(post.content)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {themeCategory && themeInfo && (
                          <Badge 
                            variant={themeInfo.badgeVariant === "cosmic" ? "outline" : themeInfo.badgeVariant || "outline"}
                            className="w-fit text-xs font-medium tracking-wide px-2 py-0.5 flex items-center gap-1"
                          >
                            <span className="h-3 w-3 mr-1">
                              <Book className="h-3 w-3" />
                            </span>
                            {displayName}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 flex-grow story-card-content">
                      <p className="text-base text-muted-foreground leading-relaxed mb-3 line-clamp-3 font-cormorant">
                        {excerpt}
                      </p>
                      <div className="flex items-center text-xs text-primary gap-1 group-hover:gap-2 transition-all duration-300 font-medium hover:underline">
                        Read full story <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>

                    <CardFooter className="p-3 mt-auto border-t">
                      <div className="w-full flex items-center justify-between">
                        {/* Make sure the LikeDislike component is always mounted in same order */}
                        {post && post.id && <LikeDislike key={`like-${post.id}`} postId={post.id} />}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigateToReader(globalIndex)}
                          className="shadow-sm hover:shadow transition-all text-xs text-primary hover:text-primary/80 flex items-center gap-1 h-8 px-2"
                        >
                          Read More <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}