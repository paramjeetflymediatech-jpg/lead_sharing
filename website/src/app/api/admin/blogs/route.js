
import { NextResponse } from "next/server";
import { Blog } from "@/models/Blog";

// Admin: GET /api/admin/blogs - Fetch all blogs (paginated)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || 1;
        const limit = searchParams.get("limit") || 10;
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || null;

        const data = await Blog.find({ search, status }, { page, limit });
        return NextResponse.json(data);
    } catch (error) {
        console.error("ADMIN BLOG GET ERROR:", error);
        return NextResponse.json(
            { message: "Failed to fetch blogs" },
            { status: 500 }
        );
    }
}

// Admin: POST /api/admin/blogs - Create new blog
export async function POST(req) {
    try {
        const body = await req.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json(
                { message: "Title and content are required" },
                { status: 400 }
            );
        }

        // Generate slug if not provided
        if (!body.slug) {
            body.slug = title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-");
        }

        // Check for duplicate slug
        const existing = await Blog.findOne({ slug: body.slug });
        if (existing) {
            // Append random string to slug if duplicates
            body.slug += "-" + Math.random().toString(36).substring(7);
        }

        const blog = await Blog.create(body);
        return NextResponse.json(blog, { status: 201 });
    } catch (error) {
        console.error("ADMIN BLOG POST ERROR:", error);
        return NextResponse.json(
            { message: error.message || "Failed to create blog" },
            { status: 500 }
        );
    }
}
