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
    const [schemaMarkup, setSchemaMarkup] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin/seo/global");
                if (res.ok) {
                    const data = await res.json();
                    setSchemaMarkup(data.schemaMarkup || "");
                } else {
                    toast.error("Failed to load global schema");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error fetching global schema");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/admin/seo/global", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schemaMarkup }),
            });

            if (res.ok) {
                toast.success("Global schema updated successfully");
                router.refresh();
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-zinc-700">
                                Global Schema Markup (JSON-LD)
                            </label>
                            <span className="text-xs text-zinc-400 font-mono">
                                Type: Organization / Website / LocalBusiness
                            </span>
                        </div>
                        <textarea
                            value={schemaMarkup}
                            onChange={(e) => setSchemaMarkup(e.target.value)}
                            rows={20}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm bg-zinc-50"
                            placeholder='{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AllCarePros",
  "url": "https://allcarepros.ca",
  "logo": "https://allcarepros.ca/logo.png"
}'
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                            Tip: You can use tools like the Schema Markup Generator to create this JSON-LD. 
                            Make sure to include the script tags if you are pasting a full block, 
                            but usually only the JSON content is needed depending on how you inject it.
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
