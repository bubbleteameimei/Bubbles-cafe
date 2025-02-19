import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, Calendar } from "lucide-react";
import React from 'react';
import { LikeDislike } from "@/components/ui/like-dislike";
import Mist from "@/components/effects/mist";
import { getReadingTime } from "@/lib/content-analysis";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

const getExcerpt = (content: string) => {
  if (!content) return '';

  const paragraphs = content.split('\n\n');
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

  const selectedParagraph = engagingParagraph || paragraphs[0];
  const maxLength = 100;
  const trimmed = selectedParagraph.trim();
  return trimmed.length > maxLength
    ? trimmed.slice(0, maxLength).split(' ').slice(0, -1).join(' ') + '...'
    : trimmed;
};

export default function IndexView() {
  const [, setLocation] = useLocation();
  const { data: postsData, isLoading, error } = useQuery<PostsResponse>({
    queryKey: ["pages", "index", "all-posts"],
    queryFn: async () => {
      const response = await fetch('/api/posts?section=index&page=1&limit=16&type=index');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const formatDate = (date: Date) => {
    try {
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const navigateToStory = (postId: number) => {
    if (!postsData?.posts) return;
    const index = postsData.posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      sessionStorage.setItem('selectedStoryIndex', index.toString());
      setLocation('/reader');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !postsData?.posts) {
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

  const posts = postsData.posts;

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
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="stories-page-title mb-4">INDEX</h1>
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
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
            {posts.map((post, index) => {
              const readingTime = getReadingTime(post.content);
              const excerpt = getExcerpt(post.content);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <Card className="relative flex flex-col h-full hover:shadow-xl transition-all duration-300 bg-card border-border hover:border-primary/20 z-10">
                    <CardHeader className="relative py-2 px-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle
                          className="text-base group-hover:text-primary transition-colors"
                        >
                          {post.title}
                        </CardTitle>
                        <div className="text-[10px] text-muted-foreground space-y-0.5">
                          <div className="flex items-center gap-1 justify-end">
                            <Calendar className="h-3 w-3" />
                            <time>{formatDate(post.createdAt)}</time>
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />
                            <span>{readingTime}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent
                      onClick={() => navigateToStory(post.id)}
                      className="cursor-pointer py-1 px-3 flex-grow"
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {excerpt}
                      </p>

                      <div className="flex items-center text-xs text-primary gap-1 group-hover:gap-2 transition-all duration-300">
                        Read full story <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                    <CardFooter className="relative mt-auto py-2 px-3 border-t border-border bg-card">
                      <div className="w-full">
                        <LikeDislike
                          postId={post.id}
                        />
                      </div>
                    </CardFooter>
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