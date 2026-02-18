"use client";

import { useState } from "react";
import Link from "next/link";

export default function TradespersonJobsList({ jobs, profileId }) {
  const [unlockingJobId, setUnlockingJobId] = useState(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [message, setMessage] = useState("");
  const [priceEstimate, setPriceEstimate] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const showAlert = (message, type = "error") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  const formatBudget = (min, max) => {
    if (!min && !max) return "Budget not specified";
    if (min && max) return `$${min} - $${max}`;
    if (max) return `Up to $${max}`;
    if (min) return `From $${min}`;
    return "Budget not specified";
  };

  const formatStartTime = (startTime) => {
    const timeMap = {
      URGENT: "Urgent",
      WITHIN_2_DAYS: "Within 2 Days",
      WITHIN_2_WEEKS: "Within 2 Weeks",
      WITHIN_2_MONTHS: "Within 2 Months",
      FLEXIBLE: "Flexible",
    };
    return timeMap[startTime] || startTime;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleUnlockClick = (job) => {
    if (job.leadCount >= job.maxLeads) {
      showAlert(`This job already has ${job.leadCount} leads. Maximum ${job.maxLeads} leads allowed.`, "error");
      return;
    }
    setSelectedJob(job);
    setShowUnlockModal(true);
  };

  const handleUnlockLead = async () => {
    if (!selectedJob) return;

    if (!message.trim()) {
      showAlert("Please enter a message for the homeowner", "error");
      return;
    }

    if (!priceEstimate.trim()) {
      showAlert("Please provide a price estimate", "error");
      return;
    }

    setUnlockingJobId(selectedJob.id);

    try {
      const response = await fetch("/api/leads/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          message,
          priceEstimate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("Lead unlocked successfully! Contact details are now available.", "success");
        setShowUnlockModal(false);
        setMessage("");
        setPriceEstimate("");

        // Refresh the page to show updated lead status
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showAlert(data.message || "Failed to unlock lead", "error");
      }
    } catch (error) {
      showAlert("Network error. Please try again.", "error");
    } finally {
      setUnlockingJobId(null);
    }
  };

  const JobCard = ({ job }) => (
    <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-[#155DFC]/10 px-3 py-1 text-xs font-bold text-[#155DFC]">
              {job.category}
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {job.subCategory}
            </span>
          </div>

          {/* Make the job title clickable */}
          <Link href={`/tradesperson/job/${job.id}`}>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 hover:text-[#155DFC] dark:hover:text-[#155DFC] transition-colors cursor-pointer">
              {job.category} - {job.subCategory}
            </h3>
          </Link>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
            {job.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location.postcode} {job.location.city && `, ${job.location.city}`}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatBudget(job.budgetMin, job.budgetMax)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatStartTime(job.startTime)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(job.createdAt)}
            </span>
          </div>

          {/* Add "View Details" link */}
          <div className="mt-3">
            <Link
              href={`/tradesperson/job/${job.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#155DFC] hover:underline"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View full job details
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* Lead Status Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${job.leadCount >= job.maxLeads
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            : job.leadCount > 0
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            }`}>
            {job.leadCount >= job.maxLeads
              ? "Full"
              : `${job.leadCount}/${job.maxLeads} leads`}
          </div>

          {/* Action Button */}
          {job.isUnlockedByMe ? (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Unlocked
              </div>
              <Link
                href={`/tradesperson/job/${job.id}`}
                className="px-3 py-1.5 rounded-lg border border-green-600 text-green-600 text-xs font-bold hover:bg-green-50 transition-all"
              >
                View Contact
              </Link>
            </div>
          ) : job.canUnlock ? (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => handleUnlockClick(job)}
                disabled={unlockingJobId === job.id}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${unlockingJobId === job.id
                  ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                  : "bg-[#155DFC] text-white hover:bg-[#155DFC]/90 shadow-sm"
                  }`}
              >
                {unlockingJobId === job.id ? "Processing..." : "Unlock Lead"}
              </button>
              <Link
                href={`/tradesperson/job/${job.id}`}
                className="text-xs text-[#155DFC] hover:underline"
              >
                View details first
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <button
                disabled
                className="px-4 py-2 rounded-xl bg-zinc-200 text-zinc-500 font-bold text-sm cursor-not-allowed"
              >
                Not Available
              </button>
              <Link
                href={`/tradesperson/job/${job.id}`}
                className="text-xs text-zinc-500 hover:underline"
              >
                View details
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Alert Message */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg ${alert.type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
          }`}>
          <div className="flex items-center gap-2">
            {alert.type === "success" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{alert.message}</span>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden p-4 ">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Unlock Lead Details
              </h3>
              <button
                onClick={() => setShowUnlockModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Job Info */}
            <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-full bg-[#155DFC]/10 px-3 py-1 text-xs font-bold text-[#155DFC]">
                  {selectedJob.category}
                </span>
                <span className="text-xs text-zinc-400">•</span>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {selectedJob.subCategory}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                {selectedJob.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>📍 {selectedJob.location.postcode}</span>
                <span>💰 {formatBudget(selectedJob.budgetMin, selectedJob.budgetMax)}</span>
              </div>
              <div className="mt-3 text-xs text-zinc-400">
                <span className="font-bold">Leads:</span> {selectedJob.leadCount}/{selectedJob.maxLeads}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Your Message to Homeowner *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you're the best fit for this job..."
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#155DFC] focus:border-transparent outline-none"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Price Estimate *
                </label>
                <input
                  type="text"
                  value={priceEstimate}
                  onChange={(e) => setPriceEstimate(e.target.value)}
                  placeholder="e.g., $500-$750 or Fixed price $600"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#155DFC] focus:border-transparent outline-none"
                  required
                />
                <p className="text-xs text-zinc-500 mt-2">
                  This will cost you 1 credit. You'll get homeowner's contact details after unlocking.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlockLead}
                  disabled={!message.trim() || !priceEstimate.trim() || unlockingJobId}
                  className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all ${!message.trim() || !priceEstimate.trim() || unlockingJobId
                    ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                    : "bg-[#155DFC] text-white hover:bg-[#155DFC]/90"
                    }`}
                >
                  {unlockingJobId ? "Processing..." : "Unlock Lead (1 Credit)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {jobs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              No jobs available right now
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Check back later for new job opportunities
            </p>
          </div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </>
  );
}