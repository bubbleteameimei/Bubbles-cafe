import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { applyCSRFToken } from '@/lib/csrf-token';
import { useAuth } from '@/hooks/use-auth';
import { Bookmark, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface BookmarkButtonProps {
  postId: number;
  className?: string;
  variant?: 'default' | 'reader';
  showText?: boolean;
}

type BookmarkData = {
  id: number;
  userId: number;
  postId: number;
  notes: string | null;
  tags: string[] | null;
  lastPosition: string;
  createdAt: string;
};

export function BookmarkButton({ postId, className, variant = 'default', showText = true }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Determine which API endpoint to use based on variant
  const apiBasePath = variant === 'reader' ? '/api/reader/bookmarks' : '/api/bookmarks';
  
  // Query to check if post is already bookmarked
  const { data: bookmark, isLoading, error: bookmarkError } = useQuery({
    queryKey: [apiBasePath, postId],
    queryFn: async () => {
      // If not in reader mode and not logged in, don't fetch
      if (variant !== 'reader' && !user) return null;
      
      try {
        return await apiRequest<BookmarkData>(`${apiBasePath}/${postId}`);
      } catch (error) {
        // If 404, it means not bookmarked which is normal
        if ((error as any).status === 404) {
          return null;
        }
        // Log any other errors but don't throw to prevent breaking the UI
        console.error('Error checking bookmark status:', error);
        return null;
      }
    },
    enabled: variant === 'reader' || !!user, // Enable for reader variant regardless of login status
    // Add retry options to handle temporary connection issues
    retry: 2,
    retryDelay: 1000,
    // Don't refetch on window focus to minimize error repetition
    refetchOnWindowFocus: false,
  });

  // Create bookmark mutation
  const createMutation = useMutation({
    mutationFn: async (data: { notes: string; tags: string[] }) => {
      // Validate postId before sending request
      if (!postId || typeof postId !== 'number' || postId <= 0) {
        throw new Error('Invalid post ID');
      }
      
      return apiRequest(apiBasePath, {
        method: 'POST',
        body: JSON.stringify({
          postId,
          notes: data.notes,
          tags: data.tags,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBasePath] });
      queryClient.invalidateQueries({ queryKey: [apiBasePath, postId] });
      toast({
        title: 'Bookmark added',
        description: 'This story has been added to your bookmarks.',
      });

      // Toast notification only - no navigation to avoid errors
      // We'll put a link to bookmarks in the sidebar instead
      setOpen(false);
      setNotes('');
      setTagsInput('');
    },
    onError: (error) => {
      console.error('Bookmark creation error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add bookmark. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Delete bookmark mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Validate postId before sending request
      if (!postId || typeof postId !== 'number' || postId <= 0) {
        throw new Error('Invalid post ID for deletion');
      }
      
      return apiRequest(`${apiBasePath}/${postId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBasePath] });
      queryClient.invalidateQueries({ queryKey: [apiBasePath, postId] });
      toast({
        title: 'Bookmark removed',
        description: 'This story has been removed from your bookmarks.',
      });
    },
    onError: (error) => {
      console.error('Bookmark deletion error:', error);
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

  // Update bookmark position (called when scrolling or changing pages)
  const updatePositionMutation = useMutation({
    mutationFn: async (position: string) => {
      return apiRequest(`${apiBasePath}/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          lastPosition: position,
        }),
      });
    },
    onSuccess: () => {
      // Silent update - no toast needed
      queryClient.invalidateQueries({ queryKey: [apiBasePath, postId] });
    },
  });

  const handleAddBookmark = () => {
    const tags = tagsInput.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    createMutation.mutate({ notes, tags });
  };

  const handleRemoveBookmark = () => {
    deleteMutation.mutate();
  };

  const isBookmarked = !!bookmark;

  // Reader-style bookmark button
  if (variant === 'reader') {
    // For anonymous users in reader mode - show bookmark button that works with session-based bookmarks
    if (!user) {
      // Use anonymous bookmark API - this will be a functional button rather than auth prompt
      return isBookmarked ? (
        <button
          onClick={handleRemoveBookmark}
          className={`h-12 w-12 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-105 ${className}`}
          aria-label="Remove bookmark"
          disabled={isLoading || deleteMutation.isPending}
        >
          <svg className="h-7 w-7 fill-current text-amber-400" viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => createMutation.mutate({ notes: '', tags: [] })}
          className={`h-12 w-12 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-105 ${className}`}
          aria-label="Bookmark post"
          disabled={isLoading || createMutation.isPending}
        >
          <svg className="h-7 w-7 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        </button>
      );
    }

    if (isBookmarked) {
      return (
        <button
          onClick={handleRemoveBookmark}
          className={`h-12 w-12 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-105 ${className}`}
          aria-label="Remove bookmark"
          disabled={isLoading || deleteMutation.isPending}
        >
          <svg className="h-7 w-7 fill-current text-amber-400" viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        </button>
      );
    }
    
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className={`h-12 w-12 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-105 ${className}`}
            aria-label="Bookmark post"
            disabled={isLoading || createMutation.isPending}
          >
            <svg className="h-7 w-7 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
        </DialogTrigger>
        <DialogContent 
          className="sm:max-w-[425px]"
          aria-labelledby="bookmark-dialog-title-reader"
          aria-describedby="bookmark-dialog-desc-reader"
        >
          <DialogHeader>
            <DialogTitle id="bookmark-dialog-title-reader">Bookmark Story</DialogTitle>
            <DialogDescription id="bookmark-dialog-desc-reader">
              Add this story to your bookmarks. You can add notes and tags or simply bookmark it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-3 mb-2">
              <Button 
                variant="default" 
                className="w-full py-6 text-lg"
                onClick={() => createMutation.mutate({ notes: '', tags: [] })}
                disabled={createMutation.isPending}
              >
                <Bookmark className="h-5 w-5 mr-3" />
                Simply Bookmark This Story
              </Button>
              <div className="flex items-center justify-center mt-1">
                <Bookmark className="h-4 w-4 mr-1 fill-amber-400" />
                <p className="text-sm text-center text-muted-foreground">
                  Quick save without tags or notes
                </p>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <p className="text-sm font-medium text-center">Or add details to organize your bookmarks</p>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags-reader" className="text-right">
                Tags
              </Label>
              <Input
                id="tags-reader"
                placeholder="horror, favorites (comma separated)"
                className="col-span-3"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes-reader" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes-reader"
                placeholder="Add your personal notes about this story"
                className="col-span-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" onClick={handleAddBookmark} disabled={createMutation.isPending}>
              Add Bookmark with Details
            </Button>
            <Link to="/bookmarks">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Close the dialog
                  setOpen(false);
                }}
              >
                View All Bookmarks
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Default button style
  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={className}
        onClick={() => {
          toast({
            title: 'Sign in to bookmark',
            description: 'Create a free account to save stories for later.',
          });
          // Navigate to auth page after a short delay
          setTimeout(() => window.location.href = '/auth', 1500);
        }}
      >
        <Bookmark className="h-4 w-4 mr-2" />
        {showText && "Bookmark"}
      </Button>
    );
  }

  return (
    <>
      {isBookmarked ? (
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          onClick={handleRemoveBookmark}
          disabled={deleteMutation.isPending}
        >
          <Bookmark className="h-4 w-4 mr-2 fill-current" />
          {showText && "Bookmarked"}
        </Button>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={className}
              disabled={createMutation.isPending || isLoading}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              {showText && "Bookmark"}
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="sm:max-w-[425px]"
            aria-labelledby="bookmark-dialog-title-default"
            aria-describedby="bookmark-dialog-desc-default"
          >
            <DialogHeader>
              <DialogTitle id="bookmark-dialog-title-default">Bookmark Story</DialogTitle>
              <DialogDescription id="bookmark-dialog-desc-default">
                Add this story to your bookmarks. You can add notes and tags or simply bookmark it.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-3 mb-2">
                <Button 
                  variant="default" 
                  className="w-full py-6 text-lg"
                  onClick={() => createMutation.mutate({ notes: '', tags: [] })}
                  disabled={createMutation.isPending}
                >
                  <Bookmark className="h-5 w-5 mr-3" />
                  Simply Bookmark This Story
                </Button>
                <div className="flex items-center justify-center mt-1">
                  <Bookmark className="h-4 w-4 mr-1 fill-amber-400" />
                  <p className="text-sm text-center text-muted-foreground">
                    Quick save without tags or notes
                  </p>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <p className="text-sm font-medium text-center">Or add details to organize your bookmarks</p>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="horror, favorites (comma separated)"
                  className="col-span-3"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add your personal notes about this story"
                  className="col-span-3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" onClick={handleAddBookmark} disabled={createMutation.isPending}>
                Add Bookmark with Details
              </Button>
              <Link to="/bookmarks">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    // Close the dialog
                    setOpen(false);
                  }}
                >
                  View All Bookmarks
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Separate component to update bookmark position from the reader
export function useBookmarkPosition(postId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Determine which API endpoint to use based on authentication status
  // For anonymous users: /api/reader/bookmarks
  // For authenticated users: /api/bookmarks
  const apiBasePath = user ? '/api/bookmarks' : '/api/reader/bookmarks';

  const updatePositionMutation = useMutation({
    mutationFn: async (position: string) => {
      // Validate postId
      if (!postId || typeof postId !== 'number' || postId <= 0) {
        console.warn('Invalid bookmark position update attempt', { postId });
        return null;
      }
      
      // Validate position
      if (!position || typeof position !== 'string') {
        console.warn('Invalid position value for bookmark update', { position });
        return null;
      }
      
      try {
        return await apiRequest(`${apiBasePath}/${postId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            lastPosition: position,
          }),
        });
      } catch (error) {
        // Log the error but don't throw it to prevent UI issues
        console.error('Error updating bookmark position:', error);
        // Return null instead of throwing to avoid breaking the reader experience
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBasePath, postId] });
    },
    onError: (error) => {
      // Silent error handling - just log to console without user-facing error
      console.error('Error updating bookmark position:', error);
    },
    // Add retry options
    retry: 1,
    retryDelay: 1000
  });

  const updatePosition = (position: string) => {
    if (postId > 0 && position) {
      try {
        updatePositionMutation.mutate(position);
      } catch (error) {
        console.error('Failed to update bookmark position:', error);
      }
    }
  };

  return { updatePosition };
}