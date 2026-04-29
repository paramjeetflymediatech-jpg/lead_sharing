
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheckIcon, KeyIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 font-sans p-4">
      <div className="w-full max-w-[400px]">
        {/* Main Clean Card */}
        <div className="bg-white border border-zinc-200 p-8 sm:p-10 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          
          {/* Header */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center mb-5 border border-zinc-200 shadow-sm">
              <ShieldCheckIcon className="w-6 h-6 text-zinc-700" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight mb-1">
              Admin Portal
            </h1>
            <p className="text-zinc-500 text-sm">
              Sign in to manage your system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rounded-lg text-center flex items-center justify-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div className="group relative">
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-0.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-200" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    className="w-full bg-white border border-zinc-200 text-zinc-900 pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 text-sm shadow-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group relative">
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-0.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-200" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border border-zinc-200 text-zinc-900 pl-10 pr-10 py-2.5 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 text-sm shadow-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-zinc-900 shadow-sm flex items-center justify-center mt-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}