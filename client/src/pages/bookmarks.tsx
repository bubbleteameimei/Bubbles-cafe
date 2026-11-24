import React from 'react';
import { BookmarkList } from '@/components/ui/BookmarkList';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useLocation } from 'wouter';
// import { useLoading } from '@/contexts/loading-context';

export default function BookmarksPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <LoadingScreen label="Loading your bookmarks…" />;
  }

  // Allow non-authenticated users to see the bookmark page
  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bookmarks</h1>
          <Button variant="outline" size="sm" onClick={() => setLocation('/index')}>Browse Index</Button>
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
        <Button variant="outline" size="sm" onClick={() => setLocation('/index')}>Browse Index</Button>
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