"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    deviceType: "website",
                    deviceId: "browser"
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }

            toast.success("Welcome back! 🎉");

            switch (data.role) {
                case "HOMEOWNER":
                    window.location.href = "/homeowner";
                    break;
                case "TRADESPERSON":
                    window.location.href = "/tradesperson";
                    break;
                default:
                    window.location.href = "/";
            }
        } catch (err) {
            toast.error(err.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex flex-1 flex-col items-center justify-center px-4 overflow-hidden">
            {/* Background Blur Effects */}
            <div className="absolute top-[10%] left-[10%] h-[250px] w-[250px] rounded-full bg-[#155DFC] opacity-10 blur-[100px]" />
            <div className="absolute bottom-[10%] right-[10%] h-[200px] w-[200px] rounded-full bg-[#155DFC] opacity-5 blur-[80px]" />

            <div className="relative z-10 w-full max-w-md my-10">
                {/* Title */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-black">
                        Welcome <span className="text-[#155DFC]">Back</span>
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Log in to manage your jobs and quotes.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-zinc-100 bg-white/80 p-8 shadow-2xl shadow-[#155DFC]/5 backdrop-blur-xl transition-colors"
                >
                    <div className="space-y-6">
                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                                Email Address
                            </label>
                            <input
                                required
                                type="email"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Password
                                </label>
                                <a
                                    href="/auth/forgot-password"
                                    className="text-[11px] font-bold text-[#155DFC] hover:underline"
                                >
                                    Forgot?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative mt-2 w-full overflow-hidden rounded-xl bg-[#155DFC] py-4 text-sm font-bold text-white transition-all hover:bg-[#1149c7] active:scale-[0.98] disabled:opacity-70"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? "Authenticating..." : "Sign In"}
                                {!loading && (
                                    <span className="transition-transform group-hover:translate-x-1">
                                        →
                                    </span>
                                )}
                            </span>
                        </button>
                    </div>
                </form>

                {/* Links */}
                <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium">
                    <p className="text-zinc-500">
                        Don't have an account?{" "}
                        <a
                            href="/auth/register"
                            className="text-[#155DFC] hover:underline underline-offset-4"
                        >
                            Create one now
                        </a>
                    </p>
                    <a
                        href="/"
                        className="text-zinc-400 transition-colors hover:text-black"
                    >
                        ← Back to homepage
                    </a>
                </div>
            </div>
        </main>
    );
}
