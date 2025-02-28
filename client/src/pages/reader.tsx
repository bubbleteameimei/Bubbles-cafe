import React, { useState, useCallback, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle, Clock, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/blog/comment-section";
import { getReadingTime } from "@/lib/content-analysis";
import { fetchWordPressPosts, convertWordPressPost } from "@/services/wordpress";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
  page?: number;
}

export default function Reader() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const [, setLocation] = useLocation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ["wordpress", "posts", "reader"],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const wpPosts = await fetchWordPressPosts(pageParam, 100); // Fetch more posts per page
        const posts = wpPosts.map(post => convertWordPressPost(post)) as Post[];

        return {
          posts,
          hasMore: posts.length === 100, // If we got a full page, there might be more
          page: pageParam
        };
      } catch (error) {
        console.error('Error fetching WordPress posts:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? (lastPage.page || 0) + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialPageParam: 1
  });

  const goToPrevious = useCallback(() => {
    const posts = data?.pages.flatMap(page => page.posts);
    if (!posts || posts.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data?.pages]);

  const goToNext = useCallback(() => {
    const posts = data?.pages.flatMap(page => page.posts);
    if (!posts || posts.length === 0) return;
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data?.pages]);

  const randomize = useCallback(() => {
    const posts = data?.pages.flatMap(page => page.posts);
    if (!posts || posts.length === 0) return;
    const newIndex = Math.floor(Math.random() * posts.length);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data?.pages]);

  useEffect(() => {
    if (data?.pages) {
      sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
    }
  }, [data?.pages, currentIndex]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !data?.pages[0].posts || data.pages[0].posts.length === 0) {
    console.error('Error loading stories:', error);
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Unable to load stories</h2>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const posts = data.pages.flatMap(page => page.posts);
  const currentPost = posts[currentIndex];

  if (!currentPost) {
    return <div className="text-center p-8">No story selected.</div>;
  }

  const formattedDate = format(new Date(currentPost.createdAt), 'MMMM d, yyyy');
  const readingTime = getReadingTime(currentPost.content);

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('reader-font-size');
    return saved ? parseInt(saved, 10) : 16;
  });

  const MIN_FONT_SIZE = 14;
  const MAX_FONT_SIZE = 24;
  const FONT_SIZE_STEP = 2;

  const increaseFontSize = () => {
    setFontSize(prev => {
      const newSize = Math.min(prev + FONT_SIZE_STEP, MAX_FONT_SIZE);
      localStorage.setItem('reader-font-size', newSize.toString());
      return newSize;
    });
  };

  const decreaseFontSize = () => {
    setFontSize(prev => {
      const newSize = Math.max(prev - FONT_SIZE_STEP, MIN_FONT_SIZE);
      localStorage.setItem('reader-font-size', newSize.toString());
      return newSize;
    });
  };


  return (
    <div className="relative min-h-screen pb-32">
      <Mist />
      <div className="story-container max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <article>
              <div className="flex flex-col items-center space-y-4 mb-8">
                <h1 className="story-title text-4xl font-bold text-center">{currentPost.title}</h1>

                <div className="flex items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={goToPrevious}
                    className="group hover:bg-primary/10 transition-all duration-300"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Previous Story
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToNext}
                    className="group hover:bg-primary/10 transition-all duration-300"
                  >
                    Next Story
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              <div className="story-meta flex items-center gap-4 mb-4 text-sm text-muted-foreground justify-center">
                <time>{formattedDate}</time>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime}</span>
                </div>
              </div>

              <div
                className="story-content mb-8 prose dark:prose-invert max-w-none"
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ __html: currentPost.content }}
              />

              <div className="border-t border-border pt-4">
                <LikeDislike postId={currentPost.id} />
              </div>

              {hasNextPage && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Loading more stories...' : 'Load More Stories'}
                  </Button>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-border">
                <CommentSection
                  postId={currentPost.id}
                  title={currentPost.title || ''}
                />
              </div>
            </article>
          </motion.div>
        </AnimatePresence>

        <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="controls-wrapper backdrop-blur-sm bg-background/50 px-6 py-4 rounded-full shadow-xl border border-border/50 hover:bg-background/70 transition-all mx-4"
          >
            <div className="nav-controls flex items-center gap-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={goToPrevious} className="hover:bg-primary/10 transition-all duration-300">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous Story</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span className="text-sm font-medium">
                {currentIndex + 1} / {posts.length}
              </span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={randomize} className="hover:bg-primary/10 transition-all duration-300">
                      <Shuffle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Random Story</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={goToNext} className="hover:bg-primary/10 transition-all duration-300">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next Story</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}