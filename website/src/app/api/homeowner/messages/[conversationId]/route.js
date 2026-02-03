import { NextResponse } from "next/server";
import { Message } from "@/models/Message";

// GET messages for a conversation
export async function GET(req, context) {
    try {
        const params = await context.params;
        // conversationId format: "otherUserId_jobId" (we need a composite key or just pass them)
        // Actually, let's assume the frontend passes a composite ID or we use query params.
        // Let's stick to the URL param being "otherUserId-jobId" for simplicity, or just use query params in the main route?
        // No, let's use the layout proposed: /messages/[conversationId]
        // But wait, the previous model `getConversations` returned an ID which was the *last message ID*.
        // We need a stable ID for the conversation.
        // Let's change the strategy: The frontend will click on a conversation which has user info and job info.
        // The API request should be `/api/homeowner/messages?otherUserId=X&jobId=Y`.

        // HOWEVER, I am creating this file at `[conversationId]/route.js`.
        // Let's assume conversationId is passed as `otherUserId-jobId`.

        const conversationId = params.conversationId;
        const [otherUserId, jobId] = conversationId.split("-");

        const userId = req.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const messages = await Message.getMessages(userId, otherUserId, jobId);

        return NextResponse.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

// POST a new message
export async function POST(req, context) {
    try {
        const params = await context.params;
        const conversationId = params.conversationId;
        const [otherUserId, jobId] = conversationId.split("-");

        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ message: "Message content is required" }, { status: 400 });
        }

        const newMessage = await Message.create({
            senderId: userId,
            receiverId: otherUserId,
            jobId: jobId,
            content,
        });

        return NextResponse.json({
            success: true,
            data: newMessage,
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
