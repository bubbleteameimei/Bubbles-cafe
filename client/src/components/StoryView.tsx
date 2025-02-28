import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { LikeDislike } from "@/components/ui/like-dislike";
import { getReadingTime } from "@/lib/content-analysis";
import axios from 'axios'; // Assuming axios is used for API calls

// Placeholder for WordPress API interaction
const wordpress = {
  getPost: async (slug: string) => {
    try {
      const response = await axios.get(`https://your-wordpress-site.com/wp-json/wp/v2/posts?slug=${slug}`); //Replace with your actual WordPress API endpoint
      return response.data[0]; // Assuming only one post per slug
    } catch (error) {
      console.error("Error fetching from WordPress API:", error);
      return null;
    }
  }
};

// Placeholder for converting WordPress post format
const convertWordPressPostToAppFormat = (wpPost: any): Post => {
  // Adapt this to map WordPress data to your Post schema
  return {
    id: wpPost.id,
    title: wpPost.title.rendered,
    content: wpPost.content.rendered,
    createdAt: wpPost.date,
    // ... other fields as needed
  };
};


interface StoryViewProps {
  slug: string;
}

export function StoryView({ slug }: StoryViewProps) {
  const { user } = useAuth();
  const { data: story, isLoading, error } = useQuery(
    ['post', slug],
    async () => {
      try {
        // First try WordPress API
        const wpPost = await wordpress.getPost(slug);
        if (wpPost) {
          return convertWordPressPostToAppFormat(wpPost);
        }

        // Fall back to our API if not found in WordPress
        const { data } = await axios.get(`/api/posts/${slug}`);
        return data;
      } catch (err) {
        // If WordPress fails, try our database
        const { data } = await axios.get(`/api/posts/${slug}`);
        return data;
      }
    },
    {
      staleTime: 1000 * 60 * 10, // 10 minutes
      enabled: !!slug,
    }
  );

  if (isLoading) {
    return <StoryViewSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-500">Error Loading Story</h2>
        <p className="text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">Story Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested story could not be found.</p>
      </div>
    );
  }

  const readingTime = getReadingTime(story.content);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <Card className="p-6">
        <h1 className="story-title mb-4">{story.title}</h1>
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            {new Date(story.createdAt).toLocaleDateString()}
          </div>
          <div className="read-time">
            {readingTime}
          </div>
        </div>
        <div className="prose dark:prose-invert max-w-none italic-text">
          {story.content}
        </div>
      </Card>

      <LikeDislike postId={story.id} />
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