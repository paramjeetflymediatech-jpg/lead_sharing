"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import toast from "react-hot-toast";

const COMMON_PAGES = [
    { label: "Home Page", value: "/" },
    { label: "Login", value: "/auth/login" },
    { label: "Register", value: "/auth/register" },
    { label: "Create Job", value: "/create-job" },
    { label: "Browse Jobs", value: "/jobs" },
    { label: "About Us", value: "/about" },
    { label: "How It Works", value: "/how-it-works" },
    { label: "Help & FAQs", value: "/help" },
    { label: "User Agreement", value: "/user-agreement" },
    { label: "Legal", value: "/legal" },
    { label: "Careers", value: "/careers" },
    { label: "Partners", value: "/partners" },
    { label: "Affiliates", value: "/affiliates" },
    { label: "Testimonials", value: "/testimonials" },
    { label: "Ask a Tradesperson", value: "/ask-a-tradesperson" },
    { label: "Cost Guides", value: "/cost-guides" },
    { label: "Homeowner Advice Centre", value: "/homeowner-advice" },
    { label: "Inspiration Centre", value: "/inspiration" },
    { label: "Trade Advice Centre", value: "/trade-advice" },
    { label: "Trends Report", value: "/trends-report" },
    { label: "Contact Us", value: "/contact" },
    { label: "Privacy Policy", value: "/privacy" },
    { label: "Terms of Service", value: "/terms" },

];

export default function SeoForm({ initialData, isEditing = false }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        pageName: "",
        title: "",
        metaDescription: "",
        metaRobots: "index, follow",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        canonicalUrl: "",
        schemaMarkup: "",
        googleAnalyticsId: "",
        googleTagManagerId: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const url = isEditing
            ? `/api/admin/seo/${initialData._id}`
            : "/api/admin/seo";

        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(isEditing ? "SEO updated successfully" : "SEO page created successfully");
                router.push("/admin/seo");
                router.refresh();
            } else {
                const error = await res.json();
                toast.error(error.error || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save SEO");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/seo" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">
                        {isEditing ? "Edit SEO Page" : "Add New SEO Page"}
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        {isEditing ? "Update meta tags and settings" : "Create and manage SEO meta tags for your pages"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 space-y-6">

                        {/* Page Name */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Page Name <span className="text-red-500">*</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.pageName}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500"
                                />
                            ) : (
                                <div className="space-y-2">
                                    <select
                                        name="pageName"
                                        value={COMMON_PAGES.find(p => p.value === formData.pageName) ? formData.pageName : ""}
                                        onChange={(e) => {
                                            if (e.target.value) handleChange(e);
                                        }}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Select a page...</option>
                                        {COMMON_PAGES.map(page => (
                                            <option key={page.value} value={page.value}>
                                                {page.label} ({page.value})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        name="pageName"
                                        placeholder="Or enter custom path (e.g., /my-page)"
                                        value={formData.pageName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        required
                                    />
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                                        <p className="text-xs text-blue-700 font-medium mb-1">Dynamic Path Support:</p>
                                        <p className="text-xs text-blue-600 leading-relaxed">
                                            You can use dynamic patterns like <code className="bg-blue-100 px-1 rounded">/local-tradespeople/[location]</code>. 
                                            The <code className="bg-blue-100 px-1 rounded">[location]</code> placeholder will be automatically replaced in your titles and descriptions.
                                        </p>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1">Select the page or enter a pattern to configure SEO for.</p>
                                </div>
                            )}
                        </div>

                        {/* Meta Robots */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Meta Robots
                            </label>
                            <select
                                name="metaRobots"
                                value={formData.metaRobots}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            >
                                <option value="index, follow">Index, Follow</option>
                                <option value="noindex, follow">Noindex, Follow</option>
                                <option value="index, nofollow">Index, Nofollow</option>
                                <option value="noindex, nofollow">Noindex, Nofollow</option>
                            </select>
                        </div>

                        {/* Page Title */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-zinc-700">
                                    Page Title <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-xs ${formData.title.length > 60 ? 'text-orange-500' : 'text-zinc-500'}`}>
                                    {formData.title.length} / 60
                                </span>
                            </div>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="Recommended: 50–60 characters"
                                required
                            />
                        </div>

                        {/* Meta Description */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-zinc-700">
                                    Meta Description <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-xs ${formData.metaDescription.length > 160 ? 'text-orange-500' : 'text-zinc-500'}`}>
                                    {formData.metaDescription.length} / 160
                                </span>
                            </div>
                            <textarea
                                name="metaDescription"
                                rows={3}
                                value={formData.metaDescription}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="Recommended: 150–160 characters"
                                required
                            />
                        </div>

                        {/* OG Tags */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Open Graph (Social Sharing)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">OG Title</label>
                                    <input
                                        type="text"
                                        name="ogTitle"
                                        value={formData.ogTitle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">OG Image URL</label>
                                    <input
                                        type="text"
                                        name="ogImage"
                                        value={formData.ogImage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">OG Description</label>
                                    <textarea
                                        name="ogDescription"
                                        rows={2}
                                        value={formData.ogDescription}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Advanced */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Advanced Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Canonical URL</label>
                                    <input
                                        type="text"
                                        name="canonicalUrl"
                                        value={formData.canonicalUrl}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Schema Markup (JSON-LD)</label>
                                    <textarea
                                        name="schemaMarkup"
                                        rows={4}
                                        value={formData.schemaMarkup}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm"
                                        placeholder='{ "@context": "https://schema.org", ... }'
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">Provide valid JSON-LD structure.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Google Analytics ID</label>
                                        <input
                                            type="text"
                                            name="googleAnalyticsId"
                                            value={formData.googleAnalyticsId}
                                            onChange={handleChange}
                                            placeholder="G-XXXXXXXXXX"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Google Tag Manager ID</label>
                                        <input
                                            type="text"
                                            name="googleTagManagerId"
                                            value={formData.googleTagManagerId}
                                            onChange={handleChange}
                                            placeholder="GTM-XXXXXXX"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save SEO"}
                            </button>
                            <Link
                                href="/admin/seo"
                                className="px-6 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 sticky top-6">
                        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Google Search Preview</h3>
                        <div className="mb-6">
                            <div className="font-sans">
                                <div className="group cursor-pointer">
                                    <div className="text-sm text-[#202124] mb-1 flex items-center gap-2">
                                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-400">
                                            L
                                        </div>
                                        <div>
                                            <div className="text-[#202124] text-sm">AllCarePros</div>
                                            <div className="text-[#5f6368] text-xs">https://leadsharing.com{formData.pageName || '/page'}</div>
                                        </div>
                                    </div>
                                    <div className="text-[#1a0dab] text-xl font-medium truncate hover:underline mb-1">
                                        {formData.title || "Your Page Title"}
                                    </div>
                                </div>
                                <div className="text-[#545454] text-sm leading-6 line-clamp-2">
                                    {formData.metaDescription || "Your meta description will appear here..."}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Social Share Preview</h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                {formData.ogImage ? (
                                    <img
                                        src={formData.ogImage}
                                        alt="Preview"
                                        className="w-full h-48 object-cover"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/600x315?text=No+Image'}
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className="p-3 bg-white">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">
                                        LEADSHARING.COM
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 mb-1 truncate">
                                        {formData.ogTitle || formData.title || "Page Title"}
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-2">
                                        {formData.ogDescription || formData.metaDescription || "Description..."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
