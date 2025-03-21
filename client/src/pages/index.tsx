import { useInfiniteQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useState } from "react";
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, ChevronRight, Clock, Calendar, Book, Loader2
} from "lucide-react";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Badge } from "@/components/ui/badge";
import Mist from "@/components/effects/mist";

import { getReadingTime, getExcerpt, THEME_CATEGORIES } from "@/lib/content-analysis";
import { convertWordPressPost, type WordPressPost } from "@/services/wordpress";
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
  // No more pagination - fetch all posts at once
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery<WordPressResponse>({
    queryKey: ["wordpress", "posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      console.log('[Index] Fetching posts page:', page);
      // Modified to fetch 20 posts per page
      const wpResponse = await fetchWordPressPosts({ 
        page, 
        perPage: 20
      });
      const wpPosts = wpResponse.posts || [];
      console.log('[Index] Received posts:', wpPosts.length);
      // Use proper type for the post parameter
      const posts = wpPosts.map((post: WordPressPost) => convertWordPressPost(post)) as Post[];
      return {
        posts,
        hasMore: wpPosts.length > 0,
        page
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true, // Changed to true to ensure we get the latest posts
    refetchOnWindowFocus: true, // Changed to true to ensure posts update when user returns to tab
    initialPageParam: 1
  });

  // Navigation functions
  const navigateToReader = (index: number) => {
    console.log('[Index] Navigating to reader:', {
      index,
      totalPosts: data?.pages.reduce((acc, page) => acc + page.posts.length, 0)
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

  if (error || !data?.pages[0]?.posts) {
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

  const allPosts = data.pages.flatMap(page => page.posts);
  
  // Sort posts by newest first (default sorting for March 3rd version)
  const sortedPosts = [...allPosts].sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // No need for pagination calculations anymore
  
  // Display all posts instead of paginating
  const currentPosts = sortedPosts;

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
        
        <motion.div
          className="flex justify-center items-center mb-10 mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
              const excerpt = getExcerpt(post.content);
              const globalIndex = index; // Since we're not paginating, index is the global index
              const metadata = post.metadata || {};
              // Handle the type safely
              const themeCategory = typeof metadata === 'object' && metadata !== null && 'themeCategory' in metadata
                ? String(metadata.themeCategory || "") 
                : "";
              
              // Get theme info for icon display
              const themeInfo = themeCategory ? THEME_CATEGORIES[themeCategory as keyof typeof THEME_CATEGORIES] : null;
              
              // Capitalize first letter and lowercase the rest, replacing underscores with spaces
              const displayName = themeCategory 
                ? themeCategory.charAt(0) + themeCategory.slice(1).toLowerCase().replace(/_/g, ' ') 
                : '';
              
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
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3 font-cormorant">
                        {excerpt}
                      </p>
                      <div className="flex items-center text-xs text-primary gap-1 group-hover:gap-2 transition-all duration-300 font-medium hover:underline">
                        Read full story <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 mt-auto border-t">
                      <div className="w-full flex items-center justify-between">
                        <LikeDislike postId={post.id} />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigateToReader(globalIndex)}
                          className="shadow-sm hover:shadow transition-all text-xs text-primary hover:text-primary/80 flex items-center gap-1"
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