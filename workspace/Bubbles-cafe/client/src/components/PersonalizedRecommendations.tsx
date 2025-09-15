import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Define the type for a recommendation post
interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
  themeCategory?: string | null;
  readingTimeMinutes?: number | null;
}

// Define the type for the API response
interface PersonalizedRecommendationsResponse {
  recommendations: Post[];
  meta: {
    count: number;
    userPreferences: boolean;
    generatedAt: string;
  };
}

interface PersonalizedRecommendationsProps {
  limit?: number;
  preferredThemes?: string[];
  showHeading?: boolean;
  showEmptyMessage?: boolean;
}

export function PersonalizedRecommendations({
  limit = 5,
  preferredThemes = [],
  showHeading = true,
  showEmptyMessage = true
}: PersonalizedRecommendationsProps) {
  const { toast } = useToast();
  
  // Build the URL with query parameters
  const buildQueryUrl = () => {
    const url = new URL('/api/recommendations/personalized', window.location.origin);
    
    // Add the limit parameter
    url.searchParams.append('limit', limit.toString());
    
    // Add theme preferences if they exist
    if (preferredThemes.length > 0) {
      preferredThemes.forEach(theme => {
        url.searchParams.append('themes', theme);
      });
    }
    
    return url.toString();
  };

  // Fetch personalized recommendations using React Query
  const { data, isLoading, isError, error } = useQuery<PersonalizedRecommendationsResponse>({
    queryKey: ['/api/recommendations/personalized', limit, ...preferredThemes],
    enabled: true,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show error toast if the fetch fails
  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error loading recommendations',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  // Handle refreshing recommendations
  const refreshRecommendations = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/recommendations/personalized']
    });
    
    toast({
      title: 'Refreshing recommendations',
      description: 'Finding new horror stories tailored to your interests...',
    });
  };

  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="space-y-4">
        {showHeading && <h2 className="text-2xl font-bold text-primary mb-4">Recommendations For You</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If there are no recommendations, show a message
  if (!data?.recommendations || data.recommendations.length === 0) {
    if (!showEmptyMessage) return null;
    
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">No Recommendations Yet</h2>
        <p className="text-muted-foreground mb-4">
          As you read and interact with stories, we'll learn your preferences and suggest horror tales you might enjoy.
        </p>
        <button 
          onClick={refreshRecommendations}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Browse Horror Stories
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeading && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Recommendations For You</h2>
          <button 
            onClick={refreshRecommendations}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.recommendations.map((post) => (
          <Link key={post.id} href={`/story/${post.slug}`}>
            <a className="block h-full">
              <Card className="h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  {post.themeCategory && (
                    <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground w-fit">
                      {post.themeCategory}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt || "Dive into this horror tale..."}
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.readingTimeMinutes && (
                    <span>{post.readingTimeMinutes} min read</span>
                  )}
                </CardFooter>
              </Card>
            </a>
          </Link>
        ))}
      </div>
      
      {data.meta.userPreferences && (
        <p className="text-sm text-muted-foreground mt-4">
          Recommendations based on your preferred themes and reading history.
        </p>
      )}
    </div>
  );
}

export default PersonalizedRecommendations;