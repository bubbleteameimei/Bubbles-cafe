import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./button";

interface LikeDislikeProps {
  initialLikes?: number;
  initialDislikes?: number;
  onLike?: (liked: boolean) => void;
  onDislike?: (disliked: boolean) => void;
}

export function LikeDislike({
  initialLikes = Math.floor(Math.random() * 100),
  initialDislikes = Math.floor(Math.random() * 20),
  onLike,
  onDislike
}: LikeDislikeProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);

  const handleLike = () => {
    if (disliked) {
      setDisliked(false);
      setDislikes(prev => prev - 1);
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes(prev => prev + (newLiked ? 1 : -1));
    onLike?.(newLiked);
  };

  const handleDislike = () => {
    if (liked) {
      setLiked(false);
      setLikes(prev => prev - 1);
    }
    const newDisliked = !disliked;
    setDisliked(newDisliked);
    setDislikes(prev => prev + (newDisliked ? 1 : -1));
    onDislike?.(newDisliked);
  };

  return (
    <div className="like-dislike-container flex items-center gap-4 p-4 bg-background/80 backdrop-blur-sm rounded-full">
      <div className="flex items-center">
        <Button
          variant={liked ? "default" : "ghost"}
          size="icon"
          onClick={handleLike}
          className="relative group hover:scale-105 transition-all duration-200"
        >
          <ThumbsUp className={`h-5 w-5 transition-transform group-hover:scale-110 ${liked ? 'text-primary' : ''}`} />
          <span className="ml-2">{likes}</span>
          {liked && (
            <div className="absolute -top-1 -right-1 w-2 h-2 animate-ping rounded-full bg-primary/50" />
          )}
        </Button>
      </div>

      <div className="flex items-center">
        <Button
          variant={disliked ? "default" : "ghost"}
          size="icon"
          onClick={handleDislike}
          className="relative group hover:scale-105 transition-all duration-200"
        >
          <ThumbsDown className={`h-5 w-5 transition-transform group-hover:scale-110 ${disliked ? 'text-destructive' : ''}`} />
          <span className="ml-2">{dislikes}</span>
          {disliked && (
            <div className="absolute -top-1 -right-1 w-2 h-2 animate-ping rounded-full bg-destructive/50" />
          )}
        </Button>
      </div>
    </div>
  );
}