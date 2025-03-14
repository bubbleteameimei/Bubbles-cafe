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

  // Allow non-authenticated users to see the bookmark page
  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bookmarks</h1>
          <Link to="/">
            <Button variant="outline" size="sm">Browse Stories</Button>
          </Link>
        </div>
        
        <div className="mb-6">
          <p className="text-muted-foreground">
            Save your favorite stories to read later. Sign in to unlock personalized bookmarks with tags and notes.
          </p>
        </div>
        
        <BookmarkList className="mt-8" showFilter={false} />
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
          Manage your saved stories. You can simply bookmark stories or add tags and notes to organize them.
        </p>
      </div>
      
      <BookmarkList className="mt-8" showFilter={true} />
    </div>
  );
}