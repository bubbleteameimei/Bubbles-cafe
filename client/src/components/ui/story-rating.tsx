import React from 'react';

interface StoryRatingProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
}

export const StoryRating: React.FC<StoryRatingProps> = ({ 
  rating = 0, 
  onRatingChange, 
  disabled = false 
}) => {
  return (
    <div className="story-rating">
      <p className="text-sm text-muted-foreground">
        Rating system has been replaced with like/dislike functionality
      </p>
    </div>
  );
};

export default StoryRating;