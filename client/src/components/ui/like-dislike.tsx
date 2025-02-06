import { useState, useRef } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./button";

interface LikeDislikeProps {
  postId?: number;
  onLike?: (liked: boolean) => void;
  onDislike?: (disliked: boolean) => void;
}

export function LikeDislike({
  postId,
  onLike,
  onDislike
}: LikeDislikeProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const countRef = useRef({
    likes: Math.floor(Math.random() * (100)) + 50,    // 50-150 range
    dislikes: Math.floor(Math.random() * (5)) + 10    // 10-15 range
  });

  const handleLike = () => {
    if (disliked) {
      setDisliked(false);
    }
    const newLiked = !liked;
    setLiked(newLiked);
    onLike?.(newLiked);
  };

  const handleDislike = () => {
    if (liked) {
      setLiked(false);
    }
    const newDisliked = !disliked;
    setDisliked(newDisliked);
    onDislike?.(newDisliked);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant={liked ? "default" : "ghost"}
        size="icon"
        onClick={handleLike}
        className="relative group hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <ThumbsUp className={`h-5 w-5 transition-transform group-hover:scale-110 ${liked ? 'text-primary' : ''}`} />
        <span className="ml-2">{countRef.current.likes + (liked ? 1 : 0)}</span>
        {liked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 animate-ping rounded-full bg-primary/50" />
        )}
      </Button>

      <Button
        variant={disliked ? "default" : "ghost"}
        size="icon"
        onClick={handleDislike}
        className="relative group hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <ThumbsDown className={`h-5 w-5 transition-transform group-hover:scale-110 ${disliked ? 'text-destructive' : ''}`} />
        <span className="ml-2">{countRef.current.dislikes + (disliked ? 1 : 0)}</span>
        {disliked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 animate-ping rounded-full bg-destructive/50" />
        )}
      </Button>
    </div>
  );
}