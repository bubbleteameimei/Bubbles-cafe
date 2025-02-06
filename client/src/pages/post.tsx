import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Post } from "@shared/schema";
import CommentSection from "@/components/blog/comment-section";
import { PostFooter } from "@/components/blog/post-footer";
import Mist from "@/components/effects/mist";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useState, useCallback } from "react";

// Social media links
const socialLinks = {
  wordpress: "https://bubbleteameimei.wordpress.com",
  twitter: "https://twitter.com/Bubbleteameimei",
  instagram: "https://www.instagram.com/bubbleteameimei"
};

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
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: posts } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["/api/posts", slug],
    enabled: !!slug
  });

  const goToPrevious = useCallback(() => {
    if (!posts?.length) return;
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts?.length]);

  const goToNext = useCallback(() => {
    if (!posts?.length) return;
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts?.length]);

  const randomize = useCallback(() => {
    if (!posts?.length) return;
    const newIndex = Math.floor(Math.random() * posts.length);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts?.length]);

  if (isLoading || !slug) {
    return <LoadingScreen />;
  }

  if (!post || !posts) {
    return null;
  }

  return (
    <div className="relative min-h-screen pb-32">
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

          <PostFooter
            currentIndex={currentIndex}
            totalPosts={posts.length}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onRandom={randomize}
            socialLinks={socialLinks}
          />

          <div className="mt-12 max-w-2xl mx-auto">
            <CommentSection postId={post.id} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}