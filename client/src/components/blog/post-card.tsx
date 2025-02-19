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
    const paragraphs = content.split('\n\n');
    const significantParagraph = paragraphs.find(p => p.trim().length >= 100) || paragraphs[0] || '';
    return significantParagraph.slice(0, 200) + (significantParagraph.length > 200 ? '...' : '');
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