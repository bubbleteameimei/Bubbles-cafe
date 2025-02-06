import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, memo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Mist from "@/components/effects/mist";

const PostContent = memo(({ content }: { content: string }) => (
  <div className="story-content" style={{ whiteSpace: 'pre-wrap' }}>
    {content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-6">
        {paragraph.trim().split('_').map((text, i) =>
          i % 2 === 0 ? text : <i key={i}>{text}</i>
        )}
      </p>
    ))}
  </div>
));

PostContent.displayName = "PostContent";

export default function Posts() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const goToPrevious = useCallback(() => {
    if (!posts?.length) return;
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts?.length]);

  const goToNext = useCallback(() => {
    if (!posts?.length) return;
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts?.length]);

  const randomize = useCallback(() => {
    if (!posts?.length) return;
    const newIndex = Math.floor(Math.random() * posts.length);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts?.length]);

  // Scroll to top when component mounts or updates
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  if (isLoading || !posts?.length) {
    return <LoadingScreen />;
  }

  const currentPost = posts[currentIndex];

  return (
    <div className="relative min-h-screen pb-32">
      <Mist />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <article className="prose dark:prose-invert mx-auto">
              <h2 className="text-3xl font-bold mb-4">{currentPost.title}</h2>
              <ErrorBoundary>
                <PostContent content={currentPost.content} />
              </ErrorBoundary>
            </article>
          </motion.div>
        </AnimatePresence>

        <div className="controls-container">
          <div className="controls-wrapper">
            <span className="text-sm text-muted-foreground px-3">
              {currentIndex + 1} / {posts.length}
            </span>
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
  );
}