"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    GlobeAltIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Pagination from "../../../../components/Pagination";

export default function SeoManagementPage() {
    const [seoPages, setSeoPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchSeoPages();
    }, []);

    // Reset pagination when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchSeoPages = async () => {
        try {
            const res = await fetch("/api/admin/seo");
            if (res.ok) {
                const data = await res.json();
                setSeoPages(data);
            }
        } catch (error) {
            console.error("Error fetching SEO pages:", error);
            toast.error("Failed to load SEO pages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this SEO configuration?")) return;

        try {
            const res = await fetch(`/api/admin/seo/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setSeoPages(seoPages.filter(page => page._id !== id));
                toast.success("SEO page deleted");
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting page");
        }
    };

    const filteredPages = seoPages.filter(page =>
        page.pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Slicing
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPages = filteredPages.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">SEO Management</h1>
                    <p className="text-zinc-500 text-sm">Create and manage SEO meta tags for your pages</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin/seo/global"
                        className="flex items-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <GlobeAltIcon className="w-4 h-4" />
                        Global Schema
                    </Link>
                    <Link
                        href="/admin/seo/create"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add New SEO Page
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search page URL or title..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading SEO configurations...</div>
                ) : filteredPages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No SEO configurations found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Page Name</th>
                                    <th className="px-6 py-4">Page Title</th>
                                    <th className="px-6 py-4">Meta Description</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {currentPages.map((page) => (
                                    <tr key={page._id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-900 flex items-center gap-2">
                                            <GlobeAltIcon className="w-4 h-4 text-zinc-400" />
                                            {page.pageName}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={page.title}>
                                            {page.title}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-zinc-500" title={page.metaDescription}>
                                            {page.metaDescription}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {new Date(page.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/seo/${page._id}`}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(page._id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-zinc-200">Loading SEO configurations...</div>
                ) : filteredPages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-zinc-200">No SEO configurations found.</div>
                ) : (
                    currentPages.map((page) => (
                        <div key={page._id} className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 font-bold text-zinc-900">
                                    <GlobeAltIcon className="w-4 h-4 text-zinc-400" />
                                    {page.pageName}
                                </div>
                                <div className="text-xs text-zinc-400">
                                    {new Date(page.updatedAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="text-sm text-zinc-600 flex flex-col gap-2">
                                <div>
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold block mb-1">Title</span>
                                    <div className="font-medium">{page.title}</div>
                                </div>
                                <div>
                                    <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold block mb-1">Description</span>
                                    {/* <div className="text-xs text-zinc-500">{page.metaDescription}</div> */}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                                <Link
                                    href={`/admin/seo/${page._id}`}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded bg-blue-50/50"
                                    title="Edit"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(page._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded bg-red-50/50"
                                    title="Delete"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalItems={filteredPages.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
