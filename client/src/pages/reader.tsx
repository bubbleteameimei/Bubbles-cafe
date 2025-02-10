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
interface ThemeInfo {
  icon: React.ComponentType;
  keywords: string[];
  atmosphericTrack: string;
  badgeVariant: "psychological" | "gore" | "supernatural" | "survival";
}

const THEME_CATEGORIES: Record<ThemeCategory, ThemeInfo> = {
  PSYCHOLOGICAL: {
    icon: Brain,
    keywords: [
      'mind', 'sanity', 'reality', 'perception', 'consciousness', 'dream',
      'paranoia', 'delusion', 'hallucination', 'madness', 'insanity',
      'psychosis', 'memory', 'identity', 'trauma', 'therapy', 'mental'
    ],
    atmosphericTrack: 'ethereal',
    badgeVariant: "psychological"
  },
  GORE: {
    icon: Skull,
    keywords: [
      'blood', 'flesh', 'bone', 'visceral', 'mutilation', 'wound', 'gore',
      'dismember', 'organ', 'tissue', 'entrails', 'dissect', 'cut', 'slice',
      'tear', 'rip', 'eviscerate', 'body', 'corpse', 'dead'
    ],
    atmosphericTrack: 'nocturnal',
    badgeVariant: "gore"
  },
  SUPERNATURAL: {
    icon: Ghost,
    keywords: [
      'ghost', 'spirit', 'demon', 'haunted', 'ethereal', 'occult', 'ritual',
      'possession', 'paranormal', 'entity', 'apparition', 'specter', 'phantom',
      'poltergeist', 'curse', 'hex', 'witch', 'magic', 'undead', 'soul'
    ],
    atmosphericTrack: 'ethereal',
    badgeVariant: "supernatural"
  },
  SURVIVAL: {
    icon: Running,
    keywords: [
      'chase', 'escape', 'hide', 'run', 'pursue', 'hunt', 'trap', 'survive',
      'flee', 'evade', 'stalker', 'predator', 'prey', 'hunter', 'victim',
      'catch', 'corner', 'trapped', 'escape', 'alone'
    ],
    atmosphericTrack: 'nocturnal',
    badgeVariant: "survival"
  }
};

// Enhanced trigger warnings with additional categories and descriptions
const TRIGGER_WARNINGS = [
  { id: 'gore', label: 'Gore', description: 'Graphic violence or blood' },
  { id: 'body-horror', label: 'Body Horror', description: 'Physical transformation or mutilation' },
  { id: 'psychological-distress', label: 'Psychological Distress', description: 'Mental trauma or breakdown' },
  { id: 'claustrophobia', label: 'Claustrophobia', description: 'Confined spaces' },
  { id: 'trypophobia', label: 'Trypophobia', description: 'Patterns of small holes' },
  { id: 'arachnophobia', label: 'Arachnophobia', description: 'Spiders or spider-like creatures' },
  { id: 'death', label: 'Death', description: 'Death or dying' },
  { id: 'suicide', label: 'Suicide', description: 'References to suicide' },
  { id: 'self-harm', label: 'Self-harm', description: 'Self-inflicted injuries' },
  { id: 'violence', label: 'Violence', description: 'Physical violence' },
  { id: 'abuse', label: 'Abuse', description: 'Physical or emotional abuse' },
  { id: 'religious-imagery', label: 'Religious Imagery', description: 'Disturbing religious content' },
  { id: 'cosmic-horror', label: 'Cosmic Horror', description: 'Existential dread or cosmic entities' },
  { id: 'body-transformation', label: 'Body Transformation', description: 'Physical metamorphosis' },
  { id: 'paranoia', label: 'Paranoia', description: 'Extreme suspicion or persecution' },
  { id: 'existential-horror', label: 'Existential Horror', description: 'Reality-bending concepts' },
  { id: 'medical-procedures', label: 'Medical Procedures', description: 'Graphic medical content' },
  { id: 'isolation', label: 'Isolation', description: 'Extreme solitude or abandonment' },
  { id: 'jumpscares', label: 'Jump Scares', description: 'Sudden frightening elements' },
  { id: 'child-harm', label: 'Child Harm', description: 'Violence involving minors' },
  { id: 'animal-harm', label: 'Animal Harm', description: 'Cruelty to animals' },
  { id: 'disturbing-imagery', label: 'Disturbing Imagery', description: 'Unsettling visual descriptions' },
  { id: 'stalking', label: 'Stalking', description: 'Unwanted pursuit or surveillance' },
  { id: 'home-invasion', label: 'Home Invasion', description: 'Violation of personal space' }
];

// Enhanced intensity calculation with theme-based modifiers
const calculateIntensity = (content: string): number => {
  const intensityFactors = {
    triggerWords: 0,
    capitalizedWords: 0,
    exclamationMarks: 0,
    ellipsis: 0,
    paragraphLength: 0,
    emotionalWords: 0,
    rapidPacing: 0,
    thematicIntensity: 0
  };

  // Analyze themes for base intensity
  const themes = detectThemes(content);
  intensityFactors.thematicIntensity = themes.length * 0.5; // Multiple themes indicate higher intensity

  // Enhanced emotional word detection
  const emotionalPatterns = {
    extreme: /terrified|horrified|petrified|screaming|agony/gi,
    strong: /scared|frightened|panic|terror|dread/gi,
    moderate: /worried|nervous|anxious|uneasy|fear/gi
  };

  Object.entries(emotionalPatterns).forEach(([level, pattern]) => {
    const matches = content.match(pattern);
    if (matches) {
      intensityFactors.emotionalWords += matches.length * (
        level === 'extreme' ? 2 :
          level === 'strong' ? 1.5 :
            1
      );
    }
  });

  // Analyze sentence structure and pacing
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 10).length;
  intensityFactors.rapidPacing = (shortSentences / sentences.length) * 3;

  // Calculate final score with weighted components
  const rawScore = (
    intensityFactors.thematicIntensity * 0.3 +
    intensityFactors.emotionalWords * 0.3 +
    intensityFactors.rapidPacing * 0.2 +
    (themes.includes('GORE') ? 0.5 : 0) +
    (themes.includes('PSYCHOLOGICAL') ? 0.3 : 0)
  );

  return Math.max(1, Math.min(5, Math.ceil(rawScore * 2)));
};

// Enhanced excerpt generation focusing on impactful moments
const generateExcerpt = (content: string): string => {
  if (!content) return '';

  const paragraphs = content.split('\n\n');
  const scoredParagraphs = paragraphs.map(p => ({
    text: p,
    score: calculateParagraphImpact(p)
  }));

  // Get the highest-impact paragraph
  const mostImpactful = scoredParagraphs.sort((a, b) => b.score - a.score)[0];

  const maxLength = 150;
  const trimmed = mostImpactful.text.trim();
  return trimmed.length > maxLength
    ? trimmed.slice(0, maxLength).split(' ').slice(0, -1).join(' ') + '...'
    : trimmed;
};

const calculateParagraphImpact = (paragraph: string): number => {
  let score = 0;

  // Check for horror elements with weighted scoring
  const horrorElements = {
    visceral: /blood|scream|flesh|bone|wound/i,
    psychological: /sanity|mind|reality|consciousness|madness/i,
    supernatural: /ghost|spirit|demon|shadow|dark/i,
    tension: /suddenly|instantly|without warning|silence/i,
    emotion: /fear|terror|horror|dread|panic/i,
    sensory: /saw|heard|felt|smelled|tasted/i,
    atmosphere: /cold|dark|empty|alone|night/i
  };

  Object.entries(horrorElements).forEach(([type, regex]) => {
    if (regex.test(paragraph)) {
      // Weight different horror elements differently
      const weight = type === 'visceral' || type === 'psychological' ? 2 : 1.5;
      score += weight;
    }
  });

  // Check for emotional intensity markers
  if (/!|\?{2,}|\.{3}/g.test(paragraph)) score += 1.5;
  if (/[A-Z]{2,}/g.test(paragraph)) score += 1;

  return score;
};

// Add combination detection for multi-themed stories
const detectThemes = (content: string): ThemeCategory[] => {
  try {
    const themes: Set<ThemeCategory> = new Set();
    const lowerContent = content.toLowerCase();
    console.log('[Theme Detection] Analyzing content:', lowerContent.substring(0, 100) + '...');

    // First pass: Direct keyword matching
    Object.entries(THEME_CATEGORIES).forEach(([theme, info]) => {
      const matchedKeywords = info.keywords.filter(keyword => lowerContent.includes(keyword));
      if (matchedKeywords.length > 0) {
        console.log(`[Theme Detection] Found ${theme} theme with keywords:`, matchedKeywords);
        themes.add(theme as ThemeCategory);
      }
    });

    // Second pass: Context-based analysis
    if (lowerContent.includes('hospital') || lowerContent.includes('doctor') || lowerContent.includes('patient')) {
      console.log('[Theme Detection] Medical context detected, adding PSYCHOLOGICAL theme');
      themes.add('PSYCHOLOGICAL');
      if (lowerContent.includes('blood') || lowerContent.includes('surgery')) {
        console.log('[Theme Detection] Medical + gore context detected, adding GORE theme');
        themes.add('GORE');
      }
    }

    if (lowerContent.includes('basement') || lowerContent.includes('attic')) {
      console.log('[Theme Detection] Location-based supernatural context detected');
      themes.add('SUPERNATURAL');
    }

    if (lowerContent.includes('forest') || lowerContent.includes('dark')) {
      console.log('[Theme Detection] Environment-based survival context detected');
      themes.add('SURVIVAL');
    }

    return Array.from(themes);
  } catch (error) {
    console.error('[Theme Detection] Error:', error);
    return [];
  }
};

const detectTriggerWarnings = (content: string): string[] => {
  try {
    const warnings: string[] = [];
    const lowerContent = content.toLowerCase();
    console.log('[Trigger Warning Detection] Analyzing content');

    TRIGGER_WARNINGS.forEach(warning => {
      const regex = new RegExp(warning.id.replace('-', '|'), 'gi');
      if (content.match(regex)) {
        console.log(`[Trigger Warning Detection] Found warning: ${warning.label}`);
        warnings.push(warning.label);
      }
    });

    return warnings;
  } catch (error) {
    console.error('[Trigger Warning Detection] Error:', error);
    return [];
  }
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
    const currentPost = posts?.[currentIndex];
    if (currentPost?.content) {
      const intensity = calculateIntensity(currentPost.content);
      const themes = detectThemes(currentPost.content);
      const warnings = detectTriggerWarnings(currentPost.content);
      const excerpt = generateExcerpt(currentPost.content);

      console.log('[Content Analysis]', {
        postTitle: currentPost.title,
        intensity,
        themes,
        warnings,
        excerpt
      });

      setContentAnalysis({
        intensity,
        themes,
        warnings,
        excerpt
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
                      <TooltipProvider key={theme}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">
                              <Badge
                                variant={themeInfo?.badgeVariant || "default"}
                                className="flex items-center gap-1 cursor-pointer"
                              >
                                <ThemeIcon className="inline-block h-3 w-3 mr-1" />
                                <span>{theme.toLowerCase()}</span>
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
                  {contentAnalysis.warnings.map((warning) => {
                    const warningInfo = TRIGGER_WARNINGS.find(w => w.label === warning);
                    return (
                      <TooltipProvider key={warning}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">
                              <Badge
                                variant="trigger"
                                className="text-xs backdrop-blur-sm cursor-pointer"
                              >
                                {warning}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{warningInfo?.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-block">
                        <Badge
                          variant="intensity"
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>
                            Intensity: {Array(contentAnalysis.intensity).fill('●').join('')}
                            {Array(5 - contentAnalysis.intensity).fill('○').join('')}
                          </span>
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {contentAnalysis.intensity === 1 ? 'Mild horror elements' :
                          contentAnalysis.intensity === 2 ? 'Moderate suspense and tension' :
                            contentAnalysis.intensity === 3 ? 'Strong horror elements' :
                              contentAnalysis.intensity === 4 ? 'Very intense content' :
                                'Extreme horror content'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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