"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, ShieldAlert, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DataDeletionPage() {
    const [formData, setFormData] = useState({
        email: "",
        reason: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/data-deletion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setSubmitted(true);
                toast.success("Request submitted successfully");
            } else {
                toast.error(data.message || "Failed to submit request");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-4">Request Received</h1>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-8 font-medium">
                    Thank you for your request. An administrator will review your data deletion request within 14 business days. You will receive an email confirmation once the process is complete.
                </p>
                <Link 
                    href="/"
                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all"
                >
                    Return to Homepage
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
            <div className="max-w-2xl mx-auto w-full">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Homepage
                </Link>

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                                <Trash2 size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">Data Deletion Request</h1>
                                <p className="text-gray-500 font-medium mt-1">Submit a request to permanently delete your account and associated data.</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-10 flex gap-4">
                            <div className="text-amber-600 shrink-0 mt-1">
                                <ShieldAlert size={20} />
                            </div>
                            <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                <strong className="font-black uppercase tracking-tighter block mb-1">Important</strong>
                                This action is permanent and cannot be undone. Once processed, all your personal data, job history, and account settings will be permanently removed from our platform.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm text-gray-900 font-medium placeholder:text-gray-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Reason for Deletion</label>
                                <textarea
                                    required
                                    name="reason"
                                    rows={4}
                                    placeholder="Please let us know why you'd like to delete your data..."
                                    value={formData.reason}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm text-gray-900 font-medium placeholder:text-gray-300 min-h-[120px]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Submit Deletion Request <Trash2 size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            © {new Date().getFullYear()} All Care Pros. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
