
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/blogs?page=${page}&search=${search}&status=${statusFilter}`);
            const data = await res.json();
            setBlogs(data.blogs || []);
            setTotal(data.total || 0);
        } catch (error) {
            toast.error("Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [page, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchBlogs();
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return;

        try {
            const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Blog deleted successfully");
                fetchBlogs();
            } else {
                toast.error("Failed to delete blog");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
                    <p className="text-gray-500 text-sm">Manage your website's articles and news.</p>
                </div>
                <Link
                    href="/admin/blogs/create"
                    className="bg-[#1149C7] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#0d38a0] transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create New Blog
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#1149C7] transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <select
                    className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#1149C7] transition-colors min-w-[150px]"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Author</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                </tr>
                            ))
                        ) : blogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No blog posts found.</td>
                            </tr>
                        ) : (
                            blogs.map((blog) => (
                                <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 border-b border-transparent hover:border-[#1149C7] inline-block">
                                            <Link href={`/admin/blogs/edit/${blog._id}`}>{blog.title}</Link>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">/{blog.slug}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {blog.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{blog.author}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/blogs/edit/${blog._id}`}
                                                className="p-2 text-gray-400 hover:text-[#1149C7] hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(blog._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-medium text-gray-900">{blogs.length}</span> of <span className="font-medium text-gray-900">{total}</span> blogs
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={blogs.length < 10 || (page * 10) >= total}
                            onClick={() => setPage(page + 1)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
