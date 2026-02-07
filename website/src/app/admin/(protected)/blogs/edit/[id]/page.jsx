
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PhotoIcon, GlobeAltIcon, ShareIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function EditBlogPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        featured_image: "",
        status: "DRAFT",
        author: "Admin",
        tags: "",
        seo_title: "",
        seo_description: "",
        seo_robots: "index, follow",
        canonical_url: "",
        og_title: "",
        og_description: "",
        og_image: "",
        schema_markup: "",
        ga_id: "",
        gtm_id: ""
    });

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await fetch(`/api/admin/blogs/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setFormData({
                        title: data.title || "",
                        slug: data.slug || "",
                        content: data.content || "",
                        excerpt: data.excerpt || "",
                        featured_image: data.featuredImage || "",
                        status: data.status || "DRAFT",
                        author: data.author || "Admin",
                        tags: data.tags || "",
                        seo_title: data.seoTitle || "",
                        seo_description: data.seoDescription || "",
                        seo_robots: data.seoRobots || "index, follow",
                        canonical_url: data.canonicalUrl || "",
                        og_title: data.ogTitle || "",
                        og_description: data.ogDescription || "",
                        og_image: data.ogImage || "",
                        schema_markup: data.schemaMarkup || "",
                        ga_id: data.gaId || "",
                        gtm_id: data.gtmId || ""
                    });
                } else {
                    toast.error("Failed to fetch blog post");
                }
            } catch (error) {
                toast.error("An error occurred fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/blogs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Blog post updated successfully! 🎉");
                router.push("/admin/blogs");
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to update blog post");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: "basic", name: "Basic Content", icon: PhotoIcon },
        { id: "seo", name: "Search SEO", icon: GlobeAltIcon },
        { id: "social", name: "Social (OG)", icon: ShareIcon },
        { id: "advanced", name: "Advanced", icon: CodeBracketIcon }
    ];

    if (loading) return <div className="p-10 text-center animate-pulse text-gray-400">Loading blog data...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
                        <p className="text-gray-500 text-sm">Update your blog article and SEO</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 bg-white rounded-t-xl overflow-hidden shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? "text-[#1149C7] border-b-2 border-[#1149C7] bg-blue-50/30"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-8 rounded-b-xl border-x border-b border-gray-100 shadow-sm min-h-[500px]">
                    {/* Basic Content Tab */}
                    {activeTab === "basic" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Title <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Slug <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Content <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    name="content"
                                    rows="12"
                                    value={formData.content}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Excerpt</label>
                                <textarea
                                    name="excerpt"
                                    rows="3"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Featured Image URL</label>
                                    <input
                                        type="text"
                                        name="featured_image"
                                        value={formData.featured_image}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">Published</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Author</label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* SEO Tab */}
                    {activeTab === "seo" && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Search Engine Optimization</h3>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Page Title</label>
                                <input
                                    type="text"
                                    name="seo_title"
                                    value={formData.seo_title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Meta Description</label>
                                <textarea
                                    name="seo_description"
                                    rows="4"
                                    value={formData.seo_description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Meta Robots</label>
                                    <input
                                        type="text"
                                        name="seo_robots"
                                        value={formData.seo_robots}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Canonical URL</label>
                                    <input
                                        type="text"
                                        name="canonical_url"
                                        value={formData.canonical_url}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Tab */}
                    {activeTab === "social" && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Open Graph (Social Media)</h3>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">OG Title</label>
                                <input
                                    type="text"
                                    name="og_title"
                                    value={formData.og_title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">OG Description</label>
                                <textarea
                                    name="og_description"
                                    rows="4"
                                    value={formData.og_description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">OG Image URL</label>
                                <input
                                    type="text"
                                    name="og_image"
                                    value={formData.og_image}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Advanced Tab */}
                    {activeTab === "advanced" && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Advanced / Technical</h3>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Schema Markup (JSON-LD)</label>
                                <textarea
                                    name="schema_markup"
                                    rows="10"
                                    value={formData.schema_markup}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all font-mono text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">GA ID</label>
                                    <input
                                        type="text"
                                        name="ga_id"
                                        value={formData.ga_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">GTM ID</label>
                                    <input
                                        type="text"
                                        name="gtm_id"
                                        value={formData.gtm_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-4 pb-12">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#1149C7] text-white px-10 py-3 rounded-lg font-bold hover:bg-[#0d38a0] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                    >
                        {saving ? "Saving Changes..." : "Save Blog"}
                    </button>
                </div>
            </form>
        </div>
    );
}
