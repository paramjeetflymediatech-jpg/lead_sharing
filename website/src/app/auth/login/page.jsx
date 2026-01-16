// "use client";

// import { useState } from "react";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     const res = await fetch("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//     const data = await res.json().catch(() => ({}));

//     if (!res.ok) {
//       setError(data.message || "Login failed");
//       return;
//     }

//     if (data.role === "HOMEOWNER") {
//       window.location.href = "/homeowner";
//     } else if (data.role === "TRADESPERSON") {
//       window.location.href = "/tradesperson";
//     } else {
//       window.location.href = "/";
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
//       >
//         <h1 className="mb-4 text-xl font-semibold">Log in</h1>
//         {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
//         <label className="mb-2 block text-sm font-medium">
//           Email
//           <input
//             type="email"
//             className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </label>
//         <label className="mb-4 block text-sm font-medium">
//           Password
//           <input
//             type="password"
//             className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </label>
//         <button
//           type="submit"
//           className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
//         >
//           Log in
//         </button>
//         <a
//           href="/auth/register"
//           className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
//         >
//           Create an account / 
//         </a>
//           <a
//             href="/"
//             className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
//           >
//           / Back to home
//           </a>
//       </form>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Using router.push for smoother SPA navigation
      if (data.role === "HOMEOWNER") {
        router.push("/homeowner");
      } else if (data.role === "TRADESPERSON") {
        router.push("/tradesperson");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-white px-4 transition-colors dark:bg-[#000000] overflow-hidden">
      
      {/* Background unique UI accents */}
      <div className="absolute top-[10%] left-[10%] h-[250px] w-[250px] rounded-full bg-[#155DFC] opacity-10 blur-[100px]" />
      <div className="absolute bottom-[10%] right-[10%] h-[200px] w-[200px] rounded-full bg-[#155DFC] opacity-5 blur-[80px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">
            Welcome <span className="text-[#155DFC]">Back</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Log in to manage your jobs and quotes.
          </p>
        </div>

        {/* Login Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-100 bg-white/80 p-8 shadow-2xl shadow-[#155DFC]/5 backdrop-blur-xl transition-colors dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                Email Address
              </label>
              <input
                required
                type="email"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Password
                </label>
                <a href="/auth/forgot-password" className="text-[11px] font-bold text-[#155DFC] hover:underline">
                  Forgot?
                </a>
              </div>
              <input
                required
                type="password"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 w-full overflow-hidden rounded-xl bg-[#155DFC] py-4 text-sm font-bold text-white transition-all hover:bg-[#1149c7] active:scale-[0.98] disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Authenticating..." : "Sign In"}
                {!loading && <span className="transition-transform group-hover:translate-x-1">→</span>}
              </span>
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium">
          <p className="text-zinc-500 dark:text-zinc-400">
            Don't have an account?{" "}
            <a href="/auth/register" className="text-[#155DFC] hover:underline underline-offset-4">
              Create one now
            </a>
          </p>
          <a href="/" className="text-zinc-400 transition-colors hover:text-black dark:hover:text-white">
            ← Back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}