import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format, parseISO } from "date-fns";
import CommentSection from "@/components/blog/comment-section";
import { motion } from "framer-motion";
import Mist from "@/components/effects/mist";
import { SoundMixer } from "@/components/effects/sound-mixer";
import { LikeDislike } from "@/components/ui/like-dislike";
import { useState, useEffect } from "react";

// Helper function to generate and persist random stats
const getOrCreateStats = (postId: number) => {
  const storageKey = `post-stats-${postId}`;
  const existingStats = localStorage.getItem(storageKey);

  if (existingStats) {
    return JSON.parse(existingStats);
  }

  const newStats = {
    likes: Math.floor(Math.random() * 150),
    dislikes: Math.floor(Math.random() * 15)
  };

  localStorage.setItem(storageKey, JSON.stringify(newStats));
  return newStats;
};

interface StoryViewProps {
  params: {
    slug: string;
  };
}

export default function StoryView({ params }: StoryViewProps) {
  const [postStats, setPostStats] = useState<Record<number, { likes: number, dislikes: number }>>({});

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ["/api/posts", params.slug],
  });

  // Initialize persisted stats for the post
  useEffect(() => {
    if (post) {
      const stats = getOrCreateStats(post.id);
      setPostStats(prev => ({
        ...prev,
        [post.id]: stats
      }));
    }
  }, [post]);

  const formatDate = (dateString: string | Date) => {
    try {
      if (!dateString) return '';
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
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
  const stats = postStats[post.id] || { likes: 0, dislikes: 0 };

  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="fixed bottom-4 right-4 z-50">
        <SoundMixer />
      </div>
      <div className="story-container max-w-3xl mx-auto px-4 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose dark:prose-invert mx-auto"
        >
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-mono">
            {post.createdAt && <time>{formatDate(post.createdAt)}</time>}
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