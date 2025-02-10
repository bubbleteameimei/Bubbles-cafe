import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  ListFilter,
  Brain,
  Cpu,
  Bug as Worm,
  Dna,
  Footprints,
  Ghost,
  Castle,
  Radiation,
  Skull,
  UserMinus2,
  Anchor,
  AlertTriangle,
  Building,
  Clock,
  Moon,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/blog/comment-section";
import { detectThemes, THEME_CATEGORIES } from "@/lib/content-analysis";
import type { ThemeCategory } from "../shared/types";

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Brain': return Brain;
    case 'Cpu': return Cpu;
    case 'Worm': return Worm;
    case 'Dna': return Dna;
    case 'Footprints': return Footprints;
    case 'Ghost': return Ghost;
    case 'Castle': return Castle;
    case 'Radiation': return Radiation;
    case 'Skull': return Skull;
    case 'UserMinus2': return UserMinus2;
    case 'Anchor': return Anchor;
    case 'AlertTriangle': return AlertTriangle;
    case 'Building': return Building;
    case 'Clock': return Clock;
    default: return Moon;
  }
};

interface ContentAnalysis {
  themes: ThemeCategory[];
}

export default function Reader() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const [postStats, setPostStats] = useState<Record<number, { likes: number, dislikes: number }>>({});
  const [, setLocation] = useLocation();
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis>({
    themes: []
  });

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

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
    const currentPost = posts?.[currentIndex];
    if (currentPost?.content) {
      const themes = detectThemes(currentPost.content);
      setContentAnalysis({ themes });
    }
  }, [currentIndex, posts]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !posts || posts.length === 0) {
    console.error('Error loading stories:', error);
    return <div className="text-center p-8">Stories not found or error loading stories.</div>;
  }

  const currentPost = posts[currentIndex];
  if (!currentPost) {
    return <div className="text-center p-8">Error loading current story.</div>;
  }

  const formattedDate = format(new Date(currentPost.createdAt), 'MMMM d, yyyy');
  const storyThemeMap: Record<string, ThemeCategory> = {
    'bug': 'PARASITE',
    'skin': 'BODY_HORROR',
    'tunnel': 'STALKING',
    'chase': 'STALKING',
    'descent': 'DEATH'
  };
  const title = currentPost.title.toLowerCase();
  let theme = storyThemeMap[title] || contentAnalysis.themes[0];
  const themeInfo = theme ? THEME_CATEGORIES[theme] : null;
  const displayName = theme ? theme.charAt(0) + theme.slice(1).toLowerCase().replace(/_/g, ' ') : '';
  const IconComponent = themeInfo ? getIconComponent(themeInfo.icon) : Moon;

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

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
            <article>
              <div className="flex items-center justify-between mb-4">
                <h1 className="story-title text-4xl font-bold font-serif">{currentPost.title}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation('/index')}
                  className="hover:bg-primary/10"
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
              </div>

              <div className="story-meta flex flex-wrap items-center gap-2 mb-4 text-sm text-muted-foreground">
                <time>{formattedDate}</time>
                <span className="text-primary/50">•</span>
                <span className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {getReadingTime(currentPost.content)}
                </span>
              </div>

              {themeInfo && (
                <div className="mb-6">
                  <Badge
                    variant="default"
                    className="text-sm font-medium tracking-wide px-3 py-1 flex items-center gap-1.5 w-fit"
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    {displayName}
                  </Badge>
                </div>
              )}

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
                  title={currentPost.title}
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