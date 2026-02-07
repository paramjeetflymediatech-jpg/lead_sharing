"use client";

import { useState, useEffect } from "react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";

export default function TradespersonRatingsPage() {
  const [ratings, setRatings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tradesperson/ratings", {
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);
        setStatistics(data.statistics || null);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIconSolid key={star} className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarIconOutline key={star} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          )
        ))}
      </div>
    );
  };

  const getPercentage = (count, total) => {
    if (total === 0) return 0;
    return ((count / total) * 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Ratings & Reviews
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            See what homeowners are saying about your work
          </p>
        </div>

        {/* Statistics Overview */}
        {statistics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Average Rating Card */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-zinc-700">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2">Average Rating</p>
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {statistics.averageRating}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(statistics.averageRating))}
                </div>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Based on {statistics.totalRatings} review{statistics.totalRatings !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Total Reviews Card */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-zinc-700">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2">Total Reviews</p>
                <div className="text-5xl font-bold text-blue-600 mb-4">
                  {statistics.totalRatings}
                </div>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Customer feedback received
                </p>
              </div>
            </div>

            {/* Rating Distribution Card */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-zinc-700">
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">Rating Distribution</p>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 w-8">
                      {star}★
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all"
                        style={{ 
                          width: `${getPercentage(statistics.distribution[star], statistics.totalRatings)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-zinc-400 w-12 text-right">
                      {statistics.distribution[star]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              All Reviews ({ratings.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-zinc-700">
            {ratings.length > 0 ? (
              ratings.map((review) => (
                <div key={review.id} className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500 dark:text-zinc-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {review.homeownerName || 'Anonymous'}
                      </p>
                      {review.jobCategory && (
                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                          {review.jobCategory}
                        </p>
                      )}
                    </div>
                  </div>

                  {review.review && (
                    <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
                      "{review.review}"
                    </p>
                  )}

                  {review.jobDescription && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mb-1">Job:</p>
                      <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2">
                        {review.jobDescription}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600 dark:text-zinc-400">
                  Complete jobs to start receiving reviews from homeowners
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}