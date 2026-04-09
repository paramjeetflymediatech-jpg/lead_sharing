import { NextResponse } from "next/server";
import { ContactRequest } from "@/models/ContactRequest";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET(req) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'ALL';

        const skip = (page - 1) * limit;

        const query = {};
        if (status !== 'ALL') query.status = status;
        if (search) query.search = search;

        const [requests, total] = await Promise.all([
            ContactRequest.find(query, { limit, skip }),
            ContactRequest.count(query)
        ]);

        return NextResponse.json({
            requests,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }, { status: 200 });

    } catch (error) {
        console.error("ADMIN CONTACTS ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
