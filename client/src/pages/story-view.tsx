import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import CommentSection from "@/components/blog/comment-section";
import { motion } from "framer-motion";
import { LikeDislike } from "@/components/ui/like-dislike";
import { MetaTags } from "@/components/ui/meta-tags";
import { ShareButton } from "@/components/ui/share-button";

interface StoryViewProps {
  slug: string;
}

export default function StoryView({ slug }: StoryViewProps) {
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
      <MetaTags post={post} />
      <div className="story-container max-w-3xl mx-auto px-4 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose dark:prose-invert mx-auto"
        >
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground mb-8 font-mono">
            <time>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</time>
            <ShareButton 
              title={post.title} 
              text={`Read "${post.title}" on Horror Stories`}
              className="ml-auto"
            />
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
          <div className="border-t border-border pt-4">
            <LikeDislike postId={post.id} />
          </div>
        </motion.article>

        <div className="mt-16 pt-8 border-t border-border/50">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}