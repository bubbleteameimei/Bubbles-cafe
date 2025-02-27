import { motion } from "framer-motion";
import { type Post } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Bug as Worm, Skull, Brain, Pill, Cpu, Dna, Axe, Ghost, Footprints, Castle, Radiation, UserMinus2, Anchor, AlertTriangle, Building, Clock, Moon, Timer, Gauge } from "lucide-react";
import { detectThemes, calculateIntensity, getReadingTime, THEME_CATEGORIES } from "@/lib/content-analysis";

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
      setLocation(`/story/${post.slug}`);
    }
  };

const getEngagingExcerpt = (content: string): string => {
  if (!content) return '';

  // Split content into paragraphs
  const paragraphs = content.split('\n\n');

  // Find paragraphs that contain engaging elements
  const engagingParagraphs = paragraphs.filter(p => {
    const hasDialogue = p.includes('"') || p.includes('"');
    const hasAction = /(?:ed|ing)\b/.test(p) || /!\s*$/.test(p) || 
      /(ran|jumped|moved|turned|gasped|screamed|trembled|shuddered|stumbled|crashed)\b/i.test(p);
    const hasVividDescription = /(felt|heard|saw|smelled|tasted|sensed|noticed|realized|discovered|observed|watched|stared|glanced)\b/i.test(p);
    const hasEmotionalContent = /(fear|terror|horror|dread|panic|anxiety|shocked|terrified|frightened|horrified|petrified|paranoid)\b/i.test(p);
    const hasSuspense = /(suddenly|unexpectedly|without warning|to my horror|to my surprise)\b/i.test(p);
    const hasAtmosphere = /(darkness|shadow|silence|cold|dark|quiet|eerie|mysterious|strange|odd)\b/i.test(p);

    return hasDialogue || hasAction || hasVividDescription || hasEmotionalContent || hasSuspense || hasAtmosphere;
  });

  // Score paragraphs based on engagement factors
  const scoredParagraphs = engagingParagraphs.map(p => {
    let score = 0;
    if (p.includes('"')) score += 2; // Dialogue is highly engaging
    if (/!\s*$/.test(p)) score += 2; // Exclamations indicate intensity
    if (/(suddenly|unexpectedly|without warning)\b/i.test(p)) score += 2; // Surprise elements
    if (/(fear|terror|horror|dread)\b/i.test(p)) score += 1; // Horror elements
    if (/(darkness|shadow|silence)\b/i.test(p)) score += 1; // Atmosphere
    return { paragraph: p, score };
  });

  // Sort by score and length (prefer longer paragraphs if scores are equal)
  scoredParagraphs.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.paragraph.length - a.paragraph.length;
  });

  // Use the highest-scoring paragraph, or fall back to the first one
  const significantParagraph = (scoredParagraphs[0]?.paragraph || paragraphs[0] || '').trim();

  // Extract a compelling snippet
  let excerpt = significantParagraph;
  if (excerpt.length > 200) {
    // Try to end at a natural break point
    const breakPoint = excerpt.substring(0, 200).lastIndexOf('.');
    excerpt = excerpt.substring(0, breakPoint > 150 ? breakPoint + 1 : 200) + '...';
  }

  return excerpt;
};

  const themes = post.content ? detectThemes(post.content) : [];
  const theme = themes.length > 0 ? themes[0] : null;
  const intensity = post.content ? calculateIntensity(post.content) : 1;
  const themeInfo = theme ? THEME_CATEGORIES[theme] : null;
  const displayName = theme ? theme.charAt(0) + theme.slice(1).toLowerCase().replace(/_/g, ' ') : '';

  const IconComponent = themeInfo?.icon === 'Worm' ? Worm :
                    themeInfo?.icon === 'Skull' ? Skull :
                    themeInfo?.icon === 'Brain' ? Brain :
                    themeInfo?.icon === 'Pill' ? Pill :
                    themeInfo?.icon === 'Cpu' ? Cpu :
                    themeInfo?.icon === 'Dna' ? Dna :
                    themeInfo?.icon === 'Footprints' ? Footprints :
                    themeInfo?.icon === 'Ghost' ? Ghost :
                    themeInfo?.icon === 'Castle' ? Castle :
                    themeInfo?.icon === 'Radiation' ? Radiation :
                    themeInfo?.icon === 'UserMinus2' ? UserMinus2 :
                    themeInfo?.icon === 'Anchor' ? Anchor :
                    themeInfo?.icon === 'AlertTriangle' ? AlertTriangle :
                    themeInfo?.icon === 'Building' ? Building :
                    themeInfo?.icon === 'Clock' ? Clock :
                    Moon;

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
          <CardTitle className="story-title text-xl">{post.title}</CardTitle>
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
                className="text-xs font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 w-fit"
              >
                <IconComponent className="h-3 w-3" />
                {displayName}
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