
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface Comment {
  id: number;
  name: string;
  content: string;
  createdAt: string;
  approved: boolean;
}

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    refetchInterval: 30000
  });

  const mutation = useMutation({
    mutationFn: async (comment: { name: string; content: string }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment)
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
    <div className="mt-12 border-t border-border/50 pt-8">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          rows={4}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      <div className="space-y-6">
        {comments
          .filter(comment => comment.approved)
          .map(comment => (
            <div key={comment.id} className="bg-card p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{comment.name}</span>
                <time className="text-sm text-muted-foreground">
                  {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                </time>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
