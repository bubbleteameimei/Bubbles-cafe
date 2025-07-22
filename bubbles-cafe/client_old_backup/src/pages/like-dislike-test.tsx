import { useState, useEffect } from "react";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { initCSRFProtection } from "@/lib/csrf-token";

// Simple test page for like/dislike functionality
export default function LikeDislikeTest() {
  const [postId, setPostId] = useState(1);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  
  // Initialize CSRF protection
  useEffect(() => {
    initCSRFProtection();
  }, []);
  
  // Get the toast function from the hook
  const { toast } = useToast();
  
  // Handle updates from the LikeDislike component
  const handleUpdate = (likesCount: number, dislikesCount: number) => {
    console.log("[Test] Updated counts:", { likesCount, dislikesCount });
    setLikes(likesCount);
    setDislikes(dislikesCount);
    
    toast({
      title: "Reaction counts updated",
      description: `Likes: ${likesCount}, Dislikes: ${dislikesCount}`
    });
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Like/Dislike Test Page</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Testing with Post ID: {postId}</h2>
        
        <div className="flex items-center gap-4 mb-6">
          <label htmlFor="post-id" className="font-medium">Post ID:</label>
          <Input
            id="post-id"
            type="number"
            min="1"
            value={postId}
            onChange={(e) => setPostId(parseInt(e.target.value) || 1)}
            className="w-24"
          />
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
        
        <div className="border p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-3">Current Counts:</h3>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{likes}</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dislikes}</div>
              <div className="text-sm text-muted-foreground">Dislikes</div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Test Like/Dislike Buttons:</h3>
          <LikeDislike 
            postId={postId} 
            onUpdate={handleUpdate}
            variant="reader"
            size="lg"
          />
        </div>
        
        <div className="mt-8 pt-4 border-t">
          <h3 className="text-lg font-medium mb-3">Testing Instructions:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the like button and verify the count increases</li>
            <li>Click it again to remove your like and verify the count decreases</li>
            <li>Try the dislike button and confirm it works similarly</li>
            <li>Change the post ID to test with different posts</li>
            <li>Reload the page to reset the UI state</li>
          </ol>
        </div>
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Debug Information:</h3>
        <p>Check browser console for detailed logs</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => console.log("[Test] Current state:", { postId, likes, dislikes })}
          className="mt-2"
        >
          Log State to Console
        </Button>
      </div>
    </div>
  );
}