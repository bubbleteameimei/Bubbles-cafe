import React from 'react';
import { BookmarkList } from '@/components/ui/BookmarkList';
import { useAuth } from '@/hooks/use-auth';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function BookmarksPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Bookmarks</h1>
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Bookmarks</h1>
        <div className="bg-muted/30 rounded-lg p-10 text-center">
          <Bookmark className="mx-auto h-16 w-16 opacity-20 mb-6" />
          <h2 className="text-2xl font-semibold mb-3">Sign in to view your bookmarks</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create an account or sign in to access your bookmarked stories and track your reading progress.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Browse Stories</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Bookmarks</h1>
        <Link to="/">
          <Button variant="outline" size="sm">Browse Stories</Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <p className="text-muted-foreground">
          Manage your saved stories. Use tags to organize them and add notes to remember your thoughts.
        </p>
      </div>
      
      <BookmarkList className="mt-8" showFilter={true} />
    </div>
  );
}