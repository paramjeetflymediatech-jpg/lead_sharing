"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { StarIcon as StarIconOutline, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function RateJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;

  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserAndJobDetails();
  }, [jobId]);

  const fetchUserAndJobDetails = async () => {
    try {
      setLoading(true);

      // 1. Fetch user first
      const userRes = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (!userRes.ok) {
        toast.error("Please login to continue");
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      const userData = await userRes.json();
      setUser(userData);

      const userId = userData?._id || userData?.id || userData?.user?._id;
      
      if (!userId) {
        toast.error("Please login to continue");
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      // 2. Fetch job details - CHANGED TO NEW ENDPOINT
      const jobRes = await fetch(`/api/jobs/details/${jobId}`, {
        credentials: "include",
        headers: {
          'x-user-id': userId.toString(),
          'x-user-role': 'HOMEOWNER'
        }
      });

      if (!jobRes.ok) {
        const errorData = await jobRes.json();
        toast.error(errorData.message || "Failed to load job");
        router.push('/homeowner/jobs');
        return;
      }

      const jobData = await jobRes.json();
      console.log("Job data:", jobData);
      setJob(jobData);

      // 3. Check if job has a tradesperson hired
      if (!jobData.hiredTradesperson) {
        console.warn("No tradesperson hired for this job");
        toast.error("No tradesperson was hired for this job");
      }

      // 4. Check if already rated
      try {
        const ratingsRes = await fetch(`/api/ratings?jobId=${jobId}`, {
          credentials: "include"
        });
        
        if (ratingsRes.ok) {
          const ratingsData = await ratingsRes.json();
          if (ratingsData.success && ratingsData.rating) {
            toast.error("You have already rated this job");
            setTimeout(() => router.push('/homeowner/jobs'), 2000);
          }
        }
      } catch (error) {
        console.error("Error checking existing ratings:", error);
      }

    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load job details");
      setTimeout(() => router.push('/homeowner/jobs'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!user) {
      toast.error("Please login to submit rating");
      return;
    }

    const userId = user?._id || user?.id || user?.user?._id;
    const userRole = user?.role || user?.user?.role;

    if (userRole !== "HOMEOWNER") {
      toast.error("Only homeowners can submit ratings");
      return;
    }

    // Get tradesperson ID from job
    const tradespersonId = job.hiredTradesperson?._id || job.hiredTradesperson?.id;
    
    if (!tradespersonId) {
      toast.error("Cannot submit rating: No tradesperson was hired for this job.");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Submitting your rating...");

    try {
      const requestBody = {
        jobId: job._id,
        tradespersonId: tradespersonId,
        rating,
        review: review.trim() || null,
        homeownerId: userId
      };

      console.log("Submitting rating:", requestBody);

      const res = await fetch("/api/ratings", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          'x-user-id': userId.toString(),
          'x-user-role': userRole
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok && data.success) {
        toast.success("✅ Rating submitted successfully!");
        setTimeout(() => {
          router.push('/homeowner/jobs');
        }, 1500);
      } else {
        toast.error(data.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.dismiss(loadingToast);
      toast.error("An error occurred while submitting rating");
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating) => {
    const labels = {
      5: "⭐ Excellent!",
      4: "😊 Great!",
      3: "👍 Good",
      2: "😐 Fair",
      1: "😞 Poor"
    };
    return labels[rating] || "";
  };

  const getTradespersonName = () => {
    if (!job?.hiredTradesperson) return 'Unknown Tradesperson';
    return job.hiredTradesperson.companyName || job.hiredTradesperson.name || 'Tradesperson';
  };

  const getJobIdString = () => {
    if (!job?._id) return '';
    return String(job._id).substring(0, 8);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job not found</h2>
          <button
            onClick={() => router.push('/homeowner/jobs')}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const tradespersonName = getTradespersonName();
  const shortJobId = getJobIdString();

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6 font-semibold"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Rate Your Experience
            </h1>
            <p className="text-gray-600 dark:text-zinc-400">
              How was your experience with {tradespersonName}?
            </p>
          </div>

          {/* Warning if no tradesperson */}
          {tradespersonName === 'Unknown Tradesperson' && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ <span className="font-semibold">Note:</span> No specific tradesperson is assigned to this job.
              </p>
            </div>
          )}

          {/* Job Info Card */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-zinc-700 shadow-md">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {tradespersonName[0]?.toUpperCase() || 'T'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {job.subCategory?.name || 'Job'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                  {tradespersonName}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 text-xs font-semibold rounded-full">
                    ✓ {job.status}
                  </span>
                  {job.location?.postcode && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs font-semibold rounded-full">
                      📍 {job.location.postcode}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-600 text-xs font-semibold rounded-full">
                    ID: {shortJobId}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-2xl p-8 border border-gray-200 dark:border-zinc-700 shadow-lg">
            {/* Star Rating */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
                Your Rating *
              </label>
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    disabled={submitting}
                  >
                    {star <= (hoverRating || rating) ? (
                      <StarIconSolid className="h-12 w-12 text-yellow-400" />
                    ) : (
                      <StarIconOutline className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
              {(rating > 0 || hoverRating > 0) && (
                <p className="text-center text-lg font-semibold text-gray-700 dark:text-zinc-300">
                  {getRatingLabel(hoverRating || rating)}
                </p>
              )}
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                Write a Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this job..."
                rows={8}
                className="w-full border border-gray-300 dark:border-zinc-600 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 resize-none"
                maxLength={1000}
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-zinc-500">
                  {review.length}/1000 characters
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/homeowner/jobs')}
                disabled={submitting}
                className="flex-1 px-6 py-4 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <StarIconSolid className="h-5 w-5" />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}