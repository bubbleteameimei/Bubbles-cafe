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
  name: string;
  content: string;
  createdAt: Date | string;
  approved: boolean;
  author?: string;
}

interface CommentSectionProps {
  postId: number;
  title?: string; // Made optional since it's not always needed
}

export default function CommentSection({ postId, title }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    refetchInterval: 30000,
    staleTime: 10000
  });

  const mutation = useMutation({
    mutationFn: async (comment: { name: string; content: string }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: comment.name, content: comment.content, approved: false })
      });
      if (!response.ok) throw new Error("Failed to post comment");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    mutation.mutate({ name, content });
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
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={4}
              className="bg-background/50"
            />
          </div>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
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
          {comments.filter(comment => comment.approved).length} Comments
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : comments.filter(comment => comment.approved).length > 0 ? (
          <div className="space-y-4">
            {comments
              .filter(comment => comment.approved)
              .map(comment => (
                <Card key={comment.id} className="p-4 bg-card/50 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">{comment.name}</span>
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