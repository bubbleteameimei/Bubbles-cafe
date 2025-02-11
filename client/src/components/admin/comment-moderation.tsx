import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// List of words to filter
const FILTERED_WORDS = [
  'hate', 'kill', 'racist', 'offensive', 'slur',
  // Add more filtered words as needed
];

export function containsFilteredWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return FILTERED_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

export default function CommentModeration() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("pending");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["/api/comments/pending"],
    queryFn: async () => {
      const response = await fetch("/api/comments/pending");
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      return response.json();
    }
  });

  const approvalMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/comments/${id}`,
        { approved }
      );
      if (!response.ok) {
        throw new Error("Failed to update comment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Success",
        description: "Comment status updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(
        "DELETE",
        `/api/comments/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comment Moderation</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {comments.filter(comment => {
          if (filter === "pending") return !comment.approved;
          if (filter === "approved") return comment.approved;
          return false;
        }).map(comment => (
          <Card key={comment.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{comment.author}</p>
                <time className="text-sm text-muted-foreground">
                  {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                </time>
              </div>
              <div className="flex gap-2">
                {!comment.approved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => approvalMutation.mutate({ id: comment.id, approved: true })}
                    disabled={approvalMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(comment.id)}
                  disabled={deleteMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="whitespace-pre-wrap">{comment.content}</p>
            {containsFilteredWords(comment.content) && (
              <p className="mt-2 text-sm text-red-500">
                Warning: This comment may contain inappropriate content
              </p>
            )}
          </Card>
        ))}

        {comments.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">
            No comments to moderate
          </p>
        )}
      </div>
    </div>
  );
}
