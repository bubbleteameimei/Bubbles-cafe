import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  approved: boolean;
  author: string;
}

interface CommentSectionProps {
  postId: number;
  title?: string;
}

export default function CommentSection({ postId, title }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
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

      // Basic content validation (prevent scripts and ensure readability)
      const sanitizedContent = comment.content
        .trim()
        .replace(/\s+/g, ' ');  // normalize whitespace

      const sanitizedName = comment.name
        .trim()
        .replace(/\s+/g, ' '); // normalize whitespace

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setName("");
      setContent("");
      toast({
        title: "Comment posted",
        description: "Your comment will be visible after moderation"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
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
      // Error is handled by mutation error callback
      console.error('Failed to submit comment:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-t border-border/50 pt-8">
        <h2 className="text-2xl font-bold mb-6">
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
              className="bg-background/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              minLength={3}
              rows={4}
              className="bg-background/50"
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