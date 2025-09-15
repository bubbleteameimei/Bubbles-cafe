import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Share2 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CommentReactionButtonsProps {
  comment: {
    id: number;
    votes?: { 
      upvotes: number; 
      downvotes: number;
    };
    metadata?: {
      votes?: {
        upvotes: number;
        downvotes: number;
      }
    }
  };
  onUpvote: (commentId: number) => void;
  onDownvote: (commentId: number) => void;
  showLabels?: boolean;
  size?: "sm" | "default";
}

export default function CommentReactionButtons({ 
  comment, 
  onUpvote, 
  onDownvote, 
  showLabels = false,
  size = "default"
}: CommentReactionButtonsProps) {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(
    (comment.votes?.upvotes ?? comment.metadata?.votes?.upvotes ?? 0)
  );
  const [localDownvotes, setLocalDownvotes] = useState(
    (comment.votes?.downvotes ?? comment.metadata?.votes?.downvotes ?? 0)
  );

  const handleUpvote = () => {
    if (isUpvoted) {
      // Cancel upvote
      setLocalUpvotes(prev => Math.max(0, prev - 1));
      setIsUpvoted(false);
    } else {
      // Add upvote
      setLocalUpvotes(prev => prev + 1);
      setIsUpvoted(true);
      
      // If previously downvoted, remove downvote
      if (isDownvoted) {
        setLocalDownvotes(prev => Math.max(0, prev - 1));
        setIsDownvoted(false);
      }
    }
    
    onUpvote(comment.id);
  };
  
  const handleDownvote = () => {
    if (isDownvoted) {
      // Cancel downvote
      setLocalDownvotes(prev => Math.max(0, prev - 1));
      setIsDownvoted(false);
    } else {
      // Add downvote
      setLocalDownvotes(prev => prev + 1);
      setIsDownvoted(true);
      
      // If previously upvoted, remove upvote
      if (isUpvoted) {
        setLocalUpvotes(prev => Math.max(0, prev - 1));
        setIsUpvoted(false);
      }
    }
    
    onDownvote(comment.id);
  };
  
  const handleReport = () => {
    // This could open a modal or navigate to a report form
    console.log("Report comment", comment.id);
    alert("Thank you for flagging this comment. Our moderators will review it.");
  };
  
  const handleShare = () => {
    // Implement share functionality - for now just copy to clipboard
    navigator.clipboard.writeText(window.location.href + `#comment-${comment.id}`);
    alert("Link to comment copied to clipboard!");
  };
  
  const buttonSize = size === "sm" ? "sm" : "default";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  
  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isUpvoted ? "default" : "ghost"}
              size={buttonSize}
              onClick={handleUpvote}
              className={`${isUpvoted ? 'bg-primary/10 hover:bg-primary/20 text-primary' : 'hover:bg-primary/5'} ${textSize} px-2`}
            >
              <ThumbsUp className={`${iconSize} ${isUpvoted ? 'fill-primary/60' : ''} mr-1`} />
              {showLabels ? 'Upvote' : ''} {localUpvotes > 0 ? localUpvotes : ''}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upvote this comment</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isDownvoted ? "default" : "ghost"}
              size={buttonSize}
              onClick={handleDownvote}
              className={`${isDownvoted ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive' : 'hover:bg-destructive/5'} ${textSize} px-2`}
            >
              <ThumbsDown className={`${iconSize} ${isDownvoted ? 'fill-destructive/60' : ''} mr-1`} />
              {showLabels ? 'Downvote' : ''} {localDownvotes > 0 ? localDownvotes : ''}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Downvote this comment</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="ml-auto flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={buttonSize}
                onClick={handleReport}
                className={`${textSize} hover:bg-destructive/5 hover:text-destructive px-2`}
              >
                <Flag className={iconSize} />
                {showLabels ? ' Report' : ''}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Report this comment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={buttonSize}
                onClick={handleShare}
                className={`${textSize} hover:bg-primary/5 px-2`}
              >
                <Share2 className={iconSize} />
                {showLabels ? ' Share' : ''}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this comment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}