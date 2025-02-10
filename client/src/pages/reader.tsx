import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  ListFilter
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
import { cn } from "@/lib/utils";

// Theme types
type ThemeCategory = 'PSYCHOLOGICAL' | 'GORE' | 'SUPERNATURAL' | 'SURVIVAL';
interface ThemeInfo {
  keywords: string[];
  atmosphericTrack: string;
  badgeVariant: "psychological" | "gore" | "supernatural" | "survival";
}

const THEME_CATEGORIES: Record<ThemeCategory, ThemeInfo> = {
  PSYCHOLOGICAL: {
    keywords: [
      'mind', 'sanity', 'reality', 'perception', 'consciousness', 'dream',
      'paranoia', 'delusion', 'hallucination', 'madness', 'insanity',
      'psychosis', 'memory', 'identity', 'trauma', 'therapy', 'mental'
    ],
    atmosphericTrack: 'ethereal',
    badgeVariant: "psychological"
  },
  GORE: {
    keywords: [
      'blood', 'flesh', 'bone', 'visceral', 'mutilation', 'wound', 'gore',
      'dismember', 'organ', 'tissue', 'entrails', 'dissect', 'cut', 'slice',
      'tear', 'rip', 'eviscerate', 'body', 'corpse', 'dead'
    ],
    atmosphericTrack: 'nocturnal',
    badgeVariant: "gore"
  },
  SUPERNATURAL: {
    keywords: [
      'ghost', 'spirit', 'demon', 'haunted', 'ethereal', 'occult', 'ritual',
      'possession', 'paranormal', 'entity', 'apparition', 'specter', 'phantom',
      'poltergeist', 'curse', 'hex', 'witch', 'magic', 'undead', 'soul'
    ],
    atmosphericTrack: 'ethereal',
    badgeVariant: "supernatural"
  },
  SURVIVAL: {
    keywords: [
      'chase', 'escape', 'hide', 'run', 'pursue', 'hunt', 'trap', 'survive',
      'flee', 'evade', 'stalker', 'predator', 'prey', 'hunter', 'victim',
      'catch', 'corner', 'trapped', 'escape', 'alone'
    ],
    atmosphericTrack: 'nocturnal',
    badgeVariant: "survival"
  }
};

const getReadingTime = (content: string) => {
  if (!content) return '0 min read';
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

// Single theme detection
const detectThemes = (content: string): ThemeCategory[] => {
  try {
    const themeCounts = new Map<ThemeCategory, number>();
    const lowerContent = content.toLowerCase();

    Object.entries(THEME_CATEGORIES).forEach(([theme, info]) => {
      const matchCount = info.keywords.filter(keyword => lowerContent.includes(keyword)).length;
      if (matchCount > 0) {
        themeCounts.set(theme as ThemeCategory, matchCount);
      }
    });

    let dominantTheme: ThemeCategory | null = null;
    let maxCount = 0;

    themeCounts.forEach((count, theme) => {
      if (count > maxCount) {
        maxCount = count;
        dominantTheme = theme;
      }
    });

    return dominantTheme ? [dominantTheme] : [];
  } catch (error) {
    console.error('[Theme Detection] Error:', error);
    return [];
  }
};

const calculateIntensity = (content: string): number => {
  if (!content) return 1;

  const emotionalPatterns = {
    extreme: /terrified|horrified|petrified|screaming|agony/gi,
    strong: /scared|frightened|panic|terror|dread/gi,
    moderate: /worried|nervous|anxious|uneasy|fear/gi
  };

  let score = 1;

  Object.entries(emotionalPatterns).forEach(([level, pattern]) => {
    const matches = content.match(pattern);
    if (matches) {
      score += matches.length * (
        level === 'extreme' ? 0.5 :
          level === 'strong' ? 0.3 :
            0.2
      );
    }
  });

  const shortSentences = content.split(/[.!?]+/).filter(s => 
    s.trim().split(/\s+/).length < 10
  ).length;

  score += shortSentences * 0.1;

  if (content.includes('blood') || content.includes('gore')) score += 1;
  if (/[A-Z]{3,}/.test(content)) score += 0.5;
  if (content.match(/!{2,}/g)) score += 0.5;

  return Math.max(1, Math.min(5, Math.ceil(score)));
};

const detectTriggerWarnings = (content: string): string[] => {
  const TRIGGER_WARNINGS = [
    { id: 'gore', label: 'Gore', keywords: ['blood', 'gore', 'visceral'] },
    { id: 'violence', label: 'Violence', keywords: ['violent', 'brutality', 'assault'] },
    { id: 'psychological', label: 'Psychological', keywords: ['mental', 'trauma', 'ptsd'] },
    { id: 'disturbing', label: 'Disturbing Content', keywords: ['disturbing', 'graphic', 'explicit'] }
  ];

  try {
    const warnings = new Set<string>();
    const lowerContent = content.toLowerCase();

    TRIGGER_WARNINGS.forEach(warning => {
      if (warning.keywords.some(keyword => lowerContent.includes(keyword))) {
        warnings.add(warning.label);
      }
    });

    return Array.from(warnings);
  } catch (error) {
    console.error('[Trigger Warning Detection] Error:', error);
    return [];
  }
};

interface ContentAnalysis {
  intensity: number;
  themes: ThemeCategory[];
  warnings: string[];
}

export default function Reader() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const [postStats, setPostStats] = useState<Record<number, { likes: number, dislikes: number }>>({});
  const [, setLocation] = useLocation();
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis>({
    intensity: 1,
    themes: [],
    warnings: []
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
      const intensity = calculateIntensity(currentPost.content);
      const themes = detectThemes(currentPost.content);
      const warnings = detectTriggerWarnings(currentPost.content);

      setContentAnalysis({
        intensity,
        themes,
        warnings
      });
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

              <div className="story-meta flex flex-wrap items-center gap-2 mb-4">
                <time>{formattedDate}</time>
                <span className="text-primary/50">•</span>
                <span>{getReadingTime(currentPost.content)}</span>
                <span className="text-primary/50">•</span>
                <span>Intensity: {contentAnalysis.intensity}/5</span>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {contentAnalysis.themes.map((theme) => {
                    const themeInfo = THEME_CATEGORIES[theme];
                    return (
                      <TooltipProvider key={theme}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">
                              <Badge
                                variant={themeInfo?.badgeVariant || "default"}
                                className="cursor-pointer"
                              >
                                {theme.toLowerCase()}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {theme === 'PSYCHOLOGICAL' ? 'Mental and psychological horror elements' :
                                theme === 'GORE' ? 'Graphic and visceral content' :
                                  theme === 'SUPERNATURAL' ? 'Paranormal and otherworldly elements' :
                                    'Survival and chase sequences'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {contentAnalysis.warnings.map((warning) => (
                    <Badge
                      key={warning}
                      variant="trigger"
                      className="text-xs backdrop-blur-sm"
                    >
                      {warning}
                    </Badge>
                  ))}
                </div>
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

              <div className="mt-16">
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