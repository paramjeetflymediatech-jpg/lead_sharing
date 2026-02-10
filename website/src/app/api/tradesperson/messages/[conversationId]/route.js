import { NextResponse } from "next/server";
import db from "../../../../../../config/db";

/**
 * GET /api/tradesperson/messages/[conversationId]
 * Fetch all messages for a specific conversation
 * conversationId format: jobId-homeownerId
 */
export async function GET(req, context) {
    try {
        const params = await context.params;
        const conversationId = params.conversationId;

        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "TRADESPERSON") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        // Parse conversation ID
        const [jobId, homeownerId] = conversationId.split('-');

        if (!jobId || !homeownerId) {
            return NextResponse.json(
                { success: false, message: "Invalid conversation ID" },
                { status: 400 }
            );
        }

        // Get job details
        const [jobs] = await db.query(
            `SELECT * FROM jobs WHERE id = ? LIMIT 1`,
            [jobId]
        );

        if (!jobs || jobs.length === 0) {
            return NextResponse.json(
                { success: false, message: "Job not found" },
                { status: 404 }
            );
        }

        const job = jobs[0];

        // Get tradesperson profile ID
        const [profiles] = await db.query(
            `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
            [userId]
        );

        if (!profiles || profiles.length === 0) {
            return NextResponse.json(
                { success: false, message: "Tradesperson profile not found" },
                { status: 404 }
            );
        }

        const tradespersonId = profiles[0].id;

        // Verify tradesperson has unlocked this lead
        const [leads] = await db.query(
            `SELECT * FROM leads WHERE job_id = ? AND tradesperson_id = ? AND is_unlocked = TRUE LIMIT 1`,
            [jobId, tradespersonId]
        );

        if (!leads || leads.length === 0) {
            return NextResponse.json(
                { success: false, message: "You must unlock this lead first" },
                { status: 403 }
            );
        }

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
    `, [jobId, userId, homeownerId, homeownerId, userId]);

        // Mark messages as read
        await db.query(`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE job_id = ? 
        AND sender_id = ? 
        AND receiver_id = ?
        AND is_read = FALSE
    `, [jobId, homeownerId, userId]);

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
                homeownerId: parseInt(homeownerId),
                jobTitle: job.description,
                jobStatus: job.status,
                conversationStatus,
                acceptedByHomeowner,
                acceptedByTradesperson,
                isClosed,
                needsAcceptance: conversationStatus === 'PENDING_TRADESPERSON_ACCEPTANCE' && !acceptedByTradesperson
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
        console.error("GET TRADESPERSON CONVERSATION ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/tradesperson/messages/[conversationId]
 * Send a message in this conversation
 */
export async function POST(req, context) {
    try {
        const params = await context.params;
        const conversationId = params.conversationId;

        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "TRADESPERSON") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const { message, isFirstMessage } = await req.json();

        if (!message || message.trim() === '') {
            return NextResponse.json(
                { success: false, message: "Message content is required" },
                { status: 400 }
            );
        }

        // Parse conversation ID
        const [jobId, homeownerId] = conversationId.split('-');

        // Get job details
        const [jobs] = await db.query(
            `SELECT * FROM jobs WHERE id = ? LIMIT 1`,
            [jobId]
        );

        if (!jobs || jobs.length === 0) {
            return NextResponse.json(
                { success: false, message: "Job not found" },
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

        // Get tradesperson profile ID
        const [profiles] = await db.query(
            `SELECT id FROM tradesperson_profiles WHERE user_id = ? LIMIT 1`,
            [userId]
        );

        if (!profiles || profiles.length === 0) {
            return NextResponse.json(
                { success: false, message: "Tradesperson profile not found" },
                { status: 404 }
            );
        }

        const tradespersonId = profiles[0].id;

        // Verify tradesperson has unlocked this lead
        const [leads] = await db.query(
            `SELECT * FROM leads WHERE job_id = ? AND tradesperson_id = ? AND is_unlocked = TRUE LIMIT 1`,
            [jobId, tradespersonId]
        );

        if (!leads || leads.length === 0) {
            return NextResponse.json(
                { success: false, message: "You must unlock this lead first" },
                { status: 403 }
            );
        }

        // Get the latest message to check conversation status
        const [latestMessages] = await db.query(`
      SELECT conversation_status, conversation_accepted_by_homeowner, conversation_accepted_by_tradesperson
      FROM messages
      WHERE job_id = ? AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      ORDER BY created_at DESC
      LIMIT 1
    `, [jobId, userId, homeownerId, homeownerId, userId]);

        let conversationStatus = 'ACTIVE';
        let acceptedByHomeowner = false;
        let acceptedByTradesperson = false;

        if (latestMessages.length > 0) {
            const latest = latestMessages[0];
            conversationStatus = latest.conversation_status;
            acceptedByHomeowner = Boolean(latest.conversation_accepted_by_homeowner);
            acceptedByTradesperson = Boolean(latest.conversation_accepted_by_tradesperson);

            // If tradesperson is replying after homeowner accepted, update status
            if (conversationStatus === 'PENDING_TRADESPERSON_ACCEPTANCE') {
                conversationStatus = 'ACTIVE';
                acceptedByTradesperson = true;
            }
        } else if (isFirstMessage) {
            // This is the first message from tradesperson
            conversationStatus = 'PENDING_HOMEOWNER_ACCEPTANCE';
            acceptedByHomeowner = false;
            acceptedByTradesperson = false;
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
            homeownerId,
            jobId,
            message.trim(),
            conversationStatus,
            acceptedByHomeowner,
            acceptedByTradesperson
        ]);

        return NextResponse.json({
            success: true,
            message: "Message sent successfully",
            messageId: result.insertId
        });
    } catch (error) {
        console.error("SEND TRADESPERSON MESSAGE ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/tradesperson/messages/[conversationId]
 * Accept a conversation
 */
export async function PUT(req, context) {
    try {
        const params = await context.params;
        const conversationId = params.conversationId;

        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || role !== "TRADESPERSON") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const [jobId, homeownerId] = conversationId.split('-');

        // Update all messages in this conversation to mark as accepted by tradesperson
        await db.query(`
      UPDATE messages 
      SET conversation_accepted_by_tradesperson = TRUE,
          conversation_status = CASE
            WHEN conversation_status = 'PENDING_TRADESPERSON_ACCEPTANCE' THEN 'ACTIVE'
            ELSE conversation_status
          END
      WHERE job_id = ? 
        AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    `, [jobId, userId, homeownerId, homeownerId, userId]);

        return NextResponse.json({
            success: true,
            message: "Conversation accepted"
        });
    } catch (error) {
        console.error("ACCEPT TRADESPERSON CONVERSATION ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
