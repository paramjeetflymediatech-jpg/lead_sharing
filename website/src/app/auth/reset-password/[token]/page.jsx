"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: params.token,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.success === false) {
                throw new Error(data.message || "Failed to reset password.");
            }

            toast.success("Password reset successfully!");
            setSubmitted(true);
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err) {
            toast.error(err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-white px-4 dark:bg-[#000000] overflow-hidden">
            <div className="relative z-10 w-full max-w-md">
                <div className="rounded-3xl border border-zinc-100 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50">
                    {!submitted ? (
                        <>
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#155DFC]/10 text-2xl">
                                    🔒
                                </div>
                                <h1 className="text-2xl font-extrabold text-black dark:text-white">
                                    Set New Password
                                </h1>
                                <p className="mt-2 text-sm text-zinc-500">
                                    Enter your new password below.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold uppercase text-zinc-500 ml-1">
                                        New Password
                                    </label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full mt-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-[#155DFC] outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-zinc-500 ml-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full mt-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-[#155DFC] outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-[#155DFC] py-4 text-sm font-bold text-white hover:bg-[#1149c7] disabled:opacity-70 transition-all"
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
                                ✓
                            </div>
                            <h1 className="text-2xl font-extrabold dark:text-white">
                                Password Updated
                            </h1>
                            <p className="mt-3 text-sm text-zinc-500">
                                Your password has been reset successfully.
                            </p>
                            <Link
                                href="/auth/login"
                                className="mt-8 inline-block text-sm font-bold text-[#155DFC]"
                            >
                                Continue to Login →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
