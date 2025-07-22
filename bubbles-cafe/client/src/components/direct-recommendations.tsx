import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface Recommendation {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  createdAt: string;
}

interface DirectRecommendationsProps {
  /** Maximum number of recommendations to show */
  limit?: number;
  /** Display layout style */
  layout?: "grid" | "carousel" | "sidebar";
  /** Whether to show author information */
  showAuthor?: boolean;
  /** Whether to show excerpts */
  showExcerpt?: boolean;
  /** Optional callback when a story is bookmarked */
  onBookmark?: (postId: number) => void;
}

/**
 * DirectRecommendations - A simpler and more reliable recommendations component
 * This component uses the direct recommendations endpoint that avoids complex queries
 */
export function DirectRecommendations({
  limit = 3,
  layout = "grid",
  showAuthor = true,
  showExcerpt = true,
  onBookmark,
}: DirectRecommendationsProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Fade in effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Query for recommendations using the direct endpoint
  const { data: recommendations, isLoading, error } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations/direct', limit],
    queryFn: async () => {
      console.log('Fetching recommendations from API...');
      try {
        const response = await fetch(`/api/recommendations/direct?limit=${limit}`);
        if (!response.ok) {
          console.error('API response not OK:', response.status);
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        const data = await response.json();
        console.log('Recommendations fetched successfully:', data);
        return data.slice(0, limit); // Ensure we don't exceed the requested limit
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
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

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-3">You Might Also Enjoy</h3>
        <div className={layoutClasses[layout]}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className={`animate-pulse ${itemClasses[layout]}`}>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              {showExcerpt && <div className="h-3 bg-gray-100 rounded w-1/2"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Handle errors and empty states with better debugging
  if (error || !recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    console.log('Recommendations state:', { 
      error: error ? (error instanceof Error ? error.message : String(error)) : 'no error', 
      recommendations: recommendations
    });
    
    return (
      <div className="rounded-lg border p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-2">You Might Also Enjoy</h3>
        <p className="text-sm text-gray-500">
          {error 
            ? `Unable to load recommendations. ${error instanceof Error ? error.message : ''}`
            : 'Check back soon for more story recommendations.'}
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded">
            {error instanceof Error ? error.message : String(error)}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div 
      className={`rounded-lg border p-4 shadow-sm transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <h3 className="text-lg font-medium mb-3">You Might Also Enjoy</h3>
      <div className={layoutClasses[layout]}>
        {recommendations.map((rec: Recommendation) => (
          <div key={rec.id} className={`group ${itemClasses[layout]}`}>
            <Link href={`/reader/${rec.slug}`}>
              <div className="block cursor-pointer">
                <h4 className="font-medium text-md group-hover:underline">
                  {rec.title}
                </h4>
                {showAuthor && (
                  <div className="text-sm text-muted-foreground">
                    by Anonymous
                  </div>
                )}
                {showExcerpt && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {rec.excerpt || 'Read this horror story now...'}
                  </p>
                )}
                {onBookmark && (
                  <button 
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onBookmark(rec.id);
                    }}
                  >
                    Bookmark
                  </button>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}