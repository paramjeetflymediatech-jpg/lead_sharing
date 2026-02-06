"use client";

import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';

const RatingForm = ({ jobId, tradespersonId, homeownerId, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (!review.trim()) {
      setError('Please provide a review');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          homeownerId,
          tradespersonId,
          rating,
          review
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Rating submitted successfully!');
        setRating(0);
        setReview('');
        
        if (onRatingSubmitted) {
          onRatingSubmitted(data.profile);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Rate Tradesperson</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-lg font-medium text-gray-700">
              {rating > 0 ? `${rating}.0` : 'Select'}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Review Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this tradesperson..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            maxLength={500}
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {review.length}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !rating || !review.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Rating
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RatingForm;