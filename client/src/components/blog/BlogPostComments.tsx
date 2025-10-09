
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CommentPlugin from '../CommentPlugin';
import { useToast } from '@/hooks/use-toast';
import { apiJson } from '@/lib/api';

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
      return apiJson<any>('POST', `/api/posts/${postId}/comments`, { content: text });
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

  // Vote on a comment
  const voteCommentMutation = useMutation({
    mutationFn: async ({ commentId, isUpvote }: { commentId: string; isUpvote: boolean }) => {
      return apiJson<any>('POST', `/api/comments/${commentId}/vote`, { isUpvote });
    },
    onSuccess: () => {
      // Optionally refresh comments after voting
      // We're handling optimistic updates in the component,
      // so we don't necessarily need to refetch here
    },
    onError: (error) => {
      console.error('Error voting on comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to register your vote. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitComment = async (text: string, postId: number) => {
    await submitCommentMutation.mutateAsync({ text, postId });
  };

  const handleVoteComment = async (commentId: string, isUpvote: boolean) => {
    await voteCommentMutation.mutateAsync({ commentId, isUpvote });
  };

  if (isLoading) {
    return <div className="mt-8 text-center">Loading comments...</div>;
  }

  return (
    <CommentPlugin
      postId={postId}
      initialComments={comments}
      onSubmitComment={handleSubmitComment}
      onVoteComment={handleVoteComment}
    />
  );
};

export default BlogPostComments;
