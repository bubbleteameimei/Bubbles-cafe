import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  ListFilter,
  AlertTriangle,
  Volume2,
  Brain,
  Skull,
  Ghost,
  FileHeart as Running
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
import { SoundMixer } from "@/components/effects/sound-mixer";

// Theme categories and types
type ThemeCategory = 'PSYCHOLOGICAL' | 'GORE' | 'SUPERNATURAL' | 'SURVIVAL';

interface ThemeCategoryInfo {
  icon: React.ComponentType;
  keywords: string[];
  atmosphericTrack: string;
  badgeVariant: "psychological" | "gore" | "supernatural" | "survival";
}

const THEME_CATEGORIES: Record<ThemeCategory, ThemeCategoryInfo> = {
  PSYCHOLOGICAL: {
    icon: Brain,
    keywords: ['mind', 'sanity', 'reality', 'perception', 'consciousness', 'dream', 'paranoia', 'delusion'],
    atmosphericTrack: 'ethereal.mp3',
    badgeVariant: "psychological"
  },
  GORE: {
    icon: Skull,
    keywords: ['blood', 'flesh', 'bone', 'visceral', 'mutilation', 'wound', 'gore', 'dismember'],
    atmosphericTrack: 'heartbeat.mp3',
    badgeVariant: "gore"
  },
  SUPERNATURAL: {
    icon: Ghost,
    keywords: ['ghost', 'spirit', 'demon', 'haunted', 'ethereal', 'occult', 'ritual', 'possession'],
    atmosphericTrack: 'whispers.mp3',
    badgeVariant: "supernatural"
  },
  SURVIVAL: {
    icon: Running,
    keywords: ['chase', 'escape', 'hide', 'run', 'pursue', 'hunt', 'trap', 'survive'],
    atmosphericTrack: 'chase.mp3',
    badgeVariant: "survival"
  }
};

// Enhanced trigger warnings
const TRIGGER_WARNINGS = [
  'gore',
  'body-horror',
  'psychological-distress',
  'claustrophobia',
  'trypophobia',
  'arachnophobia',
  'death',
  'suicide',
  'self-harm',
  'violence',
  'abuse',
  'religious-imagery',
  'cosmic-horror',
  'body-transformation',
  'paranoia',
  'existential-horror',
  'medical-procedures',
  'isolation',
  'jumpscares',
  'child-harm',
  'animal-harm',
  'disturbing-imagery',
  'stalking',
  'home-invasion'
];

// Calculate intensity rating
const calculateIntensity = (content: string): number => {
  const intensityFactors = {
    triggerWords: 0,
    capitalizedWords: 0,
    exclamationMarks: 0,
    ellipsis: 0,
    paragraphLength: 0
  };

  // Count trigger words
  TRIGGER_WARNINGS.forEach(warning => {
    const regex = new RegExp(warning.replace('-', '|'), 'gi');
    const matches = content.match(regex);
    if (matches) intensityFactors.triggerWords += matches.length;
  });

  // Count capitalized words (excluding normal sentence starts)
  const capitalizedWords = content.match(/[.!?]\s+\w*[A-Z]+\w*|\w*[A-Z]{2,}\w*/g);
  intensityFactors.capitalizedWords = capitalizedWords ? capitalizedWords.length : 0;

  // Count exclamation marks and ellipsis
  intensityFactors.exclamationMarks = (content.match(/!/g) || []).length;
  intensityFactors.ellipsis = (content.match(/\.\.\./g) || []).length;

  // Analyze paragraph length variance
  const paragraphs = content.split('\n\n');
  const avgLength = paragraphs.reduce((acc, p) => acc + p.length, 0) / paragraphs.length;
  const variance = paragraphs.reduce((acc, p) => acc + Math.pow(p.length - avgLength, 2), 0) / paragraphs.length;
  intensityFactors.paragraphLength = Math.min(variance / 1000, 5);

  // Calculate final score (1-5 scale)
  const rawScore = (
    intensityFactors.triggerWords * 0.3 +
    intensityFactors.capitalizedWords * 0.2 +
    intensityFactors.exclamationMarks * 0.2 +
    intensityFactors.ellipsis * 0.1 +
    intensityFactors.paragraphLength * 0.2
  );

  return Math.max(1, Math.min(5, Math.ceil(rawScore)));
};

// Generate impactful excerpt
const generateExcerpt = (content: string): string => {
  if (!content) return '';

  const paragraphs = content.split('\n\n');
  const scoredParagraphs = paragraphs.map(p => ({
    text: p,
    score: calculateParagraphImpact(p)
  }));

  // Sort by impact score and get the highest-impact paragraph
  const mostImpactful = scoredParagraphs.sort((a, b) => b.score - a.score)[0];

  const maxLength = 150;
  const trimmed = mostImpactful.text.trim();
  return trimmed.length > maxLength
    ? trimmed.slice(0, maxLength).split(' ').slice(0, -1).join(' ') + '...'
    : trimmed;
};

const calculateParagraphImpact = (paragraph: string): number => {
  let score = 0;

  // Check for horror elements
  if (/blood|scream|dark|shadow|fear|terror|horror/i.test(paragraph)) score += 2;

  // Check for emotional intensity
  if (/!|\?{2,}|\.{3}/g.test(paragraph)) score += 1;

  // Check for sudden events
  if (/suddenly|instantly|immediately|without warning/i.test(paragraph)) score += 1.5;

  // Check for sensory descriptions
  if (/heard|saw|felt|smelled|tasted/i.test(paragraph)) score += 1;

  // Check for atmospheric words
  if (/cold|dark|silent|empty|alone/i.test(paragraph)) score += 1;

  return score;
};

// Update the detectThemes function to use proper typing
const detectThemes = (content: string): ThemeCategory[] => {
  const themes: ThemeCategory[] = [];
  Object.entries(THEME_CATEGORIES).forEach(([theme, info]) => {
    if (info.keywords.some(keyword => content.toLowerCase().includes(keyword))) {
      themes.push(theme as ThemeCategory);
    }
  });
  return themes;
};

const detectTriggerWarnings = (content: string): string[] => {
  const warnings: string[] = [];
  TRIGGER_WARNINGS.forEach(warning => {
    const regex = new RegExp(warning.replace('-', '|'), 'gi');
    if (content.match(regex)) warnings.push(warning);
  });
  return warnings;
};


interface ContentAnalysis {
  intensity: number;
  themes: ThemeCategory[];
  warnings: string[];
  excerpt: string;
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
    warnings: [],
    excerpt: ''
  });

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: 3,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt)
    }))
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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentIndex]);

  useEffect(() => {
    if (currentPost?.content) {
      const intensity = calculateIntensity(currentPost.content);
      const themes = detectThemes(currentPost.content);
      const warnings = detectTriggerWarnings(currentPost.content);
      const excerpt = generateExcerpt(currentPost.content);

      setContentAnalysis({
        intensity,
        themes,
        warnings,
        excerpt
      });
    }
  }, [currentPost]);

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


  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="fixed bottom-4 right-4 z-50">
        <SoundMixer />
      </div>
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
                <span>{currentPost.readingTimeMinutes} min read</span>
                <span className="text-primary/50">•</span>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Intensity: {contentAnalysis.intensity}/5</span>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {contentAnalysis.themes.map((theme) => {
                    const themeInfo = THEME_CATEGORIES[theme];
                    const ThemeIcon = themeInfo?.icon || AlertTriangle;
                    return (
                      <Badge
                        key={theme}
                        variant={themeInfo?.badgeVariant || "default"}
                        className="flex items-center gap-1"
                      >
                        <ThemeIcon className="inline-block h-3 w-3 mr-1" />
                        <span>{theme}</span>
                      </Badge>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {contentAnalysis.warnings.map((warning) => (
                    <Badge
                      key={warning}
                      variant="warning"
                      className="text-xs"
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