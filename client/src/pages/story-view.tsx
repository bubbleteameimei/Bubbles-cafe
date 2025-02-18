import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import CommentSection from "@/components/blog/comment-section";
import { motion } from "framer-motion";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import { useState, useEffect } from "react";

// Helper function to generate deterministic stats based on post ID
const getOrCreateStats = (postId: number) => {
  const storageKey = `post-stats-${postId}`;
  const existingStats = localStorage.getItem(storageKey);

  if (existingStats) {
    return JSON.parse(existingStats);
  }

  // Calculate deterministic likes and dislikes based on post ID
  const likesBase = 80;
  const likesRange = 40; // To get max of 120
  const dislikesBase = 5;
  const dislikesRange = 15; // To get max of 20

  // Use post ID to generate deterministic but varying values
  const likes = likesBase + (postId * 7) % likesRange;
  const dislikes = dislikesBase + (postId * 3) % dislikesRange;

  const newStats = {
    likes,
    dislikes
  };

  localStorage.setItem(storageKey, JSON.stringify(newStats));
  return newStats;
};

interface StoryViewProps {
  slug: string;
}

export default function StoryView({ slug }: StoryViewProps) {
  const [postStats, setPostStats] = useState<Record<number, { likes: number, dislikes: number }>>({});

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

  useEffect(() => {
    if (post) {
      const stats = getOrCreateStats(post.id);
      setPostStats(prev => ({
        ...prev,
        [post.id]: stats
      }));
    }
  }, [post]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !post) {
    return <div className="text-center p-8">Story not found or error loading story.</div>;
  }

  const stats = postStats[post.id] || { likes: 0, dislikes: 0 };

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
          <div className="border-t border-border pt-4">
            <LikeDislike
              postId={post.id}
              initialLikes={stats.likes}
              initialDislikes={stats.dislikes}
            />
          </div>
        </motion.article>

        <div className="mt-16 pt-8 border-t border-border/50">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}