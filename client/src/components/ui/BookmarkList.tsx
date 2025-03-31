import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { Bookmark, Clock, Tag, X, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import ApiLoader from '@/components/api-loader';

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  createdAt: string;
};

type BookmarkWithPost = {
  id: number;
  userId: number;
  postId: number;
  notes: string | null;
  tags: string[] | null;
  lastPosition: string;
  createdAt: string;
  post: Post;
};

interface BookmarkListProps {
  className?: string;
  limit?: number;
  showFilter?: boolean;
}

export function BookmarkList({ className, limit, showFilter = true }: BookmarkListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterTag, setFilterTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Query to fetch all bookmarks for authenticated users
  const { data: authBookmarks = [], isLoading: isLoadingAuth, error: authError, status: authStatus, fetchStatus: authFetchStatus } = useQuery({
    queryKey: ['/api/bookmarks', { tag: filterTag }],
    queryFn: async () => {
      if (!user) return [];
      const url = filterTag
        ? `/api/bookmarks?tag=${encodeURIComponent(filterTag)}`
        : '/api/bookmarks';
      console.log(`[BookmarkList] Fetching authenticated bookmarks with URL: ${url}`);
      try {
        const result = await apiRequest<BookmarkWithPost[]>(url);
        console.log(`[BookmarkList] Successfully fetched ${result.length} authenticated bookmarks`);
        return result;
      } catch (err) {
        console.error('[BookmarkList] Error fetching authenticated bookmarks:', err);
        throw err;
      }
    },
    enabled: !!user,
  });
  
  // Query to fetch anonymous bookmarks for non-authenticated users
  const { 
    data: anonymousBookmarks = [], 
    isLoading: isLoadingAnonymous,
    error: anonymousError,
    status: anonymousStatus,
    fetchStatus: anonymousFetchStatus
  } = useQuery({
    queryKey: ['/api/reader/bookmarks', { tag: filterTag }],
    queryFn: async () => {
      if (user) return []; // Skip for authenticated users
      const url = filterTag
        ? `/api/reader/bookmarks?tag=${encodeURIComponent(filterTag)}`
        : '/api/reader/bookmarks';
      console.log(`[BookmarkList] Fetching anonymous bookmarks with URL: ${url}`);
      try {
        // Force refetch by adding timestamp to avoid client-side caching issues
        const result = await apiRequest<BookmarkWithPost[]>(`${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`);
        console.log(`[BookmarkList] Successfully fetched ${result.length} anonymous bookmarks`, result);
        return result;
      } catch (err) {
        console.error('[BookmarkList] Error fetching anonymous bookmarks:', err);
        return []; // Return empty array on error to prevent breaking UI
      }
    },
    enabled: !user, // Only enabled for non-authenticated users
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 10000, // Refresh data every 10 seconds
  });
  
  // Query to fetch recommended stories for non-authenticated users with no bookmarks
  const { 
    data: recommendedStories = [], 
    isLoading: isLoadingRecommended,
    status: recommendedStatus,
    fetchStatus: recommendedFetchStatus
  } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      console.log('[BookmarkList] Fetching recommended stories');
      try {
        const result = await apiRequest<Post[]>('/api/posts?limit=5');
        console.log(`[BookmarkList] Successfully fetched ${result.length} recommended stories`);
        return result;
      } catch (err) {
        console.error('[BookmarkList] Error fetching recommended stories:', err);
        throw err;
      }
    },
    // Only enable if user is not authenticated and there are no anonymous bookmarks
    enabled: !user && anonymousStatus === 'success' && anonymousBookmarks.length === 0,
  });
  
  // Enhanced debug logging for loading states with more detailed information
  useEffect(() => {
    console.log(`[BookmarkList] Auth loading state changed: 
      - isLoadingAuth: ${isLoadingAuth}
      - Status: ${authStatus}
      - Fetch status: ${authFetchStatus}
      - Time: ${new Date().toISOString()}`);
  }, [isLoadingAuth, authStatus, authFetchStatus]);
  
  useEffect(() => {
    console.log(`[BookmarkList] Anonymous loading state changed: 
      - isLoadingAnonymous: ${isLoadingAnonymous}
      - Status: ${anonymousStatus}
      - Fetch status: ${anonymousFetchStatus}
      - Time: ${new Date().toISOString()}`);
  }, [isLoadingAnonymous, anonymousStatus, anonymousFetchStatus]);
  
  useEffect(() => {
    console.log(`[BookmarkList] Recommended loading state changed: 
      - isLoadingRecommended: ${isLoadingRecommended}
      - Status: ${recommendedStatus}
      - Fetch status: ${recommendedFetchStatus}
      - Time: ${new Date().toISOString()}`);
  }, [isLoadingRecommended, recommendedStatus, recommendedFetchStatus]);

  // Delete authenticated bookmark mutation
  const deleteAuthMutation = useMutation({
    mutationFn: async (postId: number) => {
      // Validate input
      if (!postId || typeof postId !== 'number' || postId <= 0) {
        throw new Error('Invalid post ID for bookmark deletion');
      }
      
      return apiRequest(`/api/bookmarks/${postId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: 'Bookmark removed',
        description: 'The bookmark has been removed successfully.',
      });
    },
    onError: (error) => {
      console.error('Error removing authenticated bookmark:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to remove bookmark. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
  
  // Delete anonymous bookmark mutation
  const deleteAnonymousMutation = useMutation({
    mutationFn: async (postId: number) => {
      // Validate input
      if (!postId || typeof postId !== 'number' || postId <= 0) {
        throw new Error('Invalid post ID for anonymous bookmark deletion');
      }
      
      return apiRequest(`/api/reader/bookmarks/${postId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reader/bookmarks'] });
      toast({
        title: 'Bookmark removed',
        description: 'The bookmark has been removed successfully.',
      });
    },
    onError: (error) => {
      console.error('Error removing anonymous bookmark:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to remove bookmark. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
  
  // Use the appropriate mutation based on user authentication status
  const deleteMutation = user ? deleteAuthMutation : deleteAnonymousMutation;

  // Handle removing a bookmark
  const handleRemoveBookmark = (postId: number) => {
    try {
      if (!postId || typeof postId !== 'number' || postId <= 0) {
        toast({
          title: 'Error',
          description: 'Invalid bookmark ID. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      deleteMutation.mutate(postId);
    } catch (error) {
      console.error('Error in handleRemoveBookmark:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Combine authenticated and anonymous bookmarks
  const bookmarks = user ? authBookmarks : anonymousBookmarks;
  
  // Filter bookmarks by search query
  const filteredBookmarks = bookmarks.filter((bookmark: BookmarkWithPost) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      bookmark.post.title.toLowerCase().includes(searchLower) ||
      (bookmark.notes && bookmark.notes.toLowerCase().includes(searchLower)) ||
      (bookmark.tags && bookmark.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
    );
  });

  // Extract all unique tags from bookmarks
  const allTags = bookmarks.reduce<string[]>((tags: string[], bookmark: BookmarkWithPost) => {
    if (bookmark.tags && bookmark.tags.length > 0) {
      bookmark.tags.forEach((tag: string) => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    return tags;
  }, []);

  // Display a limited number of bookmarks if specified
  const displayedBookmarks = limit ? filteredBookmarks.slice(0, limit) : filteredBookmarks;

  // Special handling for non-authenticated users
  if (!user) {
    // Show anonymous bookmarks if available, otherwise show recommended stories
    const hasAnonymousBookmarks = anonymousBookmarks.length > 0;
    
    return (
      <div className={className}>
        <div className="text-center p-6 bg-muted/20 rounded-lg border border-border/50 mb-8">
          <Bookmark className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Discover your reading list</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a free account to bookmark stories and track your reading progress.
          </p>
          <Link to="/auth">
            <Button variant="default" size="sm">Sign in to get started</Button>
          </Link>
        </div>
        
        {/* Show loading state for either anonymous bookmarks or recommended stories */}
        {isLoadingAnonymous || isLoadingRecommended ? (
          <div className="relative min-h-[200px]">
            <ApiLoader 
              isLoading={true} 
              message={hasAnonymousBookmarks ? "Loading your bookmarks..." : "Loading recommended stories..."}
              minimumLoadTime={800}
              debug={true}
              overlayZIndex={100}
            >
              <div className="invisible">
                <div className="h-[200px] w-full flex items-center justify-center">
                  <span className="sr-only">Loading content...</span>
                </div>
              </div>
            </ApiLoader>
          </div>
        ) : hasAnonymousBookmarks ? (
          // Show anonymous bookmarks if available
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Your Bookmarks</h3>
              <p className="text-xs text-muted-foreground">
                Bookmarks are saved locally until you create an account
              </p>
            </div>
            <div className="space-y-4">
              {bookmarks.map((bookmark: BookmarkWithPost) => (
                <Card key={bookmark.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          <Link to={`/reader/${bookmark.post.slug}`} className="hover:underline">
                            {bookmark.post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center text-xs mt-1 text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(bookmark.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBookmark(bookmark.postId)}
                        disabled={deleteMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {bookmark.post.excerpt}
                    </p>
                    
                    {bookmark.notes && (
                      <ScrollArea className="h-[80px] mt-2 rounded-md border p-3 bg-muted/20">
                        <div className="text-sm text-muted-foreground min-h-[50px] w-full">{bookmark.notes}</div>
                      </ScrollArea>
                    )}
                    
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div className="flex items-center mt-3 flex-wrap gap-1">
                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                        {bookmark.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                
                  <CardFooter>
                    <Link to={`/reader/${bookmark.post.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Continue Reading
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : recommendedStories.length > 0 ? (
          // Show recommended stories if no anonymous bookmarks
          <>
            <h3 className="text-xl font-semibold mb-4">Recommended Stories</h3>
            <div className="space-y-4">
              {recommendedStories.map((story) => (
                <Card key={story.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      <Link to={`/reader/${story.slug}`} className="hover:underline">
                        {story.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center text-xs mt-1 text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(story.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {story.excerpt}
                    </p>
                  </CardContent>
                  
                  <CardFooter>
                    <Link to={`/reader/${story.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Read Story
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground">No recommended stories available.</p>
          </div>
        )}
      </div>
    );
  }

  // Enhanced loading state handling with improved debugging and user feedback
  const isLoading = user ? isLoadingAuth : isLoadingAnonymous;
  const error = user ? authError : anonymousError;
  
  if (isLoading) {
    return (
      <div className="relative min-h-[200px]">
        <ApiLoader 
          isLoading={true}
          message="Loading your bookmarks..."
          minimumLoadTime={800}  
          debug={true}
          overlayZIndex={100}
        >
          <div className="invisible">
            {/* This creates proper space for the content while invisible */}
            <div className="h-[200px] w-full flex items-center justify-center">
              <span className="sr-only">Loading bookmarks...</span>
            </div>
          </div>
        </ApiLoader>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">
        Failed to load bookmarks. Please try again.
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center p-6">
        <Bookmark className="mx-auto h-12 w-12 opacity-20 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
        <p className="text-sm text-muted-foreground">
          Start bookmarking stories to save them for later.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {showFilter && (
        <div className="mb-6 space-y-4">
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          
          {allTags.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Filter by tag:</div>
              <div className="flex flex-wrap gap-2">
                {filterTag && (
                  <Badge
                    key="clear"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setFilterTag('')}
                  >
                    Clear filter <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {allTags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant={filterTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Separator />
        </div>
      )}

      {displayedBookmarks.length === 0 ? (
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">
            No bookmarks match your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedBookmarks.map((bookmark: BookmarkWithPost) => (
            <Card key={bookmark.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      <Link to={`/reader/${bookmark.post.slug}`} className="hover:underline">
                        {bookmark.post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center text-xs mt-1 text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(bookmark.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBookmark(bookmark.postId)}
                    disabled={deleteMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                {bookmark.notes && (
                  <ScrollArea className="h-[80px] mt-2 rounded-md border p-3 bg-muted/20">
                    <div className="text-sm text-muted-foreground min-h-[50px] w-full">{bookmark.notes}</div>
                  </ScrollArea>
                )}
                
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="flex items-center mt-3 flex-wrap gap-1">
                    <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                    {bookmark.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Link to={`/reader/${bookmark.post.slug}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Continue Reading
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          
          {limit && filteredBookmarks.length > limit && (
            <div className="text-center pt-2">
              <Link to="/bookmarks">
                <Button variant="link">View all bookmarks</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}