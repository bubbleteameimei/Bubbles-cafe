import React from "react";
import { motion } from "framer-motion";
import { type Post } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Bug, Skull, Brain, Pill, Cpu, Dna, Ghost, Footprints, Castle, Radiation, UserMinus2, Anchor, AlertTriangle, Building, Clock, Moon, Timer, Gauge, Scissors, Hourglass, Utensils, Axe, Car, Bot, Eye, Zap, Flame, Cloud, Droplets, Heart, Wind, ScanFace, Tally4, Sparkles, Syringe, Globe, Scan, CloudRain, Copy, UserPlus } from "lucide-react";
import { detectThemes, calculateIntensity, getReadingTime, THEME_CATEGORIES } from "@/lib/content-analysis";

// Icon mapping to consistently handle case-insensitive icon names across the application
const THEME_ICONS: Record<string, React.ReactNode> = {
  'skull': <Skull className="h-4 w-4" />,
  'brain': <Brain className="h-4 w-4" />,
  'ghost': <Ghost className="h-4 w-4" />,
  'eye': <Eye className="h-4 w-4" />,
  'pill': <Pill className="h-4 w-4" />,
  'cpu': <Cpu className="h-4 w-4" />,
  'dna': <Dna className="h-4 w-4" />,
  'radiation': <Radiation className="h-4 w-4" />,
  'anchor': <Anchor className="h-4 w-4" />,
  'userminus2': <UserMinus2 className="h-4 w-4" />,
  'building': <Building className="h-4 w-4" />,
  'scissors': <Scissors className="h-4 w-4" />,
  'hourglass': <Hourglass className="h-4 w-4" />,
  'footprints': <Footprints className="h-4 w-4" />,
  'castle': <Castle className="h-4 w-4" />,
  'utensils': <Utensils className="h-4 w-4" />,
  'axe': <Axe className="h-4 w-4" />,
  'car': <Car className="h-4 w-4" />,
  'bot': <Bot className="h-4 w-4" />,
  'alien': <Zap className="h-4 w-4" />,
  'zap': <Zap className="h-4 w-4" />,
  'cloud': <Cloud className="h-4 w-4" />,
  'droplets': <Droplets className="h-4 w-4" />,
  'heart': <Heart className="h-4 w-4" />,
  'wind': <Wind className="h-4 w-4" />,
  'scanface': <ScanFace className="h-4 w-4" />,
  'tally4': <Tally4 className="h-4 w-4" />,
  'sparkles': <Sparkles className="h-4 w-4" />,
  'syringe': <Syringe className="h-4 w-4" />,
  'flame': <Flame className="h-4 w-4" />,
  'bug': <Bug className="h-4 w-4" />,
  'moon': <Moon className="h-4 w-4" />,
  'alerttriangle': <AlertTriangle className="h-4 w-4" />,
  'doll': <AlertTriangle className="h-4 w-4" />,
  'globe': <Globe className="h-4 w-4" />,
  'scan': <Scan className="h-4 w-4" />,
  'copy': <Copy className="h-4 w-4" />,
  'user-plus': <UserPlus className="h-4 w-4" />,
  'userplus': <UserPlus className="h-4 w-4" />,
  'cloud-rain': <CloudRain className="h-4 w-4" />,
  'cloudrain': <CloudRain className="h-4 w-4" />,
  'clock': <Clock className="h-4 w-4" />
};

interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
  const [, setLocation] = useLocation();

  if (!post) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (post.slug) {
      setLocation(`/reader/${post.slug}`);
    }
  };

const getEngagingExcerpt = (content: string): string => {
  if (!content) return '';

  // Split content into paragraphs, handling various newline patterns
  const paragraphs = content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Enhanced scoring system for horror and engagement
  const scoredParagraphs = paragraphs.map((p, index) => {
    let score = 0;
    const text = p.toLowerCase();

    // Horror elements (higher weight)
    if (/(blood|scream|death|corpse|kill|dead|demon|ghost|monster|evil|darkness|shadow|terror|horror)\b/i.test(p)) score += 6;
    if (/(spine|chill|dread|fear|panic|terror|horrif|nightmare)\b/i.test(p)) score += 5;
    if (/(heart|pulse|breath|sweat|trembl|shiver)\b/i.test(p)) score += 4;

    // Intense action or dramatic moments
    if (/(!{1,3}|\?{2,}|\.{3})/g.test(p)) score += 4;
    if (/(sudden|abrupt|without warning|to my horror|realized|discovered)\b/i.test(p)) score += 4;

    // Atmospheric elements
    if (/(silence|quiet|dark|eerie|mysterious|strange|cold|frozen|still)\b/i.test(p)) score += 3;

    // Visceral descriptions
    if (/(trembl|shudder|shiver|quiver|shake|twitch)\b/i.test(p)) score += 3;
    if (/(felt|heard|saw|smelled|tasted|sensed)\b/i.test(p)) score += 3;

    // Dialog containing horror elements (higher weight)
    if (/"[^"]*?(fear|death|help|scream|blood|run|hide)[^"]*?"/i.test(p)) score += 5;
    else if (/"[^"]*?(please|god|no|stop)[^"]*?"/i.test(p)) score += 4;
    else if (p.includes('"')) score += 2;

    // Engagement bonus (prefer paragraphs with optimal length)
    const wordCount = p.split(/\s+/).length;
    if (wordCount >= 20 && wordCount <= 60) score += 3;

    // Penalize very short or very long paragraphs
    if (wordCount < 15) score -= 2;
    if (wordCount > 80) score -= 3;

    // Debug logging
    console.log(`[PostCard] Paragraph ${index} scored:`, {
      score,
      wordCount,
      preview: p.substring(0, 50),
      horrorTerms: p.match(/(blood|scream|death|corpse|kill|dead|demon|ghost|monster|evil|darkness|shadow|terror|horror)\b/gi)
    });

    return { paragraph: p, score, length: p.length };
  });

  // Sort by score and then by optimal length
  scoredParagraphs.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Prefer paragraphs between 100-200 characters for readability
    const aLengthScore = Math.abs(150 - a.length);
    const bLengthScore = Math.abs(150 - b.length);
    return aLengthScore - bLengthScore;
  });

  // Debug logging for top paragraphs
  console.log('[PostCard] Top scoring paragraphs:', 
    scoredParagraphs.slice(0, 3).map(p => ({
      score: p.score,
      length: p.length,
      preview: p.paragraph.substring(0, 50)
    }))
  );

  // Get the best paragraph
  const bestParagraph = scoredParagraphs[0]?.paragraph || paragraphs[0] || '';

  // If it's too long, find a good breakpoint
  if (bestParagraph.length > 200) {
    const sentences = bestParagraph.match(/[^.!?]+[.!?]+/g) || [];
    let excerpt = '';
    let totalLength = 0;

    for (const sentence of sentences) {
      if (totalLength + sentence.length > 200) break;
      excerpt += sentence;
      totalLength += sentence.length;
    }

    return excerpt.trim() + (excerpt.length < bestParagraph.length ? '...' : '');
  }

  return bestParagraph;
};

  // Use stored theme category and icon if available, otherwise use automatic detection
  let theme: string | null = null;
  let iconName: string | null = null;

  // First check if the post has manually assigned theme/icon from admin
  if (post.themeCategory) {
    theme = post.themeCategory as string;
    // Get icon from direct property or metadata
    iconName = post.themeIcon || 
              (post.metadata && (post.metadata as any).themeIcon) || 
              null;
  } else {
    // Fall back to automatic detection if no admin-assigned theme
    const themes = post.content ? detectThemes(post.content) : [];
    theme = themes.length > 0 ? themes[0] : null;
  }

  const intensity = post.content ? calculateIntensity(post.content) : 1;
  const themeInfo = theme ? THEME_CATEGORIES[theme as keyof typeof THEME_CATEGORIES] : null;
  const displayName = theme ? theme.charAt(0) + theme.slice(1).toLowerCase().replace(/_/g, ' ') : '';

  // Determine icon - use the stored iconName if available, otherwise use theme's default icon
  const defaultIconName = themeInfo?.icon || 'ghost';
  const actualIconName = iconName || defaultIconName;
  
  // Convert to lowercase for consistent lookup
  const iconKey = actualIconName?.toLowerCase() || 'ghost';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <Card className="h-full hover:bg-accent/5 transition-colors border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{post.title}</CardTitle>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
            <span className="text-primary/50">•</span>
            <span className="read-time text-sm text-muted-foreground flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              {getReadingTime(post.content)}
            </span>
            <span className="text-primary/50">•</span>
            <span className="text-sm text-primary/90 font-medium flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              Level {intensity}/5
            </span>
          </div>
          {themeInfo && (
            <div className="mt-2">
              <Badge
                variant="default"
                className="text-xs font-medium tracking-wide px-2 py-0.5 flex items-center gap-1.5 w-fit"
              >
                {THEME_ICONS[iconKey] ? 
                  THEME_ICONS[iconKey] :
                  <Ghost className="h-4 w-4" />
                }
                <span className="whitespace-nowrap">{displayName}</span>
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3 prose-sm">
            {getEngagingExcerpt(post.content)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}