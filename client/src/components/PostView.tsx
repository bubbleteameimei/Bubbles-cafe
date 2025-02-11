import React from 'react';
import { Post } from '@shared/schema';
import { Card } from "@/components/ui/card";

interface PostViewProps {
  post: Post;
}

const PostView: React.FC<PostViewProps> = ({ post }) => {
  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="prose dark:prose-invert max-w-none">
        {post.content}
      </div>
      {post.triggerWarnings && post.triggerWarnings.length > 0 && (
        <div className="mt-6 p-4 bg-red-900/20 rounded-lg">
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