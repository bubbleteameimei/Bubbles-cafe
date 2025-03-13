import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Bookmark, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  // Query to check if post is already bookmarked
  const { data: bookmark, isLoading } = useQuery({
    queryKey: ['/api/bookmarks', postId],
    queryFn: async () => {
      if (!user) return null;
      try {
        return await apiRequest<BookmarkData>(`/api/bookmarks/${postId}`);
      } catch (error) {
        // If 404, it means not bookmarked which is normal
        if ((error as any).status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user,
  });

  // Create bookmark mutation
  const createMutation = useMutation({
    mutationFn: async (data: { notes: string; tags: string[] }) => {
      return apiRequest('/api/bookmarks', {
        method: 'POST',
        body: JSON.stringify({
          postId,
          notes: data.notes,
          tags: data.tags,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks', postId] });
      toast({
        title: 'Bookmark added',
        description: 'This story has been added to your bookmarks.',
      });
      setOpen(false);
      setNotes('');
      setTagsInput('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add bookmark. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete bookmark mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/bookmarks/${postId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks', postId] });
      toast({
        title: 'Bookmark removed',
        description: 'This story has been removed from your bookmarks.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update bookmark position (called when scrolling or changing pages)
  const updatePositionMutation = useMutation({
    mutationFn: async (position: string) => {
      return apiRequest(`/api/bookmarks/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          lastPosition: position,
        }),
      });
    },
    onSuccess: () => {
      // Silent update - no toast needed
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks', postId] });
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
    if (!user) {
      return (
        <button
          onClick={() => {
            toast({
              title: 'Authentication required',
              description: 'Please sign in to bookmark stories.',
            });
          }}
          className={`h-12 w-12 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-105 ${className}`}
          aria-label="Bookmark post"
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bookmark Story</DialogTitle>
            <DialogDescription>
              Add this story to your bookmarks. You can add notes and tags to organize your bookmarks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          <DialogFooter>
            <Button type="submit" onClick={handleAddBookmark} disabled={createMutation.isPending}>
              Add Bookmark
            </Button>
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
            title: 'Authentication required',
            description: 'Please sign in to bookmark stories.',
          });
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Bookmark Story</DialogTitle>
              <DialogDescription>
                Add this story to your bookmarks. You can add notes and tags to organize your bookmarks.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
            <DialogFooter>
              <Button type="submit" onClick={handleAddBookmark} disabled={createMutation.isPending}>
                Add Bookmark
              </Button>
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

  const updatePositionMutation = useMutation({
    mutationFn: async (position: string) => {
      if (!user || postId <= 0) return null;
      return apiRequest(`/api/bookmarks/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          lastPosition: position,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks', postId] });
    },
  });

  const updatePosition = (position: string) => {
    if (user && postId > 0) {
      updatePositionMutation.mutate(position);
    }
  };

  return { updatePosition };
}