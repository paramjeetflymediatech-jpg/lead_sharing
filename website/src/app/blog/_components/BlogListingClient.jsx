"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon, UserIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function BlogListingClient() {
    const [blogs, setBlogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/blogs?page=${page}&limit=6&search=${search}`);
                const data = await res.json();
                setBlogs(data.blogs || []);
                setTotal(data.total || 0);
                setTotalPages(data.totalPages || 1);
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchBlogs();
        }, 300);

        return () => clearTimeout(timer);
    }, [page, search]);

    return (
        <div className="min-h-screen bg-zinc-50 pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="text-left">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-4 tracking-tight">
                            Our <span className="text-[#1149C7]">Blog</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl">
                            Latest news, maintenance tips, and expert advice for your home and trade.
                        </p>
                    </div>

                    {/* Search Bar - Right Top corner */}
                    <div className="relative w-full md:w-80">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset to first page on search
                            }}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Blog Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-[400px] border border-gray-100 shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-lg">No blog posts found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {blogs.map((blog) => (
                            <Link
                                key={blog._id}
                                href={`/blog/${blog.slug}`}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Image Placeholder or Featured Image */}
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {blog.featuredImage ? (
                                        <img
                                            src={blog.featuredImage}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                            <span className="text-blue-200 font-black text-6xl italic">LS</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm text-[#1149C7] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                            Article
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                        <div className="flex items-center gap-1">
                                            <CalendarDaysIcon className="w-4 h-4" />
                                            {new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <UserIcon className="w-4 h-4" />
                                            {blog.author}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1149C7] transition-colors line-clamp-2 break-words">
                                        {blog.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed break-words flex-1">
                                        {blog.excerpt || "Click to read the full article and explore expert tips and advice..."}
                                    </p>
                                    <div className="flex items-center text-[#1149C7] font-bold text-sm mt-auto">
                                        Read More
                                        <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                        <button
                            disabled={page === 1}
                            onClick={() => {
                                setPage(page - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-white hover:border-[#1149C7] hover:text-[#1149C7] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            &larr;
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setPage(i + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${page === i + 1
                                        ? "bg-[#1149C7] text-white shadow-lg shadow-blue-200"
                                        : "text-gray-500 hover:bg-white hover:text-[#1149C7]"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={page === totalPages}
                            onClick={() => {
                                setPage(page + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-white hover:border-[#1149C7] hover:text-[#1149C7] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            &rarr;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
