import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  MessageSquare, 
  Reply, 
  Heart,
  Calendar,
  ThumbsUp
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface CommentMetadata {
  moderated: boolean;
  originalContent: string;
  isAnonymous: boolean;
  author: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  votes?: {
    upvotes: number;
    downvotes: number;
  }
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  metadata: CommentMetadata;
  approved: boolean;
  parentId: number | null;
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

// Using the external CommentReactionButtons component
// Helper function to adapt our Comment type to what CommentReactionButtons expects
function adaptCommentForReactions(comment: Comment) {
  // Make sure the votes field exists in metadata
  if (!comment.metadata.votes) {
    comment.metadata.votes = {
      upvotes: comment.metadata.upvotes || 0,
      downvotes: comment.metadata.downvotes || 0
    };
  }
  return comment;
}

function ReplyForm({ commentId, postId, onCancel }: ReplyFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea when the form appears
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const replyMutation = useMutation({
    mutationFn: async () => {
      console.log(`Posting reply to comment ${commentId} with content: "${content.trim()}" by "${name.trim()}"`);
      
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
        console.error("Reply error response:", errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to post reply');
      }

      const data = await response.json();
      console.log("Reply success response:", data);
      return data;
    },
    onSuccess: () => {
      console.log(`Successfully posted reply to comment ${commentId}`);
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setName("");
      setContent("");
      onCancel();
      toast({
        title: "Reply Posted!",
        description: "Your reply has been added to the discussion.",
        variant: "default"
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
    console.log("Starting reply mutation:", { name, content, commentId, postId });
    
    if (!name.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      replyMutation.mutate();
    } catch (error) {
      console.error("Reply mutation failed:", error);
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <Card className="p-4 bg-muted/10 shadow-sm border-border/50">
        <div className="space-y-3">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            minLength={2}
            className="bg-background/80 focus:ring-2 ring-primary/20"
            required
          />
          <Textarea
            ref={textareaRef}
            placeholder="Write your reply..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-background/80 focus:ring-2 ring-primary/20"
            required
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={replyMutation.isPending || !name.trim() || !content.trim()}
              size="sm"
              className="shadow-sm"
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
          </div>
        </div>
      </Card>
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
        variant: "default"
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

  const handleUpvote = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUpvote: true })
      });
      
      if (!response.ok) {
        throw new Error("Failed to upvote comment");
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    } catch (error) {
      console.error("Failed to upvote comment:", error);
      toast({
        title: "Error",
        description: "Failed to upvote comment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDownvote = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUpvote: false })
      });
      
      if (!response.ok) {
        throw new Error("Failed to downvote comment");
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    } catch (error) {
      console.error("Failed to downvote comment:", error);
      toast({
        title: "Error",
        description: "Failed to downvote comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting mutation:", { name, content, postId });
    
    if (!name.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      mutation.mutate();
    } catch (error) {
      console.error("Mutation failed:", error);
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Get only root comments
  const rootComments = comments.filter(comment => comment.parentId === null);
  
  // Group replies by parent comment
  const groupReplies = () => {
    const repliesByParentId: Record<number, Comment[]> = {};
    
    comments.filter(comment => comment.parentId !== null).forEach((reply) => {
      if (reply.parentId) {
        if (!repliesByParentId[reply.parentId]) {
          repliesByParentId[reply.parentId] = [];
        }
        repliesByParentId[reply.parentId].push(reply);
      }
    });
    
    return repliesByParentId;
  };
  
  const repliesByParentId = groupReplies();

  // Format time as "3:34 PM" (just time)
  const formatTime = (dateStr: string | Date): string => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return format(date, 'h:mm a');
  };

  return (
    <div className="antialiased mx-auto max-w-screen-lg">
      <div className="border-t border-border/50 pt-8">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title ? `Comments on "${title}"` : "Comments"} 
          <Badge variant="secondary" className="ml-2 text-xs">
            {rootComments.length}
          </Badge>
        </h3>

        <Card className="mb-10 p-5 shadow-sm bg-card/50 backdrop-blur-sm border-border/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-base font-medium text-card-foreground mb-2">Join the conversation</h4>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              minLength={2}
              className="bg-background/80 focus:ring-2 ring-primary/20"
              required
            />
            <Textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] bg-background/80 focus:ring-2 ring-primary/20"
              required
            />
            <div className="flex gap-2 items-center justify-end">
              <Button
                type="submit"
                disabled={mutation.isPending || !name.trim() || !content.trim()}
                className="w-full sm:w-auto shadow-sm"
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
            </div>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rootComments.length > 0 ? (
          rootComments.map(comment => (
            <div key={comment.id} className="space-y-4">
              <Card className="shadow-sm border-border/50 overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 flex items-center justify-between border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <Avatar className="rounded-full w-7 h-7 border-2 border-background">
                      <AvatarFallback className="text-sm bg-primary/10 text-primary">
                        {comment.metadata.author[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <strong className="text-sm font-medium text-card-foreground">
                        {comment.metadata.author}
                      </strong>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-[10px] px-2 bg-background/50">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(comment.createdAt), 'MMM d')}
                  </Badge>
                </div>
                
                <div className="px-4 py-3">
                  <p className="text-sm text-card-foreground leading-relaxed">
                    {comment.content}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <CommentReactionButtons 
                      comment={adaptCommentForReactions(comment)} 
                      onUpvote={handleUpvote} 
                      onDownvote={handleDownvote} 
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-sm hover:bg-primary/5"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </Button>
                  </div>
                  
                  {repliesByParentId[comment.id] && repliesByParentId[comment.id].length > 0 && (
                    <>
                      <div className="flex items-center gap-2 mt-6 mb-4">
                        <Separator className="flex-grow" />
                        <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                          Replies {repliesByParentId[comment.id].length > 0 && `(${repliesByParentId[comment.id].length})`}
                        </span>
                        <Separator className="flex-grow" />
                      </div>
                      
                      <div className="space-y-4 pl-4 border-l-2 border-muted/30">
                        {repliesByParentId[comment.id].map(reply => (
                          <div key={reply.id} className="relative">
                            <div className="absolute -left-[25px] top-2 h-2 w-2 rounded-full bg-primary/60"></div>
                            <div className="flex gap-3">
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {reply.metadata.author[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-muted/10 rounded-lg p-3 border border-border/30">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                  <strong className="text-xs sm:text-sm font-medium">
                                    {reply.metadata.author}
                                  </strong>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatTime(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-card-foreground mt-2 leading-relaxed">
                                  {reply.content}
                                </p>
                                <div className="mt-2">
                                  <CommentReactionButtons 
                                    comment={adaptCommentForReactions(reply)} 
                                    onUpvote={handleUpvote} 
                                    onDownvote={handleDownvote}
                                    size="sm"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
              
              {replyingTo === comment.id && (
                <div className="space-y-2 ml-8 mt-2 border-l-2 border-primary/10 pl-4">
                  <div className="flex gap-3">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {name ? name[0].toUpperCase() : 'Y'}
                      </AvatarFallback>
                    </Avatar>
                    <ReplyForm
                      commentId={comment.id}
                      postId={postId}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <Card className="p-8 text-center bg-card/50">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-muted/50 p-4 mb-4">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-medium text-card-foreground mb-2">
                No comments yet
              </h4>
              <p className="text-muted-foreground mb-4 max-w-md">
                Be the first to share your thoughts! Your insights help build our community of readers.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}