"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ForgotPasswordForm() {
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

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to send reset link.");
      }

      toast.success("Password reset link sent to your email!");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-white px-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-zinc-100 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#155DFC]/10 text-2xl">🔑</div>
                <h1 className="text-2xl font-extrabold text-black">Reset Password</h1>
                <p className="mt-2 text-sm text-zinc-500">Enter your email and we'll send you a recovery link.</p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full mt-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-[#155DFC] outline-none"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#155DFC] py-4 text-sm font-bold text-white hover:bg-[#1149c7] disabled:opacity-70 transition-all"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
              <h1 className="text-2xl font-extrabold">Check your email</h1>
              <p className="mt-3 text-sm text-zinc-500">Reset link sent to <span className="font-bold text-black">{email}</span></p>
              <button onClick={() => setSubmitted(false)} className="mt-8 text-sm font-bold text-[#155DFC]">Try another email</button>
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-black">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
