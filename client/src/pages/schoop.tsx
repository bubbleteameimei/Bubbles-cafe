import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Mist from "@/components/effects/mist";
import { useParams, useLocation } from "wouter";

export default function StoryView() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const postId = params?.id ? parseInt(params.id) : undefined;

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes,
    retry: 2
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Set initial index based on postId
  useEffect(() => {
    if (posts && postId) {
      const index = posts.findIndex(post => post.id === postId);
      if (index !== -1) {
        setCurrentIndex(index);
        setLoadingError(null);
      } else {
        setLoadingError("Story not found");
        // Redirect after a brief delay to show the error message
        setTimeout(() => setLocation("/stories"), 2000);
      }
    }
  }, [posts, postId, setLocation]);

  const navigate = useCallback((newIndex: number) => {
    if (!posts || isNavigating || newIndex < 0 || newIndex >= posts.length) return;
    setIsNavigating(true);
    const newPost = posts[newIndex];
    setLocation(`/stories/${newPost.id}`);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => setIsNavigating(false), 300);
  }, [isNavigating, posts, setLocation]);

  const goToPrevious = useCallback(() => {
    if (!posts?.length) return;
    navigate(currentIndex === 0 ? posts.length - 1 : currentIndex - 1);
  }, [posts?.length, currentIndex, navigate]);

  const goToNext = useCallback(() => {
    if (!posts?.length) return;
    navigate(currentIndex === posts.length - 1 ? 0 : currentIndex + 1);
  }, [posts?.length, currentIndex, navigate]);

  const randomize = useCallback(() => {
    if (!posts?.length) return;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * posts.length);
    } while (newIndex === currentIndex && posts.length > 1);
    navigate(newIndex);
  }, [posts?.length, currentIndex, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || loadingError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {loadingError || "Error loading stories"}
          </h2>
          <p className="text-muted-foreground mb-4">
            Please try again later
          </p>
          <Button onClick={() => setLocation("/stories")}>
            Return to Stories
          </Button>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Stories Available</h2>
          <p className="text-muted-foreground">Check back later for new stories</p>
        </div>
      </div>
    );
  }

  const currentPost = posts[currentIndex];
  if (!currentPost) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Story Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The story you're looking for might have been moved or deleted
          </p>
          <Button onClick={() => setLocation("/stories")}>
            Browse Stories
          </Button>
        </div>
      </div>
    );
  }

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
              <h2 className="text-3xl font-bold mb-4">{currentPost.title}</h2>
              <div
                className="story-content"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {currentPost.content.split('\n\n').map((paragraph, index) => (
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
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={goToPrevious}
                      className="hover:bg-primary/10"
                      disabled={isNavigating}
                    >
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
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={randomize}
                      className="hover:bg-primary/10"
                      disabled={isNavigating}
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Random Story</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={goToNext}
                      className="hover:bg-primary/10"
                      disabled={isNavigating}
                    >
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