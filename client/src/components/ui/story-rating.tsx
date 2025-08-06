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
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRatingChange?.(star)}
          disabled={disabled}
          className={`text-lg ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};