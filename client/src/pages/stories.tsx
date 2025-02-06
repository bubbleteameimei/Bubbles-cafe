import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PostFooter } from "@/components/blog/post-footer";
import Mist from "@/components/effects/mist";

// Memoized social media links
const socialLinks = {
  wordpress: "https://bubbleteameimei.wordpress.com",
  twitter: "https://twitter.com/Bubbleteameimei",
  instagram: "https://www.instagram.com/bubbleteameimei"
} as const;

function renderContent(content: string) {
  // First, clean up any residual HTML tags and normalize line breaks
  const cleanedContent = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?p>/g, '')
    .trim();

  // Split into paragraphs and process each one
  return cleanedContent.split('\n\n').map((paragraph: string, index: number) => {
    if (!paragraph.trim()) return null;

    // Process italics by looking for paired underscores
    // This regex handles nested italics and escaped underscores properly
    const parts = paragraph.trim().split(/(_(?![^_]*_)|(?<!_)_)/g);
    const processedParts = parts.map((part, i) => {
      if (part === '_') return '';
      return i % 2 === 1 ? `<em>${part}</em>` : part;
    });

    return (
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.1, 2), type: "spring", stiffness: 100 }}
        className="mb-6 leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: processedParts.join('') }}
      />
    );
  }).filter(Boolean);
}

export default function Story() {
  const { slug } = useParams();

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: [`/api/posts/${slug}`],
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false
  });

  if (isLoading || !post) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-center p-8">Error loading story. Please try again later.</div>;
  }

  return (
    <div className="relative min-h-screen bg-[url('/assets/IMG_4399.jpeg')] bg-cover bg-center bg-fixed before:content-[''] before:absolute before:inset-0 before:bg-background/90">
      <Mist className="opacity-40" />
      <div className="story-container relative z-10 max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <article className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg mx-auto backdrop-blur-sm bg-background/50 p-6 sm:p-8 rounded-lg border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              {post.title}
            </h2>
            <div className="story-content">
              {renderContent(post.content)}
            </div>
          </article>
        </motion.div>

        <PostFooter
          socialLinks={socialLinks}
        />
      </div>
    </div>
  );
}