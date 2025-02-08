import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useLocation } from "wouter";
import { format, isValid, parseISO, formatDistanceToNow } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Mist from "@/components/effects/mist";

export default function IndexView() {
  const [, setLocation] = useLocation();
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return format(new Date(), 'MMMM d, yyyy');
      }
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
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

  const getExcerpt = (content: string) => {
    if (!content) return '';

    const paragraphs = content.split('\n\n');
    // Look for engaging paragraphs
    const engagingParagraph = paragraphs.find(p => 
      p.includes('!') || 
      p.includes('?') || 
      p.includes('...') || 
      p.toLowerCase().includes('suddenly') ||
      p.toLowerCase().includes('horror') ||
      p.toLowerCase().includes('fear') ||
      p.toLowerCase().includes('scream') ||
      p.toLowerCase().includes('blood') ||
      p.toLowerCase().includes('dark')
    );

    // If no engaging paragraph found, use the first one
    const selectedParagraph = engagingParagraph || paragraphs[0];

    // Trim and add ellipsis if needed
    const maxLength = 200;
    const trimmed = selectedParagraph.trim();
    return trimmed.length > maxLength 
      ? trimmed.slice(0, maxLength).split(' ').slice(0, -1).join(' ') + '...'
      : trimmed;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !posts || posts.length === 0) {
    return <div className="text-center p-8">Stories not found or error loading stories.</div>;
  }

  return (
    <div className="relative min-h-screen">
      <Mist className="opacity-40" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold">Story Index</h1>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="text-muted-foreground hover:text-primary"
            >
              Back to Home
            </Button>
          </motion.div>

          <motion.div 
            className="grid gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {posts.map((post, index) => {
              const timeAgo = formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true });
              const readingTime = getReadingTime(post.content);
              const excerpt = getExcerpt(post.content);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setLocation(`/stories/${post.slug}`)}
                  className="cursor-pointer group"
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground font-mono space-y-1 text-right">
                          <time className="block">{formatDate(post.createdAt)}</time>
                          <div className="flex items-center gap-2 justify-end">
                            <span>{timeAgo}</span>
                            <span className="text-primary/50">•</span>
                            <span>{readingTime}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground prose dark:prose-invert">
                        {excerpt}
                      </p>
                      <div className="mt-4 flex items-center text-sm text-primary group-hover:underline">
                        Read full story <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}