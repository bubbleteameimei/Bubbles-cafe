import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, TrendingUp, Clock, BookOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
  excerpt: {
    rendered: string;
  };
  date: string;
  analytics?: {
    views: number;
    timeOnPage: number;
    engagementRate: number;
    likes: number;
  };
  metadata?: {
    themeCategory?: string;
  };
}

interface TrendingStoriesProps {
  limit?: number;
  className?: string;
}

type TrendingCategory = 'popular' | 'recent' | 'engagement';

const TrendingStories: React.FC<TrendingStoriesProps> = ({ 
  limit = 3,
  className = ''
}) => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TrendingCategory>('popular');
  
  // Query to fetch trending stories
  const { data, isLoading, error } = useQuery({
    queryKey: ['trending-stories'],
    queryFn: async () => {
      const response = await apiRequest<{ posts: Post[] }>('/api/trending-stories');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter stories based on active tab
  const getFilteredStories = () => {
    if (!data?.posts || data.posts.length === 0) return [];
    
    let stories = [...data.posts];
    
    switch (activeTab) {
      case 'popular':
        // Sort by views
        return stories
          .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
          .slice(0, limit);
      case 'recent':
        // Sort by date
        return stories
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      case 'engagement':
        // Sort by engagement (likes and time on page)
        return stories
          .sort((a, b) => {
            const aScore = (a.analytics?.likes || 0) + (a.analytics?.timeOnPage || 0) / 60;
            const bScore = (b.analytics?.likes || 0) + (b.analytics?.timeOnPage || 0) / 60;
            return bScore - aScore;
          })
          .slice(0, limit);
      default:
        return stories.slice(0, limit);
    }
  };
  
  const filteredStories = getFilteredStories();
  
  const handleReadStory = (slug: string) => {
    setLocation(`/reader/${slug}`);
  };
  
  // Clean HTML text
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  
  // Get excerpt
  const getExcerpt = (html: string, maxLength = 120) => {
    const text = stripHtml(html);
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };
  
  if (error) {
    console.error('Error fetching trending stories:', error);
    return null;
  }
  
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-red-500" />
        <h2 className="text-xl font-semibold">Trending Stories</h2>
      </div>
      
      <Tabs
        defaultValue="popular"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TrendingCategory)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="popular" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Popular</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Recent</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>Engaging</span>
          </TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent 
              value={activeTab} 
              className="mt-0 space-y-4"
            >
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: limit }).map((_, index) => (
                  <Card key={`skeleton-${index}`} className="overflow-hidden">
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex items-center gap-2 mt-4">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <Card key={story.id} className="overflow-hidden border border-border hover:border-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <CardTitle 
                        className="mb-2 line-clamp-1"
                        dangerouslySetInnerHTML={{ __html: story.title.rendered }}
                      />
                      <CardDescription className="line-clamp-2 mb-4">
                        {getExcerpt(story.excerpt.rendered)}
                      </CardDescription>
                      
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleReadStory(story.slug)}
                          className="flex items-center gap-1"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>Read Story</span>
                        </Button>
                        
                        {story.metadata?.themeCategory && (
                          <Badge variant="outline" className="capitalize">
                            {story.metadata.themeCategory.toLowerCase().replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0 flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {story.analytics?.views || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {story.analytics?.likes || 0} likes
                        </span>
                      </div>
                      <time>
                        {new Date(story.date).toLocaleDateString()}
                      </time>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No trending stories found for this category.
                </div>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default TrendingStories;