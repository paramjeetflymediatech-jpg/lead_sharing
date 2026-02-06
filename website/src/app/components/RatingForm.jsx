"use client";

import { useState } from "react";
import StarRating from "./StarRating";

export default function RatingForm({ jobId, tradespersonId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          tradespersonId,
          rating,
          review
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Success
      onSuccess?.();
      setRating(0);
      setReview("");
      
    } catch (err) {
      setError(err.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md">
      <h3 className="text-xl font-bold mb-4">Rate this Tradesperson</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Rating *
          </label>
          <StarRating rating={rating} onRatingChange={setRating} size={32} />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {review.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </button>
      </form>
    </div>
  );
}