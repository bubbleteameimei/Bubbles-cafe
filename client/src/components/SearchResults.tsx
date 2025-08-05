import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getExcerpt } from '@/lib/content-analysis';

interface SearchResultsProps {
  query: string;
  onSelect?: () => void;
}

type Post = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  slug: string;
};

const SearchResults: React.FC<SearchResultsProps> = ({ query, onSelect }) => {
  const [, navigate] = useLocation();
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', 'all'],
    queryFn: async () => {
      // Try the main API endpoint first
      try {
        const response = await fetch('/api/posts?limit=100');
        if (!response.ok) throw new Error('Main API failed');
        const data = await response.json();
        return data.posts as Post[];
      } catch (error) {
        // Fallback to WordPress API directly
        
        try {
          const wpResponse = await fetch('https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts?per_page=100');
          if (!wpResponse.ok) throw new Error('WordPress API failed');
          const wpData = await wpResponse.json();
          return wpData as Post[];
        } catch (wpError) {
          
          throw new Error('Search functionality temporarily unavailable');
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry failed requests
  });

  useEffect(() => {
    if (!query || !posts) {
      setSearchResults([]);
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const results = posts.filter(post => {
      const title = post.title.rendered.toLowerCase();
      const content = getExcerpt(post.content.rendered).toLowerCase();
      
      return title.includes(normalizedQuery) || content.includes(normalizedQuery);
    });

    setSearchResults(results);
  }, [query, posts]);

  const handlePostClick = (slug: string) => {
    navigate(`/reader/${slug}`);
    if (onSelect) onSelect();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (query.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        Type to search stories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground p-4">
        <p>Search is temporarily unavailable.</p>
        <p className="text-sm mt-2">Please try again later or browse our stories directly.</p>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No results found for "{query}"
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchResults.map(post => (
        <div 
          key={post.id}
          className="p-3 rounded-md hover:bg-muted transition-colors cursor-pointer"
          onClick={() => handlePostClick(post.slug)}
        >
          <div className="font-medium" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
          <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {getExcerpt(post.content.rendered)}
          </div>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;