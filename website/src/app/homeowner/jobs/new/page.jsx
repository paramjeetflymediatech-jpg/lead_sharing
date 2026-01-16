// "use client";

// import { useState } from "react";

// export default function NewJobPage() {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [location, setLocation] = useState("");
//   const [categoryName, setCategoryName] = useState("");
//   const [budgetMin, setBudgetMin] = useState("");
//   const [budgetMax, setBudgetMax] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setLoading(true);

//     const body = {
//       title,
//       description,
//       location,
//       categoryName,
//       budgetMin: budgetMin ? Number(budgetMin) : undefined,
//       budgetMax: budgetMax ? Number(budgetMax) : undefined,
//     };

//     const res = await fetch("/api/jobs", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     const data = await res.json().catch(() => ({}));

//     if (!res.ok) {
//       setError(data.message || "Could not create job");
//     } else {
//       setSuccess("Job posted successfully");
//       setTitle("");
//       setDescription("");
//       setLocation("");
//       setCategoryName("");
//       setBudgetMin("");
//       setBudgetMax("");
//     }

//     setLoading(false);
//   }

//   return (
//     <div className="min-h-screen bg-zinc-50 flex justify-center">
//       <main className="w-full max-w-2xl bg-white border border-zinc-200 shadow-sm mt-10 mb-10 p-6 rounded-lg">
//         <h1 className="text-xl font-semibold mb-4">Post a new job</h1>
//         {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
//         {success && <p className="mb-2 text-sm text-emerald-600">{success}</p>}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <label className="block text-sm font-medium">
//             Job title
//             <input
//               className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//             />
//           </label>

//           <label className="block text-sm font-medium">
//             Describe the job
//             <textarea
//               className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//               rows={4}
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//             />
//           </label>

//           <label className="block text-sm font-medium">
//             Location (town or postcode)
//             <input
//               className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               required
//             />
//           </label>

//           <label className="block text-sm font-medium">
//             Category (e.g. Plumber, Electrician)
//             <input
//               className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//               value={categoryName}
//               onChange={(e) => setCategoryName(e.target.value)}
//               required
//             />
//           </label>

//           <div className="grid grid-cols-2 gap-4">
//             <label className="block text-sm font-medium">
//               Budget min (optional)
//               <input
//                 type="number"
//                 className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//                 value={budgetMin}
//                 onChange={(e) => setBudgetMin(e.target.value)}
//               />
//             </label>
//             <label className="block text-sm font-medium">
//               Budget max (optional)
//               <input
//                 type="number"
//                 className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//                 value={budgetMax}
//                 onChange={(e) => setBudgetMax(e.target.value)}
//               />
//             </label>
//           </div>

//           <div className="flex items-center gap-3 pt-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
//             >
//               {loading ? "Posting..." : "Post job"}
//             </button>
//             <a
//               href="/homeowner"
//               className="text-sm text-zinc-600 hover:text-zinc-900"
//             >
//               Cancel and go back
//             </a>
//           </div>
//         </form>
//       </main>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
  const router = useRouter();
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

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Could not create job");
      }

      setSuccess("Job posted successfully! Redirecting...");
      setTimeout(() => router.push("/homeowner"), 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-zinc-50 py-8 px-4 transition-colors dark:bg-[#000000] sm:py-12">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-[#155DFC] opacity-5 blur-[120px]" />
      
      <main className="relative z-10 mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">
              Post a <span className="text-[#155DFC]">New Job</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Tell us what you need, and we'll find the right pros.
            </p>
          </div>
          <button 
            onClick={() => router.back()}
            className="hidden sm:block text-sm font-bold text-zinc-400 hover:text-black dark:hover:text-white"
          >
            ✕ Close
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#155DFC]">1. General Details</h2>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Job Title
                </label>
                <input
                  required
                  placeholder="e.g. Fix leaking pipe in kitchen"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Description
                </label>
                <textarea
                  required
                  placeholder="Please provide details about the work required..."
                  rows={4}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Logistics */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#155DFC]">2. Location & Type</h2>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Location
                </label>
                <input
                  required
                  placeholder="Town or Postcode"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Category
                </label>
                <input
                  required
                  placeholder="e.g. Plumber"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Budget */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#155DFC]">3. Budget (Optional)</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Min (£)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Max (£)
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-[#155DFC] py-4 text-sm font-bold text-white shadow-xl shadow-[#155DFC]/20 transition-all hover:bg-[#1149c7] active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Posting Job..." : "Post Job Successfully"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/homeowner")}
              className="rounded-2xl border border-zinc-200 bg-white px-8 py-4 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
