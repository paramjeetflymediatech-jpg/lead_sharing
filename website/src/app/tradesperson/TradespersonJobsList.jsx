"use client";

import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function TradespersonJobsList({ jobs }) {
  const [loadingId, setLoadingId] = useState(null);
  const [messageByJob, setMessageByJob] = useState({});

  async function handleUnlock(jobId) {
    setLoadingId(jobId);

    const message = messageByJob[jobId] || "I'm interested in your job.";

    const loadingToast = toast.loading("Unlocking lead...", {
      position: "top-center",
      style: {
        padding: "16px",
        borderRadius: "10px",
        fontSize: "16px",
      },
    });

    try {
      const res = await fetch("/api/leads/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, message }),
      });

      const data = await res.json().catch(() => ({}));

      toast.dismiss(loadingToast);

      if (!res.ok) {
        toast.error(data.message || "Could not unlock lead", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#EF4444",
            color: "#fff",
            padding: "16px",
            borderRadius: "10px",
            fontSize: "16px",
          },
          icon: "❌",
        });
      } else {
        toast.success("✅ Lead unlocked successfully!", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#fff",
            padding: "16px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
          },
          icon: "🎉",
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Something went wrong. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "10px",
          fontSize: "16px",
        },
        icon: "❌",
      });
    } finally {
      setLoadingId(null);
    }
  }

  const formatBudget = (min, max) => {
    if (!min && !max) return "Budget not specified";
    if (min && max) return `£${min} - £${max}`;
    if (max) return `Up to £${max}`;
    if (min) return `From £${min}`;
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

  const formatJobStage = (stage) => {
    const stageMap = {
      READY_TO_HIRE: "Ready to Hire",
      PLANNING: "Planning",
      INSURANCE: "Insurance Work",
    };
    return stageMap[stage] || stage;
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <div className="mx-auto w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No open jobs available yet</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Check back soon for new opportunities</p>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="space-y-3 p-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900/80"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center rounded-full bg-[#155DFC]/10 px-2.5 py-0.5 text-xs font-bold text-[#155DFC]">
                    {job.category}
                  </span>
                  <span className="text-xs text-zinc-400">•</span>
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {job.subCategory}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {job.category} - {job.subCategory}
                </h3>
              </div>
              <span className="text-xs text-zinc-400 whitespace-nowrap ml-4">
                {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ""}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 mb-4">
              {job.description}
            </p>

            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {job.location.postcode}
                  {job.location.city && `, ${job.location.city}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Budget</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {formatBudget(job.budgetMin, job.budgetMax)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Timeline</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {formatStartTime(job.startTime)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Stage</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {formatJobStage(job.jobStage)}
                </p>
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Message to homeowner
              </label>
              <textarea
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-[#155DFC] focus:border-transparent transition-all resize-none"
                rows={3}
                placeholder="Introduce yourself and explain why you're the best fit for this job..."
                value={messageByJob[job.id] || ""}
                onChange={(e) =>
                  setMessageByJob((prev) => ({ ...prev, [job.id]: e.target.value }))
                }
              />
            </div>

            {/* Action Button */}
            <button
              className="w-full rounded-xl bg-[#155DFC] px-4 py-3 text-sm font-bold text-white hover:bg-[#155DFC]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#155DFC]/20"
              type="button"
              onClick={() => handleUnlock(job.id)}
              disabled={loadingId === job.id}
            >
              {loadingId === job.id ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Unlocking...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Unlock Lead
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}