import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useState } from "react";
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ArrowRight, ChevronRight, Clock, Calendar } from "lucide-react";
import { LikeDislike } from "@/components/ui/like-dislike";
import { FloatingPagination } from "@/components/ui/floating-pagination";

import { getReadingTime, getExcerpt } from "@/lib/content-analysis";
import { fetchWordPressPosts, convertWordPressPost } from "@/services/wordpress";

interface WordPressResponse {
  posts: Post[];
  hasMore: boolean;
  page: number;
}

export default function IndexView() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 10; // Number of posts to display per page

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery<WordPressResponse>({
    queryKey: ["wordpress", "posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      console.log('[Index] Fetching posts page:', page);
      const wpPosts = await fetchWordPressPosts(page);
      console.log('[Index] Received posts:', wpPosts.length);
      const posts = wpPosts.map(post => convertWordPressPost(post)) as Post[];
      return {
        posts,
        hasMore: wpPosts.length > 0,
        page
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialPageParam: 1
  });
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Load more data if needed
    const pagesNeeded = Math.ceil(page * POSTS_PER_PAGE / (data?.pages.length || 1) / POSTS_PER_PAGE);
    if (pagesNeeded > (data?.pages.length || 0) && hasNextPage) {
      fetchNextPage();
    }
  };

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
    // Use the primary loading screen component
    return <LoadingScreen />;
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
  
  // Calculate total pages
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  
  // Get current page of posts
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = allPosts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container pb-20">
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-decorative mb-2">Latest Stories</h1>
            <p className="text-muted-foreground">Explore our collection of haunting tales</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="hover:bg-primary/20 transition-colors"
          >
            Back to Home
          </Button>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {currentPosts.map((post, index) => {
            const readingTime = getReadingTime(post.content);
            const excerpt = getExcerpt(post.content);
            const globalIndex = startIndex + index; // Calculate the global index for navigation
            
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full hover:shadow-md transition-all duration-300">
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle
                        className="text-xl group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => navigateToReader(globalIndex)}
                      >
                        {post.title}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3" />
                          <time>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</time>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          <span>{readingTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 flex-grow">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {excerpt}
                    </p>
                    <div className="flex items-center text-xs text-primary gap-1 group-hover:gap-2 transition-all duration-300">
                      Read full story <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 mt-auto border-t">
                    <div className="w-full flex items-center justify-between">
                      <LikeDislike postId={post.id} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateToReader(globalIndex)}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
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

        {/* Standard Pagination for Larger Screens */}
        <div className="mt-8 hidden lg:flex justify-center">
          {totalPages > 1 && (
            <motion.div 
              className="flex flex-wrap gap-2 justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[40px] ${
                    page === currentPage 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary/10 transition-colors"
                  }`}
                >
                  {page}
                </Button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Load More Button - Alternative to pagination */}
        {hasNextPage && allPosts.length < 50 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full max-w-xs"
            >
              {isFetchingNextPage ? 'Loading more stories...' : 'Load More Stories'}
            </Button>
          </div>
        )}
        
        {/* Floating Pagination Component - visible on all screens */}
        {totalPages > 1 && (
          <FloatingPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            variant="default"
          />
        )}
      </div>
    </div>
  );
}