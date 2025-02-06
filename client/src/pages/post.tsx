import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Post } from "@shared/schema";
import CommentSection from "@/components/blog/comment-section";
import Mist from "@/components/effects/mist";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingScreen } from "@/components/ui/loading-screen";

const PostContent = ({ content }: { content: string }) => (
  <div className="story-content" style={{ whiteSpace: 'pre-wrap' }}>
    {content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-6">
        {paragraph.trim().split('_').map((text, i) => 
          i % 2 === 0 ? text : <i key={i}>{text}</i>
        )}
      </p>
    ))}
  </div>
);

export default function PostPage() {
  const [, params] = useRoute("/post/:slug");
  const slug = params?.slug;

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["/api/posts", slug],
    enabled: !!slug
  });

  if (isLoading || !slug) {
    return <LoadingScreen />;
  }

  if (!post) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <article className="prose dark:prose-invert mx-auto">
            <h2 className="text-3xl font-bold mb-4">{post.title}</h2>
            <ErrorBoundary>
              <PostContent content={post.content} />
            </ErrorBoundary>
          </article>

          <div className="mt-12 max-w-2xl mx-auto">
            <CommentSection postId={post.id} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}