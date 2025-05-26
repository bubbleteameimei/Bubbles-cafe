import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createCSRFRequest } from "@/lib/csrf-token";

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
        
        // Get request with proper headers - no need for CSRF token for GET requests
        const headers = new Headers();
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Pragma', 'no-cache');
        
        const response = await fetch(`/api/posts/${postId}/reactions?t=${timestamp}`, {
          headers,
          credentials: 'include' // Include cookies for session identification
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
      
      // Use CSRF request helper to ensure token is included
      const requestOptions = createCSRFRequest('POST', { isLike });
      
      // Add cache control headers without overriding existing headers
      const headers = new Headers(requestOptions.headers || {});
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      
      console.log(`[LikeDislike] Request headers for post ${postId}:`, 
        Array.from(headers.entries()));
      
      // Log the actual URL and request details before making the request
      const apiUrl = `/api/no-csrf/posts/${postId}/reaction?t=${timestamp}`;
      console.log(`[LikeDislike] Sending POST request to: ${apiUrl}`);
      console.log(`[LikeDislike] Request body:`, { isLike });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ isLike })
      });
      
      // Log response status for debugging
      console.log(`[LikeDislike] Response status: ${response.status}`);
      
      // If there's an error, try to log the response text
      if (!response.ok) {
        try {
          const errorText = await response.text();
          console.error(`[LikeDislike] Error response: ${errorText}`);
          // Return a cloned response since we consumed the body
          return new Response(errorText, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        } catch (e) {
          console.error(`[LikeDislike] Failed to read error response:`, e);
        }
      }
      
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
    const wasDisliked = disliked;
    
    try {
      // Calculate expected count changes with mathematical reasoning
      let expectedLikes = stats.likesCount;
      let expectedDislikes = stats.dislikesCount;
      
      if (newLiked) {
        // Adding a like
        expectedLikes += 1;
        if (wasDisliked) {
          // Switching from dislike to like
          expectedDislikes -= 1;
        }
      } else {
        // Removing a like
        expectedLikes -= 1;
      }
      
      // Update UI state immediately with calculated values
      setLiked(newLiked);
      if (newLiked && disliked) {
        setDisliked(false);
      }
      
      // Update stats immediately with mathematical logic
      setStats({
        likesCount: Math.max(0, expectedLikes),
        dislikesCount: Math.max(0, expectedDislikes)
      });
      
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
      if (wasDisliked) {
        setDisliked(true);
      }
      // Revert stats to original values
      setStats(stats);
    }
  };

  const handleDislike = async () => {
    const newDisliked = !disliked;
    const wasLiked = liked;
    
    try {
      // Calculate expected count changes with mathematical reasoning
      let expectedLikes = stats.likesCount;
      let expectedDislikes = stats.dislikesCount;
      
      if (newDisliked) {
        // Adding a dislike
        expectedDislikes += 1;
        if (wasLiked) {
          // Switching from like to dislike
          expectedLikes -= 1;
        }
      } else {
        // Removing a dislike
        expectedDislikes -= 1;
      }
      
      // Update UI state immediately with calculated values
      setDisliked(newDisliked);
      if (newDisliked && liked) {
        setLiked(false);
      }
      
      // Update stats immediately with mathematical logic
      setStats({
        likesCount: Math.max(0, expectedLikes),
        dislikesCount: Math.max(0, expectedDislikes)
      });
      
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
      if (wasLiked) {
        setLiked(true);
      }
      // Revert stats to original values
      setStats(stats);
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
        {/* Like Button - Enhanced design */}
        <button 
          type="button" 
          onClick={handleLike}
          className={cn(
            "inline-flex items-center justify-center gap-x-2 font-semibold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none",
            // Base styling with improved shadows and gradients
            "bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 text-gray-700 shadow-lg hover:shadow-xl",
            "dark:from-neutral-800 dark:to-neutral-900 dark:border-neutral-600 dark:text-white dark:hover:from-neutral-700 dark:hover:to-neutral-800",
            // Size variants with better proportions
            variant === 'reader' ? (
              size === 'lg' ? "py-4 px-6 text-lg min-w-[120px]" : 
              size === 'md' ? "py-3 px-5 text-base min-w-[100px]" : 
              "py-2 px-4 text-sm min-w-[80px]"
            ) : (
              size === 'lg' ? "py-2.5 px-4 text-base h-10" :
              size === 'md' ? "py-2 px-3 text-sm h-9" :
              "py-1.5 px-2.5 text-xs h-8"
            ),
            // Active state styling
            liked && "border-emerald-400 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 shadow-emerald-200/50",
            liked && "dark:border-emerald-500 dark:from-emerald-900/30 dark:to-emerald-800/30 dark:text-emerald-400 dark:shadow-emerald-900/50",
            // Hover effects
            "hover:border-emerald-300 hover:from-emerald-50 hover:to-emerald-100",
            "dark:hover:border-emerald-500 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20"
          )}
        >
          <svg 
            className={cn(
              "shrink-0 transition-all duration-300",
              variant === 'reader' ? (
                size === 'lg' ? "w-6 h-6" : 
                size === 'md' ? "w-5 h-5" : 
                "w-4 h-4"
              ) : "w-4 h-4",
              liked && "scale-110"
            )}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M7 10v12"></path>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
          </svg>
          <span className="font-bold tabular-nums">
            {isLoading ? '...' : stats.likesCount}
          </span>
        </button>

        {/* Dislike Button - Enhanced design */}
        <button 
          type="button" 
          onClick={handleDislike}
          className={cn(
            "inline-flex items-center justify-center gap-x-2 font-semibold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none",
            // Base styling with improved shadows and gradients
            "bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 text-gray-700 shadow-lg hover:shadow-xl",
            "dark:from-neutral-800 dark:to-neutral-900 dark:border-neutral-600 dark:text-white dark:hover:from-neutral-700 dark:hover:to-neutral-800",
            // Size variants with better proportions
            variant === 'reader' ? (
              size === 'lg' ? "py-4 px-6 text-lg min-w-[120px]" : 
              size === 'md' ? "py-3 px-5 text-base min-w-[100px]" : 
              "py-2 px-4 text-sm min-w-[80px]"
            ) : (
              size === 'lg' ? "py-2.5 px-4 text-base h-10" :
              size === 'md' ? "py-2 px-3 text-sm h-9" :
              "py-1.5 px-2.5 text-xs h-8"
            ),
            // Active state styling
            disliked && "border-red-400 bg-gradient-to-r from-red-50 to-red-100 text-red-700 shadow-red-200/50",
            disliked && "dark:border-red-500 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-400 dark:shadow-red-900/50",
            // Hover effects
            "hover:border-red-300 hover:from-red-50 hover:to-red-100",
            "dark:hover:border-red-500 dark:hover:from-red-900/20 dark:hover:to-red-800/20"
          )}
        >
          <svg 
            className={cn(
              "shrink-0 transition-all duration-300",
              variant === 'reader' ? (
                size === 'lg' ? "w-6 h-6" : 
                size === 'md' ? "w-5 h-5" : 
                "w-4 h-4"
              ) : "w-4 h-4",
              disliked && "scale-110"
            )}
            xmlns="http://www.w3.org/2000/svg"  
            viewBox="0 0 24 24" 
            fill={disliked ? "currentColor" : "none"}
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M17 14V2"></path>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
          </svg>
          <span className="font-bold tabular-nums">
            {isLoading ? '...' : stats.dislikesCount}
          </span>
        </button>
      </div>
    </div>
  );
}