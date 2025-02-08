import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format, isValid, parseISO } from "date-fns";
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
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !post) {
    return <div className="text-center p-8">Story not found or error loading story.</div>;
  }

  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="story-container max-w-3xl mx-auto px-4 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose dark:prose-invert mx-auto mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <time className="text-sm text-muted-foreground block mb-8">
            {formatDate(post.createdAt)}
          </time>
          <div
            className="story-content"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {post.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6">
                {paragraph.trim().split('_').map((text, i) =>
                  i % 2 === 0 ? text : <i key={i}>{text}</i>
                )}
              </p>
            ))}
          </div>
        </motion.article>

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}