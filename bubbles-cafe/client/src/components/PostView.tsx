import React from 'react';
import { Post } from '@shared/schema';
import { Card } from "@/components/ui/card";
import { getReadingTime } from "@/lib/content-analysis";
import { Clock } from "lucide-react";

interface PostViewProps {
  post: Post & {
    triggerWarnings?: string[];
    createdAt: string;
  };
}

const PostView: React.FC<PostViewProps> = ({ post }) => {
  const readingTime = getReadingTime(post.content);

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h1 className="story-title mb-4">{post.title}</h1>
      <div className="flex items-center gap-2 mb-4 mt-2">
        <time className="text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
        <span className="text-primary/50">•</span>
        <span className="read-time flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {readingTime}
        </span>
      </div>
      <div className="prose dark:prose-invert max-w-none italic-text">
        {post.content}
      </div>
      {post.triggerWarnings && post.triggerWarnings.length > 0 && (
        <div className="mt-6 p-4 bg-destructive/20 rounded-lg horror-glow">
          <h3 className="text-sm font-semibold mb-2">Content Warnings</h3>
          <ul className="list-disc list-inside">
            {post.triggerWarnings.map((warning, index) => (
              <li key={index} className="text-sm">{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default PostView;