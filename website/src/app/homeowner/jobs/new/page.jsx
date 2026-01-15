"use client";

import { useState } from "react";

export default function NewJobPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const body = {
      title,
      description,
      location,
      categoryName,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
    };

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.message || "Could not create job");
    } else {
      setSuccess("Job posted successfully");
      setTitle("");
      setDescription("");
      setLocation("");
      setCategoryName("");
      setBudgetMin("");
      setBudgetMax("");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex justify-center">
      <main className="w-full max-w-2xl bg-white border border-zinc-200 shadow-sm mt-10 mb-10 p-6 rounded-lg">
        <h1 className="text-xl font-semibold mb-4">Post a new job</h1>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-2 text-sm text-emerald-600">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Job title
            <input
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Describe the job
            <textarea
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Location (town or postcode)
            <input
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Category (e.g. Plumber, Electrician)
            <input
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium">
              Budget min (optional)
              <input
                type="number"
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Budget max (optional)
              <input
                type="number"
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading ? "Posting..." : "Post job"}
            </button>
            <a
              href="/homeowner"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Cancel and go back
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
