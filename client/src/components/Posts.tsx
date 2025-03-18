import { useQuery } from "@tanstack/react-query";
import { fetchWordPressPosts, WordPressPost, checkWordPressApiStatus } from "@/lib/wordpress-api";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

function Posts() {
  const [page, setPage] = useState(1);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const { toast } = useToast();
  
  // Check WordPress API status
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const isAvailable = await checkWordPressApiStatus();
        setApiStatus(isAvailable ? 'available' : 'unavailable');
        
        if (!isAvailable) {
          toast({
            title: "WordPress content notice",
            description: "Using local content because WordPress API is currently unavailable",
            variant: "default"
          });
        }
      } catch (error) {
        setApiStatus('unavailable');
        console.error("Error checking WordPress API status:", error);
      }
    };
    
    checkApiStatus();
  }, [toast]);
  
  // Fetch posts with enhanced error handling
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['/api/wordpress/posts', page],
    queryFn: () => fetchWordPressPosts({ 
      page,
      perPage: 9, // Adjusted for better grid display (3x3)
      skipCache: false
    }),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000)
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[300px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading stories...</p>
      </div>
    );
  }

  // Error state with retry option
  if (isError && error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading stories</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error instanceof Error ? error.message : "An unknown error occurred"}</p>
          <Button 
            variant="outline" 
            size="sm"
            className="w-fit mt-2"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // API Unavailable Notice
  if (apiStatus === 'unavailable' && data?.fromFallback) {
    return (
      <div className="space-y-4">
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 relative">
          <div className="flex items-center">
            <WifiOff className="h-5 w-5 mr-2" />
            <h5 className="font-medium">WordPress API Unavailable</h5>
          </div>
          <div className="mt-2 text-sm">
            Displaying locally stored content while WordPress connection is being restored.
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post: any) => (
            <Card key={post.id} className="p-4">
              <h2 className="text-xl font-bold mb-2 line-clamp-2">
                <Link href={`/reader/${post.slug}`}>
                  {typeof post.title === 'object' 
                    ? <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    : post.title}
                </Link>
              </h2>
              <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {post.excerpt?.rendered 
                  ? <span dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                  : "No excerpt available"}
              </div>
              <Link href={`/reader/${post.slug}`}>
                <Button variant="outline">Read more</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Success state
  const { posts, totalPages } = data || { posts: [], totalPages: 0 };
  const hasMore = page < totalPages;

  // Add API status banner for "available" status
  return (
    <div className="space-y-4">
      {/* Show API status label only when it was previously unavailable and now available */}
      {apiStatus === 'available' && data?.fromFallback === undefined && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 relative">
          <div className="flex items-center">
            <span className="mr-2 h-2 w-2 rounded-full bg-green-600"></span>
            <h5 className="font-medium">WordPress API Connected</h5>
          </div>
          <div className="mt-2 text-sm">
            Displaying the latest stories from WordPress.
          </div>
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: WordPressPost) => (
          <Card key={post.id} className="p-4">
            <h2 className="text-xl font-bold mb-2 line-clamp-2">
              <Link href={`/reader/${post.slug}`}>
                <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </Link>
            </h2>
            {post.excerpt?.rendered ? (
              <div 
                className="text-sm text-muted-foreground mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              />
            ) : (
              <div className="text-sm text-muted-foreground mb-4">
                No excerpt available
              </div>
            )}
            <div className="mt-auto pt-2">
              <Link href={`/reader/${post.slug}`}>
                <Button variant="outline">Read story</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <Button 
            onClick={() => setPage(p => p + 1)}
            className="gap-2"
          >
            Load more stories
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default Posts;