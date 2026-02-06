"use client";

import { Star } from 'lucide-react';

const StarRating = ({ rating, size = "md", editable = false, onChange }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const handleClick = (star) => {
    if (editable && onChange) {
      onChange(star);
    }
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={editable ? "button" : "div"}
          className={editable ? "focus:outline-none" : ""}
          onClick={() => handleClick(star)}
          disabled={!editable}
        >
          <Star
            className={`${sizes[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;