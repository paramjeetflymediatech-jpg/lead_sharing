"use client";

import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { formatDistanceToNow } from "date-fns";

export default function RatingDisplay({ tradespersonId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [tradespersonId]);

  const fetchRatings = async () => {
    try {
      const res = await fetch(`/api/ratings/${tradespersonId}`);
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading ratings...</div>;
  }

  if (!data || data.totalRatings === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No ratings yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{data.average}</div>
            <StarRating rating={Math.round(data.average)} readonly size={20} />
            <div className="text-sm text-gray-500 mt-1">
              {data.totalRatings} {data.totalRatings === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.stats.distribution[star] || 0;
              const percentage = data.totalRatings > 0 
                ? (count / data.totalRatings) * 100 
                : 0;

              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Reviews</h3>
        {data.ratings.map((rating) => (
          <div key={rating.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between mb-2">
              <StarRating rating={rating.rating} readonly size={16} />
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
              </span>
            </div>
            {rating.review && (
              <p className="text-gray-700 mt-2">{rating.review}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}