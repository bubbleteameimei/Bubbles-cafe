import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Mist from "@/components/effects/mist";

export default function Stories() {
  const [, setLocation] = useLocation();
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-center p-8">Error loading stories. Please try again later.</div>;
  }

  if (!posts || posts.length === 0) {
    return <div className="text-center p-8">No stories found.</div>;
  }

  return (
    <div className="relative min-h-screen bg-[url('/assets/IMG_4399.jpeg')] bg-cover bg-center bg-fixed before:content-[''] before:absolute before:inset-0 before:bg-background/90">
      <Mist className="opacity-40" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h1 
            className="text-4xl md:text-5xl font-serif font-bold mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Index
          </motion.h1>

          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {posts.map((post, index) => (
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
                    <time className="text-xs text-muted-foreground font-mono">
                      {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                    </time>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 prose dark:prose-invert">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}