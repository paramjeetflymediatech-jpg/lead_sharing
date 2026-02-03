import { NextResponse } from "next/server";
import { Message } from "@/models/Message";

export async function GET(req) {
    try {
        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "HOMEOWNER") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const conversations = await Message.getConversations(userId);

        return NextResponse.json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
