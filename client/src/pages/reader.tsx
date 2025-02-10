import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle, ListFilter, AlertTriangle, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/blog/comment-section";
import { cn } from "@/lib/utils";

export default function Reader() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const [postStats, setPostStats] = useState<Record<number, { likes: number, dislikes: number }>>({});
  const [, setLocation] = useLocation();

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: 3,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt)
    }))
  });

  // Initialize or load persisted stats for posts
  useEffect(() => {
    if (posts) {
      const persistedStats: Record<number, { likes: number, dislikes: number }> = {};
      posts.forEach(post => {
        const storageKey = `post-stats-${post.id}`;
        const existingStats = localStorage.getItem(storageKey);
        if (existingStats) {
          persistedStats[post.id] = JSON.parse(existingStats);
        } else {
          const newStats = {
            likes: Math.floor(Math.random() * 71) + 80,
            dislikes: Math.floor(Math.random() * 15)
          };
          localStorage.setItem(storageKey, JSON.stringify(newStats));
          persistedStats[post.id] = newStats;
        }
      });
      setPostStats(persistedStats);
    }
  }, [posts]);

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

  const formattedDate = format(currentPost.createdAt, 'MMMM d, yyyy');
  const stats = postStats[currentPost.id] || { likes: 0, dislikes: 0 };

  // Get primary theme from trigger warnings
  const getPrimaryTheme = (warnings: string[]) => {
    const themeMapping: Record<string, string[]> = {
      'Psychological Horror': ['psychological', 'mindbending', 'existential'],
      'Gore Horror': ['gore', 'body-horror', 'violence'],
      'Supernatural Horror': ['supernatural', 'cosmic-horror', 'religious'],
      'Survival Horror': ['stalking', 'home-invasion', 'isolation'],
      'Technological Horror': ['technology', 'surveillance'],
      'Environmental Horror': ['claustrophobia', 'darkness', 'nature']
    };

    for (const [theme, keywords] of Object.entries(themeMapping)) {
      if (keywords.some(keyword => warnings.includes(keyword))) {
        return theme;
      }
    }
    return 'General Horror';
  };

  return (
    <div className="relative min-h-screen">
      <Mist className="opacity-40" />
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
            <article>
              {/* Story Header */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="story-title">{currentPost.title}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation('/index')}
                  className="hover:bg-primary/10"
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
              </div>

              {/* Story Metadata */}
              <div className="story-meta flex flex-wrap items-center gap-2 mb-4 text-sm text-muted-foreground">
                <time>{formattedDate}</time>
                <span className="text-primary/50">•</span>
                <span>{currentPost.readingTimeMinutes} min read</span>
                {currentPost.atmosphericSound && (
                  <>
                    <span className="text-primary/50">•</span>
                    <span className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      Atmospheric Sound
                    </span>
                  </>
                )}
              </div>

              {/* Theme and Trigger Warnings */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-primary">
                    {getPrimaryTheme(currentPost.triggerWarnings || [])}
                  </Badge>
                  {currentPost.matureContent && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Mature Content
                    </Badge>
                  )}
                </div>

                {currentPost.triggerWarnings && currentPost.triggerWarnings.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentPost.triggerWarnings.map((warning) => (
                      <Badge 
                        key={warning}
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          warning.includes("gore") && "bg-red-500/10 text-red-500",
                          warning.includes("psychological") && "bg-purple-500/10 text-purple-500",
                          warning.includes("death") && "bg-gray-500/10 text-gray-400"
                        )}
                      >
                        {warning}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div
                className="story-content mb-8 prose dark:prose-invert max-w-none"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {currentPost.content && currentPost.content.split('\n\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return null;

                  const processed = paragraph.trim().split('_').map((text, i) => (
                    i % 2 === 0 ? (
                      <span key={i}>{text}</span>
                    ) : (
                      <i key={i} className="italic text-primary/80 font-serif">{text}</i>
                    )
                  ));

                  return (
                    <p key={index} className="mb-6 leading-relaxed">
                      {processed}
                    </p>
                  );
                })}
              </div>

              {/* Engagement Section */}
              <div className="border-t border-border pt-4">
                <LikeDislike
                  postId={currentPost.id}
                  initialLikes={postStats[currentPost.id]?.likes || 0}
                  initialDislikes={postStats[currentPost.id]?.dislikes || 0}
                />
              </div>

              {/* Comments Section */}
              <div className="mt-16">
                <CommentSection
                  postId={currentPost.id}
                  title={currentPost.title}
                />
              </div>
            </article>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
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