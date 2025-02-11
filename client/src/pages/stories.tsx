import { useInfiniteQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useLocation } from "wouter";
import { format } from "date-fns";
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
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => lastPage.hasMore ? pages.length + 1 : undefined,
    initialPageParam: 1
  });

  // Load more posts when the load more button comes into view
  React.useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !data?.pages) {
    return <div className="text-center p-8">Stories not found or error loading stories.</div>;
  }

  const posts = data.pages.flatMap(page => page.posts);

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
                  onClick={() => setLocation(`/story/${post.slug}`)}
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
          </div>

          <div ref={loadMoreRef} className="mt-8 text-center">
            {isFetchingNextPage && <LoadingScreen />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}