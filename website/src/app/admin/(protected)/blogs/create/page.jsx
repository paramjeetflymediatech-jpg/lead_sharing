
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PhotoIcon, GlobeAltIcon, ShareIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import CKEditorField from "@/app/components/CKEditorField";

export default function CreateBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Auto-generate slug from title
            if (name === "title" && !prev.slug) {
                newData.slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
            }
            // Auto-fill SEO/OG from basic if empty
            if (name === "title" && !prev.seo_title) newData.seo_title = value;
            if (name === "title" && !prev.og_title) newData.og_title = value;
            if (name === "excerpt" && !prev.seo_description) newData.seo_description = value;
            if (name === "excerpt" && !prev.og_description) newData.og_description = value;

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation for editor content
        const cleanContent = formData.content.replace(/<[^>]*>/g, '').trim();
        if (!cleanContent) {
            toast.error("Content is required");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/admin/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Blog post created successfully! 🎉");
                router.push("/admin/blogs");
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to create blog post");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "basic", name: "Basic Content", icon: PhotoIcon },
        { id: "seo", name: "Search SEO", icon: GlobeAltIcon },
        { id: "social", name: "Social (OG)", icon: ShareIcon },
        { id: "advanced", name: "Advanced", icon: CodeBracketIcon }
    ];

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
                        <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
                        <p className="text-gray-500 text-sm">Add a new article to your blog</p>
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
                                        placeholder="e.g., Lead Tips"
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
                                        placeholder="Lead-tips"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Content <span className="text-red-500">*</span></label>
                                <p className="text-xs text-gray-400 mb-2">Supports rich text HTML formatting</p>
                                <CKEditorField
                                    value={formData.content}
                                    onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                                    placeholder="Write your blog content here..."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Excerpt</label>
                                <p className="text-xs text-gray-400 mb-2">Short summary of the blog post</p>
                                <textarea
                                    name="excerpt"
                                    rows="3"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    placeholder="Brief introduction..."
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
                                        placeholder="https://example.com/image.jpg"
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
                                <p className="text-xs text-gray-400 mb-2">tips, guide, lead (comma separated)</p>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="tips, guide, lead"
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
                                <p className="text-xs text-gray-400 mb-2">Recommended: 50-60 characters</p>
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
                                <p className="text-xs text-gray-400 mb-2">Recommended: 150-160 characters</p>
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
                                        placeholder="https://leadsharing.ca/blog/post"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Google Preview */}
                            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 max-w-2xl">
                                <p className="text-xs uppercase font-bold text-gray-400 mb-4 tracking-widest">Google Search Preview</p>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[14px] text-[#202124]">Leadsharing</p>
                                    <p className="text-[14px] text-zinc-500 mb-1 truncate">
                                        https://leadsharing.ca/blog/{formData.slug || "..."}
                                    </p>
                                    <h3 className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer leading-tight truncate">
                                        {formData.seo_title || formData.title || "Your Page Title"}
                                    </h3>
                                    <p className="text-[14px] text-[#4d5156] leading-relaxed line-clamp-2 mt-1">
                                        {formData.seo_description || formData.excerpt || "Your meta description will appear here. It should be descriptive and entice users to click."}
                                    </p>
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
                                <p className="text-xs text-gray-400 mb-2">Defaults to Page Title</p>
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
                                <p className="text-xs text-gray-400 mb-2">Defaults to Meta Description</p>
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
                                    placeholder="https://leadsharing.ca/social-image.jpg"
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
                                    placeholder='{ "@context": "https://schema.org", "@type": "BlogPosting", ... }'
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
                                        placeholder="G-XXXXXXXX"
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
                                        placeholder="GTM-XXXXXX"
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
                        disabled={loading}
                        className="bg-[#1149C7] text-white px-10 py-3 rounded-lg font-bold hover:bg-[#0d38a0] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                    >
                        {loading ? "Creating..." : "Create Blog"}
                    </button>
                </div>
            </form>
        </div>
    );
}
