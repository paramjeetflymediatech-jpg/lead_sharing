
import { NextResponse } from "next/server";
import { Blog } from "@/models/Blog";

// Public: GET /api/blogs/[slug] - Fetch single published blog by slug
export async function GET(req, { params }) {
    try {
        const { slug } = await params;
        const blog = await Blog.findOne({ slug, status: 'PUBLISHED' });
        if (!blog) {
            return NextResponse.json(
                { message: "Blog post not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(blog);
    } catch (error) {
        console.error("PUBLIC BLOG GET SINGLE ERROR:", error);
        return NextResponse.json(
            { message: "Failed to fetch blog post" },
            { status: 500 }
        );
    }
}
