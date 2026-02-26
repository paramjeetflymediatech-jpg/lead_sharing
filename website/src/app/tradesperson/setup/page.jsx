"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function TradespersonSetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        companyName: "",
        phone: "",
        bio: "",
        skills: "",
        categoryId: ""
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoryId) {
            toast.error("Please select a primary category");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/tradesperson/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName: formData.companyName,
                    phone: formData.phone,
                    bio: formData.bio,
                    skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
                    categoryId: parseInt(formData.categoryId)
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Profile setup complete!");
                router.push("/tradesperson");
                router.refresh();
            } else {
                toast.error(data.message || "Failed to setup profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-black w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Complete Your Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Tell us about your business to get started.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                            Company Name
                        </label>
                        <input
                            required
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none"
                            placeholder="e.g. Apex Plumbing Solutions"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                            Primary Category
                        </label>
                        <select
                            required
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none appearance-none"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                            Phone Number
                        </label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none"
                            placeholder="e.g. +91 9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                            Skills (comma separated)
                        </label>
                        <input
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none"
                            placeholder="e.g. Plumbing, Heating, Gas"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                            Bio
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none resize-none"
                            placeholder="Tell customers about your experience..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[#1149C7] hover:bg-[#0d38a0] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Create Business Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
}
