"use client";

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar } from 'lucide-react';

const TradespersonRating = ({ tradespersonId }) => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRatings();
  }, [tradespersonId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ratings?tradespersonId=${tradespersonId}`);
      const data = await response.json();

      if (data.success) {
        setRatings(data.data);
        setStats(data.stats);
      } else {
        setError('Failed to load ratings');
      }
    } catch (error) {
      setError('Error loading ratings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStarPercentage = (star) => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.distribution[star] / stats.total) * 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Customer Reviews</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {stats?.average_rating || '0.0'}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(parseFloat(stats?.average_rating || 0))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Based on {stats?.total_ratings || 0} reviews
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="col-span-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center mb-2">
                <div className="w-16 text-sm font-medium text-gray-700">
                  {star} star{star !== 1 ? 's' : ''}
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mx-3">
                  <div 
                    className="h-full bg-yellow-400"
                    style={{ width: `${getStarPercentage(star)}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-gray-600">
                  {getStarPercentage(star)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-gray-800">Recent Reviews</h4>
        
        {ratings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No reviews yet. Be the first to review this tradesperson!</p>
          </div>
        ) : (
          ratings.map((rating) => (
            <div key={rating.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < rating.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold text-gray-800">
                    {rating.rating}.0
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(rating.created_at || rating.formatted_date)}
                </div>
              </div>
              
              {rating.review && (
                <p className="text-gray-700 whitespace-pre-line">
                  {rating.review}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradespersonRating;