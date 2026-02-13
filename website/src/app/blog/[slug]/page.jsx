
import { Blog } from "@/models/Blog";
import Link from "next/link";
import { ArrowLeftIcon, CalendarDaysIcon, UserIcon, TagIcon } from "@heroicons/react/24/outline";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const blog = await Blog.findOne({ slug, status: 'PUBLISHED' });

    if (!blog) return { title: "Blog Not Found | Leadsharing" };

    return {
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt,
        robots: blog.seoRobots || "index, follow",
        alternates: {
            canonical: blog.canonicalUrl || `https://leadsharing.ca/blog/${blog.slug}`,
        },
        openGraph: {
            title: blog.ogTitle || blog.seoTitle || blog.title,
            description: blog.ogDescription || blog.seoDescription || blog.excerpt,
            images: blog.ogImage || blog.featuredImage ? [{ url: blog.ogImage || blog.featuredImage }] : [],
            type: 'article',
            publishedTime: blog.createdAt,
            authors: [blog.author],
        },
    };
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const blog = await Blog.findOne({ slug, status: 'PUBLISHED' });

    if (!blog) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
                <div className="text-center">
                    <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Oops! This blog post has vanished into the attic.</p>
                    <Link href="/blog" className="text-[#1149C7] font-bold hover:underline">
                        &larr; Back to all blogs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* JSON-LD Schema Markup */}
            {blog.schemaMarkup && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: blog.schemaMarkup }}
                />
            )}

            {/* Tracking IDs */}
            {blog.gaId && (
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${blog.gaId}`}></script>
            )}
            {blog.gaId && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${blog.gaId}');
                    `}}
                />
            )}

            {/* Hero Section */}
            <div className="bg-zinc-50 border-b border-gray-100 mb-12">
                <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
                    <Link href="/blog" className="inline-flex items-center text-sm font-medium text-[#1149C7] hover:underline mb-8 group">
                        <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Blog
                    </Link>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-8 break-words">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-[#1149C7] flex items-center justify-center text-white font-bold">
                                {blog.author?.[0] || 'A'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{blog.author}</p>
                                <p className="text-xs">Author</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                            <span>{new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        {blog.tags && (
                            <div className="flex items-center gap-2">
                                <TagIcon className="w-5 h-5 text-gray-400" />
                                <div className="flex gap-2">
                                    {blog.tags.split(',').map(tag => (
                                        <span key={tag} className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto px-6">
                {/* Featured Image */}
                {blog.featuredImage && (
                    <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-blue-100 ring-1 ring-gray-100">
                        <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                    </div>
                )}

                {/* Excerpt */}
                {blog.excerpt && (
                    <div className="mb-10 text-xl md:text-2xl text-gray-600 font-medium leading-relaxed italic border-l-4 border-[#1149C7] pl-6 py-2 break-words">
                        {blog.excerpt}
                    </div>
                )}

                {/* Rich Content */}
                <div
                    className="prose prose-lg md:prose-xl prose-zinc max-w-none 
                        prose-headings:font-black prose-headings:text-gray-900 
                        prose-a:text-[#1149C7] prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-2xl prose-img:shadow-lg
                        prose-blockquote:border-[#1149C7] prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
                        break-words"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Footer Actions */}
                <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Share this</p>
                        <div className="flex gap-3">
                            {/* Simple Social Icons could go here */}
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#1149C7] hover:text-white transition-all text-gray-400">f</button>
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#1149C7] hover:text-white transition-all text-gray-400">t</button>
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#1149C7] hover:text-white transition-all text-gray-400">in</button>
                        </div>
                    </div>
                    <Link href="/blog" className="bg-[#1149C7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0d38a0] transition-colors shadow-lg shadow-blue-100">
                        Read more articles
                    </Link>
                </div>
            </div>
        </div>
    );
}
