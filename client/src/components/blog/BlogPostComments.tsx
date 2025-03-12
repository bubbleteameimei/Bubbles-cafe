
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CommentPlugin from '../CommentPlugin';
import { useToast } from '@/hooks/use-toast';

interface BlogPostCommentsProps {
  postId: number;
}

const BlogPostComments: React.FC<BlogPostCommentsProps> = ({ postId }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch comments for this post
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
  });

  // Submit a new comment
  const submitCommentMutation = useMutation({
    mutationFn: async ({ text, postId }: { text: string; postId: number }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refetch comments after successful submission
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast({
        title: 'Comment submitted',
        description: 'Your comment has been posted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your comment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitComment = async (text: string, postId: number) => {
    await submitCommentMutation.mutateAsync({ text, postId });
  };

  if (isLoading) {
    return <div className="mt-8 text-center">Loading comments...</div>;
  }

  return (
    <CommentPlugin
      postId={postId}
      initialComments={comments}
      onSubmitComment={handleSubmitComment}
    />
  );
};

export default BlogPostComments;
