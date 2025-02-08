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

export default function Stories() {
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
        console.error('Invalid date:', dateString);
        return 'Invalid date';
      }
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
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

  if (error) {
    console.error('Error loading stories:', error);
    return <div className="text-center p-8">Error loading stories. Please try again later.</div>;
  }

  if (!posts || posts.length === 0) {
    return <div className="text-center p-8">No stories found.</div>;
  }

  console.log(`Rendering ${posts.length} stories`); // Debug log

  return (
    <div className="relative min-h-screen bg-[url('/assets/IMG_4399.jpeg')] bg-cover bg-center bg-fixed before:content-[''] before:absolute before:inset-0 before:bg-background/90">
      <Mist className="opacity-40" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold">Stories</h1>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="text-muted-foreground hover:text-primary"
            >
              Back to Index
            </Button>
          </motion.div>

          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {posts.map((post, index) => {
              const timeAgo = formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true });
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setLocation(`/stories/${post.slug}`)}
                  className="cursor-pointer group"
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground font-mono">
                        <time>{formatDate(post.createdAt)}</time>
                        <div className="flex items-center gap-2">
                          <span>{timeAgo}</span>
                          <span className="text-primary/50">•</span>
                          <span>{getReadingTime(post.content)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 prose dark:prose-invert">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center text-sm text-primary group-hover:underline">
                        Read more <ChevronRight className="h-4 w-4 ml-1" />
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