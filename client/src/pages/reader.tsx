import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/blog/comment-section";
import { getReadingTime, detectThemes, THEME_CATEGORIES } from "@/lib/content-analysis";
import type { ThemeCategory } from "../shared/types";
import { useAuth } from "@/hooks/use-auth";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

export default function Reader() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const [postStats, setPostStats] = useState<Record<number, { likes: number, dislikes: number }>>({});
  const [, setLocation] = useLocation();

  const { data: postsData, isLoading, error } = useQuery<PostsResponse>({
    queryKey: ["pages", "reader", "current-posts"],
    queryFn: async () => {
      const response = await fetch('/api/posts?section=reader&limit=16&type=reader');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid posts data format');
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (postsData?.posts && Array.isArray(postsData.posts)) {
      const persistedStats: Record<number, { likes: number, dislikes: number }> = {};
      postsData.posts.forEach(post => {
        persistedStats[post.id] = getOrCreateStats(post.id);
      });
      setPostStats(persistedStats);

      sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
    }
  }, [postsData?.posts, currentIndex]);

  const goToPrevious = useCallback(() => {
    if (!postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? postsData.posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [postsData?.posts]);

  const goToNext = useCallback(() => {
    if (!postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) return;
    setCurrentIndex((prev) => (prev === postsData.posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [postsData?.posts]);

  const randomize = useCallback(() => {
    if (!postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) return;
    const newIndex = Math.floor(Math.random() * postsData.posts.length);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [postsData?.posts]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) {
    console.error('Error loading stories:', error);
    return <div className="text-center p-8">No stories available.</div>;
  }

  const posts = postsData.posts;
  const currentPost = posts[currentIndex];

  if (!currentPost) {
    return <div className="text-center p-8">No story selected.</div>;
  }

  const formattedDate = format(new Date(currentPost.createdAt), 'MMMM d, yyyy');
  const readingTime = getReadingTime(currentPost.content);
  const themes = detectThemes(currentPost.content);
  const primaryTheme = themes[0];
  const themeInfo = primaryTheme ? THEME_CATEGORIES[primaryTheme] : null;

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

                {/* Story Navigation Buttons */}
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
                <span>{readingTime}</span>
                {themeInfo && (
                  <>
                    <span>·</span>
                    <Badge variant={themeInfo.badgeVariant || "default"} className="capitalize">
                      {primaryTheme.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </>
                )}
              </div>

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
                      <i key={i} className="italic text-primary/80">{text}</i>
                    )
                  ));

                  return (
                    <p key={index} className="mb-6 leading-relaxed">
                      {processed}
                    </p>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4">
                <LikeDislike postId={currentPost.id} />
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <CommentSection
                  postId={currentPost.id}
                  title={currentPost.title || ''}
                />
              </div>
            </article>
          </motion.div>
        </AnimatePresence>

        {/* Floating Navigation Bar */}
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

function getOrCreateStats(postId: number) {
  const storageKey = `post-stats-${postId}`;
  const existingStats = localStorage.getItem(storageKey);

  if (existingStats) {
    return JSON.parse(existingStats);
  }

  // Calculate deterministic likes and dislikes based on post ID
  const likesBase = 80;
  const likesRange = 40; // To get max of 120
  const dislikesBase = 5;
  const dislikesRange = 15; // To get max of 20

  // Use post ID to generate deterministic but varying values
  const likes = likesBase + (postId * 7) % likesRange;
  const dislikes = dislikesBase + (postId * 3) % dislikesRange;

  const newStats = {
    likes,
    dislikes
  };

  localStorage.setItem(storageKey, JSON.stringify(newStats));
  return newStats;
}