import { NextResponse } from 'next/server';
import { Blog } from '@/models/Blog';
import { authenticateAiGateway } from '@/lib/ai-gateway-auth';

function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

export async function GET(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get('slug');
        const status = url.searchParams.get('status') || 'published';
        const search = url.searchParams.get('search');
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;

        if (slug) {
            const blog = await Blog.findOne({ slug });
            if (!blog) {
                return NextResponse.json({ success: false, message: `Blog with slug '${slug}' not found` }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: blog });
        }

        const query = {};
        if (status && status !== 'all') query.status = status;
        if (search) query.search = search;

        const { blogs, total, totalPages } = await Blog.find(query, { page, limit });

        return NextResponse.json({
            success: true,
            page,
            limit,
            total,
            totalPages,
            data: blogs
        });
    } catch (error) {
        console.error("AI Gateway Blogs GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const body = await request.json();
        let { title, slug, content, excerpt, image, featuredImage, status, author, metaTitle, seoTitle, metaDescription, seoDescription } = body;

        if (!title || !content) {
            return NextResponse.json({ success: false, error: "title and content are required." }, { status: 400 });
        }

        if (!slug) {
            slug = slugify(title);
        }

        const blogData = {
            title,
            slug,
            content,
            excerpt: excerpt || content.replace(/<[^>]*>?/gm, '').substring(0, 160),
            featured_image: featuredImage || image || null,
            status: status || 'published',
            author: author || 'Leadsharing Team',
            seo_title: seoTitle || metaTitle || title,
            seo_description: seoDescription || metaDescription || excerpt,
            ...body
        };

        const existing = await Blog.findOne({ slug });
        let result;

        if (existing) {
            result = await Blog.findByIdAndUpdate(existing._id, blogData);
            return NextResponse.json({
                success: true,
                message: `Updated blog '${title}'`,
                data: result
            });
        } else {
            result = await Blog.create(blogData);
            return NextResponse.json({
                success: true,
                message: `Created blog '${title}'`,
                data: result
            }, { status: 201 });
        }
    } catch (error) {
        console.error("AI Gateway Blogs POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get('slug');
        const id = url.searchParams.get('id');

        let targetId = id;
        if (!targetId && slug) {
            const existing = await Blog.findOne({ slug });
            if (existing) targetId = existing._id;
        }

        if (!targetId) {
            return NextResponse.json({ success: false, error: "Blog not found or slug/id missing." }, { status: 404 });
        }

        await Blog.findByIdAndDelete(targetId);
        return NextResponse.json({ success: true, message: `Blog deleted successfully.` });
    } catch (error) {
        console.error("AI Gateway Blogs DELETE Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
