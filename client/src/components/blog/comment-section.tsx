import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare, Edit2, Calendar } from "lucide-react";
import { ThumbsUp, ThumbsDown, Reply, Send, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentVote {
  id: number;
  isUpvote: boolean;
  userId: string;
}

interface CommentReaction {
  id: number;
  emoji: string;
  userId: string;
}

interface CommentReply {
  id: number;
  content: string;
  author: string;
  createdAt: Date | string;
  approved: boolean;
  reactions?: CommentReaction[];
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  approved: boolean;
  author: string;
  authorId?: string;
  votes?: CommentVote[];
  replies?: CommentReply[];
  upvotes?: number;
  downvotes?: number;
  reactions?: CommentReaction[];
  edited?: boolean;
  editedAt?: Date | string;
}

interface CommentSectionProps {
  postId: number;
  title?: string;
}

// Available sort options
const SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  MOST_VOTED: "most_voted",
  MOST_DISCUSSED: "most_discussed",
} as const;

// Available emoji reactions
const EMOJI_REACTIONS = ["👍", "👎", "❤️", "😄", "😢", "😮", "🎉", "💡", "🤔", "👏"];

export default function CommentSection({ postId, title }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [sortBy, setSortBy] = useState<keyof typeof SORT_OPTIONS>("NEWEST");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments with sorting
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${postId}/comments`, sortBy],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments?sort=${SORT_OPTIONS[sortBy]}`);
        if (!response.ok) throw new Error('Failed to fetch comments');
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

  // Post comment mutation
  const mutation = useMutation({
    mutationFn: async (comment: { name: string; content: string }) => {
      if (comment.name.length < 2 || comment.name.length > 50) {
        throw new Error('Name must be between 2 and 50 characters');
      }
      if (comment.content.length < 3 || comment.content.length > 2000) {
        throw new Error('Comment must be between 3 and 2000 characters');
      }

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: comment.name.trim(),
          content: comment.content.trim()
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

      toast({
        title: data.approved ? "✨ Comment Posted!" : "Comment Received",
        description: data.approved
          ? "Thank you for sharing your thoughts!"
          : "Your comment will be reviewed shortly. Thanks for your patience!",
        className: data.approved ? "bg-primary text-primary-foreground" : undefined
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

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ commentId, isUpvote }: { commentId: number; isUpvote: boolean }) => {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUpvote })
      });
      if (!response.ok) throw new Error("Failed to vote");
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

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ commentId, content, author }: { commentId: number; content: string; author: string }) => {
      const response = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, author })
      });
      if (!response.ok) throw new Error("Failed to post reply");
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

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error("Failed to edit comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setEditingComment(null);
      setEditContent("");
      toast({
        title: "Comment Updated",
        description: "Your changes have been saved.",
        className: "bg-primary text-primary-foreground"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to edit comment",
        variant: "destructive"
      });
    }
  });

  // Reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async ({ commentId, emoji }: { commentId: number; emoji: string }) => {
      const response = await fetch(`/api/comments/${commentId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji })
      });
      if (!response.ok) throw new Error("Failed to add reaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add reaction",
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

  const handleSort = (option: keyof typeof SORT_OPTIONS) => {
    setSortBy(option);
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
        content: replyContent.trim(),
        author: name.trim()
      });
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const sortedComments = [...(comments || [])].sort((a, b) => {
    switch (sortBy) {
      case "OLDEST":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "MOST_VOTED":
        return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0));
      case "MOST_DISCUSSED":
        return (b.replies?.length || 0) - (a.replies?.length || 0);
      default: // NEWEST
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-8">
      <div className="border-t border-border/50 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {title ? `Comments on "${title}"` : "Comments"}
          </h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort by: {sortBy.toLowerCase().replace('_', ' ')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(SORT_OPTIONS).map(([key, value]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleSort(key as keyof typeof SORT_OPTIONS)}
                >
                  {key.toLowerCase().replace('_', ' ')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
            <div data-color-mode="dark">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                preview="live"
                height={200}
                className="bg-background/50"
              />
            </div>
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
        ) : sortedComments.filter(comment => comment.approved).length > 0 ? (
          <div className="space-y-4">
            {sortedComments
              .filter(comment => comment.approved)
              .map(comment => (
                <Card key={comment.id} className="p-4 bg-card/50 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>{comment.author[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-foreground">{comment.author}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <time>{format(new Date(comment.createdAt), 'MMM d, yyyy')}</time>
                          {comment.edited && (
                            <Badge variant="outline" className="text-xs">
                              edited
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {editingComment === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <div data-color-mode="dark">
                        <MDEditor
                          value={editContent}
                          onChange={(val) => setEditContent(val || '')}
                          preview="live"
                          height={150}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => editMutation.mutate({ commentId: comment.id, content: editContent })}
                          disabled={editMutation.isPending}
                        >
                          {editMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none mt-2">
                      <ReactMarkdown>{comment.content}</ReactMarkdown>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voteMutation.mutate({ commentId: comment.id, isUpvote: true })}
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
                        onClick={() => voteMutation.mutate({ commentId: comment.id, isUpvote: false })}
                        className={cn(
                          "hover:bg-primary/10",
                          comment.downvotes && "text-primary"
                        )}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {comment.downvotes || 0}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                            <Smile className="h-4 w-4 mr-1" />
                            React
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <div className="grid grid-cols-5 gap-1 p-1">
                            {EMOJI_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                className="hover:bg-primary/10 p-2 rounded"
                                onClick={() => reactionMutation.mutate({ commentId: comment.id, emoji })}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (comment.authorId === "current_user_id") {
                            setEditingComment(comment.id);
                            setEditContent(comment.content);
                          } else {
                            setReplyingTo(replyingTo === comment.id ? null : comment.id);
                          }
                        }}
                        className="hover:bg-primary/10"
                      >
                        {comment.authorId === "current_user_id" ? (
                          <>
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </>
                        ) : (
                          <>
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </>
                        )}
                      </Button>
                    </div>

                    {comment.reactions && comment.reactions.length > 0 && (
                      <div className="flex gap-1">
                        {Object.entries(
                          comment.reactions.reduce((acc, { emoji }) => {
                            acc[emoji] = (acc[emoji] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([emoji, count]) => (
                          <Badge
                            key={emoji}
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            {emoji} {count}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {replyingTo === comment.id && (
                    <div className="mt-4 space-y-2">
                      <Input
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background/50"
                      />
                      <div data-color-mode="dark">
                        <MDEditor
                          value={replyContent}
                          onChange={(val) => setReplyContent(val || '')}
                          preview="live"
                          height={150}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReply(comment.id)}
                          disabled={replyMutation.isPending}
                        >
                          {replyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Post Reply"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 pl-6 border-l-2 border-primary/20">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarFallback>{reply.author[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-sm">{reply.author}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <time>{format(new Date(reply.createdAt), 'MMM d, yyyy')}</time>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown>{reply.content}</ReactMarkdown>
                          </div>
                          {reply.reactions && reply.reactions.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {Object.entries(
                                reply.reactions.reduce((acc, { emoji }) => {
                                  acc[emoji] = (acc[emoji] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([emoji, count]) => (
                                <Badge
                                  key={emoji}
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  {emoji} {count}
                                </Badge>
                              ))}
                            </div>
                          )}
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