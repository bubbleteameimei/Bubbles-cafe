"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  ArrowRight, 
  BookmarkPlus,
  Eye,
  Clock,
  ThumbsUp
} from "lucide-react"
import { DirectRecommendations } from "./direct-recommendations"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Temporarily define the types directly to avoid import issues
type ThemeCategory = 
  | 'PARASITE'
  | 'LOVECRAFTIAN'
  | 'PSYCHOLOGICAL' 
  | 'TECHNOLOGICAL'
  | 'SUICIDAL'
  | 'BODY_HORROR'
  | 'PSYCHOPATH'
  | 'SUPERNATURAL'
  | 'POSSESSION'
  | 'CANNIBALISM'
  | 'STALKING'
  | 'DEATH'
  | 'GOTHIC'
  | 'APOCALYPTIC'
  | 'ISOLATION'
  | 'AQUATIC'
  | 'VIRAL'
  | 'URBAN_LEGEND'
  | 'TIME_HORROR'
  | 'DREAMSCAPE';

// Minimal Post type for our component
interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorName?: string;
  readingTime?: number;
  views?: number;
  likesCount?: number;
  metadata?: {
    themeCategory?: string;
  };
}

interface StoryRecommendationsProps {
  /** Current post ID to exclude from recommendations */
  currentPostId: number;
  /** Theme categories to match for recommendations */
  themeCategories?: ThemeCategory[];
  /** Maximum number of recommendations to show */
  maxRecommendations?: number;
  /** Display layout style */
  layout?: "grid" | "carousel" | "sidebar";
  /** Whether to show analytics like views and likes */
  showAnalytics?: boolean;
  /** Optional callback when a story is bookmarked */
  onBookmark?: (postId: number) => void;
}

/**
 * Story recommendations component that suggests related stories
 * based on the current story's themes and user preferences
 */
export function StoryRecommendations({
  currentPostId,
  themeCategories = [],
  maxRecommendations = 3,
  layout = "grid",
  showAnalytics = true,
  onBookmark
}: StoryRecommendationsProps) {
  // Get recommended stories
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['/api/posts/recommendations', currentPostId, themeCategories],
    queryFn: async () => {
      // If the API endpoint doesn't exist yet, fall back to getting all posts and filtering
      try {
        const response = await fetch(`/api/posts/recommendations?postId=${currentPostId}&categories=${themeCategories.join(',')}&limit=${maxRecommendations}`);
        if (!response.ok) throw new Error('API endpoint not available');
        return await response.json();
      } catch (error) {
        // Fallback: fetch all posts and filter client-side
        const allPosts = await fetch('/api/posts').then(res => res.json());
        
        // Filter out current post and sort by relevance
        return allPosts
          .filter((post: Post) => post.id !== currentPostId)
          .sort(() => Math.random() - 0.5) // Simple random sort as placeholder
          .slice(0, maxRecommendations);
      }
    },
    enabled: !!currentPostId,
  });
  
  // Handle bookmark click
  const handleBookmark = (postId: number) => {
    if (onBookmark) {
      onBookmark(postId);
    }
  };
  
  // Helper to estimate reading time from content length
  const estimateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };
  
  // Layout classes based on the layout prop
  const layoutClasses = {
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    carousel: "flex gap-4 overflow-x-auto pb-2 snap-x",
    sidebar: "flex flex-col gap-4",
  };
  
  // Item classes based on the layout prop
  const itemClasses = {
    grid: "",
    carousel: "min-w-[280px] snap-start",
    sidebar: "",
  };
  
  // If there's an error, use DirectRecommendations component as a fallback
  if (error) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">You Might Also Enjoy</h2>
          <Button variant="link" asChild>
            <a href="/search">
              Browse All <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
        <DirectRecommendations
          layout={layout}
          showAuthor={true}
          showExcerpt={true}
          limit={maxRecommendations}
          onBookmark={onBookmark}
        />
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">You Might Also Enjoy</h2>
        <Button variant="link" asChild>
          <a href="/search">
            Browse All <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
      
      <div className={layoutClasses[layout]}>
        {isLoading ? (
          // Show loading skeletons
          Array.from({ length: maxRecommendations }).map((_, i) => (
            <div key={i} className={itemClasses[layout]}>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full mb-2" />
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        ) : recommendations && recommendations.length > 0 ? (
          // Show recommendations
          recommendations.map((post: Post) => (
            <div key={post.id} className={itemClasses[layout]}>
              <Card>
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    <a href={`/stories/${post.slug}`} className="hover:underline">
                      {post.title}
                    </a>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    by {post.authorName || 'Anonymous'}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-muted-foreground mb-3">
                    {post.excerpt || post.content.substring(0, 120) + '...'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.metadata && post.metadata.themeCategory && (
                      <Badge variant="secondary">
                        {(post.metadata.themeCategory as string).replace('_', ' ').toLowerCase()}
                      </Badge>
                    )}
                    {showAnalytics && (
                      <>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime || estimateReadingTime(post.content)} min
                        </Badge>
                        
                        {post.views !== undefined && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views}
                          </Badge>
                        )}
                        
                        {post.likesCount !== undefined && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {post.likesCount}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/stories/${post.slug}`}>Read Story</a>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleBookmark(post.id)}
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    <span className="sr-only">Bookmark</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))
        ) : (
          // No recommendations found
          <div className="col-span-full text-center p-4">
            <p className="text-muted-foreground">
              No recommendations found. <a href="/search" className="underline">Browse all stories</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}