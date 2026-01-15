"use client";

import { useState } from "react";

export default function TradespersonJobsList({ jobs }) {
  const [loadingId, setLoadingId] = useState(null);
  const [messageByJob, setMessageByJob] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUnlock(jobId) {
    setError("");
    setSuccess("");
    setLoadingId(jobId);

    const message = messageByJob[jobId] || "I'm interested in your job.";

    const res = await fetch("/api/leads/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, message }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.message || "Could not unlock lead");
    } else {
      setSuccess("Lead unlocked successfully");
    }

    setLoadingId(null);
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="rounded border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
        No open jobs yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(error || success) && (
        <div className="text-sm">
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-emerald-600">{success}</p>}
        </div>
      )}
      {jobs.map((job) => (
        <div
          key={job.id}
          className="rounded border border-zinc-200 bg-white p-4 flex flex-col gap-1"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">{job.title}</h3>
            <span className="text-xs text-zinc-500">
              {job.createdAt ? job.createdAt.slice(0, 10) : ""}
            </span>
          </div>
          <p className="text-sm text-zinc-600 line-clamp-2">{job.description}</p>
          <p className="text-xs text-zinc-500">Location: {job.location}</p>

          <label className="mt-2 text-xs text-zinc-700">
            Message to homeowner
            <textarea
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-xs"
              rows={2}
              value={messageByJob[job.id] || ""}
              onChange={(e) =>
                setMessageByJob((prev) => ({ ...prev, [job.id]: e.target.value }))
              }
            />
          </label>

          <button
            className="mt-2 inline-flex items-center rounded bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            type="button"
            onClick={() => handleUnlock(job.id)}
            disabled={loadingId === job.id}
          >
            {loadingId === job._id ? "Unlocking..." : "Unlock lead"}
          </button>
        </div>
      ))}
    </div>
  );
}
