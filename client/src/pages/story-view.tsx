import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import SimpleCommentSection from "@/components/blog/SimpleCommentSection";
import { motion } from "framer-motion";
import { LikeDislike } from "@/components/ui/like-dislike";
import SEO from "@/components/SEO";
import { ShareButton } from "@/components/ui/share-button";

interface StoryViewProps {
  slug: string;
}

export default function StoryView({ slug }: StoryViewProps) {
  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ["/api/posts", slug],
    queryFn: async () => {
      const response = await fetch(`/api/posts/slug/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return <div className="text-center p-8">Story not found or error loading story.</div>;
  }

  // SEO and JSON-LD breadcrumbs
  const canonical = `/community-story/${encodeURIComponent(post.slug)}`;
  const title = post.title;
  const plainText = typeof post.content === 'string' ? post.content : '';
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const description = (post.excerpt && post.excerpt.trim()) || (plainText ? plainText.slice(0, 160) : undefined);
  const createdAtIso = (() => {
    try {
      return new Date(post.createdAt as any).toISOString();
    } catch {
      return undefined;
    }
  })();

  return (
    <div className="relative min-h-screen">
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        type="article"
        published={createdAtIso}
        modified={createdAtIso}
        readingTime={readingMinutes}
        wordCount={wordCount}
      />
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
              title={"Bubble’s Cafe"} 
              text={`Read ${post.title} — from Bubble’s Cafe.${(post.excerpt && post.excerpt.trim()) ? ' ' + post.excerpt.trim() : ''}`}
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
          <h3 className="text-xl font-semibold mb-4">Discussion</h3>
          <SimpleCommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}