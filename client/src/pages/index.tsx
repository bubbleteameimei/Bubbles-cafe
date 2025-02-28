import { useInfiniteQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Clock, Calendar } from "lucide-react";
import React from 'react';
import { LikeDislike } from "@/components/ui/like-dislike";
import Mist from "@/components/effects/mist";
import { getReadingTime } from "@/lib/content-analysis";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { fetchWordPressPosts, convertWordPressPost } from "@/services/wordpress";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
  page?: number;
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ["wordpress", "posts"],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const wpPosts = await fetchWordPressPosts(pageParam, 50);
        const posts = wpPosts.map(post => convertWordPressPost(post)) as Post[];

        return {
          posts,
          hasMore: posts.length === 50, // If we got a full page, there might be more
          page: pageParam
        };
      } catch (error) {
        console.error('Error fetching WordPress posts:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? (lastPage.page || 0) + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialPageParam: 1
  });

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const navigateToStory = (postId: number) => {
    if (!data?.pages[0].posts) return;
    const index = data.pages[0].posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      sessionStorage.setItem('selectedStoryIndex', index.toString());
      setLocation('/reader');
    }
  };

  if (isLoading) {
    return <SkeletonCard />;
  }

  if (error || !data?.pages[0].posts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Unable to load stories</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Please try again later"}</p>
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

  const posts = data.pages.flatMap(page => page.posts);

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
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-border/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="stories-page-title text-4xl font-decorative mb-2">STORIES</h1>
              <p className="text-muted-foreground">Explore our collection of haunting tales</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="hover:bg-primary/20 transition-colors"
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
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <Card className="relative flex flex-col h-full hover:shadow-xl transition-all duration-300 bg-card border-border hover:border-primary/20 z-10 rounded-lg p-6">
                    <CardHeader className="relative py-2 px-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle
                          className="text-base group-hover:text-primary transition-colors cursor-pointer"
                          onClick={() => navigateToStory(post.id)}
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
                      <div className="w-full flex items-center justify-between">
                        <LikeDislike postId={post.id} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToStory(post.id)}
                          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                          Read More <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.article>
              );
            })}
          </motion.div>

          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full max-w-xs"
              >
                {isFetchingNextPage ? 'Loading more stories...' : 'Load More Stories'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}