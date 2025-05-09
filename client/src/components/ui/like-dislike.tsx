import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface LikeDislikeProps {
  postId: number;
  userLikeStatus?: 'like' | 'dislike' | null;
  onLike?: (liked: boolean) => void;
  onDislike?: (disliked: boolean) => void;
  onUpdate?: (likes: number, dislikes: number) => void;
  className?: string;
  variant?: 'index' | 'reader';
  size?: 'sm' | 'md' | 'lg';
}

interface ReactionStats {
  likesCount: number;
  dislikesCount: number;
}

// Get the user's interaction status for this post from local storage
const getUserInteraction = (postId: number): { liked: boolean, disliked: boolean } => {
  try {
    const storageKey = `post-interaction-${postId}`;
    const savedInteraction = localStorage.getItem(storageKey);
    
    if (savedInteraction) {
      const parsed = JSON.parse(savedInteraction);
      if (parsed && typeof parsed.liked === 'boolean' && typeof parsed.disliked === 'boolean') {
        return parsed;
      }
    }
    return { liked: false, disliked: false };
  } catch (error) {
    console.error(`[LikeDislike] Error getting user interaction for post ${postId}:`, error);
    return { liked: false, disliked: false };
  }
};

// Save the user's interaction status for this post to local storage
const saveUserInteraction = (postId: number, liked: boolean, disliked: boolean) => {
  try {
    const storageKey = `post-interaction-${postId}`;
    localStorage.setItem(storageKey, JSON.stringify({ liked, disliked }));
  } catch (error) {
    console.error(`[LikeDislike] Error saving user interaction for post ${postId}:`, error);
  }
};

export function LikeDislike({
  postId,
  userLikeStatus = null,
  onLike,
  onDislike,
  onUpdate,
  className,
  variant = 'index',
  size = 'sm'
}: LikeDislikeProps) {
  const { toast } = useToast();
  
  // Get the initial user interaction from localStorage
  const initialInteraction = getUserInteraction(postId);
  
  // Initialize state from local storage or props
  const [liked, setLiked] = useState(userLikeStatus === 'like' || initialInteraction.liked);
  const [disliked, setDisliked] = useState(userLikeStatus === 'dislike' || initialInteraction.disliked);
  const [stats, setStats] = useState<ReactionStats>({ likesCount: 0, dislikesCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the current reaction counts from the server
  useEffect(() => {
    const fetchReactionCounts = async () => {
      // Check if post ID is valid before making the request
      if (!postId || isNaN(Number(postId))) {
        console.warn(`[LikeDislike] Invalid post ID: ${postId}`);
        setStats({ likesCount: 0, dislikesCount: 0 });
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`[LikeDislike] Fetching reaction counts for post ${postId}`);
        
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/posts/${postId}/reactions?t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        // Special handling for 404s - just return 0 counts without error
        if (response.status === 404) {
          console.log(`[LikeDislike] Post ${postId} not found, using zero counts`);
          setStats({ likesCount: 0, dislikesCount: 0 });
          setIsLoading(false);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[LikeDislike] Server error: ${response.status}`, errorText);
          throw new Error(`Failed to fetch reaction counts: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[LikeDislike] Received counts for post ${postId}:`, data);
        
        if (typeof data.likesCount === 'number' && typeof data.dislikesCount === 'number') {
          setStats({
            likesCount: data.likesCount,
            dislikesCount: data.dislikesCount
          });
        } else {
          console.error(`[LikeDislike] Invalid data format from server:`, data);
          // Use default zero counts on invalid format
          setStats({ likesCount: 0, dislikesCount: 0 });
        }
      } catch (error) {
        // Don't log as error for 404s since we handle those separately
        if (error instanceof Error && !error.message.includes('404')) {
          console.error(`[LikeDislike] Error fetching reaction counts for post ${postId}:`, error);
        }
        // Use default zero counts on error
        setStats({ likesCount: 0, dislikesCount: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReactionCounts();
  }, [postId]);

  // Handle sending reaction to the server and updating local state
  const sendReaction = async (isLike: boolean | null) => {
    // Check if post ID is valid before making the request
    if (!postId || isNaN(Number(postId))) {
      console.warn(`[LikeDislike] Invalid post ID: ${postId}, cannot send reaction`);
      return false;
    }
    
    try {
      console.log(`[LikeDislike] Sending reaction for post ${postId}:`, isLike);
      
      // Add a timestamp parameter to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/posts/${postId}/reaction?t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ isLike })
      });
      
      // Special handling for 404s
      if (response.status === 404) {
        console.log(`[LikeDislike] Post ${postId} not found, cannot update reaction`);
        // Return false but don't throw an error - this is expected for non-existent posts
        return false;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LikeDislike] Server error: ${response.status}`, errorText);
        throw new Error(`Failed to send reaction: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[LikeDislike] Reaction response for post ${postId}:`, data);
      
      // Update stats with server counts
      if (typeof data.likesCount === 'number' && typeof data.dislikesCount === 'number') {
        setStats({
          likesCount: data.likesCount,
          dislikesCount: data.dislikesCount
        });
        
        // Notify parent component of the update
        onUpdate?.(data.likesCount, data.dislikesCount);
        return true;
      } else {
        console.warn(`[LikeDislike] Invalid data format from server:`, data);
        // Use values from the response if available, otherwise default to 0
        const likesCount = Number(data?.likesCount || 0);
        const dislikesCount = Number(data?.dislikesCount || 0);
        
        setStats({ likesCount, dislikesCount });
        onUpdate?.(likesCount, dislikesCount);
        return true;
      }
    } catch (error) {
      // Don't log as error for 404s since we handle those separately
      if (error instanceof Error && !error.message.includes('404')) {
        console.error(`[LikeDislike] Error sending reaction for post ${postId}:`, error);
      }
      return false;
    }
  };

  const handleLike = async () => {
    const newLiked = !liked;
    
    try {
      // Update UI state immediately for better UX
      setLiked(newLiked);
      if (newLiked && disliked) {
        setDisliked(false);
      }
      
      // Save interaction to localStorage
      saveUserInteraction(postId, newLiked, false);
      
      // Send to server
      const success = await sendReaction(newLiked ? true : null);
      
      if (success && newLiked) {
        toast({
          description: "Thanks for liking! 🥰"
        });
      }
      
      // Call onLike callback
      onLike?.(newLiked);
    } catch (error) {
      console.error(`[LikeDislike] Error handling like for post ${postId}:`, error);
      toast({
        title: "Error updating like",
        description: "Please try again",
        variant: "destructive"
      });
      
      // Revert UI state on error
      setLiked(!newLiked);
      if (disliked) {
        setDisliked(true);
      }
    }
  };

  const handleDislike = async () => {
    const newDisliked = !disliked;
    
    try {
      // Update UI state immediately for better UX
      setDisliked(newDisliked);
      if (newDisliked && liked) {
        setLiked(false);
      }
      
      // Save interaction to localStorage
      saveUserInteraction(postId, false, newDisliked);
      
      // Send to server
      const success = await sendReaction(newDisliked ? false : null);
      
      if (success && newDisliked) {
        toast({
          description: "Thanks for the feedback! 😔"
        });
      }
      
      // Call onDislike callback
      onDislike?.(newDisliked);
    } catch (error) {
      console.error(`[LikeDislike] Error handling dislike for post ${postId}:`, error);
      toast({
        title: "Error updating dislike",
        description: "Please try again",
        variant: "destructive"
      });
      
      // Revert UI state on error
      setDisliked(!newDisliked);
      if (liked) {
        setLiked(true);
      }
    }
  };

  return (
    <div className={cn(
      variant === 'reader' ? "mt-4 flex flex-col items-center gap-y-2" : "flex items-center gap-x-3", 
      className
    )} data-toast-container>
      {variant === 'reader' && (
        <h3 className="text-gray-800 dark:text-white text-lg font-semibold">
          Loved this story? Let me know with a like 🥹—or a dislike if you must 😔
        </h3>
      )}
      <div className={cn(
        "flex items-center",
        variant === 'reader' ? "justify-center gap-x-4" : "gap-x-2"
      )}>
        {/* Like Button - Updated to match design */}
        <button 
          type="button" 
          onClick={handleLike}
          className={cn(
            "inline-flex items-center gap-x-1 font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
            size === 'sm' && "py-1 px-2 text-xs",
            size === 'md' && "py-2 px-3 text-sm",
            size === 'lg' && "py-2.5 px-3.5 text-base",
            liked && "border-primary text-primary dark:border-primary-400 dark:text-primary-400",
            variant !== 'reader' && "h-7 sm:h-8"
          )}
        >
          <svg 
            className={cn(
              "shrink-0",
              size === 'sm' && "w-4 h-4",
              size === 'md' && "w-5 h-5",
              size === 'lg' && "w-6 h-6",
              variant !== 'reader' && "w-3.5 h-3.5"
            )}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M7 10v12"></path>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
          </svg>
          {isLoading ? '...' : stats.likesCount}
        </button>

        {/* Dislike Button - Updated to match design */}
        <button 
          type="button" 
          onClick={handleDislike}
          className={cn(
            "inline-flex items-center gap-x-1 font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
            size === 'sm' && "py-1 px-2 text-xs",
            size === 'md' && "py-2 px-3 text-sm",
            size === 'lg' && "py-2.5 px-3.5 text-base",
            disliked && "border-destructive text-destructive dark:border-destructive dark:text-destructive",
            variant !== 'reader' && "h-7 sm:h-8"
          )}
        >
          <svg 
            className={cn(
              "shrink-0",
              size === 'sm' && "w-4 h-4",
              size === 'md' && "w-5 h-5",
              size === 'lg' && "w-6 h-6",
              variant !== 'reader' && "w-3.5 h-3.5"
            )}
            xmlns="http://www.w3.org/2000/svg"  
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M17 14V2"></path>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
          </svg>
          {isLoading ? '...' : stats.dislikesCount}
        </button>
      </div>
    </div>
  );
}