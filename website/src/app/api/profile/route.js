import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(req) {
    try {
        await connectToDatabase();

        const userId = req.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(userId).select("-password").lean();

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user }, { status: 200 });
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
