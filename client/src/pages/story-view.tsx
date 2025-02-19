import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import CommentSection from "@/components/blog/comment-section";
import { motion } from "framer-motion";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import { StoryRating } from "@/components/StoryRating";
import { useAuth } from "@/hooks/use-auth";

interface StoryViewProps {
  slug: string;
}

export default function StoryView({ slug }: StoryViewProps) {
  const { user } = useAuth();
  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ["/api/posts", slug],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

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
          className="prose dark:prose-invert mx-auto"
        >
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-mono">
            <time>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</time>
          </div>
          <div className="story-content mb-16" style={{ whiteSpace: 'pre-wrap' }}>
            {post.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6">
                {paragraph.trim().split('_').map((text, i) =>
                  i % 2 === 0 ? text : <i key={i}>{text}</i>
                )}
              </p>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-4">
            <LikeDislike postId={post.id} />
            {user && <StoryRating postId={post.id} userId={user.id} />}
          </div>
        </motion.article>

        <div className="mt-16 pt-8 border-t border-border/50">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}