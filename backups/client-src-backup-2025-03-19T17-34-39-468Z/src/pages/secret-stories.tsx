import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SecretStories() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: postsResponse, isLoading, error } = useQuery<{ posts: Post[], hasMore: boolean }>({
    queryKey: ["pages", "secret-stories"],
    queryFn: async () => {
      const response = await fetch('/api/posts?category=secret&limit=16');
      if (!response.ok) throw new Error('Failed to fetch stories');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !postsResponse?.posts) {
    return <div className="text-center p-8">Error loading stories.</div>;
  }

  const posts = postsResponse.posts;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="stories-page-title">Stories</h1>
          </div>

          {posts.length > 0 ? (
            <div className="grid gap-6">
              {posts.map((post) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 border rounded-lg bg-card hover:bg-card/80 transition-colors"
                >
                  <h2 className="story-title">{post.title}</h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/reader/${post.id}`)}
                    >
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No stories found.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}