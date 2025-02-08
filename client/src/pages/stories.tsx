import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Mist from "@/components/effects/mist";

export default function Stories() {
  const [, setLocation] = useLocation();
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !posts || posts.length === 0) {
    return <div className="text-center p-8">Stories not found or error loading stories.</div>;
  }

  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-serif font-bold">Stories</h1>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
            >
              Back to Home
            </Button>
          </div>

          <div className="grid gap-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => setLocation(`/stories/${post.slug}`)}
                >
                  <CardContent className="py-4 flex justify-between items-center">
                    <h2 className="text-lg font-medium">{post.title}</h2>
                    <time className="text-sm text-muted-foreground font-mono">
                      {format(parseISO(post.createdAt), 'MMM d, yyyy')}
                    </time>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}