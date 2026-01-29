
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheckIcon, KeyIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid Credentials");
      if (data.role !== "ADMIN") throw new Error("Access Denied: Admin Only");

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#09090b] overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse delay-700" />

      <div className="relative z-10 w-full max-w-[440px] px-6">
        {/* Decorative Header Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-2xl">
              <ShieldCheckIcon className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-3xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Terminal Access
            </h1>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em]">
              Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Admin Email"
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Password Input */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden bg-white py-4 rounded-2xl font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  "Identify & Enter"
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-800/50 text-center">
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
              Encrypted Session: v2.4.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}