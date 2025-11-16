import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
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

type AuthBookmarkStatus = {
  success: boolean;
  bookmarked: boolean;
  bookmark: BookmarkData | null;
};

// Anonymous bookmark helpers (localStorage-based)
const LS_KEY = 'anon_bookmarks';
type AnonBookmark = { notes?: string; tags?: string[]; lastPosition?: string; createdAt: string };

function readAnonBookmarks(): Record<number, AnonBookmark> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') return obj as Record<number, AnonBookmark>;
    return {};
  } catch {
    return {};
  }
}

function writeAnonBookmarks(obj: Record<number, AnonBookmark>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch {}
}

function isAnonBookmarked(postId: number): boolean {
  const bks = readAnonBookmarks();
  return !!bks[Number(postId)];
}

function addAnonBookmark(postId: number, data: { notes?: string; tags?: string[] }) {
  const id = Number(postId);
  if (!Number.isFinite(id) || id <= 0) return;
  const bks = readAnonBookmarks();
  if (!bks[id]) {
    bks[id] = { createdAt: new Date().toISOString() };
  }
  if (data.notes !== undefined) bks[id].notes = data.notes;
  if (Array.isArray(data.tags)) bks[id].tags = data.tags;
  writeAnonBookmarks(bks);
}

function removeAnonBookmark(postId: number) {
  const id = Number(postId);
  if (!Number.isFinite(id) || id <= 0) return;
  const bks = readAnonBookmarks();
  if (bks[id]) {
    delete bks[id];
    writeAnonBookmarks(bks);
  }
}

export function BookmarkButton({ postId, className, variant = 'default', showText = true }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const apiBasePath = '/api/bookmarks';
  
  // Query to check if post is already bookmarked (auth users only)
  const { data: bookmarkState, isLoading } = useQuery({
    queryKey: [apiBasePath, postId],
    queryFn: async () => {
      if (!user) return null;
      try {
        return await apiRequest<AuthBookmarkStatus>(`${apiBasePath}/${postId}`);
      } catch (error) {
        if ((error as any).status === 404) {
          return null;
        }
        console.error('Error checking bookmark status:', error);
        return null;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const bookmarked = user
    ? !!(bookmarkState as AuthBookmarkStatus | null)?.bookmarked
    : isAnonBookmarked(postId);

  // Create bookmark mutation (auth path); anonymous uses localStorage
  const createMutation = useMutation({
    mutationFn: async (data: { notes: string; tags: string[] }) => {
      if (!postId || typeof postId !== 'number' || postId <= 0) {
        throw new Error('Invalid post ID');
      }

      if (!user) {
        // Anonymous: write to localStorage instead of server
        addAnonBookmark(postId, { notes: data.notes, tags: data.tags });
        return { success: true, local: true };
      }

      const createEndpoint = `${apiBasePath}/${postId}`;
      return apiRequest(createEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          postId,
          notes: data.notes,
          tags: data.tags,
        }),
      });
    },
    onSuccess: (data: any) => {
      if (user) {
        const created = (data?.bookmark ?? null) as BookmarkData | null;
        const status: AuthBookmarkStatus = { success: true, bookmarked: true, bookmark: created };
        queryClient.setQueryData([apiBasePath, postId], status);
        queryClient.invalidateQueries({ queryKey: [apiBasePath] });
      } else {
        // Anonymous: no server cache; still set a local flag via query client for consistency
        queryClient.setQueryData([apiBasePath, postId], { success: true, bookmarked: true } as any);
      }

      toast({
        title: 'Bookmark added',
        description: user ? 'This story has been added to your bookmarks.' : 'Saved locally on this device.',
      });

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

  // Delete bookmark mutation (auth path); anonymous uses localStorage
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!postId || typeof postId !== 'number' || postId <= 0) {
        throw new Error('Invalid post ID for deletion');
      }
      if (!user) {
        removeAnonBookmark(postId);
        return { success: true, local: true };
      }
      return apiRequest(`${apiBasePath}/${postId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      if (user) {
        const status: AuthBookmarkStatus = { success: true, bookmarked: false, bookmark: null };
        queryClient.setQueryData([apiBasePath, postId], status);
        queryClient.invalidateQueries({ queryKey: [apiBasePath] });
      } else {
        queryClient.setQueryData([apiBasePath, postId], { success: true, bookmarked: false } as any);
      }

      toast({
        title: 'Bookmark removed',
        description: user ? 'This story has been removed from your bookmarks.' : 'Removed from local bookmarks.',
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

  // Update bookmark position (auth path only)
  const _updatePositionMutation = useMutation({
    mutationFn: async (position: string) => {
      return apiRequest(`${apiBasePath}/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          lastPosition: position,
        }),
      });
    },
    onSuccess: () => {
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

  // Reader-style bookmark button
  if (variant === 'reader') {
    if (bookmarked) {
      return (
        <button
          onClick={handleRemoveBookmark}
          className={`h-12 w-12 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${className}`}
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
            className={`h-12 w-12 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${className}`}
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
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setOpen(false);
                  setLocation('/bookmarks');
                }}
                data-testid="bookmark-view-all"
              >
                View All Bookmarks
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Default button style (shows dialog for both auth and anonymous)
  return (
    <>
      {bookmarked ? (
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          onClick={handleRemoveBookmark}
          disabled={deleteMutation.isPending}
          data-testid={`bookmark-remove-default-${postId}`}
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
              data-testid={`bookmark-open-modal-default-${postId}`}
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
                  data-testid={`bookmark-quick-add-default-${postId}`}
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
              <Button type="submit" onClick={handleAddBookmark} disabled={createMutation.isPending} data-testid={`bookmark-add-details-default-${postId}`}>
                Add Bookmark with Details
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setOpen(false);
                  setLocation('/bookmarks');
                }}
              >
                View All Bookmarks
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
  
  const apiBasePath = '/api/bookmarks';

  const updatePositionMutation = useMutation({
    mutationFn: async (position: string) => {
      if (!user) return null;
      if (!postId || typeof postId !== 'number' || postId <= 0) {
        console.warn('Invalid bookmark position update attempt', { postId });
        return null;
      }
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
        console.error('Error updating bookmark position:', error);
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBasePath, postId] });
    },
    onError: (error) => {
      console.error('Error updating bookmark position:', error);
    },
    retry: 1,
    retryDelay: 1000
  });

  const updatePosition = (position: string) => {
    if (!user) return;
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