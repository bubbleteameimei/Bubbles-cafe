import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import { ThumbsUp, ThumbsDown, Reply, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import bcrypt from "bcryptjs";

interface CommentVote {
  id: number;
  isUpvote: boolean;
  userId: string;
}

interface CommentReply {
  id: number;
  content: string;
  author: string;
  createdAt: Date | string;
  approved: boolean;
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  approved: boolean;
  author: string;
  votes?: CommentVote[];
  replies?: CommentReply[];
  upvotes?: number;
  downvotes?: number;
}

interface CommentSectionProps {
  postId: number;
  title?: string;
}

export default function CommentSection({ postId, title }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
    },
    refetchInterval: 30000,
    staleTime: 10000
  });

  const mutation = useMutation({
    mutationFn: async (comment: { name: string; content: string }) => {
      // Validate input length
      if (comment.name.length < 2 || comment.name.length > 50) {
        throw new Error('Name must be between 2 and 50 characters');
      }
      if (comment.content.length < 3 || comment.content.length > 500) {
        throw new Error('Comment must be between 3 and 500 characters');
      }

      // Basic content validation
      const sanitizedContent = comment.content
        .trim()
        .replace(/\s+/g, ' ');

      const sanitizedName = comment.name
        .trim()
        .replace(/\s+/g, ' ');

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: sanitizedName,
          content: sanitizedContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to post comment' }));
        throw new Error(errorData.message || 'Failed to post comment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setName("");
      setContent("");

      // Show different toast messages based on whether the comment was auto-approved
      if (data.approved) {
        toast({
          title: "✨ Comment Posted!",
          description: "Thank you for sharing your thoughts!",
          className: "bg-primary text-primary-foreground"
        });
      } else {
        toast({
          title: "Comment Received",
          description: "Your comment will be reviewed shortly. Thanks for your patience!",
          variant: "default"
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive"
      });
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ commentId, isUpvote }: { commentId: number; isUpvote: boolean }) => {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUpvote })
      });
      if (!response.ok) {
        throw new Error("Failed to vote");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to vote",
        variant: "destructive"
      });
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ commentId, content, author }: { commentId: number; content: string; author: string }) => {
      const response = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, author })
      });
      if (!response.ok) {
        throw new Error("Failed to post reply");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setReplyingTo(null);
      setReplyContent("");
      toast({
        title: "Reply Posted!",
        description: "Your reply has been added to the discussion.",
        className: "bg-primary text-primary-foreground"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await mutation.mutateAsync({ name, content });
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const handleVote = async (commentId: number, isUpvote: boolean) => {
    try {
      await voteMutation.mutateAsync({ commentId, isUpvote });
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleReply = async (commentId: number) => {
    if (!replyContent.trim() || !name.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await replyMutation.mutateAsync({
        commentId,
        content: replyContent,
        author: name
      });
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-t border-border/50 pt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title ? `Comments on "${title}"` : "Comments"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              minLength={2}
              className={cn(
                "bg-background/50",
                "focus:ring-2 focus:ring-primary/20"
              )}
              required
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              minLength={3}
              rows={4}
              className={cn(
                "bg-background/50",
                "focus:ring-2 focus:ring-primary/20"
              )}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending || !name.trim() || !content.trim()}
            className="w-full sm:w-auto"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Comment"
            )}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg text-foreground/90">
          {Array.isArray(comments) ? comments.filter(comment => comment.approved).length : 0} Comments
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : Array.isArray(comments) && comments.filter(comment => comment.approved).length > 0 ? (
          <div className="space-y-4">
            {comments
              .filter(comment => comment.approved)
              .map(comment => (
                <Card key={comment.id} className="p-4 bg-card/50 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">{comment.author}</span>
                    <time className="text-sm text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </time>
                  </div>
                  <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(comment.id, true)}
                        className={cn(
                          "hover:bg-primary/10",
                          comment.upvotes && "text-primary"
                        )}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {comment.upvotes || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(comment.id, false)}
                        className={cn(
                          "hover:bg-primary/10",
                          comment.downvotes && "text-primary"
                        )}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {comment.downvotes || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="hover:bg-primary/10"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>

                  {replyingTo === comment.id && (
                    <div className="mt-4 space-y-2">
                      <Input
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background/50"
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="flex-1 bg-background/50"
                        />
                        <Button
                          size="icon"
                          onClick={() => handleReply(comment.id)}
                          disabled={replyMutation.isPending}
                        >
                          {replyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 pl-6 border-l-2 border-primary/20">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{reply.author}</span>
                            <time className="text-xs text-muted-foreground">
                              {format(new Date(reply.createdAt), 'MMM d, yyyy')}
                            </time>
                          </div>
                          <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}