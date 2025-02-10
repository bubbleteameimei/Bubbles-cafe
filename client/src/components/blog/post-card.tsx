import { motion } from "framer-motion";
import { type Post } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Brain, Skull, Ghost, Footprints, Timer, Gauge } from "lucide-react";
import { detectThemes, calculateIntensity, THEME_CATEGORIES } from "@/lib/content-analysis";

interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setLocation(`/story/${post.slug}`);
    }
  };

  // Get the first paragraph that's not empty and at least 100 characters
  const getEngagingExcerpt = (content: string): string => {
    const paragraphs = content.split('\n\n');
    const significantParagraph = paragraphs.find(p => p.trim().length >= 100) || paragraphs[0];
    return significantParagraph.slice(0, 200) + (significantParagraph.length > 200 ? '...' : '');
  };

  const getReadingTime = (content: string) => {
    if (!content) return '0 min read';
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const theme = detectThemes(post.content)[0];
  const intensity = calculateIntensity(post.content);
  const themeInfo = theme ? THEME_CATEGORIES[theme] : null;
  const displayName = theme ? theme.charAt(0) + theme.slice(1).toLowerCase() : '';
  const IconComponent = themeInfo?.icon === 'Brain' ? Brain :
                       themeInfo?.icon === 'Skull' ? Skull :
                       themeInfo?.icon === 'Ghost' ? Ghost :
                       Footprints;

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
          <CardTitle className="line-clamp-2 text-xl">{post.title}</CardTitle>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
            <span className="text-primary/50">•</span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
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
                variant={themeInfo.badgeVariant}
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