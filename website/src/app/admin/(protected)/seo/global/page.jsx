"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import toast from "react-hot-toast";

export default function GlobalSeoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        schemaMarkup: "",
        headerScripts: "",
        footerScripts: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin/seo/global");
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        schemaMarkup: data.schemaMarkup || "",
                        headerScripts: data.headerScripts || "",
                        footerScripts: data.footerScripts || ""
                    });
                } else {
                    toast.error("Failed to load global settings");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error fetching global settings");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/admin/seo/global", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Global schema updated successfully");
                router.push("/admin/seo");
            } else {
                const error = await res.json();
                toast.error(error.error || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save global schema");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading global settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/seo" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                        <ArrowLeftIcon className="w-5 h-5 text-zinc-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                            Global SEO Schema
                            <SparklesIcon className="w-6 h-6 text-amber-500" />
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            Injected on all pages of your website (e.g. Organization, Website, LocalBusiness)
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-zinc-700">
                                Global Schema Markup (JSON-LD)
                            </label>
                            <span className="text-xs text-zinc-400 font-mono">
                                Type: Organization / Website
                            </span>
                        </div>
                        <textarea
                            name="schemaMarkup"
                            value={formData.schemaMarkup}
                            onChange={handleChange}
                            rows={8}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm bg-zinc-50"
                            placeholder='{ "@context": "https://schema.org", ... }'
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                            Cleaned of &lt;script&gt; tags automatically for safety.
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-zinc-700">
                                Header Scripts
                            </label>
                            <span className="text-xs text-zinc-400 font-mono">
                                Injected in &lt;head&gt;
                            </span>
                        </div>
                        <textarea
                            name="headerScripts"
                            value={formData.headerScripts}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm bg-zinc-50"
                            placeholder="<!-- Google Tag Manager --> ..."
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                            Useful for Analytics, Pixels, and Verification tags. Include &lt;script&gt; tags.
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-zinc-700">
                                Footer Scripts
                            </label>
                            <span className="text-xs text-zinc-400 font-mono">
                                Injected before &lt;/body&gt;
                            </span>
                        </div>
                        <textarea
                            name="footerScripts"
                            value={formData.footerScripts}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm bg-zinc-50"
                            placeholder="<!-- Chat widgets, etc. --> ..."
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                            Useful for chat widgets, tracking pixels, or non-critical scripts. Include &lt;script&gt; tags.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 font-medium"
                        >
                            {saving ? "Saving..." : "Save Global Schema"}
                        </button>
                        <Link
                            href="/admin/seo"
                            className="px-6 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                        >
                            Back to SEO Management
                        </Link>
                    </div>
                </form>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h3 className="text-blue-800 font-semibold mb-1 flex items-center gap-2 text-sm">
                    How it works
                </h3>
                <p className="text-blue-700 text-sm">
                    The schema you provide here will be automatically added to the head of every page on your website. 
                    This is ideal for site-wide identifiers like your business information, social profiles, and search box functionality.
                </p>
            </div>
        </div>
    );
}
