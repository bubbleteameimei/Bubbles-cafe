import { useState, useCallback, useEffect, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle, Twitter, Facebook, FileShare, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import CommentSection from "@/components/blog/comment-section";
import { getReadingTime } from "@/lib/content-analysis";
import { fetchWordPressPosts, convertWordPressPost } from "@/services/wordpress";
import { useFontSize } from "@/hooks/use-font-size";

// Types
interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
  page: number;
}

// Utilities
const getShareUrls = (post: Post) => {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(post.title);
  return {
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
    email: `mailto:?subject=${title}&body=${url}`
  };
};

export default function Reader() {
  // Hooks (all grouped at the top)
  const [, setLocation] = useLocation();
  const { fontSize } = useFontSize();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  // Query
  const { data, isLoading, error } = useInfiniteQuery<PostsResponse>({
    queryKey: ["wordpress", "posts", "reader"],
    queryFn: async ({ pageParam = 1 }) => {
      const wpPosts = await fetchWordPressPosts(pageParam, 100);
      const posts = wpPosts.map(post => convertWordPressPost(post)) as Post[];
      return {
        posts,
        hasMore: posts.length === 100,
        page: pageParam
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialPageParam: 1
  });

  // Memoized values
  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.posts);
  }, [data?.pages]);

  const currentPost = useMemo(() => {
    return posts[currentIndex];
  }, [posts, currentIndex]);

  // Callbacks
  const goToPrevious = useCallback(() => {
    if (posts.length === 0) return;
    setCurrentIndex(prev => (prev === 0 ? posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts.length]);

  const goToNext = useCallback(() => {
    if (posts.length === 0) return;
    setCurrentIndex(prev => (prev === posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts.length]);

  const randomize = useCallback(() => {
    if (posts.length === 0) return;
    const newIndex = Math.floor(Math.random() * posts.length);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts.length]);

  // Effects
  useEffect(() => {
    if (posts.length > 0) {
      sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
    }
  }, [currentIndex, posts.length]);

  // Loading state
  if (isLoading) return <LoadingScreen />;

  // Error state
  if (error || posts.length === 0) {
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

  if (!currentPost) {
    return <div className="text-center p-8">No story selected.</div>;
  }

  const formattedDate = format(new Date(currentPost.createdAt), 'MMMM d, yyyy');
  const readingTime = getReadingTime(currentPost.content);
  const shareUrls = getShareUrls(currentPost);

  return (
    <div className="relative min-h-screen bg-background">
      <Mist />
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.article
              key={currentPost.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="prose dark:prose-invert mx-auto"
            >
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-4xl font-bold text-center mb-4 tracking-tight">
                  {currentPost.title}
                </h1>

                <div className="flex items-center gap-4">
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

              <div className="flex items-center justify-between mb-8 text-sm text-muted-foreground">
                <time>{formattedDate}</time>
                <span>{readingTime}</span>
              </div>

              <div
                className="story-content mb-8"
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ __html: currentPost.content }}
              />

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-8">
                  <LikeDislike postId={currentPost.id} />
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={shareUrls.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>Share on Twitter</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={shareUrls.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Facebook className="h-5 w-5" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>Share on Facebook</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={shareUrls.reddit}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <FileShare className="h-5 w-5" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>Share on Reddit</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={shareUrls.email}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Mail className="h-5 w-5" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>Share via Email</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <CommentSection postId={currentPost.id} />
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="backdrop-blur-sm bg-background/50 px-6 py-4 rounded-full shadow-xl border border-border/50 hover:bg-background/70 transition-all mx-4"
          >
            <div className="flex items-center gap-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToPrevious}
                      className="hover:bg-primary/10 transition-all duration-300"
                    >
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={randomize}
                      className="hover:bg-primary/10 transition-all duration-300"
                    >
                      <Shuffle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Random Story</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToNext}
                      className="hover:bg-primary/10 transition-all duration-300"
                    >
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