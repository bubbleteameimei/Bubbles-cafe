import React, { useState } from 'react';
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

  // Query to fetch all bookmarks
  const { data: bookmarks = [], isLoading, error } = useQuery({
    queryKey: ['/api/bookmarks', { tag: filterTag }],
    queryFn: async () => {
      if (!user) return [];
      const url = filterTag
        ? `/api/bookmarks?tag=${encodeURIComponent(filterTag)}`
        : '/api/bookmarks';
      return apiRequest<BookmarkWithPost[]>(url);
    },
    enabled: !!user,
  });

  // Delete bookmark mutation
  const deleteMutation = useMutation({
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
      console.error('Error removing bookmark:', error);
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

  // Filter bookmarks by search query
  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      bookmark.post.title.toLowerCase().includes(searchLower) ||
      (bookmark.notes && bookmark.notes.toLowerCase().includes(searchLower)) ||
      (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  });

  // Extract all unique tags from bookmarks
  const allTags = bookmarks.reduce<string[]>((tags, bookmark) => {
    if (bookmark.tags && bookmark.tags.length > 0) {
      bookmark.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    return tags;
  }, []);

  // Display a limited number of bookmarks if specified
  const displayedBookmarks = limit ? filteredBookmarks.slice(0, limit) : filteredBookmarks;

  if (!user) {
    return (
      <div className="text-center p-6">
        <Bookmark className="mx-auto h-12 w-12 opacity-20 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sign in to see your bookmarks</h3>
        <p className="text-sm text-muted-foreground">
          Save your favorite stories to read later.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center p-4">Loading your bookmarks...</div>;
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
                {allTags.map(tag => (
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
          {displayedBookmarks.map((bookmark) => (
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
                    {bookmark.tags.map(tag => (
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