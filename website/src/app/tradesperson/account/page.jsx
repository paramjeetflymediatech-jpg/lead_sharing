"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Cog6ToothIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function AccountPage() {
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Password updated successfully");
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                toast.error(data.message || "Failed to update password");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your login details and account security</p>
                </div>
            </div>

            {/* Password Section */}
            <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[#1149C7]">
                        <ShieldCheckIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security</h2>
                        <p className="text-sm text-gray-500">Update your password and secure your account</p>
                    </div>
                </div>

                <div className="p-8">
                    <form className="space-y-6" onSubmit={handleUpdatePassword}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Current Password</label>
                                <input
                                    type="password"
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[#1149C7] outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">New Password</label>
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[#1149C7] outline-none"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[#1149C7] outline-none"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#1149C7] text-white font-bold py-2.5 px-6 rounded-lg hover:bg-[#0d38a0] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ID Verification Placeholder */}
            <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden opacity-60">
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                            <Cog6ToothIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">ID Verification</h2>
                            <p className="text-sm text-gray-500">Coming soon</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Coming Soon</span>
                </div>
            </div>
        </div>
    );
}
