"use client";

import { useState, useEffect } from "react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Pagination from "../../../../components/Pagination";

export default function AdminTradespersonRatingsPage() {
  const [tradespeople, setTradespeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTradesperson, setSelectedTradesperson] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAllRatings();
  }, []);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchAllRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tradesperson/ratings", {
        credentials: "include",
        headers: {
          "x-user-role": "ADMIN"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTradespeople(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const roundedRating = Math.round(rating);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= roundedRating ? (
            <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIconOutline key={star} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
          )
        ))}
      </div>
    );
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

  const filteredTradespeople = tradespeople.filter(tp =>
    tp.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tp.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tp.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Slicing
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTradespeople = filteredTradespeople.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading ratings data...</p>
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
            Tradesperson Ratings Management
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            View and manage all tradesperson ratings and reviews
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, tradesperson name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2">Total Tradespeople</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {tradespeople.length}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2">Total Reviews</p>
            <p className="text-3xl font-bold text-blue-600">
              {tradespeople.reduce((sum, tp) => sum + tp.totalRatings, 0)}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2">Average Platform Rating</p>
            <p className="text-3xl font-bold text-yellow-500">
              {tradespeople.length > 0
                ? (tradespeople.reduce((sum, tp) => sum + parseFloat(tp.averageRating || 0), 0) / tradespeople.length).toFixed(1)
                : '0.0'}
              ⭐
            </p>
          </div>
        </div>

        {/* Tradespeople List */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              All Tradespeople ({filteredTradespeople.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-zinc-700">
            {currentTradespeople.length > 0 ? (
              currentTradespeople.map((tp) => (
                <div key={tp.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {tp.companyName || 'No Company Name'}
                        </h3>
                        <div className="flex items-center gap-2">
                          {renderStars(tp.averageRating)}
                          <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                            {tp.averageRating || 0}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">
                        {tp.userName} • {tp.userEmail}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
                        {tp.totalRatings} review{tp.totalRatings !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedTradesperson(selectedTradesperson?.id === tp.id ? null : tp)}
                      className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-sm font-semibold"
                    >
                      {selectedTradesperson?.id === tp.id ? 'Hide Reviews' : 'View Reviews'}
                    </button>
                  </div>

                  {/* Recent Reviews (Expanded) */}
                  {selectedTradesperson?.id === tp.id && tp.recentRatings.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-bold text-gray-700 dark:text-zinc-300 mb-3">
                        Recent Reviews:
                      </h4>
                      {tp.recentRatings.map((review, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-600 dark:text-zinc-400">
                                {review.homeownerName || 'Anonymous'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-zinc-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          {review.review && (
                            <p className="text-sm text-gray-700 dark:text-zinc-300 mb-2">
                              "{review.review}"
                            </p>
                          )}
                          {review.jobDescription && (
                            <p className="text-xs text-gray-500 dark:text-zinc-500">
                              Job: {review.jobDescription}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedTradesperson?.id === tp.id && tp.recentRatings.length === 0 && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl text-center">
                      <p className="text-sm text-gray-500 dark:text-zinc-500">
                        No reviews yet
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No tradespeople found
                </h3>
                <p className="text-gray-600 dark:text-zinc-400">
                  {searchTerm ? 'Try adjusting your search terms' : 'No tradespeople registered yet'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTradespeople.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}