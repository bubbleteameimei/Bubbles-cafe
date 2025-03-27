import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subYears, subMonths } from "date-fns";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown,
  ChevronUp,
  Expand,
  Loader2, 
  MessageSquare, 
  Minimize2,
  Reply, 
  Save,
  Calendar,
  MessageCircle,
  SendHorizontal,
  AlertCircle,
  Check,
  ShieldAlert,
  Flag,
  X,
  Ghost,
  Skull
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  // Support both field names during API transition
  approved?: boolean;
  is_approved?: boolean;
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
  const [content, setContent] = useState(authorToMention ? `@${authorToMention} ` : "");
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get authentication state
  const { user, isAuthenticated } = useAuth();
  
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
      // Use authenticated user's username if available, otherwise use "Anonymous"
      const replyAuthor = isAuthenticated && user ? user.username : "Anonymous";
      
      // Get CSRF token from cookie
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      // Using the endpoint that matches server routes for replies
      const response = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include", // Important for CSRF token
        body: JSON.stringify({
          content: content.trim(),
          author: replyAuthor,
          userId: user?.id || null,
          commentId: commentId,
          parentId: commentId, // Ensure we set the parentId properly
          metadata: {
            author: replyAuthor,
            isAnonymous: !isAuthenticated,
            moderated: false,
            originalContent: content.trim(),
            upvotes: 0,
            downvotes: 0,
            replyCount: 0
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error('Failed to post reply: ' + errorData);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
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
    
    // Only validate content is provided
    if (!content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a message",
        variant: "destructive"
      });
      return;
    }
    
    replyMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="border-l border-primary/30 pl-2 mt-0.5 bg-muted/5 rounded-md overflow-hidden">
      <div className="space-y-0.5 p-1">
        <div className="flex items-center gap-1 mb-0.5">
          <Reply className="h-2.5 w-2.5 text-primary/70" />
          <span className="text-[10px] font-medium">Reply to this comment</span>
        </div>
        
        <div className="flex gap-1">
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
            className="min-h-[35px] text-[10px] bg-background/80 py-1 flex-grow"
            required
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 px-1.5 text-[10px] self-start"
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
            className="h-5 text-[10px] px-1.5 py-0"
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

// Helper to check approval status, handling both field names
const isCommentApproved = (comment: Comment): boolean => {
  // Check both field names due to API transition
  return comment.approved === true || comment.is_approved === true;
};

// Main component
export default function SimpleCommentSection({ postId, title }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [commentToFlag, setCommentToFlag] = useState<number | null>(null);
  const [flaggedComments, setFlaggedComments] = useState<number[]>([]);
  const [collapsedComments, setCollapsedComments] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<'recent' | 'active'>('active');
  const [autoCollapsing, setAutoCollapsing] = useState(false);
  const [autoCollapseTimeoutId, setAutoCollapseTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mainSectionRef = useRef<HTMLDivElement>(null);
  
  // Get authentication state
  const { user, isAuthenticated, isAuthReady } = useAuth();
  
  // Smart moderation preview with review flag
  const { isFlagged, moderated, isUnderReview } = checkModeration(content);
  
  // Handle upvoting comments
  const handleUpvote = async (commentId: number) => {
    if (!commentId) return;
    
    // Get the comment to update
    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment) return;
    
    // Optimistic update (increment locally first)
    queryClient.setQueryData([`/api/posts/${postId}/comments`], (oldData: Comment[] | undefined) => {
      if (!oldData) return [];
      
      return oldData.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            metadata: {
              ...comment.metadata,
              upvotes: (comment.metadata.upvotes || 0) + 1
            }
          };
        }
        return comment;
      });
    });
    
    toast({
      title: "Upvoted",
      description: "Your vote has been counted!",
      variant: "default"
    });
    
    try {
      // Get CSRF token
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      // Update on server
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include",
        body: JSON.stringify({ isUpvote: true })
      });
      
      if (!response.ok) {
        throw new Error("Failed to upvote");
      }
      
      // Refresh data with actual server state
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    } catch (error) {
      console.error("Error upvoting comment:", error);
      toast({
        title: "Error",
        description: "Failed to upvote comment. Please try again.",
        variant: "destructive"
      });
      
      // Rollback optimistic update on error
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    }
  };
  
  // Load previously saved draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(`comment_draft_${postId}`);
    if (savedDraft && savedDraft.trim() !== "") {
      setContent(savedDraft);
      toast({
        title: "Draft restored",
        description: "Your previous comment draft has been restored.",
        variant: "default"
      });
    }
    
    // Set up interval to save draft while typing
    const saveDraftInterval = setInterval(() => {
      if (content.trim() !== "") {
        localStorage.setItem(`comment_draft_${postId}`, content);
      }
    }, 3000); // Save every 3 seconds if there's content
    
    return () => clearInterval(saveDraftInterval);
  }, [postId, content, toast]);
  
  // Setup auto-collapse on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Don't auto-collapse if user has manually collapsed/expanded
      if (collapsedComments.length > 0) return;
      
      if (mainSectionRef.current) {
        const rect = mainSectionRef.current.getBoundingClientRect();
        // If the comment section is scrolled out of view (plus a buffer)
        if (rect.top < -300) {
          if (!autoCollapsing && !autoCollapseTimeoutId) {
            const timeoutId = setTimeout(() => {
              setAutoCollapsing(true);
              toast({
                title: "Comments minimized",
                description: "Comments have been collapsed for a cleaner reading experience.",
                variant: "default"
              });
            }, 1500);
            setAutoCollapseTimeoutId(timeoutId);
          }
        } else {
          // Cancel auto-collapse when scrolling back
          if (autoCollapseTimeoutId) {
            clearTimeout(autoCollapseTimeoutId);
            setAutoCollapseTimeoutId(null);
          }
          setAutoCollapsing(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [autoCollapsing, autoCollapseTimeoutId, collapsedComments.length, toast]);
  
  // Load previously flagged comments from localStorage
  useEffect(() => {
    const storedFlaggedComments = localStorage.getItem('flaggedComments_' + postId);
    if (storedFlaggedComments) {
      try {
        const parsedComments = JSON.parse(storedFlaggedComments);
        if (Array.isArray(parsedComments)) {
          setFlaggedComments(parsedComments);
        }
      } catch (e) {
        console.error('Error parsing flagged comments from localStorage', e);
      }
    }
  }, [postId]);

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
      // Use authenticated user's username if available, otherwise use "Anonymous"
      const commentAuthor = isAuthenticated && user ? user.username : "Anonymous";
      
      // Get CSRF token from cookie
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      // Check if the content needs moderation
      const { isFlagged, isUnderReview } = checkModeration(content);
      
      // Using the correct endpoint format that matches server routes
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include", // Important for CSRF token
        body: JSON.stringify({
          content: content.trim(),
          author: commentAuthor,
          needsModeration: isFlagged || isUnderReview,
          moderationStatus: isFlagged ? 'flagged' : (isUnderReview ? 'under_review' : 'none'),
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error('Failed to post comment: ' + errorData);
      }

      return {
        data: await response.json(),
        moderationStatus: isFlagged ? 'flagged' : (isUnderReview ? 'under_review' : 'none')
      };
    },
    onSuccess: (result) => {
      console.log('Comment posted successfully:', result.data);
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      
      // Clear localStorage draft
      localStorage.removeItem(`comment_draft_${postId}`);
      setContent("");
      
      // Show appropriate toast based on moderation status
      if (result.moderationStatus === 'flagged' || result.moderationStatus === 'under_review') {
        toast({
          title: "Comment under review",
          description: "Your comment contains words that need review by our team. We'll review it shortly.",
          variant: "default",
          duration: 7000
        });
      } else {
        toast({
          title: "Comment posted",
          description: "Thank you for joining the conversation!",
          variant: "default"
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    }
  });


  
  // Handle opening the flag dialog
  const openFlagDialog = (commentId: number) => {
    // Check if comment has already been flagged
    if (flaggedComments.includes(commentId)) {
      toast({
        title: "Already reported",
        description: "You have already reported this comment. Thank you for helping keep our community safe.",
        variant: "default"
      });
      return;
    }
    
    setCommentToFlag(commentId);
    setFlagDialogOpen(true);
  };
  
  // Handle flag confirmation from dialog
  const confirmFlagComment = async () => {
    if (!commentToFlag) return;
    
    try {
      // Get CSRF token from cookie
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      const response = await fetch(`/api/comments/${commentToFlag}/flag`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include",
        body: JSON.stringify({ reason: "inappropriate content" })
      });
      
      if (!response.ok) {
        throw new Error("Failed to flag comment");
      }
      
      // Add comment to flagged list to prevent multiple reports
      setFlaggedComments(prev => [...prev, commentToFlag]);
      
      // Save flagged comments to localStorage to persist between sessions
      localStorage.setItem('flaggedComments_' + postId, JSON.stringify([...flaggedComments, commentToFlag]));
      
      toast({
        title: "Comment reported",
        description: "Thank you for flagging this comment. Our moderators will review it.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFlagDialogOpen(false);
      setCommentToFlag(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate content is provided
    if (!content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a message",
        variant: "destructive"
      });
      return;
    }
    
    // Execute mutation to submit comment
    mutation.mutate();
  };

  // Get root comments and group replies, filtering for approved comments only
  const rootComments = comments
    .filter(comment => comment.parentId === null)
    .filter(comment => isCommentApproved(comment));
  
  const repliesByParentId = comments
    .filter(comment => comment.parentId !== null)
    .filter(comment => isCommentApproved(comment))
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
  
  // Dynamic sorting based on activity and upvotes
  const sortedRootComments = useMemo(() => {
    let sorted = [...rootComments];
    
    if (sortOrder === 'active') {
      // Sort by most active discussions (most replies)
      sorted = sorted.sort((a, b) => {
        const aReplies = repliesByParentId[a.id]?.length || 0;
        const bReplies = repliesByParentId[b.id]?.length || 0;
        return bReplies - aReplies; // Higher reply count first
      });
    } else {
      // Default: sort by recent
      sorted = sorted.sort((a, b) => {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        return bDate.getTime() - aDate.getTime(); // Most recent first
      });
    }
    
    return sorted;
  }, [rootComments, repliesByParentId, sortOrder]);
  
  // Calculate if comment thread is from over a year ago (for chained comments visual)
  const isOldThread = (comment: Comment): boolean => {
    const commentDate = new Date(comment.createdAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return commentDate < oneYearAgo;
  };
  
  // Random eerie messages that appear occasionally in threads
  const unknownMessages = [
    "I've seen what waits in the darkness. It's been watching us all along.",
    "The words hide more than they reveal. Read between the lines.",
    "They come at night when you're alone. Listen for the whispers.",
    "Every story has a hidden truth. Some are better left untold.",
    "Time is just a circle. We've been here before, and we'll be here again.",
    "The shadows aren't empty. They're filled with forgotten memories.",
    "Some readers never leave this place. Their stories continue without them.",
    "I can still hear the voices from the other side of the page.",
    "The author knows more than they're telling. Trust nothing.",
    "What you're reading now is changing you in ways you can't perceive."
  ];
  
  // Function to determine if we should show an unknown message
  const shouldShowUnknownMessage = (): boolean => {
    // Higher chance (75%) for testing; reduce to ~10-15% in production
    return Math.random() < 0.75;
  };
  
  // Get a random unknown message
  const getRandomUnknownMessage = (): string => {
    const randomIndex = Math.floor(Math.random() * unknownMessages.length);
    return unknownMessages[randomIndex];
  };
  
  // Generate random old date for unknown messages
  const getRandomOldDate = (): Date => {
    // Random date between 2-5 years ago
    const yearsAgo = 2 + Math.floor(Math.random() * 3);
    const monthsAgo = Math.floor(Math.random() * 11);
    return subYears(subMonths(new Date(), monthsAgo), yearsAgo);
  };
  

  
  // Handle toggling comment collapse
  const toggleCollapse = (commentId: number) => {
    setCollapsedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId) 
        : [...prev, commentId]
    );
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
    <div className="antialiased mx-auto" ref={mainSectionRef}>
      <div className="border-t border-border/30 pt-4 pb-1.5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-medium">Comments ({rootComments.length})</h3>
          
          {/* Comment controls: sorting and collapse toggle */}
          <div className="flex items-center gap-2">
            <Select 
              value={sortOrder} 
              onValueChange={(value: 'recent' | 'active') => setSortOrder(value)}
            >
              <SelectTrigger className="h-6 text-[10px] w-[95px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent" className="text-xs">Most Recent</SelectItem>
                <SelectItem value="active" className="text-xs">Most Active</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (collapsedComments.length > 0 || autoCollapsing) {
                  // Expand all
                  setCollapsedComments([]);
                  setAutoCollapsing(false);
                } else {
                  // Collapse all
                  setCollapsedComments(rootComments.map(c => c.id));
                }
              }}
              className="h-6 px-1.5 text-[10px]"
            >
              {collapsedComments.length > 0 || autoCollapsing ? (
                <><Expand className="h-3 w-3 mr-1" /> Expand All</>
              ) : (
                <><Minimize2 className="h-3 w-3 mr-1" /> Collapse All</>
              )}
            </Button>
          </div>
        </div>
        {/* Comment form - ultra sleek design */}
        <Card className="mb-2 p-2 shadow-sm bg-gradient-to-b from-card/80 to-card/50 border-border/30 overflow-hidden hover:shadow-md transition-shadow">
          <form onSubmit={handleSubmit} className="space-y-1">
            <div className="grid grid-cols-1 gap-1">
              <motion.div 
                className="flex flex-col"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setContent(e.target.value);
                      if (isFlagged && !previewMode) {
                        setPreviewMode(true);
                      }
                    }}
                    className="h-7 text-xs bg-background/80 min-h-[45px] flex-grow"
                    required
                  />
                  <div className="flex flex-col">
                    <Button 
                      type="submit" 
                      disabled={mutation.isPending}
                      size="sm"
                      className="h-[45px] w-7 ml-1 p-0 flex items-center justify-center"
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
                    initial={{ opacity: 0.9, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-2.5 w-2.5" />
                      <span className="font-medium">Preview with automatic moderation:</span>
                    </div>
                    <p className="mt-0.5 text-xs ml-3.5">{moderated}</p>
                  </motion.div>
                )}
                
                {/* Under review notice */}
                {isUnderReview && !isFlagged && content.trim() !== "" && (
                  <motion.div 
                    className="mt-1 px-1.5 py-1 bg-blue-500/10 rounded-sm text-[9px] border border-blue-500/20"
                    initial={{ opacity: 0.9, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.1 }}
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
            </div>
          </form>
        </Card>
      </div>

      {/* Unknown message from the void - appears randomly */}
      {shouldShowUnknownMessage() && (
        <motion.div 
          className="mb-4 border-l-[3px] border-l-destructive/40 bg-destructive/5 rounded-sm overflow-hidden shadow-md"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Ghost className="h-3.5 w-3.5 text-destructive/70" />
              <span className="text-[10px] font-medium text-destructive/70">Unknown User</span>
              <Badge variant="outline" className="ml-1 text-[8px] px-1 py-0 h-3 border-destructive/30 bg-destructive/5 text-destructive/70">
                lost
              </Badge>
              <span className="text-[8px] text-muted-foreground/60 ml-auto flex items-center">
                <Calendar className="h-2.5 w-2.5 mr-0.5 text-muted-foreground/40" />
                {formatDate(getRandomOldDate())}
              </span>
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed opacity-90">
              "{getRandomUnknownMessage()}"
            </p>
            <div className="flex justify-end mt-1">
              <span className="text-[9px] text-destructive/50 flex items-center">
                <Skull className="h-2.5 w-2.5 mr-0.5" />
                Message from the archive
              </span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Comments list */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ) : sortedRootComments.length > 0 ? (
          sortedRootComments.map(comment => (
            <motion.div 
              key={comment.id} 
              className="space-y-1"
              initial={{ opacity: 0.9, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={cn(
                "shadow-sm hover:shadow-md transition-all border-border/30 overflow-hidden",
                comment.metadata.moderated ? "border-amber-500/30" : "hover:border-primary/30",
                isOldThread(comment) ? "border-l-primary/30 border-l-[3px]" : ""
              )}>
                {/* Comment header - ultra compact and collapsible */}
                <div 
                  className={cn(
                    "px-2.5 py-1 flex items-center justify-between border-b border-border/10 bg-muted/10 cursor-pointer",
                    "hover:bg-muted/20 transition-colors"
                  )}
                  onClick={() => toggleCollapse(comment.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={!collapsedComments.includes(comment.id) && !autoCollapsing}
                >
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
                    {isOldThread(comment) && (
                      <Badge variant="outline" className="ml-2 text-[9px] px-1 py-0 h-3.5 bg-primary/5 text-primary border-primary/20">
                        Resurrected
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-muted-foreground flex items-center">
                      <Calendar className="h-2.5 w-2.5 mr-0.5" />
                      {formatDate(comment.createdAt)}
                    </span>
                    {collapsedComments.includes(comment.id) || autoCollapsing ? 
                      <ChevronDown className="h-3 w-3 text-muted-foreground/70" /> : 
                      <ChevronUp className="h-3 w-3 text-muted-foreground/70" />
                    }
                  </div>
                </div>
                
                {/* Comment body - ultra compact and collapsible */}
                <AnimatePresence>
                  {(!(collapsedComments.includes(comment.id) || autoCollapsing)) && (
                    <motion.div 
                      className="px-2.5 py-1"
                      initial={{ opacity: 0.9, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0.9, height: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <p className="text-xs text-card-foreground leading-relaxed mb-1">
                        {parseMentions(comment.content)}
                      </p>
                      
                      {comment.metadata.moderated && (
                        <div className="mb-1 px-1.5 py-0.5 bg-amber-500/10 rounded-sm text-[9px] border border-amber-500/20">
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-2.5 w-2.5" />
                            <span className="font-medium">This comment was automatically moderated</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering collapse
                              setReplyingTo(replyingTo === comment.id ? null : comment.id);
                            }}
                            className="inline-flex items-center text-[10px] text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Reply className="h-2.5 w-2.5 mr-0.5" />
                            <span>Reply</span>
                          </button>
                        </div>
                        <div>
                          {flaggedComments.includes(comment.id) ? (
                            <span 
                              className="inline-flex items-center text-[9px] text-muted-foreground/70"
                              title="You've reported this comment"
                            >
                              <span className="mr-1 opacity-70">Reported</span>
                              <Flag className="h-2.5 w-2.5 fill-destructive/10 text-destructive/50" />
                            </span>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering collapse
                                openFlagDialog(comment.id);
                              }}
                              className="inline-flex items-center text-[9px] text-muted-foreground hover:text-destructive transition-colors group"
                              title="Report this comment"
                            >
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">Flag</span>
                              <Flag className="h-2.5 w-2.5 group-hover:fill-destructive/10" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
              
              {/* Show reply form if replying to this comment */}
              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.div
                    initial={{ opacity: 0.9, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="ml-4"
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
                <div className="ml-4 space-y-1">
                  {repliesByParentId[comment.id].map(reply => (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0.9, x: -2 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
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
                            <div></div>
                            {flaggedComments.includes(reply.id) ? (
                              <span 
                                className="inline-flex items-center text-[8px] text-muted-foreground/70"
                                title="You've reported this reply"
                              >
                                <Flag className="h-2 w-2 fill-destructive/10 text-destructive/50" />
                              </span>
                            ) : (
                              <button 
                                onClick={() => openFlagDialog(reply.id)}
                                className="inline-flex items-center text-[8px] text-muted-foreground hover:text-destructive transition-colors group"
                                title="Report this reply"
                              >
                                <Flag className="h-2 w-2 group-hover:fill-destructive/10" />
                              </button>
                            )}
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
      
      {/* Confirmation dialog for flagging comments */}
      <AlertDialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <AlertDialogContent className="max-w-[350px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Report this comment?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to report this comment? This will notify our moderation team to review it for inappropriate content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-1.5">
            <AlertDialogCancel className="text-[11px] h-7">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmFlagComment}
              className="text-[11px] h-7 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Flag className="h-3 w-3 mr-1.5" />
              Report Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}