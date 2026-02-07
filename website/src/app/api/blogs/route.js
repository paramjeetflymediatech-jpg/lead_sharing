
import { NextResponse } from "next/server";
import { Blog } from "@/models/Blog";

// Public: GET /api/blogs - Fetch published blogs (paginated)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || 1;
        const limit = searchParams.get("limit") || 10;
        const search = searchParams.get("search") || "";

        const data = await Blog.find({ search, status: 'PUBLISHED' }, { page, limit });
        return NextResponse.json(data);
    } catch (error) {
        console.error("PUBLIC BLOG GET ERROR:", error);
        return NextResponse.json(
            { message: "Failed to fetch blogs" },
            { status: 500 }
        );
    }
}
