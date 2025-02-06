import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./button";

interface LikeDislikeProps {
  onLike?: (liked: boolean) => void;
  onDislike?: (disliked: boolean) => void;
}

export function LikeDislike({
  onLike,
  onDislike
}: LikeDislikeProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes] = useState(() => Math.floor(Math.random() * 100));
  const [dislikes] = useState(() => Math.floor(Math.random() * 20));
  const [count, setCount] = useState({ likes, dislikes });

  const handleLike = () => {
    if (disliked) {
      setDisliked(false);
      setCount(prev => ({ ...prev, dislikes: prev.dislikes - 1 }));
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(prev => ({ 
      ...prev, 
      likes: prev.likes + (newLiked ? 1 : -1)
    }));
    onLike?.(newLiked);
  };

  const handleDislike = () => {
    if (liked) {
      setLiked(false);
      setCount(prev => ({ ...prev, likes: prev.likes - 1 }));
    }
    const newDisliked = !disliked;
    setDisliked(newDisliked);
    setCount(prev => ({ 
      ...prev, 
      dislikes: prev.dislikes + (newDisliked ? 1 : -1)
    }));
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
        <span className="ml-2">{count.likes}</span>
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
        <span className="ml-2">{count.dislikes}</span>
        {disliked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 animate-ping rounded-full bg-destructive/50" />
        )}
      </Button>
    </div>
  );
}