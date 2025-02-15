import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/blog/comment-section";
import { getReadingTime, detectThemes, THEME_CATEGORIES } from "@/lib/content-analysis";
import type { ThemeCategory } from "../shared/types";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

export default function Reader() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const [postStats, setPostStats] = useState<Record<number, { likes: number, dislikes: number }>>({});
  const [, setLocation] = useLocation();

  const { data: postsData, isLoading, error } = useQuery<PostsResponse>({
    queryKey: ["reader", "current-posts"],
    queryFn: async () => {
      const response = await fetch('/api/posts?limit=16&type=reader');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid posts data format');
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (postsData?.posts && Array.isArray(postsData.posts)) {
      const persistedStats: Record<number, { likes: number, dislikes: number }> = {};
      postsData.posts.forEach(post => {
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

      sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
    }
  }, [postsData?.posts, currentIndex]);

  const goToPrevious = useCallback(() => {
    if (!postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? postsData.posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [postsData?.posts]);

  const goToNext = useCallback(() => {
    if (!postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) return;
    setCurrentIndex((prev) => (prev === postsData.posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [postsData?.posts]);

  const randomize = useCallback(() => {
    if (!postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) return;
    const newIndex = Math.floor(Math.random() * postsData.posts.length);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'instant' });
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
    <div className="relative min-h-screen">
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
              <div className="flex items-center justify-between mb-4">
                <h1 className="story-title text-4xl font-bold">{currentPost.title}</h1>
              </div>

              <div className="story-meta flex items-center gap-4 mb-4 text-sm text-muted-foreground">
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
                <LikeDislike
                  postId={currentPost.id}
                  initialLikes={postStats[currentPost.id]?.likes || 0}
                  initialDislikes={postStats[currentPost.id]?.dislikes || 0}
                />
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

              <span className="page-counter text-sm text-muted-foreground">
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