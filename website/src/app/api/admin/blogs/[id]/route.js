
import { NextResponse } from "next/server";
import { Blog } from "@/models/Blog";

// Admin: GET /api/admin/blogs/[id] - Fetch single blog
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const blog = await Blog.findById(id);
        if (!blog) {
            return NextResponse.json(
                { message: "Blog not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(blog);
    } catch (error) {
        console.error("ADMIN BLOG GET SINGLE ERROR:", error);
        return NextResponse.json(
            { message: "Failed to fetch blog" },
            { status: 500 }
        );
    }
}

// Admin: PUT /api/admin/blogs/[id] - Update blog
export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Check if blog exists
        const existing = await Blog.findById(id);
        if (!existing) {
            return NextResponse.json(
                { message: "Blog not found" },
                { status: 404 }
            );
        }

        // Check for slug duplication if slug is changed
        if (body.slug && body.slug !== existing.slug) {
            const duplicate = await Blog.findOne({ slug: body.slug });
            if (duplicate) {
                return NextResponse.json(
                    { message: "Slug already exists" },
                    { status: 400 }
                );
            }
        }

        const updated = await Blog.findByIdAndUpdate(id, body);
        return NextResponse.json(updated);
    } catch (error) {
        console.error("ADMIN BLOG PUT ERROR:", error);
        return NextResponse.json(
            { message: error.message || "Failed to update blog" },
            { status: 500 }
        );
    }
}

// Admin: DELETE /api/admin/blogs/[id] - Delete blog
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const success = await Blog.findByIdAndDelete(id);
        if (!success) {
            return NextResponse.json(
                { message: "Blog not found or delete failed" },
                { status: 404 }
            );
        }
        return NextResponse.json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("ADMIN BLOG DELETE ERROR:", error);
        return NextResponse.json(
            { message: "Failed to delete blog" },
            { status: 500 }
        );
    }
}
