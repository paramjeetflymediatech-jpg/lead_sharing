"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-white px-4 transition-colors dark:bg-[#000000] overflow-hidden">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-[20%] right-[10%] h-[250px] w-[250px] rounded-full bg-[#155DFC] opacity-10 blur-[100px]" />
      <div className="absolute bottom-[20%] left-[10%] h-[200px] w-[200px] rounded-full bg-[#155DFC] opacity-5 blur-[80px]" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Card Content */}
        <div className="rounded-3xl border border-zinc-100 bg-white/80 p-8 shadow-2xl shadow-[#155DFC]/5 backdrop-blur-xl transition-all dark:border-zinc-800 dark:bg-zinc-900/50">
          
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#155DFC]/10 text-2xl">
                  🔑
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
                  Reset <span className="text-[#155DFC]">Password</span>
                </h1>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Enter your email and we'll send you a recovery link.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-[#155DFC] py-4 text-sm font-bold text-white transition-all hover:bg-[#1149c7] active:scale-[0.98] disabled:opacity-70"
                >
                  <span className="relative z-10">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </span>
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 dark:bg-emerald-900/20">
                check
              </div>
              <h1 className="text-2xl font-extrabold text-black dark:text-white">Check your email</h1>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                We've sent a password recovery link to <br />
                <span className="font-bold text-black dark:text-white">{email}</span>
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-sm font-bold text-[#155DFC] hover:underline"
              >
                Didn't get the email? Try again
              </button>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link 
            href="/auth/login" 
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-black dark:hover:text-white"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}