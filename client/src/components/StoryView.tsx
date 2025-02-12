import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { StoryRating } from "@/components/ui/story-rating";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

interface StoryViewProps {
  slug: string;
}

export function StoryView({ slug }: StoryViewProps) {
  const { user } = useAuth();
  const { data: story, isLoading, error } = useQuery<Post>({
    queryKey: [`/api/posts/${slug}`],
  });

  if (isLoading) {
    return <StoryViewSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-500">Error Loading Story</h2>
        <p className="text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">Story Not Found</h2>
        <p className="text-gray-600 mt-2">The requested story could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">{story.title}</h1>
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {new Date(story.createdAt).toLocaleDateString()}
          </div>
          {story.readingTimeMinutes && (
            <div className="text-sm text-muted-foreground">
              {story.readingTimeMinutes} min read
            </div>
          )}
        </div>
        <div className="prose dark:prose-invert max-w-none">
          {story.content}
        </div>
      </Card>

      <StoryRating postId={story.id} userId={user?.id} />
    </div>
  );
}

function StoryViewSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <Card className="p-6">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Card>

      <Skeleton className="h-48 w-full" />
    </div>
  );
}
