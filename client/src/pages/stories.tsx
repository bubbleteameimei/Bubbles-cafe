import { useInfiniteQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Mist from "@/components/effects/mist";
import { useInView } from "framer-motion";
import { useRef } from "react";
import React from 'react';

const POSTS_PER_PAGE = 16;

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

export default function Stories() {
  const loadMoreRef = useRef(null);
  const isInView = useInView(loadMoreRef);
  const [, setLocation] = useLocation();

  const { 
    data, 
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage 
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ["/api/posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/posts?page=${pageParam}&limit=${POSTS_PER_PAGE}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      if (!data.posts) {
        return { posts: [], hasMore: false };
      }
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    retry: 3
  });

  React.useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !data?.pages) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Unable to load stories</h2>
          <p className="text-muted-foreground">{error?.message || "Please try again later"}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const posts = data.pages.flatMap(page => page?.posts || []);

  if (!posts.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">No stories found</h2>
          <p className="text-muted-foreground mt-2">Check back later for new content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Mist className="opacity-40" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Stories</h1>
            <Button 
              variant="ghost" 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                setLocation('/');
              }}
              className="text-muted-foreground hover:text-primary"
            >
              Back to Home
            </Button>
          </motion.div>

          <motion.div 
            className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 relative"
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
                className="group relative"
              >
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-card border-border hover:border-primary/20 z-10"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    setLocation(`/story/${post.slug || post.id}`);
                  }}
                >
                  <CardContent className="py-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                    <time className="text-sm text-muted-foreground font-mono whitespace-nowrap ml-4">
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </time>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div ref={loadMoreRef} className="mt-8 text-center">
            {isFetchingNextPage && <LoadingScreen />}
          </div>
        </div>
      </div>
    </div>
  );
}