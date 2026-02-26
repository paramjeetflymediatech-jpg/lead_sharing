import { NextResponse } from "next/server";
import db from "../../../../../../config/db";

/**
 * GET /api/homeowner/messages/[conversationId]
 * Fetch all messages for a specific conversation
 * conversationId format: jobId-tradespersonId
 */
export async function GET(req, context) {
    try {
        const params = await context.params;
        const conversationId = params.conversationId;

        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "HOMEOWNER") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        // Parse conversation ID
        const [jobId, tradespersonId] = conversationId.split('-');

        if (!jobId || !tradespersonId) {
            return NextResponse.json(
                { success: false, message: "Invalid conversation ID" },
                { status: 400 }
            );
        }

        // Verify the homeowner owns this job
        const [jobs] = await db.query(
            `SELECT * FROM jobs WHERE id = ? AND homeowner_id = ? LIMIT 1`,
            [jobId, userId]
        );

        if (!jobs || jobs.length === 0) {
            return NextResponse.json(
                { success: false, message: "Job not found or access denied" },
                { status: 404 }
            );
        }

        const job = jobs[0];

        // Get all messages for this conversation
        const [messages] = await db.query(`
      SELECT 
        m.*,
        sender.name as sender_name,
        receiver.name as receiver_name
      FROM messages m
      INNER JOIN users sender ON m.sender_id = sender.id
      INNER JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.job_id = ?
        AND ((m.sender_id = ? AND m.receiver_id = ?)
             OR (m.sender_id = ? AND m.receiver_id = ?))
      ORDER BY m.created_at ASC
    `, [jobId, userId, tradespersonId, tradespersonId, userId]);

        // Mark messages as read
        await db.query(`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE job_id = ? 
        AND sender_id = ? 
        AND receiver_id = ?
        AND is_read = FALSE
    `, [jobId, tradespersonId, userId]);

        // Get conversation status from the latest message
        const conversationStatus = messages.length > 0
            ? messages[messages.length - 1].conversation_status
            : 'ACTIVE';

        const acceptedByHomeowner = messages.length > 0
            ? Boolean(messages[messages.length - 1].conversation_accepted_by_homeowner)
            : false;

        const acceptedByTradesperson = messages.length > 0
            ? Boolean(messages[messages.length - 1].conversation_accepted_by_tradesperson)
            : false;

        // Check if conversation is closed
        const isClosed = conversationStatus === 'CLOSED' ||
            job.status === 'COMPLETED' ||
            job.status === 'CANCELLED';

        return NextResponse.json({
            success: true,
            conversation: {
                jobId: parseInt(jobId),
                tradespersonId: parseInt(tradespersonId),
                jobTitle: job.description,
                jobStatus: job.status,
                conversationStatus,
                acceptedByHomeowner,
                acceptedByTradesperson,
                isClosed,
                needsAcceptance: conversationStatus === 'PENDING_HOMEOWNER_ACCEPTANCE' && !acceptedByHomeowner
            },
            messages: messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                senderId: msg.sender_id,
                receiverId: msg.receiver_id,
                senderName: msg.sender_name,
                receiverName: msg.receiver_name,
                isRead: Boolean(msg.is_read),
                createdAt: msg.created_at,
                isMine: msg.sender_id === parseInt(userId)
            }))
        });
    } catch (error) {
        console.error("GET CONVERSATION ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/homeowner/messages/[conversationId]
 * Send a message in this conversation
 */
export async function POST(req, context) {
    try {
        const params = await context.params;
        const conversationId = params.conversationId;

        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "HOMEOWNER") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const { message } = await req.json();

        if (!message || message.trim() === '') {
            return NextResponse.json(
                { success: false, message: "Message content is required" },
                { status: 400 }
            );
        }

        // Parse conversation ID
        const [jobId, tradespersonId] = conversationId.split('-');

        // Verify the homeowner owns this job
        const [jobs] = await db.query(
            `SELECT * FROM jobs WHERE id = ? AND homeowner_id = ? LIMIT 1`,
            [jobId, userId]
        );

        if (!jobs || jobs.length === 0) {
            return NextResponse.json(
                { success: false, message: "Job not found or access denied" },
                { status: 404 }
            );
        }

        const job = jobs[0];

        // Check if conversation is closed
        if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
            return NextResponse.json(
                { success: false, message: "Cannot send messages for completed or cancelled jobs" },
                { status: 400 }
            );
        }

        // Get the latest message to check conversation status
        const [latestMessages] = await db.query(`
      SELECT conversation_status, conversation_accepted_by_homeowner, conversation_accepted_by_tradesperson
      FROM messages
      WHERE job_id = ? AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      ORDER BY created_at DESC
      LIMIT 1
    `, [jobId, userId, tradespersonId, tradespersonId, userId]);

        let conversationStatus = 'ACTIVE';
        let acceptedByHomeowner = true;
        let acceptedByTradesperson = true;

        if (latestMessages.length > 0) {
            const latest = latestMessages[0];
            conversationStatus = latest.conversation_status;
            acceptedByHomeowner = Boolean(latest.conversation_accepted_by_homeowner);
            acceptedByTradesperson = Boolean(latest.conversation_accepted_by_tradesperson);

            // If homeowner is replying for the first time, update status
            if (conversationStatus === 'PENDING_HOMEOWNER_ACCEPTANCE') {
                conversationStatus = 'PENDING_TRADESPERSON_ACCEPTANCE';
                acceptedByHomeowner = true;
            }
        }

        // Insert the message
        const [result] = await db.query(`
      INSERT INTO messages (
        sender_id, 
        receiver_id, 
        job_id, 
        content, 
        conversation_status,
        conversation_accepted_by_homeowner,
        conversation_accepted_by_tradesperson,
        is_read
      ) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)
    `, [
            userId,
            tradespersonId,
            jobId,
            message.trim(),
            conversationStatus,
            acceptedByHomeowner,
            acceptedByTradesperson
        ]);

        // 🚀 TRIGGER NOTIFICATION TO TRADESPERSON
        try {
            const { NotificationService } = await import("@/lib/notifications");
            const [senderRows] = await db.query('SELECT name FROM users WHERE id = ?', [userId]);
            const senderName = senderRows[0]?.name || "Homeowner";

            await NotificationService.newMessage(
                tradespersonId,
                senderName,
                message.trim(),
                jobId,
                conversationId
            );
        } catch (notifyErr) {
            console.error("NOTIFICATION ERROR (MESSAGE):", notifyErr);
        }

        return NextResponse.json({
            success: true,
            message: "Message sent successfully",
            messageId: result.insertId
        });

    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/homeowner/messages/[conversationId]
 * Accept a conversation (used when homeowner first responds)
 */
export async function PUT(req, context) {
    try {
        const params = await context.params;
        const conversationId = params.conversationId;

        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "HOMEOWNER") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const [jobId, tradespersonId] = conversationId.split('-');

        // Update all messages in this conversation to mark as accepted by homeowner
        await db.query(`
      UPDATE messages 
      SET conversation_accepted_by_homeowner = TRUE,
          conversation_status = CASE
            WHEN conversation_status = 'PENDING_HOMEOWNER_ACCEPTANCE' THEN 'PENDING_TRADESPERSON_ACCEPTANCE'
            ELSE conversation_status
          END
      WHERE job_id = ? 
        AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    `, [jobId, userId, tradespersonId, tradespersonId, userId]);

        return NextResponse.json({
            success: true,
            message: "Conversation accepted"
        });
    } catch (error) {
        console.error("ACCEPT CONVERSATION ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
