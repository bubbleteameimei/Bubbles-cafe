import { motion } from "framer-motion";
import { type Post } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

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
      setLocation(`/stories/${post.id}`);
    }
  };

  // Get the first paragraph that's not empty and at least 100 characters
  const getEngagingExcerpt = (content: string): string => {
    const paragraphs = content.split('\n\n');
    const significantParagraph = paragraphs.find(p => p.trim().length >= 100) || paragraphs[0];
    return significantParagraph.slice(0, 200) + (significantParagraph.length > 200 ? '...' : '');
  };

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
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
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