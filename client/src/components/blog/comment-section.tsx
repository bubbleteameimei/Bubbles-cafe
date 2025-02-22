import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare, Reply } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommentMetadata {
  moderated: boolean;
  originalContent: string;
  isAnonymous: boolean;
  author: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  metadata: CommentMetadata;
  approved: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: number;
  title?: string;
}

interface ReplyFormProps {
  commentId: number;
  postId: number;
  onCancel: () => void;
}

function ReplyForm({ commentId, postId, onCancel }: ReplyFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const replyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author: name.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post reply');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setName("");
      setContent("");
      onCancel();
      toast({
        title: "Reply Posted!",
        description: "Your reply has been added to the discussion.",
        className: "bg-primary text-primary-foreground"
      });
    },
    onError: (error: Error) => {
      console.error('Reply posting error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post reply. Please try again.",
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
    replyMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 ml-8 border-l-2 border-border/50 pl-4">
      <Input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={50}
        minLength={2}
        className="bg-background/50"
        required
      />
      <Textarea
        placeholder="Write your reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] bg-background/50"
        required
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={replyMutation.isPending || !name.trim() || !content.trim()}
          size="sm"
        >
          {replyMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post Reply"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function CommentSection({ postId, title }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments');
      }
      return response.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author: name.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setName("");
      setContent("");
      toast({
        title: "Comment Posted!",
        description: "Thank you for sharing your thoughts!",
        className: "bg-primary text-primary-foreground"
      });
    },
    onError: (error: Error) => {
      console.error('Comment posting error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post comment. Please try again.",
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
    mutation.mutate();
  };

  return (
    <div className="space-y-8">
      <div className="border-t border-border/50 pt-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-2xl font-bold">
            {title ? `Comments on "${title}"` : "Comments"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            minLength={2}
            className="bg-background/50"
            required
          />
          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-background/50"
            required
          />
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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="space-y-4">
                <Card className="p-4 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>{comment.metadata.author[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.metadata.author}</span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          <Reply className="h-4 w-4" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
                {replyingTo === comment.id && (
                  <ReplyForm
                    commentId={comment.id}
                    postId={postId}
                    onCancel={() => setReplyingTo(null)}
                  />
                )}
                {comment.replies?.map(reply => (
                  <Card
                    key={reply.id}
                    className="p-4 bg-card/50 backdrop-blur-sm ml-8 border-l-2 border-border/50"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{reply.metadata.author[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{reply.metadata.author}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(reply.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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