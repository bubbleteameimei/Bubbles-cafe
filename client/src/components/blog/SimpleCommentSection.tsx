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
  ThumbsUp,
  Calendar,
  MessageCircle,
  SendHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Interfaces
interface CommentMetadata {
  author: string;
  upvotes: number;
  isAnonymous: boolean;
  moderated: boolean;
  originalContent: string;
  replyCount: number;
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  metadata: CommentMetadata;
  approved: boolean;
  parentId: number | null;
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

// Simple reply form component
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
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author: name.trim(),
          parentId: commentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to post reply');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setName("");
      setContent("");
      onCancel();
      toast({
        title: "Reply posted",
        description: "Your reply has been added to the discussion.",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your name and message",
        variant: "destructive"
      });
      return;
    }
    
    replyMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="border-l border-primary/30 pl-2 mt-1 bg-muted/5 rounded-md overflow-hidden">
      <div className="space-y-1 p-1.5">
        <div className="flex items-center gap-1.5 mb-1">
          <Reply className="h-2.5 w-2.5 text-primary/70" />
          <span className="text-[10px] font-medium">Reply to this comment</span>
        </div>
        <div className="flex gap-1.5">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-6 text-[10px] bg-background/80 flex-grow"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 px-2 text-[10px]"
          >
            Cancel
          </Button>
        </div>
        <Textarea
          ref={textareaRef}
          placeholder="Write your reply..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[40px] text-[10px] bg-background/80 py-1"
          required
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={replyMutation.isPending}
            className="h-6 text-[10px] px-2"
          >
            {replyMutation.isPending ? (
              <>
                <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                <span>Posting</span>
              </>
            ) : (
              <>
                <SendHorizontal className="mr-1 h-2.5 w-2.5" />
                <span>Reply</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

// Main component
export default function SimpleCommentSection({ postId, title }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    }
  });

  // Post new comment
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
        throw new Error('Failed to post comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setName("");
      setContent("");
      toast({
        title: "Comment posted",
        description: "Thank you for joining the conversation!",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle upvote
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
      toast({
        title: "Error",
        description: "Failed to upvote comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your name and message",
        variant: "destructive"
      });
      return;
    }
    
    mutation.mutate();
  };

  // Get root comments and group replies
  const rootComments = comments.filter(comment => comment.parentId === null);
  
  const repliesByParentId = comments
    .filter(comment => comment.parentId !== null)
    .reduce((groups: Record<number, Comment[]>, reply) => {
      if (reply.parentId) {
        if (!groups[reply.parentId]) {
          groups[reply.parentId] = [];
        }
        groups[reply.parentId].push(reply);
      }
      return groups;
    }, {});

  // Format date
  const formatDate = (dateStr: string | Date): string => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return format(date, 'MMM d');
  };

  return (
    <div className="antialiased mx-auto">
      <div className="border-t border-border/30 pt-4">
        <h3 className="mb-3 text-sm font-medium flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          {title ? `Comments on "${title}"` : "Discussion"} 
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-3.5">
            {rootComments.length}
          </Badge>
        </h3>

        {/* Comment form - ultra sleek design */}
        <Card className="mb-3 p-2.5 shadow-none bg-card/50 border-border/30 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-muted-foreground/70" />
              <h4 className="text-xs font-medium">Join the conversation</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
              <div className="md:col-span-1 flex">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-7 text-xs bg-background/80 flex-grow"
                  required
                />
              </div>
              <div className="md:col-span-3 flex">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-7 text-xs bg-background/80 min-h-[52px] flex-grow"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  size="sm"
                  className="h-[52px] w-7 ml-1.5 p-0 flex items-center justify-center"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>

      {/* Comments list */}
      <div className="space-y-1.5">
        {isLoading ? (
          <div className="flex justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ) : rootComments.length > 0 ? (
          rootComments.map(comment => (
            <div key={comment.id} className="space-y-1.5">
              <Card className="shadow-none border-border/30 overflow-hidden">
                {/* Comment header - ultra compact */}
                <div className="px-2.5 py-1 flex items-center justify-between border-b border-border/10 bg-muted/10">
                  <div className="flex items-center">
                    <span className="font-medium text-xs">{comment.metadata.author}</span>
                    {repliesByParentId[comment.id]?.length > 0 && (
                      <Badge variant="outline" className="ml-2 text-[9px] px-1 py-0 h-3.5 border-muted-foreground/30">
                        {repliesByParentId[comment.id].length} {repliesByParentId[comment.id].length === 1 ? 'reply' : 'replies'}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground flex items-center">
                    <Calendar className="h-2.5 w-2.5 mr-0.5" />
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                
                {/* Comment body - ultra compact */}
                <div className="px-2.5 py-1.5">
                  <p className="text-xs text-card-foreground leading-relaxed mb-1.5">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-[10px]">
                    <button 
                      onClick={() => handleUpvote(comment.id)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ThumbsUp className={cn("h-3 w-3", comment.metadata.upvotes > 0 && "text-primary")} />
                      <span>{comment.metadata.upvotes > 0 ? comment.metadata.upvotes : 'Like'}</span>
                    </button>
                    
                    <button 
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Reply className="h-3 w-3" />
                      <span>{replyingTo === comment.id ? "Cancel" : "Reply"}</span>
                    </button>
                  </div>
                </div>
              </Card>
              
              {/* Replies - ultra compact design */}
              {repliesByParentId[comment.id] && repliesByParentId[comment.id].length > 0 && (
                <div className="pl-2.5 ml-1 border-l border-border/30 space-y-1">
                  {repliesByParentId[comment.id].map(reply => (
                    <Card key={reply.id} className="shadow-none border-border/20">
                      <div className="pl-2 pr-2.5 py-0.5 flex items-center justify-between border-b border-border/10 bg-muted/5">
                        <div className="flex items-center gap-1">
                          <div className="w-0.5 h-3.5 bg-primary/20 rounded-full mr-1"></div>
                          <span className="font-medium text-[10px]">{reply.metadata.author}</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground flex items-center">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      
                      <div className="px-2.5 py-1">
                        <p className="text-[10px] text-card-foreground leading-relaxed mb-1">
                          {reply.content}
                        </p>
                        
                        <button 
                          onClick={() => handleUpvote(reply.id)}
                          className="flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ThumbsUp className={cn("h-2.5 w-2.5", reply.metadata.upvotes > 0 && "text-primary")} />
                          <span>{reply.metadata.upvotes > 0 ? reply.metadata.upvotes : 'Like'}</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Reply form */}
              {replyingTo === comment.id && (
                <ReplyForm
                  commentId={comment.id}
                  postId={postId}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
            </div>
          ))
        ) : (
          <Card className="py-3 px-2.5 text-center border-border/30 shadow-none bg-muted/5">
            <div className="flex flex-col items-center space-y-1">
              <MessageCircle className="h-4 w-4 text-muted-foreground/40" />
              <h4 className="text-xs font-medium">No comments yet</h4>
              <p className="text-[10px] text-muted-foreground max-w-sm">
                Be the first to share your thoughts on this post
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}