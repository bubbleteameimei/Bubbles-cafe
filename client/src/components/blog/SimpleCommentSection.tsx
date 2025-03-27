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
  SendHorizontal,
  AlertCircle,
  Check,
  ShieldAlert,
  Flag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

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
  authorToMention?: string;
}

// Enhanced moderation check with immediate flagging
const checkModeration = (text: string): { isFlagged: boolean, moderated: string, isUnderReview: boolean } => {
  if (!text) return { isFlagged: false, moderated: "", isUnderReview: false };
  
  // List of words/patterns that trigger moderation
  const flaggedPatterns = [
    /\b(hate|stupid|idiot|dumb|moron)\b/gi,
    /\b(sh[i*]t|f[u*]ck|a[s*][s*]|b[i*]tch)\b/gi,
    /\b(damn|hell|crap)\b/gi
  ];
  
  // Words that trigger review
  const reviewPatterns = [
    /\b(kill|violent|disgusting|vile|appalling|nasty|horrible|garbage|sucks|pathetic)\b/gi,
    /\b(scam|fraud|fake|lying|spam|trash|worst|terrible|lazy|awful)\b/gi,
    /\b(useless|worthless|waste|ugly|offensive|sexist|racist|bigot)\b/gi
  ];
  
  let moderated = text;
  let isFlagged = false;
  let isUnderReview = false;
  
  // Check for immediate moderation patterns
  flaggedPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      isFlagged = true;
      moderated = moderated.replace(pattern, match => '*'.repeat(match.length));
    }
  });
  
  // Check for patterns that require review
  if (!isFlagged) {
    reviewPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        isUnderReview = true;
      }
    });
  }
  
  return { isFlagged, moderated, isUnderReview };
};

// Simple reply form component
function ReplyForm({ commentId, postId, onCancel, authorToMention }: ReplyFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState(authorToMention ? `@${authorToMention} ` : "");
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get authentication state
  const { user, isAuthenticated, isAuthReady } = useAuth();
  
  // Apply moderation check with review flag
  const { isFlagged, moderated, isUnderReview } = checkModeration(content);

  // Focus the textarea when the form appears and position cursor at the end
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      
      // Position cursor at the end of the text
      const length = textareaRef.current.value.length;
      textareaRef.current.selectionStart = length;
      textareaRef.current.selectionEnd = length;
    }
  }, []);

  const replyMutation = useMutation({
    mutationFn: async () => {
      // Use authenticated user's username if available, otherwise use the name from input
      const replyAuthor = isAuthenticated && user ? user.username : name.trim();
      
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author: replyAuthor,
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
    
    // Only validate name field if user is not authenticated
    if ((!isAuthenticated && !name.trim()) || !content.trim()) {
      toast({
        title: "Missing information",
        description: isAuthenticated 
          ? "Please provide your message" 
          : "Please provide your name and message",
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
          {isAuthenticated && (
            <span className="ml-1 text-[9px] text-muted-foreground">
              as <span className="font-medium">{user?.username}</span>
            </span>
          )}
          {!isAuthenticated && (
            <span className="ml-1 text-[9px] text-muted-foreground">
              as <span className="font-medium">Anonymous</span>
            </span>
          )}
        </div>
        
        <div className="flex gap-1.5">
          <Textarea
            ref={textareaRef}
            placeholder="Write your reply..."
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setContent(e.target.value);
              if (isFlagged && !previewMode) {
                setPreviewMode(true);
              }
            }}
            className="min-h-[40px] text-[10px] bg-background/80 py-1 flex-grow"
            required
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 px-2 text-[10px] self-start"
          >
            Cancel
          </Button>
        </div>
        
        {/* Moderation preview for reply */}
        {isFlagged && content.trim() !== "" && (
          <motion.div 
            className="px-1.5 py-1 bg-amber-500/10 rounded-sm text-[9px] border border-amber-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-2.5 w-2.5" />
              <span className="font-medium">Preview with moderation:</span>
            </div>
            <p className="mt-0.5 text-xs ml-3.5">{moderated}</p>
          </motion.div>
        )}
        
        {/* Under review notice for reply */}
        {isUnderReview && !isFlagged && content.trim() !== "" && (
          <motion.div 
            className="px-1.5 py-1 bg-blue-500/10 rounded-sm text-[9px] border border-blue-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <ShieldAlert className="h-2.5 w-2.5" />
              <span className="font-medium">This reply may be placed under review</span>
            </div>
            <p className="mt-0.5 text-[9px] ml-3.5 text-muted-foreground">
              Your reply contains content that might need moderator approval.
            </p>
          </motion.div>
        )}
        
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
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get authentication state
  const { user, isAuthenticated, isAuthReady } = useAuth();
  
  // Smart moderation preview with review flag
  const { isFlagged, moderated, isUnderReview } = checkModeration(content);

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
      // Use authenticated user's username if available, otherwise use the name from input
      const commentAuthor = isAuthenticated && user ? user.username : name.trim();
      
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author: commentAuthor
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
    
    // Only validate name field if user is not authenticated
    if ((!isAuthenticated && !name.trim()) || !content.trim()) {
      toast({
        title: "Missing information",
        description: isAuthenticated 
          ? "Please provide your message" 
          : "Please provide your name and message",
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
  
  // Parse and highlight @mentions in text
  const parseMentions = (text: string): React.ReactNode => {
    if (!text) return "";
    
    // Regular expression to match @mentions
    const mentionRegex = /@(\w+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    // Find all mentions in the text
    while ((match = mentionRegex.exec(text)) !== null) {
      // Add the text before the mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the mention with highlighting
      const username = match[1];
      parts.push(
        <span key={`mention-${match.index}`} className="text-primary font-medium">
          @{username}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? <>{parts}</> : text;
  };

  return (
    <div className="antialiased mx-auto">
      <div className="border-t border-border/30 pt-4 pb-1.5">
        <div className="mb-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-primary/70" />
            <h3 className="text-base font-medium">Discussion</h3>
            <Badge variant="outline" className="text-[11px] h-4.5 border-primary/20 bg-primary/5 ml-1">
              {rootComments.length}
            </Badge>
          </div>
          {isAuthenticated ? (
            <div className="text-xs text-muted-foreground">Commenting as <span className="font-medium">{user?.username}</span></div>
          ) : (
            <div className="text-xs text-muted-foreground">Commenting as <span className="font-medium">Anonymous</span></div>
          )}
        </div>
        {/* Comment form - ultra sleek design */}
        <Card className="mb-3 p-2.5 shadow-sm bg-gradient-to-b from-card/80 to-card/50 border-border/30 overflow-hidden hover:shadow-md transition-shadow">
          <form onSubmit={handleSubmit} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h4 className="text-xs font-medium">Join the conversation</h4>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 text-primary/70" />
                <span className="text-xs text-muted-foreground">Write a comment</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {!isAuthenticated ? (
                <motion.div 
                  className="flex flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex">
                    <div className="flex items-center mr-2 text-xs text-muted-foreground">
                      <span>Posting as <span className="font-medium">Anonymous</span></span>
                    </div>
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={content}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setContent(e.target.value);
                        if (isFlagged && !previewMode) {
                          setPreviewMode(true);
                        }
                      }}
                      className="h-7 text-xs bg-background/80 min-h-[52px] flex-grow"
                      required
                    />
                    <div className="flex flex-col gap-1">
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
                  
                  {/* Moderation preview */}
                  {isFlagged && content.trim() !== "" && (
                    <motion.div 
                      className="mt-1 px-1.5 py-1 bg-amber-500/10 rounded-sm text-[9px] border border-amber-500/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-2.5 w-2.5" />
                        <span className="font-medium">Preview with automatic moderation:</span>
                      </div>
                      <p className="mt-0.5 text-xs ml-3.5">{moderated}</p>
                    </motion.div>
                  )}
                  
                  {/* Under review notice for anonymous */}
                  {isUnderReview && !isFlagged && content.trim() !== "" && (
                    <motion.div 
                      className="mt-1 px-1.5 py-1 bg-blue-500/10 rounded-sm text-[9px] border border-blue-500/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        <span className="font-medium">This comment may be placed under review</span>
                      </div>
                      <p className="mt-0.5 text-[9px] ml-3.5 text-muted-foreground">
                        Your comment contains content that might need moderator approval before being displayed to all users.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  className="flex flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex">
                    <div className="flex items-center mr-2 text-xs text-muted-foreground">
                      <span>Posting as <span className="font-medium">{user?.username}</span></span>
                    </div>
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={content}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setContent(e.target.value);
                        if (isFlagged && !previewMode) {
                          setPreviewMode(true);
                        }
                      }}
                      className="h-7 text-xs bg-background/80 min-h-[52px] flex-grow"
                      required
                    />
                    <div className="flex flex-col gap-1">
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
                  
                  {/* Moderation preview */}
                  {isFlagged && content.trim() !== "" && (
                    <motion.div 
                      className="mt-1 px-1.5 py-1 bg-amber-500/10 rounded-sm text-[9px] border border-amber-500/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-2.5 w-2.5" />
                        <span className="font-medium">Preview with automatic moderation:</span>
                      </div>
                      <p className="mt-0.5 text-xs ml-3.5">{moderated}</p>
                    </motion.div>
                  )}
                  
                  {/* Under review notice for authenticated */}
                  {isUnderReview && !isFlagged && content.trim() !== "" && (
                    <motion.div 
                      className="mt-1 px-1.5 py-1 bg-blue-500/10 rounded-sm text-[9px] border border-blue-500/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        <span className="font-medium">This comment may be placed under review</span>
                      </div>
                      <p className="mt-0.5 text-[9px] ml-3.5 text-muted-foreground">
                        Your comment contains content that might need moderator approval before being displayed to all users.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
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
            <motion.div 
              key={comment.id} 
              className="space-y-1.5"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            >
              <Card className={cn(
                "shadow-sm hover:shadow-md transition-all border-border/30 overflow-hidden",
                comment.metadata.moderated ? "border-amber-500/30" : "hover:border-primary/30"
              )}>
                {/* Comment header - ultra compact */}
                <div className="px-2.5 py-1 flex items-center justify-between border-b border-border/10 bg-muted/10">
                  <div className="flex items-center">
                    <span className="font-medium text-xs">{comment.metadata.author || "Anonymous"}</span>
                    {repliesByParentId[comment.id]?.length > 0 && (
                      <Badge variant="outline" className="ml-2 text-[9px] px-1 py-0 h-3.5 border-muted-foreground/30">
                        {repliesByParentId[comment.id].length} {repliesByParentId[comment.id].length === 1 ? 'reply' : 'replies'}
                      </Badge>
                    )}
                    {comment.metadata.moderated && (
                      <div className="ml-2 flex items-center text-[9px] text-amber-500">
                        <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                        <span>Moderated</span>
                      </div>
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
                    {parseMentions(comment.content)}
                  </p>
                  
                  {comment.metadata.moderated && (
                    <div className="mb-1.5 px-1.5 py-1 bg-amber-500/10 rounded-sm text-[9px] border border-amber-500/20">
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-2.5 w-2.5" />
                        <span className="font-medium">This comment was automatically moderated</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleUpvote(comment.id)}
                        className="inline-flex items-center text-[10px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ThumbsUp className="h-2.5 w-2.5 mr-0.5" />
                        <span>{comment.metadata.upvotes > 0 ? comment.metadata.upvotes : ''}</span>
                      </button>
                      <button 
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="inline-flex items-center text-[10px] text-muted-foreground hover:text-primary transition-colors ml-2"
                      >
                        <Reply className="h-2.5 w-2.5 mr-0.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                    <div>
                      <button 
                        onClick={() => toast({
                          title: "Comment reported",
                          description: "Thank you for flagging this comment. Our moderators will review it.",
                          variant: "default"
                        })}
                        className="inline-flex items-center text-[9px] text-muted-foreground hover:text-destructive transition-colors group"
                        title="Report this comment"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">Flag</span>
                        <Flag className="h-2.5 w-2.5 group-hover:fill-destructive/10" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Show reply form if replying to this comment */}
              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, x: -10 }}
                    animate={{ opacity: 1, height: "auto", x: 0 }}
                    exit={{ opacity: 0, height: 0, x: -10 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    className="ml-5"
                  >
                    <ReplyForm 
                      commentId={comment.id} 
                      postId={postId}
                      onCancel={() => setReplyingTo(null)}
                      authorToMention={comment.metadata.author}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Replies to this comment */}
              {repliesByParentId[comment.id] && repliesByParentId[comment.id].length > 0 && (
                <div className="ml-5 space-y-1.5">
                  {repliesByParentId[comment.id].map(reply => (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0, x: -5, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
                    >
                      <Card className={cn(
                        "shadow-xs hover:shadow-sm transition-all border-border/30 overflow-hidden",
                        reply.metadata.moderated ? "border-amber-500/30" : "hover:border-primary/20"
                      )}>
                        {/* Reply header - ultra compact */}
                        <div className="px-2 py-0.5 flex items-center justify-between border-b border-border/10 bg-muted/5">
                          <div className="flex items-center">
                            <span className="font-medium text-[10px]">{reply.metadata.author || "Anonymous"}</span>
                            {reply.metadata.moderated && (
                              <div className="ml-2 flex items-center text-[8px] text-amber-500">
                                <AlertCircle className="h-2 w-2 mr-0.5" />
                                <span>Moderated</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[8px] text-muted-foreground flex items-center">
                            <Calendar className="h-2 w-2 mr-0.5" />
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        
                        {/* Reply body - ultra compact */}
                        <div className="px-2 py-1">
                          <p className="text-[10px] text-card-foreground leading-relaxed mb-1">
                            {parseMentions(reply.content)}
                          </p>
                          
                          {reply.metadata.moderated && (
                            <div className="mb-1 px-1 py-0.5 bg-amber-500/10 rounded-sm text-[8px] border border-amber-500/20">
                              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-2 w-2" />
                                <span className="font-medium">This reply was automatically moderated</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-1">
                            <button 
                              onClick={() => handleUpvote(reply.id)}
                              className="inline-flex items-center text-[9px] text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ThumbsUp className="h-2 w-2 mr-0.5" />
                              <span>{reply.metadata.upvotes > 0 ? reply.metadata.upvotes : ''}</span>
                            </button>
                            <button 
                              onClick={() => toast({
                                title: "Reply reported",
                                description: "Thank you for flagging this reply. Our moderators will review it.",
                                variant: "default"
                              })}
                              className="inline-flex items-center text-[8px] text-muted-foreground hover:text-destructive transition-colors group"
                              title="Report this reply"
                            >
                              <Flag className="h-2 w-2 group-hover:fill-destructive/10" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-3">
            <p className="text-xs text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}