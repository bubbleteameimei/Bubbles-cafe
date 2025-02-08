import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle, ListFilter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";

export default function Reader() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  const goToPrevious = useCallback(() => {
    if (!posts?.length) return;
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [posts?.length]);

  const goToNext = useCallback(() => {
    if (!posts?.length) return;
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [posts?.length]);

  const randomize = useCallback(() => {
    if (!posts?.length) return;
    const newIndex = Math.floor(Math.random() * posts.length);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [posts?.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentIndex]);

  const getReadingTime = (content: string) => {
    if (!content) return '0 min read';
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !posts || posts.length === 0) {
    console.error('Error loading stories:', error);
    return <div className="text-center p-8">Stories not found or error loading stories.</div>;
  }

  const currentPost = posts[currentIndex];
  if (!currentPost) {
    console.error('Current post is undefined:', { currentIndex, totalPosts: posts.length });
    return <div className="text-center p-8">Error loading current story.</div>;
  }

  const timeAgo = formatDistanceToNow(parseISO(currentPost.createdAt), { addSuffix: true });
  const readingTime = getReadingTime(currentPost.content);

  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="story-container max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <article className="prose dark:prose-invert mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold m-0">{currentPost.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation('/stories')}
                  className="hover:bg-primary/10"
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-mono">
                <time>{format(parseISO(currentPost.createdAt), 'MMMM d, yyyy')}</time>
                <span className="text-primary/50">•</span>
                <span>{timeAgo}</span>
                <span className="text-primary/50">•</span>
                <span>{readingTime}</span>
              </div>
              <div
                className="story-content"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {currentPost.content && currentPost.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6">
                    {paragraph.trim().split('_').map((text, i) =>
                      i % 2 === 0 ? text : <i key={i}>{text}</i>
                    )}
                  </p>
                ))}
              </div>
            </article>
          </motion.div>
        </AnimatePresence>

        <div className="controls-container">
          <div className="controls-wrapper backdrop-blur-sm bg-background/50 px-6 py-4 rounded-2xl shadow-xl border border-border/50 hover:bg-background/70 transition-all">
            <div className="nav-controls flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={goToPrevious} className="hover:bg-primary/10">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous Story</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span className="page-counter text-sm text-muted-foreground font-mono">
                {currentIndex + 1} / {posts.length}
              </span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={randomize} className="hover:bg-primary/10">
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Random Story</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={goToNext} className="hover:bg-primary/10">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next Story</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}