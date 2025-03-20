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

  // API Unavailable Notice with Enhanced UI
  if (apiStatus === 'unavailable' && data?.fromFallback) {
    return (
      <div className="space-y-6">
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 relative shadow-sm dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-200">
          <div className="flex items-center">
            <WifiOff className="h-5 w-5 mr-2" />
            <h5 className="font-medium text-lg">WordPress API Unavailable</h5>
          </div>
          <div className="mt-2 text-sm">
            <p>Displaying locally stored content while WordPress connection is being restored.</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs opacity-80">Automatic reconnection in progress</span>
            </div>
          </div>
        </div>
        
        {/* Simplified Header with Horror Theme Elements */}
        <div className="mb-4 py-3 border-b border-muted">
          <h1 className="text-2xl font-creepster text-center mb-2">Tales from the Archive</h1>
          <p className="text-sm text-center text-muted-foreground italic">
            Locally cached stories available for your reading pleasure
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post: any) => (
            <Card key={post.id} className="p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/30 relative overflow-hidden group">
              {/* Decorative horror element */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute rotate-45 bg-muted/20 text-primary/70 font-medium py-1 text-xs px-6 text-center top-3 right-[-20px]">
                  Archive
                </div>
              </div>

              <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary/90 transition-colors">
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
              <div className="mt-auto pt-3 border-t border-muted/40">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    From our archives
                  </span>
                  <Link href={`/reader/${post.slug}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      Read story
                      <span className="h-1 w-1 rounded-full bg-primary animate-pulse"></span>
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Reconnection button */}
        <div className="flex justify-center mt-8 mb-4">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              toast({
                title: "Reconnecting...",
                description: "Attempting to reconnect to WordPress API",
              });
              checkWordPressApiStatus().then(isAvailable => {
                if (isAvailable) {
                  refetch();
                  toast({
                    title: "Connection restored!",
                    description: "Successfully reconnected to WordPress API",
                    variant: "default",
                  });
                } else {
                  toast({
                    title: "Connection failed",
                    description: "Still unable to connect to WordPress API. Will try again automatically.",
                    variant: "destructive",
                  });
                }
              });
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Attempt Reconnection
          </Button>
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