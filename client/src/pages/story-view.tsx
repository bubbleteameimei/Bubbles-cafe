import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format, parseISO } from "date-fns";
import CommentSection from "@/components/blog/comment-section";
import { motion } from "framer-motion";
import Mist from "@/components/effects/mist";

interface StoryViewProps {
  params: {
    slug: string;
  };
}

export default function StoryView({ params }: StoryViewProps) {
  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ["/api/posts", params.slug],
  });

  const formatDate = (dateString: string | Date) => {
    try {
      if (!dateString) return '';
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return format(new Date(), 'MMMM d, yyyy');
    }
  };

  const getReadingTime = (content: string) => {
    if (!content) return '0 min read';
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !post) {
    return <div className="text-center p-8">Story not found or error loading story.</div>;
  }

  const content = post.content || '';

  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="story-container max-w-3xl mx-auto px-4 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose dark:prose-invert mx-auto"
        >
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-mono">
            <time>{formatDate(post.createdAt)}</time>
            <span className="text-primary/50">•</span>
            <span>{getReadingTime(content)}</span>
          </div>
          <div className="story-content mb-16" style={{ whiteSpace: 'pre-wrap' }}>
            {content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6">
                {paragraph.trim().split('_').map((text, i) =>
                  i % 2 === 0 ? text : <i key={i}>{text}</i>
                )}
              </p>
            ))}
          </div>
        </motion.article>

        {/* Comments section moved to bottom with spacing */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}